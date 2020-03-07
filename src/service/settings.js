/**
* SETTINGS MANAGER
* - Group all the settings in one library
**/

import storage from "storage";

export default async function (sub) {
	var t = this, settings = await import(`./plugs/${sub}/settings`);

	async function set (name, val) {
		var obj = getAll()

		var oo = {};
		obj[name] = val;
		oo[sub] = obj;
		return await storage.set(oo);
	}

	async function get (name) {
		var obj = {};
		obj[sub] = obj[sub] || {}
		obj[sub][name] = settings[sub][name] || false;

		var data = await storage.get(obj)
		return data[sub][name];
	}

	async function setAll (obj) {
		var nobj = {};
		nobj[sub] = obj;
		return await storage.set(nobj);
	}

	async function getAll () {
		var data = await storage.get(settings)
		return data[sub];
	}

	return {
		set,
		get,
		setAll,
		getAll
	}
}