import format from "string-template";

const urls = {
	home: "https://www.instagram.com",
	post: {
		like: "/web/likes/{0}/like/", // post id
		unlike: "/web/likes/{0}/like/", // post id
	},
	get: {
		tag: "/explore/tags/{0}/", // TagName
		feed: "/{0}/", // username
		notifications: "/account/activity/?__a=1"
	}
};

function getUrl(url){
	return (!/^https?:/.test(url))?urls.home:"" + url;
}

function decodeObject (url) {
	// parse page html and return the object of the page
	var el = document.createElement("html");

	return fetch(getUrl(urls.get.notifications)).then((data) => {
		el.innerHTML = data;
		return el;
	}).then((el) => {
		el.querySelector("script:contains('window._sharedData')");
		var data = el.innerHTML;
		return data.replace(/^.+=\s\{(.+$)/, "{$1");
	})
}

export default function () {
	var id = "insta", 
		feedStatusIds = {
			homeFeed: false,
			myFeed: false,
			userFeed:{} // Used for all other users
		}

	return {
		init () {

		},
		actions: {
			getNotifications () {
				
			},
			getFeed () {

			},
			likePost () {
				
			}
		}
	}
}