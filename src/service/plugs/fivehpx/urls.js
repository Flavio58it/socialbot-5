export default {
	home: "https://500px.com",
	api: "https://api.500px.com",
	post: {
		
	},
	get: {
		user: "/{0}",
		tag: "/v1/photos/search?type=photos&term={0}&image_size=12&include_states=true&formats=jpeg%2Clytro&include_tags=true&exclude_nude=true&page={1}&rpp=50" // Tag name
	},
	post: {
		like: "/v1/photos/{0}/vote?vote=1"
	}
}

