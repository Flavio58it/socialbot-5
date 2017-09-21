import axios from "axios";

import urls from "./urls";





export default function() {
	var settings = false,
		userData = false;


	return {
		init (settingsData) {
			settings = settingsData;
			checker = new police(settingsData); 
			
			return axios(urls.home).then((home) => {

			})
		},
		actions: {

		}
	}
}