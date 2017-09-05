var trainer_data = require("./train_data");
var fs = require("fs");
var ai = require("./AI.json");
var synaptic = require("./synaptic.js");

function trainer () {
	var brain = new synaptic.Architect.Perceptron(23, 18, 11, 4)
	console.log("Init completed");
	var trainer = new synaptic.Trainer(brain)
	console.log("Training...");
	trainer.train(trainer_data, {
		rate: (iterations, error) => (error > 0.79)?0.01:((error > 0.69)?0.001:0.0001),
		iterations: 1800000,
		error: .005,
		shuffle: true,
		//log: 10000,
		cost: synaptic.Trainer.cost.CROSS_ENTROPY,
		schedule: {
			every: 10000,
			do: function(data) {
				console.log("iterations", data.iterations, "error", data.error, "rate", data.rate);
				if (data.error < 0.61)
					return true; // abort/stop training
			}
		}
	})

	console.log("Done")

	fs.writeFile("./AI.json", JSON.stringify(brain.toJSON()), 'utf-8')
	console.log("Writed");
}

function test (sample) {
	var brain = synaptic.Network.fromJSON(ai);
	console.log(brain.activate(sample))
}

trainer();




var landscape = [0.480439453125,0,0,0,0,0,0,0.45573486328125,0,0.0013818359375,0.03376220703125,0,0.000341796875,0,0,0,0,0.00254150390625,0,0.02579833984375,0,0.96921875,0.03078125];
var people = [0.197568359375,0,0,0,0.00003173828125,0,0,0.330146484375,0.00001953125,0.1532080078125,0.075302734375,0.00859619140625,0.0401220703125,0,0,0,0.04212158203125,0.02517822265625,0.04739990234375,0.08030517578125,0,0.82223876953125,0.17776123046875];
var igfriuli = [0.17421875,0,0,0,0,0,0.01151123046875,0.6407666015625,0.000107421875,0.0028466796875,0.00033203125,0.0012841796875,0.00154296875,0,0,0,0,0.00771728515625,0,0.1596728515625,0,0.820703125,0.179296875];

//test(igfriuli)