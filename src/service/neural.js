import syn from "synaptic";
import decoder from "imgDecoder";

// Import trainers!
import instagram_landscape_trainer from "./ai/trainers/instagram_landscape";

var trainers = {
	instagram: {
		landscape: instagram_landscape_trainer
	}
}

export function startTrainer (plug, name) {
	var brain = new Architect.Perceptron(3969, 3175, 2540, 2032, 1);
	var trainer = new Trainer(brain);
	trainer.train(trainers[plug][name], {
		rate: .1,
		iterations: 10000,
		error: .005,
		shuffle: true,
		log: 1000,
		cost: Trainer.cost.CROSS_ENTROPY
	});
	console.log("Training completed.");
	console.log(brain.toJSON());
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