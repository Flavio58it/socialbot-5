import Settings from "./Settings.vue";

import NotFound from "components/NotFound.vue";

import Instagram from "./sections/Instagram.vue";

export default [
	{ 
		path: '/settings', 
		component: Settings,
		children: [
			{
				path: "instagram",
				component: Instagram
			},
			{
				path: "*",
				component: NotFound
			}
		]
	},

	// Page not found fallback
	{
		path: "*",
		component: NotFound
	}
]