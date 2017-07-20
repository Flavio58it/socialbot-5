import Comm from "./comm";
import settings from "./settings";

import storage from "storage";
import db from "./db/db";
import logger from "./db/logger.js";

import robot from "./robot";

import instagram from "./plugs/instagram";

var plugs = {
	instagram: {
		settings: new settings("instagram"),
		plug: new instagram(),
		bot: false
	}
}

Comm.listen("manager", function(action, data) {
	switch (action) {
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
			plugs[data.type].settings.getAll().then((settings) => {
				Comm.sendMessage("settings", {
					type: data.type,
					settings
				});
			});
		break;
		case "saveSettings":
			plugs[data.type].settings.setAll(data.settings);
		break;

		case "getUsers": 
			plugs[data.type].bot.getPlug().then((plug) => {
				return plug.actions.followManager();
			}).then((users) => {
				Comm.sendMessage("usersData", {list: users, type: data.type});
			})
		break;
		case "getLogs": 
			var prom = db.logs;
			if (data.filter != "all")
				prom = prom.where("plug").equals(data.filter)
			if (data.limit)
				prom = prom.limit(data.limit)
			prom.toArray().then((data) => {
				Comm.sendMessage("logs", {list: data, forWhich: data.forWhich});
			});
		break;
	}
})

// Start the bot when the browser is started!
for (var i in plugs) {
	var plugContainer = plugs[i];
	if (!plugContainer.bot) {
		plugContainer.bot = new robot(plugContainer.settings, plugContainer.plug, i);
		plugContainer.bot.start();
	}
}

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}