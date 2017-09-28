export default {
	postTagList: { // List of posts in one tag.
		"photos[].id":"list[].id",
		"photos[].user.id":"list[].userId",
		"photos[].voted":"list[].liked",
		"photos[].image_url[0]":"list[].img",
		"photos[].user_id":"list[].user.id",
		"photos[].user.username":"list[].user.username",
		"photos[].user.userpic_url":"list[].user.img"
	}
}