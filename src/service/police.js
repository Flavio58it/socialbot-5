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
		console.log("Available data for like policeman: ", settings, data);

		if (!settings.options.videos && data.isVideo)
			return false;
		// Match by like number
		if (settings.options.isLikeNumber && settings.options.isLikeNumber != "0") {
			var likeNumber = parseInt(settings.options.isLikeNumber);
			if (settings.options.isLikeNumberInclusive && settings.options.isLikeNumberMoreLess && likeNumber >= data.likes)
				return false;
			if (settings.options.isLikeNumberInclusive && !settings.options.isLikeNumberMoreLess && likeNumber <= data.likes)
				return false;
			if (!settings.options.isLikeNumberInclusive && settings.options.isLikeNumberMoreLess && likeNumber <= data.likes)
				return false;
			if (!settings.options.isLikeNumberInclusive && !settings.options.isLikeNumberMoreLess && likeNumber >= data.likes)
				return false;
		}

		// Match by the text in image comment
		if (settings.options.textFilters && settings.options.textFilters.length) {
			var result = matcher(settings.options.textFilters, data.comment);
			if (result && !settings.options.isTextInclusive)
				return false;
			if (!result && settings.options.isTextInclusive)
				return false;
		}
		
		if (settings.options.brain != false) { // As is the last returns are locked here.
			return imageRecognition(data.imgThumb).then((seen) => {
				// New Brain implementation

				console.log("Police has seen", seen);
			});
		}
		
		return true;
	}

	t.shouldFollow = async (data) => {
		var settings = await getSetting("like"),
			catsetting = await catsettings();

		if (!catsetting.enabled)
			return Promise.reject({stopped: true});
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