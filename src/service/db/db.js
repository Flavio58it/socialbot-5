import Dexie from "dexie";

var db = new Dexie("followhunter");

db.version(1).stores({
	logs: "++id, plug, action, details, time", // Details should have imgSrc, username, userid etc.
	users: "++id, plug, userid, [plug+userid], username, whitelisted, toFollow, details, lastInteraction, added",
	stats: "++id, plug, likes, followers, unfollowers, followbacks, followNumber"
});

//db.users.limit(1).delete(); // Simulate a user to follow

export default db;