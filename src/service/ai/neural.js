import syn from "synaptic";
import decoder from "imgDecoder";

function compare () {
	Network.fromJSON(exported)
}

export function getImagesData (imgArray) {
	var flow = Promise.resolve(), arr = [];
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
		})
	})

	return flow.then(() => arr);
}