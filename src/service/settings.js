import storage from "storage";

const settings = {
	instagram: {
		enabled: true, // Robot enabled
		paused: false, // Pause the execution until the reboot
		likeDash: true, // Like the images from your dashboard
		followBack: true, // Follow back when a user starts following you
		unFollowBack: true, // Unfollow the people that unfollows you (managed by whitelist)
		likeBack: true, // Like back images when a user is liking yours
		followTags: [], // Follow and like images in these tags
		whiteList: [], // Whitelist of actions (unfollows etc.)
		blackList: [], // Blacklist of actions (likeback, followback etc.)
	},
	fpx: {
		enabled: false
	}
}

export default function (sub) {
	var t = this;

	t.set = (name, val) => {
		var obj = {};
		obj[sub] = obj[sub] || {}
		obj[sub][name] = val;
		return storage.set(obj);
	}

	t.get = (name) => {
		var obj = {};
		obj[sub] = obj[sub] || {}
		obj[sub][name] = settings[name] || false;
		return storage.get(obj);
	}

	t.setAll = (obj) => {
		var nobj = {};
		nobj[sub] = obj;
		return storage.set(nobj);
	}

	t.getAll = () => {
		return storage.get(settings).then((data) => data[sub]);
	}
}