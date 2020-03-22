import db from "../bot/db";

export default function (settings) {
	var settings = settings || {};

	if (!settings.type)
		return Promise.reject({error: "No type."})

	return {
		/**
		* Logs various type of data to the log db table. The various functions will be compatible with the templates used in FE
		**/
		userInteraction (type, userData, details) { // Types: LIKE, LIKEBACK, FOLLOWBACK, UNFOLLOW, NEW, COMMENT
			var details = details || {};
			console.log("Logging action: ", type," Data: ", userData, "Details", details);
			return db.logs.add({
				plug: settings.type,
				action: "USER_" + type.toUpperCase(),
				details: {
					img: details.img || userData.img, // Can be also img of the user if is followback etc.
					imgId: userData.id,
					userId: userData.userId,
					userName: userData.username,
					video: userData.isVideo,
					//comment: details.comment || undefined,
					tag: details.tag || undefined
				},
				time: new Date().getTime()
			})
		},
	}
}