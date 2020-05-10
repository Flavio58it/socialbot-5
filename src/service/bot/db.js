import Dexie from "dexie";

/**
 * WARNING --
 * 
 * Is advisable to NOT use this file directly. The database should be accessed with classes present in db folder.
*/

var db

function init () {
	db = new Dexie("socialbot");

	db.version(1).stores({
		history: "++id, plug, action, [plug+action], details, time", // Details should have imgSrc, username, userid etc.
		users: "++id, plug, userid, [plug+userid], [plug+userid+status], username, whitelisted, blacklisted, status, toFollow, details, lastInteraction, added"
	});
}

init()

export default db;
export const initDB = init