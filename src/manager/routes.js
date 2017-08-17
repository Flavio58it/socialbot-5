import Settings from "./Settings.vue";

import NotFound from "components/NotFound.vue";

import Instagram from "./sections/Instagram.vue";
import Home from "./Home.vue";

export default [
	{ 
		path: '/settings', 
		component: Settings,
		children: [
			{
				path: "instagram",
				name: "instagram",
				component: Instagram
			},
			{
				path: "*",
				redirect: "instagram" 
			}
		]
	},
	{
		path: "/",
		component: Home
	},

	// Page not found fallback
	{
		path: "*",
		component: NotFound
	}
]