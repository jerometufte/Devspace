;(function(window, undefined) {
	var Geometry = {};

	// TODO: move to SwipeCore.Geometry
	Geometry.distanceBtw = function(pt1, pt2){
		return Math.sqrt(Math.pow(pt1.x-pt2.x, 2) + Math.pow(pt1.y-pt2.y, 2));
	};

	// TODO: move to SwipeCore.Geometry
	Geometry.bearingBtw = function(pt1, pt2){
		var bearing;
		var difference = { x: Math.abs(pt2.x - pt1.x), y: Math.abs(pt2.y - pt1.y) };
		var xOverY = (180/Math.PI) * Math.atan2(difference.x, difference.y);
		var yOverX = (180/Math.PI) * Math.atan2(difference.y, difference.x);

		if (pt2.y - pt1.y > 0) {
			if (pt2.x - pt1.x > 0) bearing = 90 + yOverX;
			else bearing = 180 + xOverY;
		} else {
			if (pt2.x - pt1.x > 0) bearing = xOverY;
			else bearing = 270 + yOverX;
		}
		return bearing;
	};

	Geometry.deg2Rad = function(deg) {
		return deg * Math.PI / 180;
	}

	Geometry.rad2Deg = function(rad) {
		return rad * 180 / Math.PI;
	}

	// Export the Geometry object to window.SwipeCore
	if (window.SwipeCore && !window.SwipeCore.Geometry) {
		window.SwipeCore.Geometry = Geometry;
	} else {
		throw new Error("SwipeCore.Geometry: SwipeCore is not defined in window, or SwipeCore.Geometry is already defined");
	}

})(window, undefined);
