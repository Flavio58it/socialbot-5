/**
 * POLICE JS
 * 
 * Conditions checker. Decides when to like/unlike/follow or take any actions basing on settings and other conditions.
 * The various conditions must be clear basing on function names.
 **/

import objectMapper from "object-mapper";
import {imageRecognition} from "./ai/neural";
import matcher from "matcher";

// The default mapper for the settings. As the settings object is extended, only the needed data is extracted
const genericMapper = {
	follow: {
		"filters.follow.following": "following",
		"filters.follow.followers": "followers",
		"filters.follow.ratio": "ratio"
	},
	like: {
		"filters.likes": "options"
	}
};

function police (settings) {
	var t = this, 
	catsettings = () => settings.getAll(),  // Must be in a function in order to update with new data.
	mapOverride = false, 
	dataMapOverride = false,
	brain = false;

	t.shouldLike = async (data) => {
		var settings = await getSetting("like"),
			catsetting = await catsettings();

		if (!catsetting.enabled)
			return Promise.reject({stopped: true});

		if (!settings.options.videos && data.isVideo)
			return false;
		// Match by like number
		if (settings.options.isLikeNumber && settings.options.isLikeNumber !== "0") {
			var likeNumber = parseInt(settings.options.isLikeNumber),
				inclusive = settings.options.isLikeNumberInclusive,
				moreLess = settings.options.isLikeNumberMoreLess,
				likes = data.likes;

			if (moreLess && likes >= likeNumber && !inclusive)
				return false;
			else if (moreLess && likes < likeNumber && inclusive)
				return false			
		}

		// Match by the text in image comment
		if (settings.options.textFilters && settings.options.textFilters.length) {
			var result = matcher(settings.options.textFilters, data.comment),
				inclusive = settings.options.isTextInclusive;

			if (!result || !inclusive)
				return false
		}
		
		if (settings.options.brain === true) { // As is the last returns are locked here.
			return imageRecognition(data.imgThumb).then((seen) => {
				// New Brain implementation

				console.log("Police has seen", seen);
			});
		}
		
		return true;
	}

	t.shouldFollow = async (data) => {
		var settings = await getSetting("follow"),
			catsetting = await catsettings();

		if (!catsetting.enabled)
			return Promise.reject({stopped: true});

		var followers = settings.followers,
			following = settings.following;

		if (followers.number || following.number) {
			var followedBy = data.user.followedBy,
				follows = data.user.follows;

			if (followers.number !== 0 && followers.number >= follows && followers.more)
				return false
			else if (followers.number !== 0 && followers.number <= follows && !followers.more)
				return false
			else if (following.number !== 0 && following.number <= followedBy && !following.more)
				return false
			else if (following.number !== 0 && following.number > followedBy && following.more)
				return false
		}
		return true;
	}

	// Set mapper only for one time
	t._setMapper = (mapper) => { mapOverride = mapper; return t;}
	t._setDataMapper = (mapper) => { dataMapOverride = mapper; return t;}
	

	// -------- FUNC

	// Use the mapper above to get settings attribute
	function getSetting (cat) {
		return catsettings().then((cats) => objectMapper(cats, mapOverride || genericMapper[cat])).then((data) => {
			mapOverride = false;
			return data;
		});
	}
	
}

export default police;