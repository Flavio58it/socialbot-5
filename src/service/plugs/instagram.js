import format from "string-template";

const urls = {
	home: "https://www.instagram.com",
	post: {
		like: "/web/likes/{0}/like/", // post id
		unlike: "/web/likes/{0}/like/", // post id
	},
	get: {
		tag: "/explore/tags/{0}/", // TagName
		feed: "/{0}/", // username
		notifications: "/account/activity/?__a=1"
	}
};

function getUrl(url){
	return (!/^https?:/.test(url))?urls.home:"" + url;
}

function decodeObject (page) {
	// parse page html and then return the object of the page
	return {}
}

export default function () {
	var id = "insta", 
		feedStatusIds = {
			home: false,
		}

	return {
		init () {

		},
		actions: {
			getNotifications () {
				fetch(getUrl(urls.get.notifications)).then((data) => {
					
				})
			},
			getFeed () {

			},
			likePost () {
				
			}
		}
	}
}