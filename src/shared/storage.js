/**
* -- PROMISE google sotrage
*
* Adapt google storage to promise
* TODO: Sync with cloud
**/

const _p = (cbk) => new Promise(cbk);

export default {
	set: function(obj){
		return _p(function(s, f){
			try {
				chrome.storage.local.set(obj, s);
			} catch (e) {f(e)}
		})
	},
	get: function(name){
		return _p(function(s, f){
			try {
				chrome.storage.local.get(name, s);
			} catch (e) {f(e)}
		})
	},
	clear: function(){
		return _p(function(s, f){
			try {
				chrome.storage.local.clear(s);
			} catch (e) {f(e)}
		})
	}
}