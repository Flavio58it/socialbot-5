import requests from "./requests";

export default function (settings, plug, plugName) {
	var t = this, request = false;

	return plug.init().then((data) => {
		request = new requests(data.domain).listen(); // See the requests module for the explanation
		return settings.get("followTags")
	}).then((data) => {
		var flow = Promise.resolve();
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
		return flow;
	}).then (() => {
		if (request)
			request.unlisten();
		return {
			completed: true
		}
	})

}