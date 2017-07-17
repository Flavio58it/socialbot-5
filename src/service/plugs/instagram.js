import format from "string-template";
import urlParams from "url-params";
import waiter from "waiter";
import axios from "axios";

const urls = {
	home: "https://www.instagram.com",
	json: {
		name: "__a",
		val: "1"
	},
	post: {
		like: "/web/likes/{0}/like/", // post id
		unlike: "/web/likes/{0}/like/", // post id
	},
	get: {
		tag: "/explore/tags/{0}/", // TagName
		feed: "/{0}/", // username
		post: "/p/{0}/", // Get the post data
		notifications: "/account/activity/",
		query: "/graphql/query/?query_id={0}"
	}
}, 
// Used in encodeObject. Go to the function and watch the comments.
useJsonEncoding = true;

var cache = {
	query_id: false
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

export default function (settings) {
	var csrf = false, query_id = false, user = false;

	return {
		init () {
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
						logged: true,
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
						var ops = Promise.resolve(), source = data.tag.media;

						source.nodes.forEach((d) => {
							    //console.log("Post data: ", d);
								ops = ops.then(() => {
									// If the user or the bot has already liked the post the like process is aborted, as the previous posts has already been viewed.
									if (numberLiked >= limit)
										return Promise.reject({likeLimitReached: true});
									return decodeObject(format(urls.get.post, d.code)).then((data) => {
										if (data.graphql.shortcode_media.viewer_has_liked) {
											return Promise.reject({alreadyLiked: true})
										}
										return waiter(1000, 5000).then(() => data);
									});
								})
								.then(() => likePost(d.id, csrf))
								.then((d) => {
									numberLiked++;
									return d;
								}).catch((e) => {
									if (e.likeLimitReached || e.alreadyLiked){ // Passing the likeLimit as is not an error to manage here.
										return Promise.reject(e);
									}
									if (e.response && e.response.status == 404) {
										console.error("Post not found...");
										return Promise.resolve();
									}
									return Promise.reject({error: "Connection error", details: e});
								})
								.then(() => waiter(wait.actionLower * 1000, wait.actionUpper * 1000))
						})

						return ops.then((prevData) => {
							//Here should recall like function with pointer
							if (source.page_info.end_cursor) {
								console.log("Next page");
								return like(source.page_info.end_cursor)
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
				// TODO: Here should simulate activity of some type (or not?)
				return decodeObject(urls.home).then((data) => {
					//console.log("DashboardLike: ", data);
					var source = data.graphql.user.edge_web_feed_timeline, flow = Promise.resolve();
					source.edges.forEach((post) => {
						post = post.node;
						flow = flow.then(() => {
							if (numberLiked >= limit)
								return Promise.reject({likeLimitReached: true});
							if (post.viewer_has_liked){
								return Promise.reject({alreadyLiked: true})
							}
							return likePost(post.id, csrf).then((d) => {
								numberLiked++;
								return d;
							}).catch((e) => {
								numberLiked++;
								return Promise.reject(e);
							})
							.then(() => waiter(wait.actionLower * 1000, wait.actionUpper * 1000));
						})
					})

					return flow.then((d) => {
						//TODO: New page support here
						return d;
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
			followManager (removeThemIfUnfollowed, addThemIfFollowing) { // If both are false then the only the list is returned.
				console.log("Getting followers of ", user);

				return Promise.all([
					getUsersBatch(query_id.followers, user.id),
					getUsersBatch(query_id.following, user.id)
				]).then((res) => { // Here we have the followers and the following. Let's differentiate!
					console.log(res);

					
				})
			}
		}
	}
}