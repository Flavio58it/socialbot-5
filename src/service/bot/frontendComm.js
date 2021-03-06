import storage from "storage";
import db from "./db";
import logs from "./logs"

import {
	getPeriodStats,
	getHistory
} from "../db/History"

import Users from "../db/Users"

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
				try {
					const plugInstance = await this.plugsInstances[data.plug].bot.getPlug()

					// Provide cache immediately
					const cachedUsers = await Users.getAllUsers()
					await this.comm.sendMessage("usersData", {list: cachedUsers, plug: data.plug, cached: true});

					// Fetch users nominally updating the cache for next time and resending it
					const users = await plugInstance.actions.followManager(true);
					await this.comm.sendMessage("usersData", {list: users, plug: data.plug});
				} catch (_error) {
					this.error = {
						plug: data.plug,
						data: _error
					}
				}
			break;
			case "getLogs": 
				const history = await getHistory(data.filter, data.limit)

				this.comm.sendMessage("logs", {list: history, forWhich: data.forWhich});
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
