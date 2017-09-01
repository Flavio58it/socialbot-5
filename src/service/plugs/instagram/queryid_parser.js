/**
* QUERYID_PARSER:
* Scary shit here... The site has a js file that manages the query ids. They changes the order each update and does not have any reference of what are doing...
* Some idea needed here. absolutely!
* If when change is not working, try to see common patterns in the number
**/

import axios from "axios";

import {cache} from "./instagram";


function queryIdParser(data) {
	cache.query_id = { // For now this is ok. when they change we will see if the old works anyways or other methods are needed
		id: {
			like: "17875800862117404",
			followers: "17851374694183129",
			following: "17874545323001329"
		}
	}
	return Promise.resolve(cache.query_id.id);
	/*
	// Getting the query id token from the only found position. Yes, is a script (puke)
	var src = data.querySelector("script[src*='Commons.js']").src, thenSrc = getUrl(src, true);
	if (cache.query_id && cache.query_id.src == src && cache.query_id.id) {
		query_id = cache.query_id.id
		return Promise.resolve();
	}
	return axios(thenSrc).then((script) => script.data).then((script) => {
		console.groupCollapsed("IDs parser");
		var regex = { // r = regex, rr = nested regex, i = index
			like: {r: /(?:\=|\:).{0,4}(\d{17}).[^;]/g, rr: /\d{17}/, i: 9},
			followers: {r: /(?:\=|\:).{0,4}(\d{17}).[^;]/g, rr: /\d{17}/, i: 6},
			following: {r: /(?:\=|\:).{0,4}(\d{17}).[^;]/g, rr: /\d{17}/, i: 7}
		}
		for (var y in regex) {
			if (regex[y].r.test(script)){
				query_id = query_id?query_id:{};
				query_id[y] = script.match(regex[y].r)[regex[y].i]
				console.log(y + " matched: ", script.match(regex[y].r));
				if (!query_id[y])
					console.warn("Query_id for " + y + " not found.");
				if (regex[y].rr && query_id[y])
					query_id[y] = query_id[y].match(regex[y].rr)[0]
			} else {
				console.error("query_id not found: ", y);
			}
		}
		console.log("Query-IDS: ", query_id);
		if (query_id){
			cache.query_id = {
				src: src,
				id: query_id
			}
		} else {
			cache.query_id = false;
			return Promise.reject({error: "Cannot get query data. Try to restart or wait for an update from the dev.", id: "QUERY_ID_ENGINE_FAILURE", action: "RELOAD"})
		}
		console.groupEnd();
	})*/

}

export default queryIdParser;