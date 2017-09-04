import Settings from "./Settings.vue";

import NotFound from "components/NotFound.vue";

import Instagram from "./sections/Instagram.vue";
import Home from "./Home.vue";
import Trainer from "./Trainer.vue";

var dev = process.env.NODE_ENV === 'development';

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
		path: "/trainer",
		component: dev?Trainer:undefined,
		redirect:  dev?undefined:"/"
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