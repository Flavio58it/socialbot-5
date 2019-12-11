/**
* -- DomRemote script injector --
* 
* Create and inject the script that directly manages the javascrtipt of the page.
* The trick in createScript function is used to bypass the sandbox of the chrome extension
*
**/
function createScript(fun) {
	var funTemplate = `(${fun.toString()})(window, document)`,
		script = document.createElement("script");
	script.innerHTML = funTemplate;
	document.head.appendChild(script);
	document.head.removeChild(script);
}

export default function() {
	// createScript(function(window, document){});
}