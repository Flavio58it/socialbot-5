/**
* This is the content script that will be loaded into every instagram page.
*
**/

import comm from "comm/comm";

if (process.env.NODE_ENV === 'development') {
	console.log("Development mode... Initializing image picker!");
	var _comm = new comm({name: "content"});

	_comm.initReceiver((action, data) => {
		if (action == "getImages") {
			var images = false, arr = [];
			if (data.plug == "instagram")
				images = document.querySelectorAll("main article a div img");
			
			images.forEach((img) => {
				if (img.src.indexOf(".cdninstagram.com") >= 0)
					arr.push(img.src);
			})

			_comm.send("imagesResult", {
				plug: data.plug,
				results: arr
			})
		}
	});

	/*setTimeout(() => {
		console.log("Wei!");
		var yeaimg = document.querySelectorAll("main article a div img");

		_comm.send("checkThisImage", {
			src: yeaimg[2].src
		})
	}, 1000)*/
}