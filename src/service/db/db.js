import Dexie from "Dexie";

var db = new Dexie("followhunter");

db.version(1).stores({
	logs: "plug, action, details, time", // Details should have imgSrc, username, userid etc.
	users: "plug, userid, username, blacklisted, whitelisted, details, lastInteraction, lastUpdate" // Cache of account followers
});

export default db;