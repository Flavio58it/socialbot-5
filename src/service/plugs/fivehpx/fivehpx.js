import axios from "axios";
import waiter from "waiter";
import objectMapper from "object-mapper";

import urls from "./urls";
import {getUrl, _postData} from "./utils";
import mappers from "./mappers";
import actions from "./actions";
import police from "../../bot/police";

export default function() {
	var settings = false,
		checker = false,
		csrf = false,
		userData = false;


	return {
		init (settingsData) { // Start the game
			settings = settingsData;
			checker = new police(settingsData); 

			return axios(urls.home).then((home) => {
				var dom = document.createElement("html");
				dom.innerHTML = home.data;
				csrf = dom.querySelector("meta[name*='csrf-token']").getAttribute("content");

				return {
					logged: true,
					domain: {
						match: urls.api,
						res: urls.home
					}
				}
			})
		},
		actions: {
			likeTagImages (tagName, wait, limit) {

				var numberLikes = 0;

				function like (page) {
					return axios(getUrl(urls.get.tag, [tagName, page || 1]), _postData(csrf)).then((data) => {
						return objectMapper(data.data, mappers.postTagList);
					}).then((data) => {
						console.log(data)
						var flow = Promise.resolve();

						data.list.forEach((t) => {
							flow = flow.then(() => {
								if (numberLiked >= limit)
									return Promise.reject({id: "LIKE_LIMIT_REACHED"});

							})
							.then(() => checker.shouldLike(t).then((res) => {
								if  (!res)
									return Promise.reject({id: "LIKE_REJECTED"});
							}))
							.then(() => actions.likePost(d.id, csrf))
							.then((data) => {log.userInteraction("LIKE", d, {tag: tagName});return data;})
							.then((data) => {
								numberLiked++;
								return data;
							}).catch((e) => {
								if (e.id == "LIKE_LIMIT_REACHED" || e.id == "ALREADY_LIKED"){ // Passing the likeLimit as is not an error to manage here.
									return Promise.reject(e);
								} else if (e.id == "LIKE_REJECTED"){
									console.warn("Like rejected by police");
									//log.userInteraction(e.id, d, {tag: tagName});
									rejector++;
									if (rejector > 5) { // Like reject protection system. See the declaration of the var for explanation.
										numberLiked++;
										rejector = 0;
									}
									return Promise.resolve();
								} else if (e.response && e.response.status == 404) {
									console.error("Post not found...");
									return Promise.resolve();
								} else if (e.stopped) // Pass the stopper
									return Promise.reject(e);
								return Promise.reject({error: "Connection error.", details: (e.details || e), id: "CONNECTION_ERROR_TAG_LIKE", action: "RELOAD"});
							})
							.then(() => waiter(ms.seconds(wait.actionLower), ms.seconds(wait.actionUpper)))
						});
						
					})
				}

				return like();
			},
			followManager (mode) {
				return Promise.resolve([])
			}
		}
	}
}