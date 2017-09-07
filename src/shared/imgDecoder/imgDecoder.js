/**
* Decode image and group the blue pixels in one smaller one (usually 128x128)
*
**/
var decoderContainer = require("worker-loader!./decoder_worker.js");


var decoder = new decoderContainer(), messengers = {};

decoder.addEventListener("message", (e) => {
	for (var i in messengers) {
		var data = messengers[i];
		if (e.data.id == i)
			data(e.data);
	}
})

export default function (src) {
	return new Promise((s, f) => {
		var id = new Date().getTime(),
			my_img = new Image();

		my_img.onload = () => {
			console.log("Image loaded... parsing: ", src);
			var canvas = document.createElement('canvas'),
				context = canvas.getContext('2d'),
				xw = my_img.width/2, 
				yh = my_img.height/2;
			canvas.width = xw;
			canvas.height = yh;
			context.drawImage(my_img, 0, 0, xw, yh);

			var rows = [], divisor = 0, error = false; // Object of grids

			// Grid of all pixels created
			for (var x = 0; x < xw; x++) {
				var rowcon = context.getImageData(x, 0, 1, xw).data; // Getting one row per time in order to increase performance

				if (error)
					break;

				decoder.postMessage({
					rowcon,
					yh,
					x,
					id
				})
			}

			messengers[id] = (data) => {
				if (data.grid === false) {
					error = true;
					delete messengers[id];
					f()
				} else {
					rows.push(data.grid)
					divisor += data.divisor;
				}

				if (rows.length == yh) {
					delete messengers[id];
					var array = [], grid = {};

					rows.forEach((data) => { // // Group all the rows in the grid
						for (var it in data) {
							grid[it] = (grid[it] || 0) + data[it];
						}
					})

					for (var cname in grid) {
						array.push(grid[cname] / divisor);
					}
					//console.log(array);
					s(array);
				}
			}
			
		}

		my_img.onerror = f;
		my_img.src = src;

	})
}