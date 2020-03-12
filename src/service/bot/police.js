/**
 * POLICE JS
 * 
 * Conditions checker. Decides when to like/unlike/follow or take any actions basing on settings and other conditions.
 * The various conditions must be clear basing on function names.
 **/

import objectMapper from "object-mapper";
import {imageRecognition} from "../ai/neural";
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
	var t = this;

	t.shouldLike = async (data) => {
		if (!await settings.get("enabled"))
			return Promise.reject({stopped: true});

		if (!await settings.get("filters.likes.videos") && data.isVideo)
			return false;
		// Match by like number
		let isLikeNumber = await settings.get("filters.likes.isLikeNumber");
		if (isLikeNumber && isLikeNumber !== "0") {
			var likeNumber = parseInt(isLikeNumber),
				inclusive = await settings.get("filters.likes.isLikeNumberInclusive"),
				moreLess = await settings.get("filters.likes.isLikeNumberMoreLess"),
				likes = data.likes;

			if (moreLess && likes >= likeNumber && !inclusive)
				return false;
			else if (moreLess && likes < likeNumber && inclusive)
				return false			
		}

		// Match by the text in image comment
		let textFilters = await settings.get("filters.likes.textFilters");
		if (textFilters && textFilters.length) {
			var result = matcher(textFilters, data.comment),
				inclusive = await settings.get("filters.likes.isTextInclusive");

			if (!result || !inclusive)
				return false
		}
		
		if (settings.get("filters.likes.brain") === true) { // As is the last returns are locked here.
			return imageRecognition(data.imgThumb).then((seen) => {
				// New Brain implementation

				console.log("Police has seen", seen);
			});
		}
		
		return true;
	}

	t.shouldFollow = async (data) => {
		if (!await settings.get("enabled"))
			return Promise.reject({stopped: true});

		var followers = await settings.get("filters.follow.followers"),
			following = await settings.get("filters.follow.following");

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
}

export default police;