// Wait a random amount of time to simulate user interaction
import {Random} from "random-js";

function randomizer (from, to) {
	var randomEngine = new Random()
	return randomEngine.integer(from || 3000, to || 30000)
}

export default function (from, to) {
	var rand = to?randomizer(from, to):from;

	// In order to allow rapid tests setTimeout is partially disabled.
	if (process.env.NODE_ENV === "test")
		rand = 1;

	return new Promise(function (s, f) {
		try {
			setTimeout(s, rand);
		} catch (e) {
			f(e);
		}
	});
}