/**
* This module allows to match multiple text patterns in the same string
*
**/

function splitText(input) {
	return input.split("|");
}

export default function (matchText, inputText) { // 
	var match = splitText(matchText), result = false;

	if (!inputText || !matchText)
		return false;

	match.forEach((t) => {
		if (inputText.indexOf(t) > -1)
			result = true;
	})

	return result;
}