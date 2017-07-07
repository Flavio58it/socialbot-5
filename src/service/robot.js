import requests from "./requests";

export default function (settings, plug, plugName) {
	var t = this;

	requests.listen();

	plug.init().then(() => settings.get("followTags")).then((data) => {
		var flow = Promise.resolve()
		data.forEach((tagName) => {
			flow = flow.then(() => {
				return Promise.all([
					settings.get("waitActionLower"), 
					settings.get("waitActionHigher")
				]).then((minmax) => 
					plug.actions.likeTagImages(
						tagName, 
						minmax
					)
				)
			})
		})
	}).then (() => {
		requests.unlisten();
	})

}