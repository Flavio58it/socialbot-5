const listener = function(details) {
  for (var i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name === 'origin') {
      details.requestHeaders.splice(i, 1);
      break;
    }
  }
  details.requestHeaders.push({
  	name: "origin",
  	value: "https://www.instagram.com/"
  })
  details.requestHeaders.push({
  	name: "referer",
  	value: "https://www.instagram.com/"
  })
  return {requestHeaders: details.requestHeaders};
}

export default (function () {
	return {
		listen () {
			chrome.webRequest.onBeforeSendHeaders.addListener(
		        	listener
		        , {
			    urls: ['*://*.google.com/*']
			}, [
			    "requestHeaders"
			]);
		},
		unlisten () {
			chrome.webRequest.onBeforeSendHeaders.removeListener(listener)
		}
	}
})()