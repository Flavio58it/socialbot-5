export default {
	enabled: false,
	waiter: {
		actionLower: 10, // Wait between one action and another (min) (seconds)
		actionUpper: 30, //(max)
		roundPause: 5 // Time between one round and another. In minutes
	},
	follow: {
		tags: []
	}
}