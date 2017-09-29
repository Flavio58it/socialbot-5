// This maps the majority of the objects picked from the instagram APIs

export default {
	media: {
		"tag.media.nodes": "posts",
		"tag.media.page_info.end_cursor": "nextPage"
	},
	dashboard: {
		"graphql.user.edge_web_feed_timeline.edges": "posts",
		"graphql.user.edge_web_feed_timeline.page_info.end_cursor": "nextPage"
	},
	postLike: { // Post in a list of posts (edges) - like area
		"id": "id",
		"owner.id": "userId",
		"owner.username": "username",
		"caption": "comment",
		"viewer_has_liked": "liked",
		"code": "code",
		"display_src": "img",
		"display_url": "img",
		"thumbnail_src": "imgThumb",
		"is_video": "isVideo",
		"likes.count": "likes"
	},
	post: { // Post in a list of posts (edges) - dashboard area
		"node.id": "id",
		"node.owner.id": "userId",
		"node.owner.username": "username",
		"node.caption": "comment",
		"node.viewer_has_liked": "liked",
		"node.code": "code",
		"node.display_src": "img",
		"node.display_url": "img",
		"node.is_video": "isVideo",
		"node.likes.count": "likes"
	},
	postData: { // Post as a singular post (in an ajax specific for that post)
		"graphql.shortcode_media.viewer_has_liked": "liked"
	},
	user: { // User homepage (dashboard + posts)
		"user.username": "username",
		"user.full_name": "fullName",
		"user.id": "id",
		"user.profile_pic_url": "img",
		"user.followed_by.count": "followedBy",
		"user.follows.count": "follows",
		"user.biography": "bio",
		"user.follows_viewer": "followMe",
		"user.has_blocked_viewer": "blocked",
		"user.media.page_info.end_cursor": "posts.nextPage",
		"user.media.nodes[].id": "posts.list[].id",
		"user.media.nodes[].likes.count": "posts.list[].likes",
		"user.media.nodes[].thumbnail_src": "posts.list[].src",
		"user.media.nodes[].code": "posts.list[].code",
		"user.media.nodes[].is_video": "posts.list[].video"
	},
	notifications: {
		"graphql.user.activity_feed.edge_web_activity_feed.count": "num",
		"graphql.user.activity_feed.edge_web_activity_feed.edges[].node.type": "list[].type",
		"graphql.user.activity_feed.edge_web_activity_feed.edges[].node.user.id": "list[].id",
		"graphql.user.activity_feed.edge_web_activity_feed.edges[].node.user.username": "list[].username",
		"graphql.user.activity_feed.edge_web_activity_feed.edges[].node.user.profile_pic_url": "list[].userimg",
		"graphql.user.activity_feed.edge_web_activity_feed.edges[].node.media.thumbnail_src": "list[].imgsrc",
		"graphql.user.activity_feed.edge_web_activity_feed.edges[].node.media.shortcode": "list[].code"
	}
}