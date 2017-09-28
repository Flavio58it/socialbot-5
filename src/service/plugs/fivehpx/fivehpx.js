import axios from "axios";
import waiter from "waiter";
import objectMapper from "object-mapper";

import urls from "./urls";
import {getUrl} from "./utils";
import mappers from "./mappers";
import police from "../../police";

export default function() {
	var settings = false,
		userData = false;


	return {
		init (settingsData) { // Start the game
			settings = settingsData;
			checker = new police(settingsData); 

			return axios(urls.home).then((home) => {
				return {
					logged: true
				}
			})
		},
		actions: {
			likeTagImages (tagName, wait, limit) {

				var numberLikes = 0;

				function like () {
					return axios(getUrl(urls.get.tag, [tagName, 0])).then((data) => {
						return objectMapper(data, mappers.tagList);
					}).then((data) => {
						var flow = Promise.resolve();
						
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