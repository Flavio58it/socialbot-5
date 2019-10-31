import * as cocoSsd from '@tensorflow-models/coco-ssd';

export async function imageRecognition (src) {
	if (!src)
		return Promise.reject({error: "No image src for neural analysis", id: "NEURAL_NO_SRC", action: "RELOAD"});

	try {
	var coco = await cocoSsd.load(),
		predictions = coco.detect(src);

	return predictions;

	} catch (err) {
		console.error("Decoder has failed. Giving dummy data in order to activate fallbacks.");
		return []
	}
}

/*
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
		}, (e) => {
			console.error("Image broken ", e);
		})
	})

	return flow.then(() => arr);
}
*/