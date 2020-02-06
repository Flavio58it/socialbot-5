import waiter from "waiter";
import axios from "axios";
import db from "../../db/db";
import ms from "milliseconds";
import randomArray from "randEngine";
import objectMapper from "object-mapper";
import format from "string-template";
import urlParams from "url-params";

import {cache} from "./instagram";
import {getUrl, decodeObject, _postData} from "./utils";
import mappers from "./mappers";
import urls from "./urls";
import logger from "../../db/logger";

const lib = {
	likePost: function (postId, csrf) {
		return axios(getUrl(format(urls.post.like, postId), true), _postData(csrf));
	},
	getUsersBatch: function(query, userid, list, pointer) {
		if (!list)
			var list = [];
		var data = {
			"id": userid,
			"first": 100
		};
		if (pointer)
			data.after = pointer;
		return decodeObject(urlParams.add(format(urls.get.query, query), "variables", JSON.stringify(data)), {
			overrideJson: true
		}).then(data => data.data.user)
		.then((data) => {
			var fdata = data.edge_followed_by?data.edge_followed_by:data.edge_follow;
			list.push(...fdata.edges);
			if (fdata.page_info.has_next_page && fdata.page_info.end_cursor)
				return lib.getUsersBatch(query, userid, list, fdata.page_info.end_cursor);
			return list;
		})
	},
	getUserData: function(username) {
		var now = new Date().getTime();
		if (!cache.userData)
			cache.userData = {}
		if (cache.userData[username] && cache.userData[username].time >= (now - ms.minutes(20))) // Cached users for 20 minutes
			return Promise.resolve(cache.userData[username].data);
		return decodeObject(format(urls.get.user, username)).then((userData) => {
			var mapped = objectMapper(userData, mappers.user);
			console.log("User data expired for "+username+". Refetched.");
			cache.userData[username] = {
				data: mapped,
				time: now
			}
			return mapped;
		})
	},
	getNotifications: function() { // TODO: Send notifications to FE
		return decodeObject(urls.get.notifications).then((notifications) => {
			return objectMapper(notifications, mappers.notifications);
		});
	},
	likeUserPosts: function ({username, csrf, limit, checker, log}) {
		return lib.getUserData(username).then((userData) => {
			var len = userData.posts.list.length;
			if (len === 0)
				return Promise.resolve();
				
			var flow = Promise.resolve(),
				randNumbers = randomArray(limit, 0, len - 1);

			userData.posts.list.forEach((details, i) => {
				if (randNumbers && randNumbers.indexOf(i) != -1) { // If the post index is in array proceed
					flow = flow.then(() => decodeObject(format(urls.get.post, details.code)).then((post) => { // Check the post and see if has already been liked
						post = objectMapper(post, mappers.postData);
						if (!post.liked)
							return lib
								.likePost(details.id, csrf)
								.then(() => {
									//console.log("POPOST: ", details);
									userData.img = details.src; // Overwriting user image with post image
									return log.userInteraction("LIKEBACK", userData, {})
								})
								.then(() => waiter(ms.seconds(1), ms.seconds(5))); // Like and wait TODO: Check with police!
						else
							return waiter(ms.seconds(1), ms.seconds(5)); // Do not like but wait anyway... a call has been made!
					}))
				}
			});

			return flow;
		})
	},
	followUser: function (userId) {
		console.log("FollowUserAction")
		return Promise.resolve(true)
	},
	unfollowUser: function (userId) {
		console.log("UnfollowUserAction")
		return Promise.resolve(true);
	},
	newDbUser: function(us, now, toFollow) {
		return {
			plug: "instagram",
			userid: us.id,
			username: us.username,
			whitelisted: false,
			toFollow: toFollow,
			details: {
				img: us.img
			},
			lastInteraction: toFollow == 2?now:false,
			added: now
		}
	},
	cleanDB: function (){ // Clean database from old users. Async mode! Don't even try to make it syncronous!
		
	}
}

export default lib;