import axios from "axios";
import urlParams from "url-params";

import urls from "./urls";

export function getUrl(url, overrideJson){
	if (/^chrome-extension:/.test(url))
		url = url.replace(/^.+\/\/.[^\/]+(.+)/, "$1");
	return ((!/^https?:/.test(url))?urls.home:"") + (!overrideJson?urlParams.add(url, urls.json.name, urls.json.val):url);
}

export async function decodeObject (url, extraSettings) {
	const settings = {
		cbk: {}, 
		overrideJson: false,
		overrideDecoder: false,
		overrideSelector: "window._sharedData",
		overrideCallback: (data) => data.replace(/^.+=\s\{(.+$)/, "{$1").replace(/\};$/, "}"),
		...extraSettings
	};

	/**
	 * Instagram has two methods for providing data to browser:
	 * 
	 * * Ajax call to service, returns json. This is nominally triggered by adding '?__a=1'. It works only in certain cases
	 * * in-page object, returns html of page with in-dom script.
	 * 
	 */
	
	if (settings.overrideDecoder === true) {
		var el = document.createElement("html");

		var page = await axios(getUrl(url, true));
		page = page.data;

		el.innerHTML = page;

		if (settings.cbk.onData)
			await Promise.resolve(settings.cbk.onData(el))
		
		var data = document.evaluate(`//script[contains(., "${settings.overrideSelector}")]`, el).iterateNext().innerHTML;	

		// Replaced JSON.parse with looser model as some objects returned from instagramfunction params are not valid jsons but real objects
		return Function(`"use strict";return ${settings.overrideCallback(data)}`)();
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