import urls from "./urls";
import format from "string-template";

export function getUrl(url, template){ // Template is an array of values
	if (/^chrome-extension:/.test(url))
		url = url.replace(/^.+\/\/.[^\/]+(.+)/, "$1");
	url = ((!/^https?:/.test(url))?urls.api:"") + url;
	if (template)
		url = format(url, template);
	return url;
}

export function _postData (csrf) {
	return {
		method: "GET",
		headers: {
			"content-type":"application/json",
			"x-requested-with": "XMLHttpRequest",
			"X-CSRF-Token": csrf
		}
	}
}