export default function (src) {
	var myImg = new Image();
	myImg.src = src;
	var context = document.getElementById('canvas').getContext('2d');
	context.drawImage(myImg, 0, 0);
	var grid = []; // Returns r, g, b, a

	// Grid of all pixels created
	for (var x=0; x<myImg.width, x++) {
		var xpix = grid[x];
		for (var y=0; y<myImg.height, y++) {
			var ypix = grid[x][y],
			con = context.getImageData(x, y, 1, 1).data;
			ypix = data;
		}
	}

	// Grid now must be converted to 256*256 grid

	// OR CAN BE DONE DIRECTLY... Must sleep over :S

	return false;
}