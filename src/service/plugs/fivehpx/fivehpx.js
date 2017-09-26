import axios from "axios";

import urls from "./urls";
import police from "../../police";





export default function() {
	var settings = false,
		userData = false;


	return {
		init (settingsData) {
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
				return Promise.resolve()
			},
			followManager (mode) {
				return Promise.resolve([])
			}
		}
	}
}