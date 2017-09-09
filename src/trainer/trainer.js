var trainer_data = require("./train_data");
var fs = require("fs");
var ai = require("./AI.json");
var synaptic = require("./synaptic.js");

function trainer (params, input, out) {
	var iterator = params.splice(params.length-2, 1)[0], refiner = params.splice(params.length-1, 1)[0];
	params.unshift(input);
	params.push(out);
	var brain = new synaptic.Architect.Perceptron(...params);
	brain.setOptimize(false);
	console.log("Init completed");
	var trainer = new synaptic.Trainer(brain)
	var schedule = 20, rp = iterator/schedule, started = new Date().getTime(), last = started;
	console.log("Training: iterator", iterator, "| refiner", refiner, "| initParams", params, "| inputLength sample", trainer_data[0].input.length);
	trainer.train(trainer_data, {
		rate: (iterations, error) => (iterations > refiner)?0.001:0.01, //(error > 0.64)?0.01:((error > 0.61)?0.001:0.0001),
		iterations: iterator,
		error: .005,
		shuffle: true,
		//log: 10000,
		cost: synaptic.Trainer.cost.CROSS_ENTROPY,
		schedule: {
			every: schedule,
			do: function(data) {
				var now = new Date().getTime()
				console.log("iterations", data.iterations, "error", data.error, "rate", data.rate, "TIME: finish|", ((now-last) * rp) / 1000 / 60, "min");
				last = now;
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

trainer(params, 363, 4);


//test(landscape)