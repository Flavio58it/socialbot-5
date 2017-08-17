/**
* Conditions checker. Decides when to like/unlike/follow or take any actions basing on settings and other conditions.
* The various conditions must be clear basing on function names.
**/

import objectMapper from "object-mapper";

const genericMapper = { // The default mapper for the settings.
	follow: {
		"filters.follow.following": "following",
		"filters.follow.followers": "followers",
		"filters.follow.ratio": "ratio"
	}
};

function police (settings) {
	var t = this, catsettings = settings.getAll();

	t.shouldLike = (data) => {
		return true
	}

	t.shouldFollow = (data) => {
		var settings = getSetting("follow");
		return settings.then((settings) => {
			console.log("Available data for the policeman: ", settings, data);

			if (settings.followers.number || settings.following.number) {
					return ((settings.following.number?(settings.following.more?(settings.following.number >= data.user.follows):(settings.following.number >= data.user.follows)):true) && 
						   (settings.followers.number?(settings.followers.more?(settings.followers.number >= data.user.followedBy):(settings.followers.number >= data.user.followedBy)):true));
			} else if (settings.ratio) {
				console.log("By ratio");
				var me = data.data, user = data.user
				return (settings.ratio >= 5)
			}

			return true;
		});
	}
	

	// -------- FUNC

	function getSetting (cat, altMapper) {
		return catsettings.then((cats) => objectMapper(cats, altMapper || genericMapper[cat]));
	}
	
}

export default police;