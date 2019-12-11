/**
* This is the content script that will be loaded into every instagram page.
*
* This section is used to get all images in instagram page (AI). Disabled as not needed anymore.
* Can be enabled by the following in the manifest: 
   "content_scripts":[
     {
      "matches": ["*://*.instagram.com/*"],
      "js": ["/dist/content.js"],
      "all_frames": false
    }
  ],
**/

/*
if (process.env.NODE_ENV === 'development') {
	var images = false, arr = [];
	if (data.plug == "instagram")
		images = document.querySelectorAll("main article a div img");
	
	images.forEach((img) => {
		if (img.src.indexOf(".cdninstagram.com") >= 0)
			download(img.src);
	});

	function download (src) {
		
	}
}
*/