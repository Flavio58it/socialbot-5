import Comm from "./comm";
import settings from "./settings";

import storage from "storage";

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
		case "reset":
			storage.clear();
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
	}
})

// Start the bot when the browser is started!
for (var i in plugs) {
	var plugContainer = plugs[i];
	if (!plugContainer.bot)
		plugContainer.bot = new robot(plugContainer.settings, plugContainer.plug);
}

function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}