/**
 * MATCHER
 * 
 * This module allows to match multiple non case sensitive text patterns in the same string
 * 
 * */

function splitText(input) {
	if (typeof input == "string")
		return input.split("|");
	return input;
}

export default function (match, inputText) {
	var match = splitText(match), result = false;

	if (inputText === undefined || match === undefined)
		return false;

	// Remove case sensitivity
	inputText = inputText.toLowerCase()

	match.forEach((string) => {
		string = string.toLowerCase()

		if(/^\/.+\/$/.test(string))
			result = new RegExp(string.replace(/^\/(.*)\/$/, "$1"), "g").test(inputText)
		else if (inputText.indexOf(string) > -1)
			result = true;
	})

	return result;
}