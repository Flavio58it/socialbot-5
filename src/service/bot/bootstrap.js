/**
 * Main bootstrap file
 * 
 * This script will start all available plugs.
 * The plugs that will be started are listed in plugs file
 * 
 */

import robot from "./robot";
import settings from "./settings"
import logs, { PlugLogger } from "./logs"

export default async function bootstrap({ 
	Comm, 
	plugs,
	
	plugInstantiators = {}
}) {
	var instances = {}
	
	logs.clearEvent()
	// Implement realtime logging to frontend and popup
	logs.attachEvent("log", function () {
		Comm.sendMessage("logs", logs.getLogs());
	})

	logs.attachEvent("clear", function () {
		Comm.sendMessage("logs", logs.getLogs());
	})

	for (let plugIndex = 0; plugIndex < plugs.enabledPlugs.length; plugIndex ++) {
        const plug = plugs.enabledPlugs[plugIndex],
            plugInstantiator = plugInstantiators[plug] ? plugInstantiators[plug] : await require(`../plugs/${plug}/${plug}`).default;
	
        const settingsInterface = await new settings(plug);
	
		instances[plug] = {
			settings: settingsInterface,
			plug: new plugInstantiator(settingsInterface),
			logger: new PlugLogger(plug),
			bot: false
        }
	}

	for (const i in instances) {
		const plugContainer = instances[i];
		if (plugContainer.bot)
			continue;

		// Let's dance!
		plugContainer.bot = new robot(plugContainer.settings, plugContainer.plug, i);
		plugContainer.bot.start();

		// Send errors to frontend when necessary
		plugContainer.bot.addListener("error", (t, name, error) => {
			Comm.sendMessage("backendError", {
				plug: name,
				data: error
			});
		});

		// Reset errors on bot boot
		plugContainer.bot.addListener("start", (t, name) => {
			logs.setLogAsRead() // TODO: Should clear only for starting plug
			// Update settings status
			Comm.sendMessage("statusUpdate", {status: t.getStatus(), plug: name});
		});

		// Send update to frontend. Ideally at this moment the user is showing a waiting screen during reboot
		plugContainer.bot.addListener("reboot", (t, name) => {
			Comm.sendMessage("statusUpdate", {status: t.getStatus(), plug: name});
		});

		plugContainer.bot.addListener("stop", (t, name) => {
			Comm.sendMessage("statusUpdate", {status: t.getStatus(), plug: name});
		});
    }
    
    return instances;
}