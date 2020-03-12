import Comm from "./bot/comm";

import storage from "storage";
import db from "./db/db";

import actions from "./actions";

import bootstrap from './bot/bootstrap'

// Main plugins object. All the plugins must be initialized here in order to have all the data available for the messages
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
			plugsInstances[data.plug].settings.getAll().then((settings) => {
				Comm.sendMessage("settings", {
					plug: data.plug,
					settings,
					status: plugsInstances[data.plug].bot.getStatus()
				});
			});
		break;
		case "saveSettings":
			plugsInstances[data.plug].settings.setAll(data.settings).then(() => plugsInstances[data.plug].bot.reboot());
		break;

		case "getUsers": 
			plugsInstances[data.plug].bot.getPlug().then((plug) => {
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
			if (plugsInstances[data.plug].bot !== false)
				plugsInstances[data.plug].bot.directAction(data.operation, data);
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

// Start bot
bootstrap({
	Comm
}).then((plugs) => {plugsInstances = plugs})

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}