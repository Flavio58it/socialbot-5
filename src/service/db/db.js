import Dexie from "Dexie";

var db = new Dexie("followhunter");

db.version(1).stores({
	logs: "++id, plug, action, details, time", // Details should have imgSrc, username, userid etc.
	users: "++id, plug, userid, [plug+userid],username, whitelisted, followbacked, details, lastInteraction",
	stats: "++id, plug, likes, followers, unfollowers, followbacks, followNumber"
});

export default db;