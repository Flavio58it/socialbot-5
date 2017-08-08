import format from "string-template";
import urlParams from "url-params";
import waiter from "waiter";
import axios from "axios";
import logger from "../db/logger";
import db from "../db/db";
import objectMapper from "object-mapper";
import police from "../police";

const urls = {
	home: "https://www.instagram.com",
	json: {
		name: "__a",
		val: "1"
	},
	post: {
		like: "/web/likes/{0}/like/", // post id
		unlike: "/web/likes/{0}/like/", // post id
		follow: "/web/friendships/{0}/follow/",
		unfollow: "/web/friendships/{0}/unfollow/"
	},
	get: {
		tag: "/explore/tags/{0}/", // TagName
		user: "/{0}/", // username
		post: "/p/{0}/", // Get the post data
		notifications: "/account/activity/",
		query: "/graphql/query/?query_id={0}"
	}
}, 
mappers = { // This maps the majority of the objects picked from the instagram APIs
	media: {
		"tag.media.nodes": "posts",
		"tag.media.page_info.end_cursor": "nextPage"
	},
	dashboard: {
		"graphql.user.edge_web_feed_timeline.edges": "posts",
		"graphql.user.edge_web_feed_timeline.page_info.end_cursor": "nextPage"
	},
	postLike: { // Post in a list of posts (edges) - like area
		"id": "id",
		"owner.id": "userId",
		"owner.username": "userName",
		"caption": "comment",
		"viewer_has_liked": "liked",
		"code": "code",
		"display_src": "img",
		"display_url": "img",
		"is_video": "isVideo",
		"likes.count": "likes"
	},
	post: { // Post in a list of posts (edges) - dashboard area
		"node.id": "id",
		"node.owner.id": "userId",
		"node.owner.username": "userName",
		"node.caption": "comment",
		"node.viewer_has_liked": "liked",
		"node.code": "code",
		"node.display_src": "img",
		"node.display_url": "img",
		"node.is_video": "isVideo",
		"node.likes.count": "likes"
	},
	postData: { // Post as a singular post (in an ajax specific for that post)
		"graphql.shortcode_media.viewer_has_liked": "liked"
	},
	user: { // User homepage (dashboard + posts)
		"user.username": "username",
		"user.full_name": "fullName",
		"user.id": "id",
		"user.followed_by.count": "followedBy",
		"user.follows.count": "follows",
		"user.biography": "bio",
		"user.follows_viewer": "followMe",
		"user.has_blocked_viewer": "blocked",
		"user.media.page_info.end_cursor": "posts.nextPage",
		"user.media.nodes[].id": "posts.list[].id",
		"user.media.nodes[].likes.count": "posts.list[].likes",
		"user.media.nodes[].thumbnail_src": "posts.list[].src",
		"user.media.nodes[].is_video": "posts.list[].video"
	}
},
// Used in encodeObject. Go to the function and watch the comments.
useJsonEncoding = true;

var cache = {
	query_id: false,
	userData: false
};

// ------------------
// Generic functions -----------------
function getUrl(url, overrideJson){
	if (/^chrome-extension:/.test(url))
		url = url.replace(/^.+\/\/.[^\/]+(.+)/, "$1");
	return ((!/^https?:/.test(url))?urls.home:"") + ((useJsonEncoding && !overrideJson)?urlParams.add(url, urls.json.name, urls.json.val):url);
}

function decodeObject (url, overrideDecoder, settings) {
	var settings = settings || {cbk:{}};
	if (!useJsonEncoding || overrideDecoder === true) {
		// This is emergency fallback if the json method will not work anymore. Is dirty but is working.
		// parse page html and return the object of the page
		var el = document.createElement("html");

		return axios(getUrl(url, true))
		.then((response) => {
			return response.data;
		})
		.then((data) => {
			el.innerHTML = data;
			return el;
		})
		.then((el) => {
			if (settings.cbk.onData)
				return Promise.resolve(settings.cbk.onData(el)).then(() => el);
			else
				return Promise.resolve(el);
		})
		.then((el) => {
			var data = document.evaluate("//script[contains(., 'window._sharedData')]", el).iterateNext().innerHTML;	
			return JSON.parse(data.replace(/^.+=\s\{(.+$)/, "{$1").replace(/\};$/, "}"));
		})
	} else {
		return axios(getUrl(url, settings.overrideJson)).then((data) => {
			return data.data;
		})
	}
}

function _postData (csrf) {
	return {
		method: "POST",
		headers: {
			"content-type":"application/x-www-form-urlencoded",
			"x-requested-with": "XMLHttpRequest",
			"x-instagram-ajax":"1",
			"x-csrftoken": csrf
		}
	}
}

// -----------------
// Action functions ----------------
function likePost (postId, csrf) {
	return axios(getUrl(format(urls.post.like, postId), true), _postData(csrf));
}

function getUsersBatch (query, userid, list, pointer) {
	if (!list)
		var list = [];
	var data = {
		"id": userid,
		"first": 100
	};
	if (pointer)
		data.after = pointer;
	return decodeObject(urlParams.add(format(urls.get.query, query), "variables", JSON.stringify(data)), false, {overrideJson: true})
		.then(data => data.data.user)
		.then((data) => {
			var fdata = data.edge_followed_by?data.edge_followed_by:data.edge_follow;
			list.push(...fdata.edges);
			if (fdata.page_info.has_next_page && fdata.page_info.end_cursor)
				return getUsersBatch(query, userid, list, fdata.page_info.end_cursor);
			return list;
		})
}

function getUserData (userName) {
	var now = new Date().getTime();
	if (!cache.userData)
		cache.userData = {}
	if (cache.userData[userName] && cache.userData[userName].time >= (now-600000)) // Cached users to 10 minutes
		return Promise.resolve(cache.userData[userName].data);
	return decodeObject(format(urls.get.user, userName)).then((userData) => {
		var mapped = objectMapper(userData, mappers.user);
		console.log("User data expired. Refetched.")
		cache.userData[userName] = {
			data: mapped,
			time: now
		}
		return mapped;
	})
}

function likeUserPosts(userName) {
	return getUserData(userName).then((userData) => {
		if (!userData.posts.length)
			return Promise.resolve();
		var flow = Promise.resolve();

		userData.posts.forEach(() => {

		});

		return flow;
	})
}

function followUser (userId, checker) {
	console.log("Checking if should follow");
	if (!checker)
		return follow(); // Here will directly follow without checks

	// Followback algorhytm below ---
	return db.users.where("[plug+userid]").equals(["instagram", userId]).toArray().then((data) => { // Check if the user has to be followed
		if (data.length > 1)
			return Promise.reject({error: "Users number mismatch", id: "DB_USER_EXCEEDING"});
		if (data[0].toFollow) {
			console.log("Authorized by DB");
			return getUserData(data[0].username).then((userInfo) =>  checker.shouldFollow({user:userInfo, data: data[0]})).then((auth) => {
				if (auth) {
					return follow()
				} else {
					console.warn("Not authorized by police")
					return Promise.resolve(false)
				}
			});
		}
	}).then (() => {
		return db.users.where("[plug+userid]").equals(["instagram", userId]).modify({toFollow: false});
	})
	
	function follow(){
		console.log("Authorized by police or bypassed directly");
	}
}

function unfollowUser (userId) {
	console.log("UnfollowUserAction")
	return Promise.resolve(true);
}

function cleanDB(){ // Clean database from old users. Async mode! Don't even try to make it syncronous!

}

/**
* -------------- Exposed functions
**/

export default function () {
	var csrf = false, query_id = false, user = false,
		log = new logger({type: "instagram"}),
		checker = false,
		settings = false;

	return {
		init (settingsData) {
			settings = settingsData
			checker = new police(settingsData); // Init the main checker.
			// Check if user is logged in and get the tokens
			return decodeObject(urls.home, true, {
				cbk: {
					onData (data) {
						// Getting the query id token from the only found position. Yes, is a script (puke)
						var src = data.querySelector("script[src*='Commons.js']").src, thenSrc = getUrl(src, true);
						if (cache.query_id && cache.query_id.src == src && cache.query_id.id) {
							query_id = cache.query_id.id
							return Promise.resolve();
						}
						return axios(thenSrc).then((script) => script.data).then((script) => {
							var regex = {
								like: /\=.{1,4}(\d{17}).[^;]+SUL_REQUESTED/,
								followers: /\=.{1,4}(\d{17}).[^;]+FOLLOW_LIST_REQUEST_UPDATED/,
								following: /\=.{1,4}(\d{17}).[^;\d{17}]+FOLLOW_LIST_REQUEST_UPDATED/
							}
							for (var y in regex) {
								if (regex[y].test(script)){
									query_id = query_id?query_id:{};
									query_id[y] = script.match(regex[y])[1]
								}
							}
							if (query_id){
								cache.query_id = {
									src: src,
									id: query_id
								}
							} else {
								cache.query_id = false;
								return Promise.reject({error: "query_id picker fail"})
							}
						}).catch((e) => {
							console.error("Query id fetcher failed. Some operations will not work. ", e)
						})
					}
				}
			}).then((data) => {
				// Getting data from homepage, using the fallback method. The original json is much lighter and misses basic info as csrf_token.
				console.log("Init info: ", data)
				csrf = data.config.csrf_token;
				user = data.config.viewer;
				return {
						// TODO: Check login status
						connectionOk: true,
						logged: (data && !data.entry_data.LandingPage),
						domain: urls.home
				}
			})
		},
		actions: {
			/**
			* ----- Like the images by tag
			*
			**/
			likeTagImages (tagName, wait, limit) {
				if (!csrf)
					return Promise.reject({error: "Init failed"});

				var numberLiked = 0;

				function like (pointer) {
					var nextQuery = pointer?
						urlParams.add(
							urlParams.add(
								format((urls.get.tag), tagName), "query_id", query_id.like), 
							"pointer", JSON.stringify({
								"tag_name": tagName,
								"first": numberLiked,
								"after": pointer
							})):
						format((urls.get.tag), tagName);

					return decodeObject(nextQuery)
					.then((data) => {
						var ops = Promise.resolve(), source = objectMapper(data, mappers.media);

						source.posts.forEach((d) => {
							    //console.log("Post data: ", d);
							    d = objectMapper(d, mappers.postLike);

								ops = ops.then(() => {
									// If the user or the bot has already liked the post the like process is aborted, as the previous posts has already been viewed.
									if (numberLiked >= limit)
										return Promise.reject({likeLimitReached: true});
									return decodeObject(format(urls.get.post, d.code)).then((data) => {
										data = objectMapper(data, mappers.postData)
										if (data.liked) {
											return Promise.reject({alreadyLiked: true})
										}
										return waiter(1000, 5000).then(() => data);
									});
								})
								.then(() => likePost(d.id, csrf))
								.then((data) => {log.userInteraction("LIKE", d, {tag: tagName});return data;})
								.then((data) => {
									numberLiked++;
									return data;
								}).catch((e) => {
									if (e.likeLimitReached || e.alreadyLiked){ // Passing the likeLimit as is not an error to manage here.
										return Promise.reject(e);
									}
									if (e.response && e.response.status == 404) {
										console.error("Post not found...");
										return Promise.resolve();
									}
									return Promise.reject({error: "Connection error", details: (e.details || e)});
								})
								.then(() => waiter(wait.actionLower * 1000, wait.actionUpper * 1000))
						})

						return ops.then((prevData) => {
							//Here should recall like function with pointer
							if (source.nextPage) {
								console.log("Next page");
								return like(source.nextPage)
							} else {
								return Promise.resolve(prevData);
							}
						}).catch((e) => {
							if (e.alreadyLiked) {
								console.warn("Already liked. Aborting...");
								return Promise.resolve({
									data,
									liked: numberLiked
								});
							} else if (e.likeLimitReached) {
								console.warn("Like limit reached...");
								return Promise.resolve({
									data,
									liked: numberLiked
								})
							}
							return Promise.reject(e);
						});
					});
				}

				return like();
			},
			/**
			* ----- Like the dashboard posts
			*
			**/

			likeDashboard (wait, limit) {
				var numberLiked = 0;

				function like(pointer) {
					return decodeObject(urls.home).then((data) => {
						//console.log("DashboardLike: ", data);
						var source = objectMapper(data, mappers.dashboard), flow = Promise.resolve();
						source.posts.forEach((post) => {
							post = objectMapper(post, mappers.post);
							flow = flow.then(() => {
								if (numberLiked >= limit)
									return Promise.reject({likeLimitReached: true});
								if (post.liked){
									return Promise.reject({alreadyLiked: true})
								}
								return likePost(post.id, csrf)
								.then((d) => {log.userInteraction("LIKE", post);return d;})
								.then((d) => {
									numberLiked++;
									return d;
								}).catch((e) => {
									numberLiked++;
									return Promise.reject(e);
								})
								.then(() => waiter(wait.actionLower * 1000, wait.actionUpper * 1000));
							})
						})

						return flow.then((prevData) => {
							if (source.nextPage) {
								console.log("Next page");
								return like(source.nextPage)
							} else {
								return Promise.resolve(prevData);
							}
						}).catch((e) => {
							if (e.alreadyLiked) {
								console.warn("Already liked. Aborting...");
								return Promise.resolve({
									data,
									liked: numberLiked
								});
							} else if (e.likeLimitReached) {
								console.warn("Like limit reached...");
								return Promise.resolve({
									data,
									liked: numberLiked
								})
							}
							return Promise.reject(e);
						})
					})
				}


				return like();
			},
			/**
			* ----- Like the explore (magnifying glass) posts
			*
			**/
			likeExplore () {

			},

			/**
			* --- Get the user list and check if is following you. Optionally unfollow or followBack
			* the params are followBack and unFollowback features
			**/
			followManager (onlyFetch) {
				console.log("Getting followers of ", user);

				if (!user)
					return Promise.reject({error: "User error"})

				var settingsData = Promise.all([
					settings.get("followBack"),
					settings.get("unFollowBack")
				])

				return Promise.all([
					getUsersBatch(query_id.followers, user.id),
					getUsersBatch(query_id.following, user.id)
				]).then((res) => { // Here we have the followers and the following. Let's differentiate!
					var users = [], indexer = [];
					console.log("All users", res);

					res[0].forEach((t) => {
						users.push({
							id: t.node.id,
							profile_url: getUrl(format(urls.get.user, t.node.username), true),
							username: t.node.username,
							fullname: t.node.full_name,
							img: t.node.profile_pic_url,
							status: "follower",
							follows_me: true
						});
						indexer.push(t.node.id);
					});

					res[1].forEach((t) => {
						var index = indexer.indexOf(t.node.id);
						if (index > -1) { // Check if the user has been aleeady picked
							users[index].status = "followback";
							return;
						}
						users.push({
							id: t.node.id,
							profile_url: getUrl(format(urls.get.user, t.node.username), true),
							username: t.node.username,
							fullname: t.node.full_name,
							img: t.node.profile_pic_url,
							status: "following",
							follows_me: false
						});
					});

					console.log("Result: ", users);

					return users;
				}).then((users) => {
					return settingsData.then(settings => ({settings, users}))
				}).then((data) => {
					var isFirstTime = false;
					return db.users.toArray().then((arr) => {
						var cache = {}, //Cache users by id in order to avoid nested foreach
							now = new Date().getTime(), 
							flow = [],
							usersCorrupted = false; 
						arr.forEach((user) => {
							if (!user.userid)
								usersCorrupted = true;
							cache[user.userid] = user;
						})
						if (usersCorrupted) // Missing one or more ids from cache. This is critically wrong. Should wipe all database off when this happens (or recover from username)
							return Promise.reject({error: "The user database is corrupted.", id: "DB_USER_CORRUPTED"})
						if (arr.length == 0)
							isFirstTime = true;

						data.users.forEach(function(us) { // Cycle each user. Check if is present in the database. if not present and the db is not empty, the user is a new one.
							// us = users picked now from server / user = users picked from database
							// settings[0] = followBack, settings[1] = unFollowBack
							var user = cache[us.id];
							if (user) { // The user is present!
								user.found = true; // The user has been found so has not unfollowed
								us.whitelisted = user.whitelisted;
								// Update in real time the details to the db in order to have all info updated somehow
								db.users.where("[plug+userid]").equals(["instagram", us.id]).modify({
									username: user.username,
									details: {img: user.img}
								})
							} else { // User not found and is present in the users array so is a new follower! (party) (except if isFirstTime)
								flow.push(db.users.add({
									plug: "instagram",
									userid: us.id,
									username: us.username,
									whitelisted: false,
									toFollow: !((!data.settings[0]) || isFirstTime),
									details: {
										img: us.img
									},
									lastInteraction: now,
									added: now
								}).then(() => { // Followback!
									if ((isFirstTime || !data.settings[0]) && !onlyFetch) // Not followbacking all the people the first time
										return Promise.resolve();
									return followUser(us.id, checker).then((result) => {
										if (result)
											return log.userInteraction("FOLLOWBACK", {
												img: us.img,
												userId: us.id,
												userName: us.username
											});
									});
								}))
							}
						});

						return Promise.all(flow).then(() => { // Check the cached users and unfollow the ones that are not present and are not whitelisted!
							if ((isFirstTime || !data.settings[1]) && !onlyFetch)
								return Promise.resolve();
							console.log("Unfollowing and cleaning DB");

							for (var u in cache) {
								var user = cache[u];
								if (!user.found && !user.whitelisted)
									unfollowUser(user.id);
							}
						}).then(() => arr);
					})
					.then(() => data.users);
				})
			},
			/**
			* Like the users that like your photos
			**/
			likeBack () {
				console.log("Starting likeBack");
				return getUserData(user.username).then((userData) => { // The default user data does not contains the posts.
					console.log(userData)
				})
			}
		}
	}
}