/**
* SETTINGS MANAGER
* - Group all the settings in one library
**/

import storage from "storage";

import objectPath from "object-path";
import clone from "clone"

/**
 * 
 * @param {String} sub - Plugin from which the settings should be picked
 * @param {Object} overrider - Default values to override
 */

export default async function (sub, overrider) {
	var t = this, settings = await import(`../plugs/${sub}/settings`);

	if (overrider)
		settings = {...settings, default: overrider}


	async function set (path, val) {
		let obj = clone(await getAll())

		if (!objectPath.has(obj, path))
			throw new Error("Not existent setting");

		objectPath.set(obj, path, val);

		var storageObj = {};
		storageObj[sub] = obj;
		return await storage.set(storageObj);
	}

	async function get (path) {
		var obj = {...await getAll()}

		if (!objectPath.has(obj, path))
			throw new Error("Not existent setting");

		return objectPath.get(obj, path);
	}

	async function setAll (obj) {
		let storageObj = {};
		storageObj[sub] = clone(obj);
		return await storage.set(storageObj);
	}

	async function getAll () {
		let storageObj = {}
		storageObj[sub] = {...settings.default}
		let data = await storage.get(storageObj)
		return data[sub];
	}

	async function resetAll () {
		let storageObj = {}
		storageObj[sub] = settings.default
		return await storage.set(storageObj)
	}

	return {
		set,
		get,
		setAll,
		getAll,
		resetAll
	}
}