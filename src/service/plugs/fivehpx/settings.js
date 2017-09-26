export default {
	enabled: false,
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
			textFilters: [],
			isLikeNumber: 0,
			videos: true,
			brain: false, // landscape, people, arhitecture
			brainFallback: true // If image is not recognized will like or not?
		},
	},
	limits: {
		likes: {
			tag: 20,	// Max likes per tag
			dash: 20,	// Max likes to your dashboard
			upcoming: 20, // Recommended area. This apply for each section
			fresh: 20,
			popular: 20
		}
	},
	follow: {
		tags: []
	}
}