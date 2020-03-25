import Comm from "./bot/comm";

import storage from "storage";
import db from "./bot/db";

import {
	getPeriodStats
} from "./db/filters"

import actions from "./actions/index";

import bootstrap from './bot/bootstrap'

// Main plugins object. All the plugins must be initialized here in order to have all the data available for the messages
var plugsInstances = {}, error = false;

// Initialize communication between control panel and backend.
Comm.listen("manager", async function (action, data) {
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
			let settings = await plugsInstances[data.plug].settings.getAll();
			let status = plugsInstances[data.plug].bot.getStatus();
			let stats = {
				month: await getPeriodStats(data.plug, 1, 30),
				summaryMonth: await getPeriodStats(data.plug, 1, 30, {sum: true}),
				today: await getPeriodStats(data.plug, 0, 1)
			}

			Comm.sendMessage("settings", {
				plug: data.plug,
				settings,
				status,
				stats
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
	Comm,
	onStart: () => {error = false}
}).then((instances) => {
	plugsInstances = instances
})

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}