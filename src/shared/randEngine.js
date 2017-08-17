import Random from "random-js";

export default function (size, min, max) {
	var arr = [];
	if ((max - min) <= size)
		throw new Error("Random array engine cannot work out this.");
	while (arr.length < size) {
		var rand = Random.integer(min, max)(Random.engines.browserCrypto);
		if (arr.indexOf(rand) == -1) 
			arr.push(rand);
	}
	return arr;
}