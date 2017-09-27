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
		if (t.indexOf("#") == 0 || t.indexOf("@") == 0)
			result = inputText.indexOf(t + " ") > -1
		else if(/^\/.+\/$/.test(t))
			result = new RegExp(t.replace(/^\/(.*)\/$/, "$1"), "g").test(inputText)
		else if (inputText.indexOf(t) > -1)
			result = true;
	})

	return result;
}