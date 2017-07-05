import Comm from "./comm";
import settings from "./settings";

import robot from "./robot";

import instagram from "./plugs/instagram";

var settings = {
	instagram: new settings("instagram")
}

Comm.listen("popup", function(action, data) {
	switch (action) {
		case "init":
			getAllInitInfo();
		break;
		case "getSettings":
			settings[data.type].getAll().then((data) => {
				Comm.send("settings", data);
			});
		});
		break;
	}
})


function getAllInitInfo() {
	Comm.send("initInfo", {});
}