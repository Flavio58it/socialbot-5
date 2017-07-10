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
	if (/^chrome-extension:/.test(url))
		url = url.replace(/^.+\/\/.[^\/]+(.+)/, "$1");
	return ((!/^https?:/.test(url))?urls.home:"") + url + ((useJsonEncoding && !overrideJson)?urls.json:"");
}

function decodeObject (url, overrideDecoder, settings) {
	var settings = settings || {cbk:{}};
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
		})
		.then((el) => {
			if (settings.cbk.onData)
				return Promise.resolve(settings.cbk.onData(el)).then(() => el);
			else
				return Promise.resolve(el);
		})
		.then((el) => {
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
	var csrf = false, query_id = false;

	return {
		init () {
			// Check if user is logged in and get the tokens
			return decodeObject(urls.home, true, {
				cbk: {
					onData (data) {
						// Getting the query id token from the only found position. Yes, is a script (puke)
						var data = getUrl(data.querySelector("script[src*='Commons.js']").src, true);
						return fetch(data).then((script) => script.text()).then((script) => {
							var regex = /\:.{1,3}(\d{17}).{1,3}\,/;
							if (regex.test(script)){
								query_id = script.match(regex)[1];
							}
						}).catch(() => {
							console.error("Query id fetcher failed. Cannot look for new pages")
						})
					}
				}
			}).then((data) => {
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
			likeTagImages (tagName, wait, limit) {
				if (!csrf)
					return Promise.reject({error: "Init failed"});

				var numberLiked = 0;

				function like (pointer) {
					return decodeObject(format((urls.get.tag), tagName))
					.then((data) => {
						var ops = Promise.resolve();

						data.tag.media.nodes.forEach((d) => {
							    //console.log("Post data: ", d);
								ops = ops.then(() => {
									// If the user or the bot has already liked the post the like process is aborted, as the previous posts has already been viewed.
									if (numberLiked > limit)
										return Promise.reject({likedLimitReached: true});
									return decodeObject(format(urls.get.post, d.code)).then((data) => {
										if (data.graphql.shortcode_media.viewer_has_liked) {
											return Promise.reject({alreadyLiked: true})
										}
										return waiter(1000, 5000).then(() => data);
									});
								})
								.then(() => likePost(d.id, csrf))
								.then(() => waiter(wait.actionLower * 1000, wait.actionUpper * 1000))
						})
						return ops.then((data) => {
							//Here should recall like function with pointer
							return Promise.resolve(data);
						}).catch((e) => {
							if (e.alreadyLiked) {
								console.warn("Already liked. Aborting...");
								return Promise.resolve({
									data,
									liked: numberLiked
								});
							}
							return Promise.reject(e);
						});
					});
				}

				return like();
			}
		}
	}
}