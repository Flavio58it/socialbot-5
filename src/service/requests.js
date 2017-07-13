/**
* -- Requests editor
* Manage the origin and referrer headers in order to simulate a real client
**/

function _updater(details) {
  var enableFix = false;
  for (var i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name === 'Origin') {
      if (details.requestHeaders[i].value.indexOf("chrome-extension") >= -1) {
        enableFix = true;
        details.requestHeaders.splice(i, 1);
      }
      break;
    }
  }
  if (enableFix) {
    //console.log("Headers fix enabled: ", details)
    details.requestHeaders.push({
    	name: "origin",
    	value: "https://www.instagram.com/"
    })
    details.requestHeaders.push({
    	name: "referer",
    	value: "https://www.instagram.com/"
    })
    //console.log("Headers fix result: ", details)
  }
  return {requestHeaders: details.requestHeaders};
}

export default (function (domain) {
  var listening = false;

	return {
		listen () {
      if (!listening)
  			chrome.webRequest.onBeforeSendHeaders.addListener(_updater, {
  			    urls: ['*://*.instagram.com/*']
  			}, [
  			    "blocking", "requestHeaders"
  			]);
      listening = true;
		},
		unlisten () {
      console.log("Unlistened")
			chrome.webRequest.onBeforeSendHeaders.removeListener(_updater);
      listening = false;
		}
	}
})