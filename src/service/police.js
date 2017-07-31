/**
* Conditions checker. Decides when to like/unlike/follow or take any actions basing on settings and other conditions.
* The various conditions must be clear basing on function names.
**/

import objectMapper from "object-mapper";

const genericMapper = { // The default mapper for the settings.
	follow: {
		"filters.follow.following": "following"
	}
}, 
police = (settings) => {
	var t = this, catsettings = settings.getAll();

	t.shouldLike = (numberLikes) => {

	}

	t.shouldFollow = (data) => {
		var settings = getSetting("follow");
		return settings.then((settings) => {

		});
	}
	

	// -------- FUNC

	function getSetting (cat, altMapper) {
		return catsettings.then((cats) => objectMapper(cats, altMapper || genericMapper[cat]));
	}
	
}

export default police;