/**
* This module allows to match multiple text patterns in the same string
*
**/

function splitText(input) {
	return input.split("|");
}

export default function (matchText, inputText) { // 
	var match = splitText(matchText), result = false;

	match.forEach((t) => {
		if (inputText.indexOf(inputText) > -1)
			result = true;
	})

	return result;
}