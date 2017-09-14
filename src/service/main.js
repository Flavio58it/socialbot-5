import Comm from "./comm";
import settings from "./settings";

import storage from "storage";
import db from "./db/db";
import logger from "./db/logger";
import {getImagesData} from "./ai/neural";

import robot from "./robot";

import instagram from "./plugs/instagram/instagram";
import fivehpx from "./plugs/fivehpx/fivehpx";

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
			plugs[data.type].settings.getAll().then((settings) => {
				Comm.sendMessage("settings", {
					type: data.type,
					settings,
					status: plugs[data.type].bot.getStatus()
				});
			});
		break;
		case "saveSettings":
			plugs[data.type].settings.setAll(data.settings);
			plugs[data.type].bot.reboot();
		break;

		case "getUsers": 
			plugs[data.type].bot.getPlug().then((plug) => {
				return plug.actions.followManager(true);
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
			prom = prom.reverse();
			prom.toArray().then((data) => {
				Comm.sendMessage("logs", {list: data, forWhich: data.forWhich});
			});
		break;
		case "whitelistUser": // Whitelist a user
			db.users.where("[plug+userid]").equals([data.type, data.id]).modify({whitelisted: data.add});
		break;
	}
	if (error) // Sure?
		Comm.sendMessage("backendError", {error});
});

Comm.listen("content", function(action, data) {
	switch (action) {
		case "imagesResult":
			getImagesData(data.results).then((arr) => {
				console.log("Results: ", arr);
				Comm.sendMessage("moderateImages", {arr, plug: data.plug});
			});
		break;
	}
});

// Start the bot when the browser is started!
for (var i in plugs) {
	var plugContainer = plugs[i];
	if (!plugContainer.bot) {
		plugContainer.bot = new robot(plugContainer.settings, plugContainer.plug, i);
		plugContainer.bot.start();
		plugContainer.bot.addListener("error", (t, name, _error) => {
			error = {
				plug: name,
				data: _error
			}
			Comm.sendMessage("backendError", {error});
		});
		plugContainer.bot.addListener("start", (t, name) => {
			error = false;
			Comm.sendMessage("backendError", {remove: true, plug: name});
		});
	}
}

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}