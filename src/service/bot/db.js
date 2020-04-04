import Dexie from "dexie";

/**
 * WARNING --
 * 
 * Is advisable to NOT use this file directly. The database should be accessed with classes present in db folder.
*/

var db = new Dexie("socialbot");

db.version(1).stores({
	history: "++id, plug, action, [plug+action], details, time", // Details should have imgSrc, username, userid etc.
	users: "++id, plug, userid, [plug+userid], username, whitelisted, blacklisted, toFollow, details, lastInteraction, added"
});

//db.users.limit(1).delete(); // Simulate a user to follow

export default db;