export default {
	home: "https://www.instagram.com",
	json: {
		name: "__a",
		val: "1"
	},
	post: {
		like: "/web/likes/{0}/like/", // post id
		unlike: "/web/likes/{0}/like/", // post id
		follow: "/web/friendships/{0}/follow/",
		unfollow: "/web/friendships/{0}/unfollow/"
	},
	get: {
		tag: "/explore/tags/{0}/", // TagName
		user: "/{0}/", // username
		post: "/p/{0}/", // Get the post data
		notifications: "/accounts/activity/",
		query: "/graphql/query/?query_id={0}"
	}
}