/**
* Decode image and group the blue pixels in one smaller one (usually 128x128)
*
**/

import colorNamer from "color-namer";
import color from "color";

var colorData = {};

function colorCache(r, g, b) {
	if (!colorData[r])
		colorData[r] = {}
	if (!colorData[r][g])
		colorData[r][g] = {}
	if (!colorData[r][g][b])
		colorData[r][g][b] = false

	if (colorData[r][g][b])
		return colorData[r][g][b];
	var colorDef = `rgb(${r}, ${g}, ${b})`;
	var color = colorNamer(colorDef, {pick: ["basic"]}).basic[0].name //roygbiv
	colorData[r][g][b] = color;
	return color;
}

export default function (src) {
	var my_img = new Image();

	return new Promise ((s, f) => {
		my_img.onload = () => {
			console.log("Image loaded... parsing: ", src);
			var canvas = document.createElement('canvas'),
				context = canvas.getContext('2d'),
				xw = my_img.width, 
				yh = my_img.height;
			canvas.width = xw;
			canvas.height = yh;
			context.drawImage(my_img, 0, 0, xw, yh);
			var grid = {
				black: 		0,
				blue: 		0,
				cyan: 		0,
				green: 		0,
				teal: 		0,
				turquoise: 	0,
				indigo: 	0,
				gray: 		0,
				purple: 	0,
				brown: 		0,
				tan: 		0,
				violet: 	0,
				beige: 		0,
				fuchsia: 	0,
				gold: 		0,
				magenta: 	0,
				orange: 	0,
				pink: 		0,
				red: 		0,
				white: 		0,
				yellow: 	0,

				// Here are the pixels that are dark or light (used for image luminosity)
				dark: 		0,
				light: 		0
			}, divisor = 0;

			//debugger;

			// Grid of all pixels created
			for (var x = 0; x < xw; x++) {
				var rowcon = context.getImageData(x, 0, 1, xw).data; // Getting one row per time in order to increase performance

				for (var y = 0; y < yh; y++) {
					var con = [rowcon[((y+1) * 4) - 4], rowcon[((y+1) * 4) - 3], rowcon[((y+1) * 4) - 2]]; // getImageData throws an array Uint8ClampedArray... converting it to something useful

					grid[colorCache(con[0], con[1], con[2])] += 1;
					if (color({r: con[0], g: con[1], b: con[2]}).luminosity() <= 0.5)
						grid["dark"] += 1;
					else
						grid["light"] += 1;
					divisor+=1;
				}
			}

			var array = [];

			for (var cname in grid) {
				array.push(grid[cname] / divisor);
			}
			console.log(array);
			s(array); 
		}

		my_img.onerror = f;
		my_img.src = src;
	});
}