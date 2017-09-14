/**
* SETTINGS MANAGER
* - Group all the settings in one library
**/

import storage from "storage";

import instagram from "./plugs/instagram/settings";
import fivehpx from "./plugs/fivehpx/settings";

const settings = {
	instagram,
	fivehpx,
	//flickr
}

export default function (sub) {
	var t = this;

	t.set = (name, val) => {
		return t.getAll().then((obj) => {
			obj[name] = val;
			return storage.set(obj);
		})
	}

	t.get = (name) => {
		var obj = {};
		obj[sub] = obj[sub] || {}
		obj[sub][name] = settings[sub][name] || false;
		return storage.get(obj).then(d => d[sub][name]);
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