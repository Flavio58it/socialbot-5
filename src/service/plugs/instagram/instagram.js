import format from "string-template";
import urlParams from "url-params";
import waiter from "waiter";
import logger from "../../db/logger";
import ms from "milliseconds";
import db from "../../db/db";
import objectMapper from "object-mapper";
import police from "../../police";

import mappers from "./mappers";
import {getUrl, decodeObject} from "./utils";
import actions from "./actions";
import urls from "./urls";
import queryIdParser from "./queryid_parser";

// https://www.npmjs.com/package/node-schedule
// https://www.npmjs.com/package/node-cron

export var cache = {
	query_id: false,
	userData: false
};

/**
* -------------- Exposed functions
**/

export default function () {
	var csrf = false, query_id = false, user = false,
		log = new logger({type: "instagram"}),
		checker = false,
		settings = false;

	return {
		async init (settingsData) {
			settings = settingsData
			checker = new police(settingsData); // Init the main checker.
			// Check if user is logged in and get the tokens
			if (!settingsData)
				return Promise.reject({error: "NO_SETTINGS"})

			var homeData = await decodeObject(urls.home, true, {
				cbk: {
					onData: (data) => queryIdParser(data).then((queryd) => {
						query_id = queryd;
					})
				}
			})

			// Getting data from homepage, using the fallback method. The original json is much lighter and misses basic info as csrf_token.

			console.log("Init info: ", homeData)
			csrf = homeData.config.csrf_token;
			user = homeData.config.viewer;

			return {
					connectionOk: true,
					logged: (homeData && !homeData.entry_data.LandingPage),
					domain: {
						match: urls.home
					}
			}
		},
		actions: {
			async likeTagImages (tagName, wait, limit) { // Like the images by tag
				if (!csrf)
					return await Promise.reject({error: "Init failed"});

				var numberLiked = 0,
					rejector = 0; // When a like is rejected this increases. When too much rejections happens, the numberLikes must increase in order to prevent hangs of the system (too strict filters)

				async function like (pointer) {
					var nextQuery = format((urls.get.tag), tagName);

					if (pointer) {
						let base = urlParams.add(format((urls.get.tag), tagName), "query_id", query_id.like),
							params = JSON.stringify({
								"tag_name": tagName,
								"first": numberLiked,
								"after": pointer
							});
						nextQuery = urlParams.add(base, "pointer", params);
					}
					
					var pageData = await decodeObject(nextQuery),
						source = objectMapper(pageData, mappers.media);

					try {
						for (let i = 0; i < source.posts.length; i++) {
							let d = source.posts[i];
							d = objectMapper(d, mappers.postLike);

							// If the user or the bot has already liked the post the like process is aborted, as the previous posts has already been viewed.
							if (numberLiked >= limit)
								return {
									stoppedBy: "LIKE_LIMIT_REACHED",
									data: pageData,
									liked: numberLiked
								}

							let postData = await decodeObject(format(urls.get.post, d.code))

							postData = objectMapper(postData, mappers.postData)

							// If the post has already been liked it means that 1)The bot has already liked this image 2) The human has already seen and liked the image.
							// Stopping the round here
							if (postData.liked)
								return {
									stoppedBy: "ALREADY_LIKED",
									data: pageData,
									liked: numberLiked
								}
							
							await waiter(1000, 5000)

							let likeCheckResult = await checker.shouldLike(d)
							if  (!likeCheckResult) {
								console.warn("Like rejected by police");
								//log.userInteraction(e.id, d, {tag: tagName});
								rejector++;
								if (rejector > 5) { // Like reject protection system. See the declaration of the var for explanation.
									numberLiked++;
									rejector = 0;
								}
								//"LIKE_REJECTED"
								// TODO: Maybe add a log for rejecting
								continue;
							}
							try {
								let likeResult = await actions.likePost(d.id, csrf);
							} catch (e) { 
								if (e.response && e.response.status == 404) {
									console.error("Post not found...");
									continue;
								}
								await Promise.reject(e)
							}

							log.userInteraction("LIKE", d, {tag: tagName});

							numberLiked++;
						}
					} catch (e) {
						// When something goes wrong is the connection that is unstable. THis will prompt the user to restart or check connection.
						return await Promise.reject({error: "Connection error.", details: (e.details || e), id: "CONNECTION_ERROR_TAG_LIKE", action: "RELOAD"})
					}

					if (source.nextPage) {
						console.log("Next page");
						return await like(source.nextPage)
					} else {
						return await Promise.resolve();
					}
				}

				return await like();
			},
			/**
			* ----- Like the dashboard posts
			*
			**/

			async likeDashboard (wait, limit) {
				var numberLiked = 0, rejector = 0;

				async function like(pointer) {
					var homeData = await decodeObject(urls.home),
						source = objectMapper(homeData, mappers.dashboard);

					try {
						for (let i = 0; i < source.posts.length; i++) {
							let post = source.posts[i];
							
							post = objectMapper(post, mappers.post);
	
							if (numberLiked >= limit)
								return {
									stoppedBy: "LIKE_LIMIT_REACHED",
									data: post,
									liked: numberLiked
								}
							if (post.liked)
								return {
									stoppedBy: "ALREADY_LIKED",
									data: post,
									liked: numberLiked
								}
	
							let likeCheckResult = await checker.shouldLike(post)
							if  (!likeCheckResult) {
								console.warn("Like rejected by police");
								//log.userInteraction(e.id, d, {tag: tagName});
								rejector++;
								if (rejector > 5) { // Like reject protection system. See the declaration of the var for explanation.
									numberLiked++;
									rejector = 0;
								}
								//"LIKE_REJECTED"
								// TODO: Maybe add a log for rejecting
								continue;
							}
							let likeResult = await actions.likePost(post.id, csrf);
	
							log.userInteraction("LIKE", post);
	
							numberLiked++;
	
							await waiter(ms.seconds(wait.actionLower), ms.seconds(wait.actionUpper))
						}
					} catch (e) {
						return await Promise.reject({error: "Connection error.", details: (e.details || e), id: "CONNECTION_ERROR_DASH_LIKE", action: "RELOAD"})
					}
					
					if (source.nextPage) {
						console.log("Next page");
						return like(source.nextPage)
					} else {
						return Promise.resolve();
					}
				}


				return await like();
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
			async followManager (onlyFetch) {
				console.log("Getting followers of ", user, csrf);

				if (!user)
					return await Promise.reject({error: "User error, try to restart", id: "USER_DATA_NOT_FOUND", action: "RELOAD"})

				var settingsData = {
					followBack: await settings.get("followBack"),
					unFollowBack: await settings.get("unFollowBack")
				},
				accountUsers = {
					followers: await actions.getUsersBatch(query_id.followers, user.id),
					following: await actions.getUsersBatch(query_id.following, user.id)
				};

				var users = [], indexer = [], isFirstTime = false;

				accountUsers.followers.forEach((t) => {
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

				accountUsers.following.forEach((t) => {
					var index = indexer.indexOf(t.node.id);
					if (index > -1) { // Check if the user has been already picked
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

				var arr = await db.users.toArray()

				var cache = {}, //Cache users by id in order to avoid nested foreach
					now = new Date().getTime(), 
					usersCorrupted = false; 

				arr.forEach((user) => {
					if (!user.userid)
						usersCorrupted = true;
					cache[user.userid] = user;
				})

				if (usersCorrupted) // Missing one or more ids from cache. This is critically wrong. Should wipe all database off when this happens (or recover from username)
					return await Promise.reject({
						error: "The user database is corrupted.", 
						id: "DB_USER_CORRUPTED", 
						action: "RESET_DB"
					})	
				
				if (arr.length == 0)
					isFirstTime = true;

				for (let i = 0; i < users.length; i++) {
					let us = users[i];

					// us = users picked now from server / user = users picked from database
					let user = cache[us.id];
					if (user && user.toFollow != 2) {
						user.found = true; // The user has been found so has not unfollowed
						us.whitelisted = user.whitelisted;
						// TODO: Update in real time the details to the db in order to have all info updated somehow [partially done]
						await db.users.where("[plug+userid]").equals(["instagram", us.id]).modify({
							username: user.username,
							"details.img": user.img
						})
					} else { // User not found and is present in the users array so is a new follower! (party) (except if isFirstTime or likeBack)
						let toFollow = !((!settingsData.followBack) || isFirstTime);

						if (user){ // When the user is in database but has already been added by likeBack
							await db.users.where("[plug+userid]").equals(["instagram", us.id]).modify({
								toFollow
							});
							us.whitelisted = user.whitelisted; // TODO: Not sure if needed
						} else{ // Here normal addition.
							await db.users.add(
								await actions.newDbUser(us, now, toFollow)
							);
						}

						if ((isFirstTime || !settingsData.followBack) && !onlyFetch) // Not followbacking all the people the first time
							continue;
							
						let followResult = await actions.followUser(us.id, checker)
						
						if (followResult) {
							await log.userInteraction("FOLLOWBACK", {
								img: us.img,
								userId: us.id,
								username: us.username
							});
							await db.users.where("[plug+userid]").equals(["instagram", us.id]).modify({ // Specify that has been auto_followed
								"details.autoFollowed": true,
								lastInteraction: now // If has been followed no interaction will occur for some time (TODO: May rethink this.)
							})
						}
					}
				}

				if ((isFirstTime || !settingsData.followBack) && !onlyFetch)
					return users;
				/*
				for (var u in cache) {
					var user = cache[u];
					if (!user.found && !user.whitelisted)
						await actions.unfollowUser(user.id);
				}
				*/
				
				return users;
			},
			/**
			* Like the users that like your photos
			**/
			async likeBack () {
				console.log("Starting likeBack");

				var notifications = await actions.getNotifications(),
					likeBackSettings = await settings.get("likeBack"),
					now = new Date().getTime(), 
					likebacked = 0;

				console.log("Getting notifications: ", notifications);

				for (let i = 0; i < notifications.list.length; i++) {
					let t = notifications.list[i];

					if (t.type != 1)
						continue;
					
					let query = await db.users.where("[plug+userid]").equals(["instagram", t.id]),
						qres = await query.toArray();

					if ((qres.length && (!qres[0].lastInteraction || (qres[0].lastInteraction  <= now - ms.days(likeBackSettings.ignoreTime)))) || !qres.length) {
						if (likebacked >= likeBackSettings.maxUsersLike)
							continue;
						likebacked ++;

						await actions.likeUserPosts(t.username, csrf, likeBackSettings.likes, checker, log);

						let res = await query.modify({
							lastInteraction: now
						})

						if (!res) {
							let userData = await actions.getUserData(t.username)
							await db.users.add(actions.newDbUser(t, now, 2))
						}
						await waiter(1000, 10000)
					} else {
						console.log("The user has been ignored.");
						continue;
					}
				}
					
			}
		}
	}
}