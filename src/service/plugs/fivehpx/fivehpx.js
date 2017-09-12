import axios from "axios";

import urls from "./urls";





export default function() {
	var userData = false;


	return {
		init (settingsData) {
			return axios(urls.home).then((home) => {

			})
		},
		actions: {

		}
	}
}