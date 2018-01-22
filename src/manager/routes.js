import Settings from "./Settings.vue";

import NotFound from "components/NotFound.vue";

import Instagram from "./sections/Instagram.vue";
import Fivehpx from "./sections/Fivehpx.vue";

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
				path: "fivehpx",
				name: "fivehpx",
				component: Fivehpx
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
		component: dev?Home:NotFound
	},

	// Page not found fallback
	{
		path: "*",
		component: NotFound
	}
]