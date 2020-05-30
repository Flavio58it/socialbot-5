/**
* -- Requests editor
* Manage the origin and referrer headers in order to simulate a real client
**/

function _updater(details, domain) {
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
    details.requestHeaders.push({
    	name: "origin",
    	value: domain
    })
    details.requestHeaders.push({
    	name: "referer",
    	value: domain
    })
  }

  return {
    requestHeaders: details.requestHeaders
  };
}

export default (function (domain, override) {
  var listening = false, requestHeader = override || domain;

  console.info("Request overrider enabled on: ", domain, "on", override);

	return {
    // Listen to all requests and override the ones in the domain
		listen () {
      if (!listening)
  			chrome.webRequest.onBeforeSendHeaders.addListener((details) => _updater(details, requestHeader), {
  			    urls: [domain+ "/*"]
  			}, [
  			    "blocking", "requestHeaders", "extraHeaders"
  			]);
      listening = true;
    },
    // Disable the above listening callback
		unlisten () {
      console.log("Unlistened")
			chrome.webRequest.onBeforeSendHeaders.removeListener((details) => _updater(details, requestHeader));
      listening = false;
		}
	}
});