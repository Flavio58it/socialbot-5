import waiter from "waiter";
import axios from "axios";
import ms from "milliseconds";
import randomArray from "randEngine";
import objectMapper from "object-mapper";
import format from "string-template";
import urlParams from "url-params";

import {cache} from "./instagram";
import {getUrl, decodeObject, _postData} from "./utils";
import mappers from "./mappers";
import urls from "./urls";

const lib = {
	likePost: function (postId, csrf) {
		return axios(getUrl(format(urls.post.like, postId), true), _postData(csrf));
	},
	getUsersBatch: async function(query, userid, list, pointer) {
		if (!list)
			var list = [];
		var data = {
			"id": userid,
			"first": 100
		};
		if (pointer)
			data.after = pointer;

		var user = await decodeObject(urlParams.add(format(urls.get.query, query), "variables", JSON.stringify(data)), {
			overrideJson: true
		});

		user = user.data.user;

		var fdata = user.edge_followed_by?user.edge_followed_by:user.edge_follow;

		list.push(...fdata.edges);

		if (fdata.page_info.has_next_page && fdata.page_info.end_cursor)
			return lib.getUsersBatch(query, userid, list, fdata.page_info.end_cursor);

		return list;
	},
	getUserData: async function(username) {
		var now = new Date().getTime();
		if (!cache.userData)
			cache.userData = {}
		if (cache.userData[username] && cache.userData[username].time >= (now - ms.minutes(20))) // Cached users for 20 minutes
			return cache.userData[username].data;

		var userData = await decodeObject(format(urls.get.user, username));
		var mapped = objectMapper(userData, mappers.user);

		console.log("User data expired for "+username+". Refetched.");
		cache.userData[username] = {
			data: mapped,
			time: now
		}
		return mapped;
	},
	getNotifications: async function() { // TODO: Send notifications to FE
		var notifications = await decodeObject(urls.get.notifications);
		return objectMapper(notifications, mappers.notifications);
	},
	likeUserPosts: async function ({username, csrf, limit, checker, history, waitTime}) {
		var userData = await lib.getUserData(username)

		if (!userData.posts || !userData.posts.list) {
			console.warn("No posts")
			return;
		}

		const len = userData.posts.list.length;
		if (len === 0)
			return;
			
		// Like images randomly in the list
		var randNumbers = randomArray(limit, 0, len - 1);

		for (let i = 0; i < len; i++) {
			let details = userData.posts.list[i];

			if (randNumbers && randNumbers.indexOf(i) != -1) { // If the post index is in array proceed
				let post = await decodeObject(format(urls.get.post, details.code));

				post = objectMapper(post, mappers.postData);
				if (!post.liked) {
					var likedPost = await lib.likePost(details.id, csrf);
					userData.img = details.src;
					await history.userInteraction("LIKEBACK", userData, {})
				}
				await waiter(ms.seconds(waitTime.min), ms.seconds(waitTime.max));
			}
		}	
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
	}
}

export default lib;