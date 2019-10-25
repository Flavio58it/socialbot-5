
// Functoinality disabled until the AI system will be consistent.

export function imageRecognition () {
	var t = this, brain = synaptic.Network.fromJSON(brain_neurons);

	t.watch = (src) => {
		/*if (!src)
			return Promise.reject({error: "No image src for neural analysis", id: "NEURAL_NO_SRC", action: "RELOAD"});
		return decoder(src).then((sample) => {
			var result = brain.activate(sample);
			console.log("This is what i have seen: ", result);
			return result;
		}).catch(() => {
			console.error("Decoder has failed. Giving dummy data in order to activate fallbacks.");
			return Promise.resolve([0,0,0,0]);
		});*/

		return Promise.resolve([0,0,0,0])
	}
}

export function getImagesData (imgArray) {
	/*var flow = Promise.resolve(), arr = [];
	imgArray.forEach((img) => {
		flow = flow.then(() => decoder(img)).then((input) => {
			arr.push({
				src: img,
				input,
				output: [
					0.5, // Cool factor
					0.5, // Landscape
					0.5, // People
					0.5  // Arhitecture
				]
			})
		}, (e) => {
			console.error("Image broken ", e);
		})
	})

	return flow.then(() => arr);
	*/

	return Promise.resolve([])
}