import storage from "storage";

const settings = {
	instagram: {
		enabled: true,
		followTags: false
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
		storage.set(obj);
	}

	t.get = (name) => {
		var obj = {};
		obj[sub] = obj[sub] || {}
		obj[sub][name] = settings[name] || false;
		return storage.get(obj);
	}

	t.getAll = () => {
		return storage.get(settings).then((data) => data[sub]);
	}
}