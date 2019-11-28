import Comm from "./comm";
import settings from "./settings";

import storage from "storage";
import db from "./db/db";
import logger from "./db/logger";

import robot from "./robot";

// Import all plugins into the bot
import instagram from "./plugs/instagram/instagram";
import fivehpx from "./plugs/fivehpx/fivehpx";

// Main plugins object. All the pòlugins must be initialized here in order to have all the data
var plugs = {
	instagram: {
		settings: new settings("instagram"),
		plug: new instagram(),
		bot: false
	},
	fivehpx: {
		settings: new settings("fivehpx"),
		plug: new fivehpx(),
		bot: false
	}
}, error = false;

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
		case "directAction": // Direct operations to users by popup page and followManager
			switch(data.operation){
				case "whitelistUser": db.users.where("[plug+userid]").equals([data.plug, data.id]).modify({whitelisted: data.add});break;// Whitelist a user
				
			}
		break;
	}
	if (error) // Sure?
		Comm.sendMessage("backendError", {error});
});

// Start the bot when the browser is started!
for (var i in plugs) {
	var plugContainer = plugs[i];
	if (plugContainer.bot)
		continue;

	// Let's dance!
	plugContainer.bot = new robot(plugContainer.settings, plugContainer.plug, i);
	plugContainer.bot.start();

	// Send errors to frontend when necessary
	plugContainer.bot.addListener("error", (t, name, error) => {
		Comm.sendMessage("backendError", {
			plug: name,
			data: _error
		});
	});

	// Reset errors on bot boot
	plugContainer.bot.addListener("start", (t, name) => {
		error = false;
		Comm.sendMessage("backendError", {remove: true, plug: name});
	});

	// Send update to frontend. Ideally at this moment the user is showing a waiting screen during reboot
	plugContainer.bot.addListener("reboot", (t, name) => {
		Comm.sendMessage("statusUpdate", {status: t.getStatus(), plug: name});
	});
}

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}