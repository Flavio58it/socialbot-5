/**
* Decode image and group the blue pixels in one smaller one (usually 128x128)
*
**/

import colorCacheDefault from "./imgDecoderColorCache";
import colorNamer from "color-namer";
import color from "color";

var colorData = colorCacheDefault;

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

function decodeImage(rowcon, yh, x, id) {
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
		light: 		0,
		overexposed:0,
		underexposed:0
	}, divisor = 0;


	for (var y = 0; y < yh; y++) {
		var con = [rowcon[((y+1) * 4) - 4], rowcon[((y+1) * 4) - 3], rowcon[((y+1) * 4) - 2]]; // getImageData throws an array Uint8ClampedArray... converting it to something useful

		if (con[0] === undefined) {
			console.error("Color not present. Skipping!");
			grid = false;
			break;
		}

		grid[colorCache(con[0], con[1], con[2])] += 1;
		if (color({r: con[0], g: con[1], b: con[2]}).luminosity() <= 0.5)
			grid["dark"] += 1;
		else
			grid["light"] += 1;

		if (con[0] >= 240 && con[1] >= 240 && con[2] >= 240)
			grid["overexposed"] +=1;
		if (con[0] <= 20 && con[1] <= 20 && con[2] <= 20)
			grid["underexposed"] +=1;
		divisor+=1;
	}

	self.postMessage({
		grid,
		divisor,
		x,
		id
	})
}

self.onmessage = (e) => {
	decodeImage(e.data.rowcon, e.data.yh, e.data.x, e.data.id);
}
