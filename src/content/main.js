/**
* This is the content script that will be loaded into every spotify page.
*
**/

import comm from "comm/comm";
import mQ from "mQ";

import {open} from "./fetcher";
import domRemote from "./domRemote";

import spotifyDomHooks from "spotifyDomHooks";

var checker = 
setInterval(function(){
	// Wait until the page is completely ready and the bar shows up!
	if (mQ("div.now-playing-bar").length) {
		clearInterval(checker);
		init();
	}
}, 200)


function init() {
	var _comm = new comm({name: "spotiPage"}),
		fetcher = new open(), // This will be used to differentiate the fetcher if the interface will return to play.spotify.com
		interval = false,
		remoteInjected = false;

	_comm.initReceiver(function(action, data){
		//console.log("Received message!!!", action)
		if (action == "startWatching" && interval === false) {
			interval = setInterval(function(){ // Send update every second to user interface(s)
				_comm.send("songData", fetcher.getSong())
			}, 1000)
		} 
		else if (action == "stopWatchers") {
			clearInterval(interval);
			interval = false;
		}
		else if (action == "buttonAction") {
			if (!remoteInjected) {
				remoteInjected = true;
				domRemote();
				window.postMessage({action: "_domRemoteHooks_", type: spotifyDomHooks}, "*");
			}
			if (data.actionName == "playPause") { // Toggle action. Must check which selector can be used
				var container = document.querySelector(spotifyDomHooks["mainContainer"]);
				if (container)
					data.actionName = container.querySelector(spotifyDomHooks["play"])?"play":"pause";
			}
			window.postMessage({action: "_domRemoteButtonAction_", type: data.actionName}, "*");
			_comm.send("songData", fetcher.getSong()); // Send update immediately to reflect data
		}
	});
	
	_comm.send("ready");
}