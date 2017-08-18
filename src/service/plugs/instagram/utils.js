import axios from "axios";
import urlParams from "url-params";

import urls from "./urls";

// Used in decodeObject. Go to the function and watch the comments.
const useJsonEncoding = true;

export function getUrl(url, overrideJson){
	if (/^chrome-extension:/.test(url))
		url = url.replace(/^.+\/\/.[^\/]+(.+)/, "$1");
	return ((!/^https?:/.test(url))?urls.home:"") + ((useJsonEncoding && !overrideJson)?urlParams.add(url, urls.json.name, urls.json.val):url);
}

export function decodeObject (url, overrideDecoder, settings) {
	var settings = settings || {cbk:{}};
	if (!useJsonEncoding || overrideDecoder === true) {
		// This is emergency fallback if the json method will not work anymore. Is dirty but is working.
		// parse page html and return the object of the page
		var el = document.createElement("html");

		return axios(getUrl(url, true))
		.then((response) => {
			return response.data;
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
		return axios(getUrl(url, settings.overrideJson)).then((data) => data.data)
	}
}

export function _postData (csrf) {
	return {
		method: "POST",
		headers: {
			"content-type":"application/x-www-form-urlencoded",
			"x-requested-with": "XMLHttpRequest",
			"x-instagram-ajax":"1",
			"x-csrftoken": csrf
		}
	}
}