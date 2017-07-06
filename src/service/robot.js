import Random from "random-js";

const _p = (cbk) => new Promise(cbk);

// Wait a random amount of time to simulate user interaction
function wait (from, to) {
	var rand = Random.integer(from || 3000, to || 30000)
	return _p((s, f) => {
		setTimeout(s, rand);
	})
}

export default function (settings, plug, plugName) {
	var t = this, flow = Promise.resolve();

	plug.init().then(settings.get("followTags")).then((data) => {
		console.log("We are good here", data);
	})

}