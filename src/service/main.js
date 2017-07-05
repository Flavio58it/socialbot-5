import Comm from "./comm";
import settings from "./settings";

import robot from "./robot";

import instagram from "./plugs/instagram";

var sets = {
	instagram: new settings("instagram")
}

Comm.listen("manager", function(action, data) {
	switch (action) {
		case "init":
			getAllInitInfo();
		break;
		case "getSettings":
			sets[data.type].getAll().then((settings) => {
				Comm.sendMessage("settings", {
					type: data.type,
					settings
				});
			});
		break;
	}
})


function getAllInitInfo() {
	Comm.sendMessage("initInfo", {});
}