export default {
	postTagList: { // List of posts in one tag.
		"photos[].id":"list[].id",
		"photos[].voted":"list[].liked",
		"photos[].image_url":"list[].img",
		"photos[].user_id":"list[].user.id",
		"photos[].user.username":"list[].user.username",
		"photos[].user.userpic_url":"list[].user.img"
	}
}