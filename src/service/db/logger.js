import db from "./db";

export default function (settings) {
	var settings = settings || {};

	if (!settings.type)
		return Promise.reject({error: "No type."})

	return {
		/**
		* Logs various type of data to the log db table. The various functions will be compatible with the templates used in FE
		**/
		userInteraction (type, userData, details) { // Types: LIKE, FOLLOWBACK, UNFOLLOW, NEW, COMMENT
			return db.logs.add({
				plug: settings.type,
				action: "USER_" + type.toUpperCase(),
				details: {
					img: userData.display_src,
					userId: userData.owner.id || false,
					userName: userData.userName || false,
					comment: details.comment || undefined
				},
				time: new Date().getTime()
			})
		}
	}
}