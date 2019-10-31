import Comm from "./comm";
import settings from "./settings";

import storage from "storage";
import db from "./db/db";
import logger from "./db/logger";

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

/*
// Code used for images moderation. Not used anymore as the system now uses tensorflow js
Comm.listen("content", function(action, data) {
	switch (action) {
		case "imagesResult":
			getImagesData(data.results).then((arr) => {
				console.log("Results: ", arr);
				Comm.sendMessage("moderateImages", {arr, plug: data.plug});
			});
		break;
	}
});*/

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
		plugContainer.bot.addListener("reboot", (t, name) => {
			Comm.sendMessage("statusUpdate", {status: t.getStatus(), plug: name});
		});
	}
}

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}