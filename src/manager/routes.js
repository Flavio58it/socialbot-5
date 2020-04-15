import Settings from "./Settings.vue";
import Followers from "./Followers.vue";

import NotFound from "components/NotFound.vue";

import Home from "./Home.vue";

var dev = process.env.NODE_ENV === 'development';

import config from "../config"

const settingsPaths = []

for (const plugName in config.plugs) {
	const plug = config.plugs[plugName]

	if (!plug.enabled)
		continue

	const plugUpperString = `${plugName.charAt(0).toUpperCase()}${plugName.slice(1)}`
	
	settingsPaths.push({
		path: plugName,
		name: plugName,
		component: require(`./sections/${plugUpperString}/${plugUpperString}.vue`).default
	})
}

export default [
	{ 
		path: '/settings', 
		component: Settings,
		children: settingsPaths
	},
	{
		path: "/followers/:plug",
		component: Followers
	},
	{
		path: "/",
		redirect:"/settings/instagram",
		component: Home
	},

	// Page not found fallback
	{
		path: "*",
		component: NotFound
	}
]