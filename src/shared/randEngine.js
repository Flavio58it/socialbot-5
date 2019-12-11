import {Random} from "random-js";

/**
 * 
 * @param {integer} size : Number of ranbdom values in array
 * @param {integer} min : Minimun value
 * @param {integer} max : Maximum value
 * 
 * When the difference between min and max is less than the size the algorhytm cannot provide enough unique values in array. 
 * The fallback for this is to provide only one value in array
 */

export default function (size, min, max) {
	var arr = [];

	// Fallback if not enough size. The system will resize the array to 1
	if (((max - min) > 0 && (max - min) <= size) || ((max === min) && size > 0))
		size = 1

	// Block execution in cases where the random values will not be genuine
	if (
		(typeof min !== "number" || typeof max !== "number" || typeof size !== "number") ||
		((max - min) < size && max !== min) 
		|| (min > max)
	)
		throw new Error("Random array engine cannot work out this.");

	// Create array of random unique numbers
	while (arr.length < size) {
		var randEngine = new Random()
		var rand = randEngine.integer(min, max);
		if (arr.indexOf(rand) == -1) 
			arr.push(rand);
	}
	return arr;
}