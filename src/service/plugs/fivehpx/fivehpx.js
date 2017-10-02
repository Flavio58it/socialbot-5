import axios from "axios";
import waiter from "waiter";
import objectMapper from "object-mapper";

import urls from "./urls";
import {getUrl, _postData} from "./utils";
import mappers from "./mappers";
import police from "../../police";

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