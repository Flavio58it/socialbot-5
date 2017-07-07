import requests from "./requests";
import waiter from "waiter";

const bot = function(settings, plug, plugName) {
	var request = false;
	return plug.init().then((data) => {
		request = new requests(data.domain).listen(); // See the requests module for the explanation
		return settings.get("followTags")
	}).then((data) => {
		// LIke all the tag images
		var flow = Promise.resolve();
		data.forEach((tagName) => {
			flow = flow.then(() => {
				return settings.get("waiter").then((minmax) => {
					return plug.actions.likeTagImages(
						tagName, 
						minmax
					)
				})
			})
		})
		return flow;
	})
	// Like your flow images




	// When all is finished ---
	.then (() => {
		if (request)
			request.unlisten();
	})
}

export default function (settings, plug, plugName) {
	var t = this, running = false;

	t.start = () => {
		running = true;
		return settings.get("enabled").then((enabled) => {
			if (!enabled)
				return Promise.reject({stopped: true});
		}).then(() => bot(settings, plug, plugName)).then(() => {
			running = false;
			triggerTimer();
		}).catch ((e) => {
			running = false;
			if (e.stopped) {
				console.warn("Bot stopped");
				return;
			}
			return Promise.reject(e);
		});
	}


	function triggerTimer () {
		settings.get("waiter").then((wait) => {
			waiter(wait.roundPause * 1000 * 60).then(t.start); // Converted from minutes
		});
	}

}