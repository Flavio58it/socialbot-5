/**
* Decode image and group the blue pixels in one smaller one (usually 128x128)
*
**/

var gx = 10, gy = 10,
roundCache = {}; 

var rounder = (num) => {
	if (roundCache[num])
		return roundCache[num];
	if (num == 0)
		return 0;
	return Math.round(num);
}

export default function (src) {
	var my_img = new Image();

	return new Promise ((s, f) => {
		my_img.onload = () => {
			console.log("Image loaded, converting: ", src);
			var canvas = document.createElement('canvas'),
				context = canvas.getContext('2d'),
				xw = my_img.width, 
				yh = my_img.height;
			canvas.width = xw;
			canvas.height = yh;
			context.drawImage(my_img, 0, 0, xw, yh);
			var grid = {}, error = false, 
			x_co = xw / gx, // x_co = How much pixels are compressed to one pixel (x)
			y_co = yh / gy; // y_co = How much pixels are compressed to one pixel (y)

			// Grid of all pixels created
			for (var x = 0; x < xw; x++) {
				var x_assigned = rounder(x / x_co); // x_assigned = Which pixel is compressed

				grid[x_assigned] = grid[x_assigned] || {};

				var y_assigned, 
					xypix, 
					rowcon = context.getImageData(x, 0, 1, xw).data; // Getting one row per time in order to increase performance

				for (var y = 0; y < yh; y++) {
					y_assigned = rounder(y / y_co); // y_assigned = Which pixel is compressed 
					xypix = grid[x_assigned][y_assigned]; // This grid should be gx*gy
					var con = [rowcon[((y+1) * 4) - 4], rowcon[((y+1) * 4) - 3], rowcon[((y+1) * 4) - 2]]; // getImageData throws an array Uint8ClampedArray... converting it to something useful
					xypix = xypix || {
						r:0,
						g: 0,
						b:0,
						sumindex: 0
					};

					if (con[0] === undefined) {
						console.error("Pixel broken. Stopping!");
						error = true;
						break;
					}
					
					xypix.r = xypix.r + con[0];
					xypix.g = xypix.g + con[1];
					xypix.b = xypix.b + con[2];
					
					xypix.sumindex = xypix.sumindex + 1;

					grid[x_assigned][y_assigned] = xypix;

				}
			}

			if (error)
				return false;

			var array = [];

			console.log(grid);

			for (var x in grid) {// Converted to monodimensional array!
				for (var y in grid[x]) {
					var pixel = grid[x][y];

					array.push((pixel.r/pixel.sumindex) / 255); // Normalize to average and then to 0/1 range for AI
					array.push((pixel.g/pixel.sumindex) / 255); 
					array.push((pixel.b/pixel.sumindex) / 255); 
				}
			}

			console.log(array);
			s(array); 
		}

		my_img.onerror = f;
		my_img.src = src;
	});
}