/**
* This module allows to match multiple text patterns in the same string
*
**/

function splitText(input) {
	if (typeof input == "string")
		return input.split("|");
	return input;
}

export default function (match, inputText) { // 
	var match = splitText(match), result = false;

	if (!inputText || !match)
		return false;

	match.forEach((t) => {
		if (inputText.indexOf(t) > -1)
			result = true;
	})

	return result;
}