// Wait a random amount of time to simulate user interaction
import {Random} from "random-js";

const _p = (cbk) => new Promise(cbk);

function randomizer (from, to) {
	var randomEngine = new Random()
	return randomEngine.integer(from || 3000, to || 30000)
}

export default function (from, to) {
	var rand = to?randomizer(from, to):from;
	return _p((s, f) => {
		setTimeout(s, rand);
	})
}