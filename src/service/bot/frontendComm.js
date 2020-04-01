import storage from "storage";
import db from "./db";
import logs from "./logs"

import {
	getPeriodStats
} from "../db/filters"

import actions from "../actions/index";

export default class {
	constructor ({
		Comm,
		plugsInstances
	} = {}) {
		this.comm = Comm
		this.plugsInstances = plugsInstances

		this.error = false
	}

	async event (action, data) {
		console.log("Frontend message", action, data);

		switch (action) {
			case "sendAll":
				this.comm.sendMessage(data.forwardAction, data.data);
			break;
			case "init":
				this.getAllInitInfo();
			break;
			case "resetStorage":
				storage.clear();
			break;
			case "resetDB":
				db.delete();
			break;
			case "getPlugData":
				let settings = await this.plugsInstances[data.plug].settings.getAll();
				let status = this.plugsInstances[data.plug].bot.getStatus();
				let stats = {
					month: await getPeriodStats(data.plug, 1, 30),
					summaryMonth: await getPeriodStats(data.plug, 1, 30, {sum: true}),
					today: await getPeriodStats(data.plug, 0, 1)
				}
	
				this.comm.sendMessage("plugData", {
					plug: data.plug,
					settings,
					status,
					stats
				});
			break;
			case "getPlugDayStats":
				this.comm.sendMessage("plugDayStats", {
					plug: data.plug,
					dayStats: await getPeriodStats(data.plug, 0, 1)
				})
			break;
			case "saveSettings":
				this.plugsInstances[data.plug].settings.setAll(data.settings).then(() => this.plugsInstances[data.plug].bot.reboot());
			break;
	
			case "getUsers": 
				this.plugsInstances[data.plug].bot.getPlug().then((plug) => {
					return plug.actions.followManager(true);
				}).then((users) => {
					this.comm.sendMessage("usersData", {list: users, plug: data.plug});
				}).catch((_error) => {
					this.error = {
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
					this.comm.sendMessage("logs", {list: data, forWhich: data.forWhich});
				});
			break;
			// Direct operations to users by popup page and followManager
			// Perform operation by bot type
			case "directAction":
				if (this.plugsInstances[data.plug].bot !== false)
					this.plugsInstances[data.plug].bot.directAction(data.operation, data);
			break;
			// Generic operation, usually related to internal database. Is same for every bot
			case "performOperation":
				if (data.operation)
					actions[data.operation](data);
			break;
		}
		if (this.error) { // Sure?
			logs.logError(this.error, data.plug || undefined)
			this.error = false;
		}
	}

	getAllInitInfo() {
		this.comm.sendMessage("initInfo", {});
	}
}
