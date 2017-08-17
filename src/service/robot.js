import requests from "./requests";
import waiter from "waiter";

const bot = function(settings, plug, plugName) {
	var request = false;
	return plug.init(settings).then((data) => {
		console.info("Logged in: ", data.logged);
		request = new requests(data.domain).listen(); // See the requests module for the explanation
		return settings.get("follow").then((follow) => follow.tags)
	}).then((data) => {
		// LIke all the tag images
		var flow = Promise.resolve();
		data.forEach((tagName) => {
			flow = flow.then(() => {
				return Promise.all([
					settings.get("waiter"),
					settings.get("limits")
				]).then((settings) => {
					return plug.actions.likeTagImages(
						tagName, 
						settings[0],
						settings[1].likes.tag
					)
				})
			})
		})
		return flow;
	})
	// Like your flow images
	.then(() => {
		return settings.get("likeDash").then((shouldLike) => {
			if (shouldLike)
				return Promise.all([
					settings.get("waiter"),
					settings.get("limits")
				]).then ((settings) => plug.actions.likeDashboard(settings[0], settings[1].likes.dash));
			else
				return Promise.resolve();
		})
	}).then(() => {
		return plug.actions.followManager(false);
	}).then(() => {
		return settings.get("likeBack").then((setting) => {
			if (!setting.enabled)
				return Promise.resolve();
			return plug.actions.likeBack();
		})
	})


	// When all is finished ---
	.then (() => {
		console.info("Round finished");
		if (request)
			request.unlisten();
	}).catch((e) => {
		//console.error("Round error", e);
		if (request)
			request.unlisten();
		return Promise.reject(e);
	})
}

export default function (settings, plug, plugName) {
	var t = this, running = false, runningOnce = false, events = {};

	t.start = () => {
		running = runningOnce = true;
		return settings.get("enabled").then((enabled) => {
			if (!enabled)
				return Promise.reject({stopped: true});
		}).then(() => {
			events.start&&events.start(this, plugName);
			return bot(settings, plug, plugName);
		}).then(() => {
			running = false;
			triggerTimer();
		}).catch ((e) => {
			running = runningOnce = false;
			triggerTimer(); // Restart after some time!
			if (e.stopped) {
				console.warn("Bot stopped");
				events.stop&&events.stop(this, plugName);
			} else {
				console.error("Bot error", e);
				events.error&&events.error(this, plugName, e);
			}
			//return Promise.reject(e);
		});
	}

	t.isRunning = () => {
		return running;
	}

	t.getPlug = () => {
		if (runningOnce)
			return Promise.resolve(plug);
		return plug.init(settings).then((data) => {
			return plug;
		})
	}

	t.addListener = (ev, cbk) => {
		events[ev] = cbk;
	}


	function triggerTimer () {
		settings.get("waiter").then((wait) => {
			waiter(wait.roundPause * 1000 * 60).then(t.start); // Converted from minutes
		});
	}

}