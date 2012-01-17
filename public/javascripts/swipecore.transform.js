;(function(window, undefined) {
	var Transform = {};

	// TODO: implement `translate3d`, `translateX`, `translateY`, `translateZ`, `rotate2d`, rotate3d, rotateY, rotateZ, scaleX, scaleY, scaleZ, scale3d
	// Also for `skew`, `perspective`
	// TODO: add option to perverse the original transform, i.e. to transform an addition of some values

	Transform.objectifyTransformStyle = function(str) {
		// TODO: /(\w*)\((\d\.?\d*)p?x?, (\d\.?\d*)p?x?(, (\d\.?\d*)p?x?)?\)/g.exec(style) only returns the first match

		if (str.length === 0) return {};

		// Breakdown the transform styles into an array
		var styles = str.match(/( ?\w*\([-\d,\. pxdeg]*\))/g);

		// Refer: http://rubular.com/r/uiUdB5E9Lk
		var transformStyles = {};
		for (var i=0; i<styles.length; i++) {
			if (styles[i].indexOf("rotate") !== -1){
				// Refer: http://rubular.com/r/XuL9pk2aq8
				var style = styles[i].match(/([\w]+)\((-?\d*\.?\d*)deg(, (-?\d*\.?\d*)deg)?(, (-?\d*\.?\d*)deg)?\)/);
				transformStyles[style[1]] = {
					x: style[2],
					y: style[4],
					z: style[6]
				};
			} else {
				var style = styles[i].match(/([\w]+)\((-?\d*\.?\d*)p?x?, (-?\d*\.?\d*)p?x?(, (-?\d*\.?\d*)p?x?)?\)/);
				transformStyles[style[1]] = {
					x: style[2],
					y: style[3],
					z: style[5]
				};
			}
		}
		return transformStyles;
	};

	Transform.stringifyTransformStyle = function(obj) {
		var str = "";
		for (style in obj) {
			if (style.match("translate")){
				obj[style].x += "px";
				obj[style].y += "px";
				if (style.match("3d")) obj[style].z += "px";
				str += style + "(" + obj[style].x + ", " + obj[style].y;
				if (style.match("3d")) str += ", " + obj[style].z;
			} else if (style.match("rotate")) {
				obj[style].x += "deg";
				if (obj[style].y) obj[style].y += "deg";
				if (obj[style].z) obj[style].z += "deg";
				str += style + "(" + obj[style].x;
				if (style.match("3d")) str += ", " + obj[style].y + ", " + obj[style].z;
			} else {
				str += style + "(" + obj[style].x + ", " + obj[style].y;
				if (style.match("3d")) str += ", " + obj[style].z;
			}
			str += ") ";
		}
		return str;
	};

	Transform.translate2d = function(el, x, y){
		var webkitTransform = SwipeCore.Transform.objectifyTransformStyle(el.style.webkitTransform);
		webkitTransform.translate3d = { x: x, y: y, z: 0 };
		el.style.webkitTransform = SwipeCore.Transform.stringifyTransformStyle(webkitTransform);
	};

	Transform.rotateX = function(el, deg){
		var webkitTransform = SwipeCore.Transform.objectifyTransformStyle(el.style.webkitTransform);
		webkitTransform.rotate = { x: deg };
		el.style.webkitTransform = SwipeCore.Transform.stringifyTransformStyle(webkitTransform);
	};

	Transform.scale2d = function(el, x, y) {
		var webkitTransform = SwipeCore.Transform.objectifyTransformStyle(el.style.webkitTransform);
		webkitTransform.scale3d = { x: x, y: y, z: 1 };
		el.style.webkitTransform = SwipeCore.Transform.stringifyTransformStyle(webkitTransform);
	}

	// Export the Transform object to window.SwipeCore
	if (window.SwipeCore && !window.SwipeCore.Transform) {
		window.SwipeCore.Transform = Transform;
	} else {
		throw new Error("SwipeCore.Transform: SwipeCore is not defined in window, or SwipeCore.Transform is already defined");
	}

})(window, undefined);
