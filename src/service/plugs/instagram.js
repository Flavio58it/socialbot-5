import format from "string-template";
import urlParams from "url-params";
import waiter from "waiter";

const urls = {
	home: "https://www.instagram.com",
	json: {
		name: "__a",
		val: "1"
	},
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
var cache = {
	query_id: false
};

// ------------------
// Generic functions -----------------
function getUrl(url, overrideJson){
	if (/^chrome-extension:/.test(url))
		url = url.replace(/^.+\/\/.[^\/]+(.+)/, "$1");
	return ((!/^https?:/.test(url))?urls.home:"") + ((useJsonEncoding && !overrideJson)?urlParams.add(url, urls.json.name, urls.json.val):url);
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
						var src = data.querySelector("script[src*='Commons.js']").src, data = getUrl(src, true); // TODO: Implement script cache if the name remains the same.
						if (cache.query_id && cache.query_id.src == src && cache.query_id.id) {
							query_id = cache.query_id.id
							return Promise.resolve();
						}
						return fetch(data).then((script) => script.text()).then((script) => {
							var regex = /\:.{1,3}(\d{17}).{1,3}\,/;
							if (regex.test(script)){
								query_id = script.match(regex)[1];
								cache.query_id = {
									src: src,
									id: query_id
								}
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
					var nextQuery = pointer?
						urlParams.add(
							urlParams.add(
								format((urls.get.tag), tagName), "query_id", query_id), 
							"pointer", JSON.stringify({
								"tag_name": tagName,
								"first": numberLiked,
								"after": pointer
							})):
						format((urls.get.tag), tagName);

					return decodeObject(nextQuery)
					.then((data) => {
						var ops = Promise.resolve(), source = data.tag.media;

						source.nodes.forEach((d) => {
							    //console.log("Post data: ", d);
								ops = ops.then(() => {
									// If the user or the bot has already liked the post the like process is aborted, as the previous posts has already been viewed.
									if (numberLiked >= limit)
										return Promise.reject({likeLimitReached: true});
									return decodeObject(format(urls.get.post, d.code)).then((data) => {
										if (data.graphql.shortcode_media.viewer_has_liked) {
											return Promise.reject({alreadyLiked: true})
										}
										return waiter(1000, 5000).then(() => data);
									});
								})
								.then(() => likePost(d.id, csrf))
								.then((d) => {
									numberLiked++;
									return d;
								}).catch((e) => {
									if (e.likeLimitReached) // Passing the likeLimit as is not an error to manage here.
										return Promise.reject(e);
									console.error("Post not found...");
								})
								.then(() => waiter(wait.actionLower * 1000, wait.actionUpper * 1000))
						})

						return ops.then((prevData) => {
							//Here should recall like function with pointer
							if (source.page_info.end_cursor) {
								console.log("Next page");
								return like(source.page_info.end_cursor)
							} else {
								return Promise.resolve(prevData);
							}
						}).catch((e) => {
							if (e.alreadyLiked) {
								console.warn("Already liked. Aborting...");
								return Promise.resolve({
									data,
									liked: numberLiked
								});
							} else if (e.likeLimitReached) {
								console.warn("Like limit reached...");
								return Promise.resolve({
									data,
									liked: numberLiked
								})
							}
							return Promise.reject(e);
						});
					});
				}

				return like();
			},
			likeDashboard (wait, limit) {
				var numberLiked = 0;
				// TODO: Here should simulate activity of some type
				return decodeObject(urls.home).then((data) => {
					//console.log("DashboardLike: ", data);
					var source = data.graphql.user.edge_web_feed_timeline, flow = Promise.resolve();
					source.edges.forEach((post) => {
						post = post.node;
						flow = flow.then(() => {
							if (numberLiked >= limit)
								return Promise.reject({likeLimitReached: true});
							if (post.viewer_has_liked){
								return Promise.reject({alreadyLiked: true})
							}
							return likePost(post.id, csrf).then((d) => {
								numberLiked++;
								return d;
							}).catch((e) => {
								numberLiked++;
								return Promise.reject(e);
							})
							.then(() => waiter(wait.actionLower * 1000, wait.actionUpper * 1000));
						})
					})

					return flow.then((d) => {
						return d;
					}).catch((e) => {
						if (e.alreadyLiked) {
							console.warn("Already liked. Aborting...");
							return Promise.resolve({
								data,
								liked: numberLiked
							});
						} else if (e.likeLimitReached) {
							console.warn("Like limit reached...");
							return Promise.resolve({
								data,
								liked: numberLiked
							})
						}
						return Promise.reject(e);
					})
				})
			}
		}
	}
}