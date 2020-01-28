import requests from "./requests";
import waiter from "waiter";

/**
 * ROBOT JS
 * 
 * Promise based sequential actions executor. 
 * Uses plug functions for calls and uses timers to perform human-like interactions with servers
 */

const bot = async function (settings, plug, plugName) {
	var plugData = await plug.init(settings);

	console.info("[robot] Logged in: ", plugData.logged);

	if (!plugData.logged)
		return Promise.reject({id: "LOGGED_OUT", error: "Login failure. Please go to the homepage and login.", action: "PLUG_HOME"})
	
	var request = new requests(plugData.domain.match, plugData.domain.res).listen(); // Modify requests to instagram server

	try {
		// 1st phase: likeTagImages
		// Bot will get the list of tags from settings and like a predefined number of photos from them
		var tags = await settings.get("follow");
		tags = tags.tags

		var waiter = await settings.get("waiter"),
			limits = await settings.get("limits")

		for (let i = 0; i < tags.length; i++) {
			let tagName = tags[i]

			await plug.actions.likeTagImages(
				tagName, 
				waiter,
				limits.likes.tag
			)
		}

		// 2nd phase: likeDashboard
		// Bot will like the user dashboard
		var shouldLikeDash = await settings.get("likeDash")
		if (shouldLikeDash && plug.actions.likeDashboard)
			await plug.actions.likeDashboard(waiter, limits.likes.dash)

		// 3rd phase: followManager
		// Manage followers of the user

		await plug.actions.followManager(false)

		// 4th phase: likeBack
		// Like images of users that liked yours
		var shouldLikeBack = await settings.get("likeBack");

		if (shouldLikeBack.enabled && plug.actions.likeBack)
			await plug.actions.likeBack()
		
		console.info("[robot] Round finished");
		if (request)
			request.unlisten();
	} catch (e) {
		// In case of errors disable requests editor

		if (request)
			request.unlisten();

		return await Promise.reject(e)
	}
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
	/**
	 * Params:
	 * * singleRun {boolean} - Run the bot only once, does not loop
	 */
	t.start = (singleRun) => {
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
			if (!singleRun)
				triggerTimer();
		}).catch ((e) => {
			// Error or stopped/rebooting
			running = false;
			events.runstatus&&events.runstatus(t, plugName, e);
			if (!singleRun)
				triggerTimer(); // Restart after some time!

			if (e.stopped) {
				if (rebooting) {
					console.info("Rebooting");
					rebooting = false;
					settings.set("enabled", preRebootStatus).then(() => t.start());
					events.reboot&&events.reboot(t, plugName);
					preRebootStatus = true;
				} else {
					console.warn("[robot] Bot stopped");
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
			waiter(wait.roundPause * 1000 * 60).then(() => (!running)&&t.start()); // Converted from minutes
		});
	}

}