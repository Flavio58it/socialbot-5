import storage from "storage";

const settings = {
	generic:  {
		influencerTreshold: 15000 // Number of followers
	},
	instagram: {
		enabled: true, // Robot enabled
		paused: false, // Pause the execution until the reboot
		notifications: false, // Show notification when is present
		likeDash: true, // Like the images from your dashboard
		followBack: true, // Follow back when a user starts following you
		unFollowBack: true, // Unfollow the people that unfollows you (managed by whitelist)
		likeBack: true, // Like back images when a user is liking yours
		noFollowIfInfluencer: false, //If the user is a influencer do not follow it (as it will not follow back)
		followTags: [], // Follow and like images in these tags
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