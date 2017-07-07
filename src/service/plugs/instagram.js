import format from "string-template";
import waiter from "waiter";

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
}, 
// Used in encodeObject. Go to the function and watch the comments.
useJsonEncoding = true,
fetchConfig = {
	credentials: "include",
	mode: "cors"
};

function getUrl(url, overrideJson){
	return ((!/^https?:/.test(url))?urls.home:"") + url + ((useJsonEncoding && !overrideJson)?urls.json:"");
}

function decodeObject (url, overrideDecoder) {
	if (!useJsonEncoding || overrideDecoder === true) {
		// This is emergency fallback if the json method will not work anymore. Is dirty but is working.
		// parse page html and return the object of the page
		var el = document.createElement("html");

		return fetch(getUrl(url, true), fetchConfig)
		.then((response) => {
			return response.text();
		})
		.then((data) => {
			el.innerHTML = data;
			return el;
		}).then((el) => {
			var data = document.evaluate("//script[contains(., 'window._sharedData')]", el).iterateNext().innerHTML;
			return JSON.parse(data.replace(/^.+=\s\{(.+$)/, "{$1").replace(/\};$/, "}"));
		})
	} else {
		return fetch(getUrl(url), fetchConfig).then((data) => {
			return data.json();
		})
	}
}

function likePost (postId, csrf) {
	return fetch(getUrl(format(urls.post.like, postId), true), {
		credentials: "include",
		method: "POST",
		headers: {
			"content-type":"application/x-www-form-urlencoded",
			"x-requested-with": "XMLHttpRequest",
			"x-instagram-ajax":"1",
			"x-csrftoken": csrf
		}
	});
}

export default function () {
	var csrf = false;

	return {
		init () {
			// Check if user is logged in and get the token
			return decodeObject(urls.home, true).then((data) => {
				// Getting data from homepage, using the fallback method. The original json is much lighter and misses basic info as csrf_token.
				console.log("Init info: ", data)
				csrf = data.config.csrf_token;
				return {
						// TODO: Check login status
						logged: true,
						domain: urls.home
				}
			})
		},
		actions: {
			getNotifications () {
				
			},
			likeTagImages (tagName, wait, limit) {
				if (!csrf)
					return Promise.reject({error: "Init failed"});
				return decodeObject(format(urls.get.tag, tagName))
				.then((data) => {
					var ops = Promise.resolve();
					data.tag.media.nodes.forEach((d) => {
						// TODO: Check if the post is already liked
						ops = ops.then(() => likePost(d.id, csrf)).then(() => waiter(wait[0] * 1000, wait[1] * 1000));
					})
					return ops;
				});
			}
		}
	}
}