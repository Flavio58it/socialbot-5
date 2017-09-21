/**
* Conditions checker. Decides when to like/unlike/follow or take any actions basing on settings and other conditions.
* The various conditions must be clear basing on function names.
**/

import objectMapper from "object-mapper";
import {imageRecognition} from "./ai/neural";
import textMatcher from "textMatcher";

const genericMapper = { // The default mapper for the settings.
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

	getSetting("like").then((settings) => {
		if (settings.options.brain != false) {
			brain = new imageRecognition(); // Create brain instance
		}
	})

	t.shouldLike = (data) => {
		var settings = [getSetting("like"), catsettings()];
		return Promise.all(settings).then((settings) => {
			if (!settings[1].enabled)
				return Promise.reject({stopped: true});
			console.log("Available data for like policeman: ", settings, data);
			if (!settings[0].options.videos && data.isVideo)
				return false;
			if (settings[0].options.isLikeNumber && settings[0].options.isLikeNumber != "0") { // Match by like number
				var likeNumber = parseInt(settings[0].options.isLikeNumber);
				if (settings[0].options.isLikeNumberInclusive && settings[0].options.isLikeNumberMoreLess && likeNumber >= data.likes)
					return false;
				if (settings[0].options.isLikeNumberInclusive && !settings[0].options.isLikeNumberMoreLess && likeNumber <= data.likes)
					return false;
				if (!settings[0].options.isLikeNumberInclusive && settings[0].options.isLikeNumberMoreLess && likeNumber <= data.likes)
					return false;
				if (!settings[0].options.isLikeNumberInclusive && !settings[0].options.isLikeNumberMoreLess && likeNumber >= data.likes)
					return false;
			}

			if (settings[0].options.text.trim()) { // Match by the text in image comment
				var result = textMatcher(settings[0].options.text.trim(), data.comment);
				if (result && !settings[0].options.isTextInclusive)
					return false;
				if (!result && settings[0].options.isTextInclusive)
					return false;
			}
			
			if (settings[0].options.brain != false) { // As is the last returns are locked here.
				return brain.watch(data.imgThumb).then((seen) => {
					if (seen[1] < 0.5 && seen[2] < 0.5 && seen[3] < 0.5)
						return settings[0].options.brainFallback; // If the ai dont know what to do
					if (settings[0].options.brain == "landscape")
						return seen[1] >= 0.6 && seen[2] <= 0.5 && seen[3] <= 0.5;
					if (settings[0].options.brain == "people")
						return seen[2] >= 0.6 && seen[1] <= 0.5 && seen[3] <= 0.5;
					if (settings[0].options.brain == "arhitecture")
						return seen[3] >= 0.6 && seen[1] <= 0.5 && seen[2] <= 0.5;

					return true; // Should never
				});
			}
			
			return true;
		})
		
	}

	t.shouldFollow = (data) => {
		var settings = [getSetting("follow"), catsettings()];
		return Promise.all(settings).then((settings) => {
			if (!settings[1].enabled)
				return Promise.reject({stopped: true});
			console.log("Available data for the policeman: ", settings, data);

			if (settings[0].followers.number || settings[0].following.number) {
					return ((settings[0].following.number?(settings[0].following.more?(settings[0].following.number >= data.user.follows):(settings[0].following.number >= data.user.follows)):true) && 
						   (settings[0].followers.number?(settings[0].followers.more?(settings[0].followers.number >= data.user.followedBy):(settings[0].followers.number >= data.user.followedBy)):true));
			} else if (settings[0].ratio) {
				console.log("By ratio");
				var me = data.data, user = data.user
				return (settings[0].ratio >= 5)
			}

			return true;
		});
	}

	// Set mapper only for one time
	t._setMapper = (mapper) => { mapOverride = mapper; return t;}
	t._setDataMapper = (mapper) => { dataMapOverride = mapper; return t;}
	

	// -------- FUNC

	function getSetting (cat) {
		return catsettings().then((cats) => objectMapper(cats, mapOverride || genericMapper[cat])).then((data) => {
			mapOverride = false;
			return data;
		});
	}

	function getData (data) {
		var d = dataMapOverride?objectMapper(data, dataMapOverride):data;
		dataMapOverride = false;
		return d;
	}
	
}

export default police;