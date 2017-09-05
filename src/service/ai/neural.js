import decoder from "imgDecoder";
import brain from "./brain";

export function imageRecognition (src) {
	return decoder(src).then((sample) => {
		var result = brain(sample);
		console.log("This is what i have seen: ", result);
		return result;
	});
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