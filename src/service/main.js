import Comm from "./bot/comm";
import settings from "./bot/settings";

import storage from "storage";
import db from "./db/db";

import robot from "./bot/robot";

import actions from "./actions";

import plugs from "./plugs";

// Main plugins object. All the plugins must be initialized here in order to have all the data
var plugsInstances = {}, error = false;

// Initialize communication between control panel and backend.
Comm.listen("manager", function(action, data) {
	switch (action) {
		case "sendAll":
			Comm.sendMessage(data.forwardAction, data.data);
		break;
		case "init":
			getAllInitInfo();
		break;
		case "resetStorage":
			storage.clear();
		break;
		case "resetDB":
			db.delete();
		break;
		case "getSettings":
			plugs[data.plug].settings.getAll().then((settings) => {
				Comm.sendMessage("settings", {
					plug: data.plug,
					settings,
					status: plugs[data.plug].bot.getStatus()
				});
			});
		break;
		case "saveSettings":
			plugs[data.plug].settings.setAll(data.settings).then(() => plugs[data.plug].bot.reboot());
		break;

		case "getUsers": 
			plugs[data.plug].bot.getPlug().then((plug) => {
				return plug.actions.followManager(true);
			}).then((users) => {
				Comm.sendMessage("usersData", {list: users, plug: data.plug});
			}).catch((_error) => {
				error = {
					plug: data.plug,
					data: _error
				}
			})
		break;
		case "getLogs": 
			var prom = db.logs;
			if (data.filter != "all")
				prom = prom.where("plug").equals(data.filter)
			if (data.limit)
				prom = prom.limit(data.limit)
			prom = prom.reverse();
			prom.toArray().then((data) => {
				Comm.sendMessage("logs", {list: data, forWhich: data.forWhich});
			});
		break;
		// Direct operations to users by popup page and followManager
		// Perform operation by bot type
		case "directAction":
			if (plugs[data.plug].bot !== false)
				plugs[data.plug].bot.directAction(data.operation, data);
		break;
		// Generic operation, usually related to internal database. Is same for every bot
		case "performOperation":
			if (data.operation)
				actions[data.operation](data);
		break;
	}
	if (error) // Sure?
		Comm.sendMessage("backendError", {error});
});


async function bootstrap() {
	for(var plugIndex = 0; plugs.enabledPlugs.length; plugIndex++) {
		let plug = plugs.enabledPlugs[plugIndex],
			plugInstantiator = await require(`./plugs/${plug}/${plug}`);
	
		let settingsInterface = new settings(plug);
	
		plugsInstances[plug] = {
			settings: settingsInterface,
			plug: new plugInstantiator(settingsInterface),
			bot: false
		}
	}

	for (var i in plugs) {
		var plugContainer = plugsInstances[i];
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
			error = false;

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
}

// Start the bot when the browser is started!
bootstrap()

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}