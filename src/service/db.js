import dexie from "dexie";

var db = new Dexie("followhunter");

db.version(1).stores({
	log: "plug, action, details, time", // Details should have imgSrc, username, userid etc.
	whitelist: "plug, userid, username, details, time",// Whitelist of actions (unfollows etc.)
	blacklist: "plug, userid, username, details, time", // Blacklist of actions (likeback, followback etc.)
	followers: "plug, userid, username, followed, following, lastInteraction, lastUpdate" // Cache of account followers
});

export default db;