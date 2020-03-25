/**
 * Main bootstrap file
 * 
 * This script will start all available plugs.
 * The plugs that will be started are listed in plugs file
 * 
 */

import robot from "./robot";
import settings from "./settings"

// Get enabled plugs list
import plugs from "../plugs";

export default async function bootstrap({ Comm, onStart }) {
    var instances = {}

	for (let plugIndex = 0; plugIndex < plugs.enabledPlugs.length; plugIndex ++) {
        let plug = plugs.enabledPlugs[plugIndex],
            plugInstantiator = await require(`../plugs/${plug}/${plug}`).default;
	
        let settingsInterface = await new settings(plug);
	
		instances[plug] = {
			settings: settingsInterface,
			plug: new plugInstantiator(settingsInterface),
			bot: false
        }
	}

	for (var i in instances) {
		var plugContainer = instances[i];
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
			onStart && onStart()

			Comm.sendMessage("backendError", {remove: true, plug: name});
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