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
				output: 1
			})
		})
	})

	return flow.then(() => arr);
}