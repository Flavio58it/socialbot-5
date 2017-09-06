var trainer_data = require("./train_data");
var fs = require("fs");
var ai = require("./AI.json");
var synaptic = require("./synaptic.js");

function trainer () {
	var brain = new synaptic.Architect.Perceptron(25, 18,  4); // third 12?
	console.log("Init completed");
	var trainer = new synaptic.Trainer(brain)
	console.log("Training...");
	trainer.train(trainer_data, {
		rate: (iterations, error) => iterations > 80000?0.001:0.01, //(error > 0.64)?0.01:((error > 0.61)?0.001:0.0001),
		iterations: 100000,
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

	//console.log(brain.activate(landscape))

	//console.log(brain.standalone().toString())

	fs.writeFile("./AI.json", JSON.stringify(brain.toJSON()), 'utf-8') // brain.standalone().toString()
	console.log("Writed");
}

function test (sample) {
	var brain = synaptic.Network.fromJSON(ai);
	console.log(ai(sample))
}

trainer();


//test(landscape)