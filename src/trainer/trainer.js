var trainer_data = require("./train_data");
var fs = require("fs");
var ai = require("./AI.json");
var synaptic = require("./synaptic.js");

function trainer (params) {
	var iterator = params.splice(params.length-2, 1)[0], refiner = params.splice(params.length-1, 1)[0];
	params.unshift(25);
	params.push(4);
	var brain = new synaptic.Architect.Perceptron(...params); // One hidden layer basta e avanza (seems)
	console.log("Init completed");
	var trainer = new synaptic.Trainer(brain)
	console.log("Training: iterator", iterator, "refiner", refiner, "initParams", params);
	trainer.train(trainer_data, {
		rate: (iterations, error) => (iterations > refiner)?0.001:0.01, //(error > 0.64)?0.01:((error > 0.61)?0.001:0.0001),
		iterations: iterator,
		error: .005,
		shuffle: true,
		//log: 10000,
		cost: synaptic.Trainer.cost.CROSS_ENTROPY,
		schedule: {
			every: 10000,
			do: function(data) {
				console.log("iterations", data.iterations, "error", data.error, "rate", data.rate);
				/*if (data.error < 0.58)
					return true; // abort/stop training*/
			}
		}
	})

	console.log("Done")

	fs.writeFile("./AI.json", JSON.stringify(brain.toJSON()), 'utf-8') // brain.standalone().toString()
	console.log("Writed");
}

function test (sample) {
	var brain = synaptic.Network.fromJSON(ai);
	console.log(ai(sample))
}

var params = process.argv
params.splice(0,2);

trainer(params);


//test(landscape)