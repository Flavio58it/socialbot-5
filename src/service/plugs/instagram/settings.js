export default {
	enabled: true, // Robot enabled
	paused: false, // Pause the execution until the reboot
	notifications: false, // Show notification when is present
	likeDash: true, // Like the images from your dashboard
	followBack: true, // Follow back when a user starts following you
	unFollowBack: true, // Unfollow the people that unfollows you (managed by whitelist)
	likeBack: {
		enabled: true,
		likes: 4, // How much photos to like
		ignoreTime: 7, // Days to ignore the user
		maxUsersLike: 10 // Maximum users to like per session
	}, // Like back images when a user is liking yours
	waiter: {
		actionLower: 10, // Wait between one action and another (min) (seconds)
		actionUpper: 30, //(max)
		roundPause: 5 // Time between one round and another. In minutes
	},
	filters: { // Various filters for liking/following
		likes: { // When like a post
			isTextInclusive: false,
			isLikeNumberInclusive: false,
			isLikeNumberMoreLess: false,
			text: "",
			isLikeNumber: 0,
			videos: true,
			brain: false, // landscape, people, arhitecture
			brainFallback: true // If image is not recognized will like or not?
		},
		follow: {
			followers: {
				number: 0,
				more: false
			},
			following: {
				number: 0,
				more: false
			},
			ratio: 0
		}
	},
	limits: {
		likes: {
			tag: 20,	// Max likes per tag
			dash: 20,	// Max likes to your dashboard
			explorer: 20 // Max likes per session for explorers tab/section
		}
	},
	follow: {
		tags: []
	}, // Follow and like images in these tags
}