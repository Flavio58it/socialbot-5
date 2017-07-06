import format from "string-template";

const urls = {
	home: "https://www.instagram.com",
	json: "?__a=1",
	post: {
		like: "/web/likes/{0}/like/", // post id
		unlike: "/web/likes/{0}/like/", // post id
	},
	get: {
		tag: "/explore/tags/{0}/", // TagName
		feed: "/{0}/", // username
		notifications: "/account/activity/"
	}
};

function getUrl(url){
	return ((!/^https?:/.test(url))?urls.home:"") + url;
}

function decodeObject (url) {
	// parse page html and return the object of the page
	var el = document.createElement("html");

	return fetch(getUrl(url))
	.then((response) => {
		return response.text();
	})
	.then((data) => {
		el.innerHTML = data;
		return el;
	}).then((el) => {
		var data = document.evaluate("//script[contains(., 'window._sharedData')]", el).innerHTML;
		return JSON.parse(data.replace(/^.+=\s\{(.+$)/, "{$1"));
	})
}

export default function () {
	var id = "insta", csrf = false;

	return {
		// Check if user is logged in and get the token
		init () {
			return decodeObject(urls.home).then((json) => {
				csrf = json.config.csrf_token
			}).then(() => {
				return {
					logged: true
				}
			})
		},
		actions: {
			getNotifications () {
				
			},
			likeTagImages (tagName, wait, limit) {
				return false;
			}
		}
	}
}