/**
* This is the content script that will be loaded into every instagram page.
*
**/

import comm from "comm/comm";
import decoder from "imgDecoder";

if (process.env.NODE_ENV === 'development') {
	console.log("Development mode... Initializing image picker!");
	var _comm = new comm({name: "content"});

	_comm.initReceiver((action, data) => {
		if (action == "getImages") {
			var images = document.querySelectorAll("main article a div img");
			
		}
	}

}