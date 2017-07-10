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
		post: "/p/{0}/", // Get the post data
		notifications: "/account/activity/"
	}
}, 
// Used in encodeObject. Go to the function and watch the comments.
useJsonEncoding = true,
fetchConfig = {
	credentials: "include",
	mode: "cors"
};

// ------------------
// Generic functions -----------------
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

function _postData (csrf) {
	return {
		credentials: "include",
		method: "POST",
		headers: {
			"content-type":"application/x-www-form-urlencoded",
			"x-requested-with": "XMLHttpRequest",
			"x-instagram-ajax":"1",
			"x-csrftoken": csrf
		}
	}
}

// -----------------
// Action functions ----------------
function likePost (postId, csrf) {
	return fetch(getUrl(format(urls.post.like, postId), true), _postData(csrf));
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
						connectionOk: true,
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
				var continueLikes = 
				return decodeObject(format(urls.get.tag, tagName))
				.then((data) => {
					var ops = Promise.resolve();
					data.tag.media.nodes.forEach((d) => {
						// TODO: Check if the post is already liked
						console.log("Post data: ", d);

						ops = ops.then(() => {
							return decodeObject(format(urls.get.post, d.id)).then(() => {
								
							});
						})
						.then(() => likePost(d.id, csrf))
						.then(() => waiter(wait.actionLower * 1000, wait.actionUpper
						 * 1000));
					})
					return ops;
				});
			}
		}
	}
}