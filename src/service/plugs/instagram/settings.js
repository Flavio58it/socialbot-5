export default {
	enabled: true, // Robot enabled
	notifications: false, // Show notification when is present
	modules: {
		like: {
			likeDash: true, // Like the images from your dashboard
			tags: [],
			filters: {
				isTextInclusive: false,
				isLikeNumberInclusive: false,
				isLikeNumberMoreLess: false,
				textFilters: [],
				isLikeNumber: 0,
				videos: true,
				brain: {
					included: [], // If the image has these objects will be liked {type: int, min_width: int, score: float}
					excluded: [] // If the image hasn't these objects will not be liked
				}
			},
			limits: {
				tag: 15,	// Max likes per tag
				dash: 15,	// Max likes to your dashboard
				explorer: 15 // Max likes per session for explorers tab/section
			}
		},
		follow: {
			followBack: false, // Follow back when a user starts following you
			unFollowBack: false, // Unfollow the people that unfollows you (managed by whitelist)
			filters: {
				followers: {
					number: 0,
					more: false
				},
				following: {
					number: 0,
					more: false
				}
			}
		},
		likeBack: {
			enabled: true,
			useLikeFilters: true, // Use filters of like functionality also for likeBack
			likes: 4, // How much photos to like
			ignoreTime: 30, // Days to ignore the user
			maxUsersLike: 10 // Maximum users to like per session
		} // Like back images when a user is liking yours
	},
	waiter: {
		actionLower: 20, // Wait between one action and another (seconds)
		actionUpper: 100, // (max)
		roundPause: 10 // Time between one round and another. In minutes
	},
	rates: {  // Limit actions done by the bot in time interval
		timePeriod: 7, // In days
		likeLimit: 0,
		followLimit: 0
	}
}