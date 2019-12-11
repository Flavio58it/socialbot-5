import requests from "./requests";
import waiter from "waiter";

/**
 * ROBOT JS
 * 
 * Promise based sequential actions executor. 
 * Uses plug functions for calls and uses timers to perform human-like interactions with servers
 */

const bot = function(settings, plug, plugName) {
	var request = false;
	return plug.init(settings).then((data) => {
		console.info("Logged in: ", data.logged);
		if (!data.logged)
			return Promise.reject({id: "LOGGED_OUT", error: "Login failure. Please go to the homepage and login.", action: "PLUG_HOME"})
		request = new requests(data.domain.match, data.domain.res).listen(); // See the requests module for the explanation
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
	.then(() => {
		// Likes the dashboards of users
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
		// Like back the users that liked your image.
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
		if (request)
			request.unlisten();
		return Promise.reject(e);
	})
}

export default function (settings, plug, plugName) {
	var t = this, 
		running = false, 
		inited = false, 
		events = {}, 
		rebooting = false, 	   // Flag used to track reboot process
		preRebootStatus = true // Used during reboot in order to force the bot to stop and reload new settings
	;

	if (!settings || !plug)
		return new error("Missing params");

	// Boot bot
	t.start = () => {
		running = true;
		
		events.runstatus&&events.runstatus(t, plugName);

		// Check if bot is flagged as enabled. If not the round is stopped
		return settings.get("enabled").then((enabled) => {
			if (!enabled)
				return Promise.reject({stopped: true});
		}).then(() => {
			events.start&&events.start(t, plugName);
			inited = true;
			
			// Start bot function
			return bot(settings, plug, plugName);
		}).then((result) => {
			// Round finished. Setting flag as stopped and initializing the timer for the next round.
			events.stop&&events.stop(t, plugName);

			running = false;
			triggerTimer();
		}).catch ((e) => {
			// Error or stopped/rebooting
			running = false;
			events.runstatus&&events.runstatus(t, plugName, e);
			triggerTimer(); // Restart after some time!

			if (e.stopped) {
				if (rebooting) {
					console.info("Rebooting");
					rebooting = false;
					settings.set("enabled", preRebootStatus).then(() => t.start());
					events.reboot&&events.reboot(t, plugName);
					preRebootStatus = true;
				} else {
					console.warn("Bot stopped");
					events.stop&&events.stop(t, plugName);
				}
			} else {
				console.error("Bot error", e);

				// Create user friendly generic error if we have no idea of what happened
				if (e.request && !e.request.status && !e.id)
				events.error&&events.error(t, plugName, {
					id: "NETWORK_GENERIC_ERROR",
					error: e.toString()
				});
			}
		});
	}

	t.getStatus = () => {
		return {
			running,
			rebooting
		};
	}

	t.reboot = () => {
		console.log("Reboot command. Running:", running)
		if (running)
			settings.get("enabled").then((enabled) => {
				preRebootStatus = enabled;
			})
			.then(() => settings.set("enabled", false))
			.then(() => {
				rebooting = true;
			});
		else
			t.start();
	}

	t.getPlug = () => {
		if (inited)
			return Promise.resolve(plug);
		return plug.init(settings).then((data) => {
			inited = true;
			return plug;
		})
	}

	/**
	 * Set various events callbacks
	 * 
	 * - error
	 * - reboot
	 * - start
	 * - runstatus
	 * - stop
	 */
	t.addListener = (ev, cbk) => {
		events[ev] = cbk;
	}

	// Simple timer that waits n ms before restarting server
	function triggerTimer () {
		settings.get("waiter").then((wait) => {
			waiter(wait.roundPause * 1000 * 60).then(() => (!running)?t.start():false); // Converted from minutes
		});
	}

}