import Dexie from "dexie";

var db = new Dexie("socialbot");

db.version(1).stores({
	logs: "++id, plug, action, [plug+action], details, time", // Details should have imgSrc, username, userid etc.
	users: "++id, plug, userid, [plug+userid], username, whitelisted, blacklisted, toFollow, details, lastInteraction, added"
});

//db.users.limit(1).delete(); // Simulate a user to follow

export default db;