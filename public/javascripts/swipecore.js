// TODO: rename this to swipecore.core.js
;(function(window, undefined) {

	// Preserve previous SwipeCore object
	var previousSwipeCore = window.SwipeCore;

	// Initialize SwipeCore Object
	var SwipeCore = {};
	SwipeCore.VERSION = "0.5.3";

	/*
	No conflict mode for SwipeCore. Restore previous SwipeCore reference.
	@return {object} SwipeCore i.e. this library
	*/
	SwipeCore.noConlict = function(){
		window.SwipeCore = previousSwipeCore;
		return SwipeCore;
	};

	// TODO: memorize the value
	// TODO: remove the catch/try
	/*
	Check if the browser supports touch input
	@return {Boolean} true when touch event is supported, false otherwise
	*/
	SwipeCore.hasTouch = function(){
		try {
			if (document.createEvent("TouchEvent").initTouchEvent) {
				return true;
			}
		} catch (err) {
			return false;
		}
	};

	/*
	Return the corresponding event name for start, move, end, and cancel, based on `hasTouch` method
	@return {Object}
		start {string}: event name for start gesture
		move {string}: event name for move gesture
		end {string}: event name for end gesture
		cancel {string}: event name for cancel gesture
	*/
	SwipeCore.gestures = function(){
		if (SwipeCore.hasTouch()){
			return {
				start: "touchstart",
				move: "touchmove",
				end: "touchend",
				cancel: "touchcancel"
			};
		} else {
			return {
				start: "mousedown",
				move: "mousemove",
				end: "mouseup"
			};
		}
	};

	// TODO: remove `objExtend` and update all tests to use `default` instead
	// Underscore's each function
	var nativeForEach = Array.prototype.forEach;
	var breaker = {};
	var each = function(obj, iterator, context) {
		if (obj == null) return;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
			}
		} else {
			for (var key in obj) {
				if (hasOwnProperty.call(obj, key)) {
					if (iterator.call(context, obj[key], key, obj) === breaker) return;
				}
			}
		}
	};

	// Underscore's extend function
	SwipeCore.objExtend = function(obj) {
		var slice = Array.prototype.slice;
		each(slice.call(arguments, 1), function(source) {
			for (var prop in source) {
				if (source[prop] !== void 0) obj[prop] = source[prop];
			}
		});
		return obj;
	};

	// TODO: use getter for all properties
	/*
	A `Touch` object represent a touch, that is transformed from the original `TouchEvent` from `touchstart`, `touchmove`, `touchend`.
	A `Touch` object contains information `position`, `duration`, `velocity: speed`, `velocity: bearing`, `displacement: distance`, `displacement: bearing`, `target`
	*/
	var Touch = function(e, opts){
		// Save time the touch is received
		this.timestamp = new Date();

		// Save the position of the touch
		this.position = {
			x: e.pageX,
			y: e.pageY
		};

		// Set the duration of the touch, if there is no opts.startTouch, this is a new touch, and is set to 0
		if (opts.startTouch) {
			this.duration = new Date() - opts.startTouch.timestamp;
		} else {
			this.duration = 0;
		}

		// Calculate velocity of a finger:
		if (opts.lastTouch) {
			// Find the difference of the finger's position. 0 if the finger has just touched
			var lastTouch = opts.lastTouch;
			var lastPositionDifference = {
				x: lastTouch.position.x - this.position.x,
				y: lastTouch.position.y - this.position.y
			};
			// TODO: come up with a smarter formula mathematically
			var bearing = (180/Math.PI) * Math.atan2(lastPositionDifference.y, lastPositionDifference.x);
			bearing = bearing < 0 ? bearing + 360 : bearing;
			bearing += 90;
			bearing = bearing > 360 ? bearing - 360 : bearing;
			this.velocity = {
				speed: Math.sqrt( Math.pow(lastPositionDifference.x, 2) + Math.pow(lastPositionDifference.y, 2) ) / ( (new Date() - lastTouch.timestamp) / 1000),
				bearing: bearing
			};
		} else {
			this.velocity = {
				speed: undefined,
				direction: undefined
			};
		}

		// Calculate displacement
		if (opts.startTouch) {
			var startTouch = opts.startTouch;
			// Set displacement of finger
			var startPositionDifference = {
				x: this.position.x - startTouch.position.x,
				y: this.position.y - startTouch.position.y
			};
			// TODO: come up with a smarter formula mathematically
			var bearing = (180/Math.PI) * Math.atan2(startPositionDifference.y, startPositionDifference.x);
			bearing = bearing < 0 ? bearing + 360 : bearing;
			bearing += 90;
			bearing = bearing > 360 ? bearing - 360 : bearing;

			this.displacement = {
				x: startPositionDifference.x,
				y: startPositionDifference.y,
				distance: Math.sqrt(Math.pow(startPositionDifference.x, 2) + Math.pow(startPositionDifference.y, 2)),
				bearing: bearing
			};
		} else {
			// Return 0 displacement for first touch
			this.displacement = {
				x: 0,
				y: 0,
				distance: 0,
				bearing: undefined
			};
		}

		// Set target to be the element tapped by the finger
		if (SwipeCore.hasTouch()) {
			this.target = document.elementFromPoint(this.position.x - window.scrollX, this.position.y - window.scrollY);
		} else {
			this.target = e.target;
		}
	};

	// TODO: find a way to eliminate the use of startTouch, lastTouch
	// TODO: Touches has problem when a finger let go and contact again (e.g. duration)
	/*
	`Touches` is a collection of `Touch` object. Also provides additional utility method for calculating some additional information about the `Touch`es.
	`Touch` are sorted ascendingly according to the order of contact.
	*/
	var startTouch = [], lastTouch = [];
	var Touches = function(e, opts){
		var that = this;
		this.touches = [];
		var orderedTouches = [];
		// Reorder touches if there is lastTouch for comparison
		// TODO: clean up the code
		if (lastTouch.length !== 0) {
			var match = [];
			var lastTouchMatched = [];
			var newTouchCounter = e.touches.length - 1;
			for (var i=0; i<e.touches.length; i++){
				var touch = e.touches[i];
				// Find the closest touch comparing to lastTouch
				var leastDistance = Infinity;
				// Init to be 0 for first touch
				var closestTouch = 0;
				for (var j=0; j<lastTouch.length; j++){
					var distance = SwipeCore.Geometry.distanceBtw(
						lastTouch[j].position, {x: touch.pageX, y: touch.pageY}
					);
					if (distance < leastDistance) {
						leastDistance = distance;
						closestTouch = j;
					}
				}
				// See if the closestTouch we found for this touch has been matched or not
				// If yes, check with the distance between the original match and the closest touch, and the new match and wthe cloeset touch
				// If no, match the new touch with the closest touch
				if (lastTouchMatched[closestTouch] !== undefined) {
					var originalMatch = lastTouchMatched[closestTouch];
					var distanceFromOriginalMatch = SwipeCore.Geometry.distanceBtw(
						{x: e.touches[originalMatch].pageX, y: e.touches[originalMatch].pageY}, lastTouch[closestTouch].position
					);
					var distanceFromNewMatch = SwipeCore.Geometry.distanceBtw(
						{x: touch.pageX, y: touch.pageY}, lastTouch[closestTouch].position
					);
					// If the new match is further away from the original match, this is a new touch
					// Else, the original match is a new touch
					// TODO: the original match may not be a new touch. Investigate further.
					if (distanceFromNewMatch > distanceFromOriginalMatch) {
						match[i] = newTouchCounter--;
					} else {
						match[originalMatch] = newTouchCounter--;
						match[i] = closestTouch;
					}
				} else {
					lastTouchMatched[closestTouch] = i;
					match[i] = closestTouch;
				}
			}
			for (var i=0; i<e.touches.length; i++){
				var newIndex = match[i];
				orderedTouches[newIndex] = e.touches[i];
			}
			// TODO: make sure we can use filter in all platforms
			orderedTouches = orderedTouches.filter(function(element){
				return element !== undefined;
			});
		}
		// Loop through all the touches
		for (var i=0; i<e.touches.length; i++) {
			// If startTouch has not been defined, it is a new touch
			if (lastTouch.length !== 0){
				this.touches[i] = new Touch(orderedTouches[i], {
					startTouch: startTouch[i],
					lastTouch: lastTouch[i]
				});
				if (!startTouch[i]) startTouch[i] = this.touches[i];
			} else {
				this.touches[i] = new Touch(e.touches[i], {});
			}
		}
		this._rotation = e.rotation;
		this._scale = e.scale;
		lastTouch = this.touches;
	};

	/*
	Returns the n-th `Touch` object.
	@param i {int}: a zero-based index
	@return {Touch}: the n-th `Touch` object
	*/
	Touches.prototype.get = function(i){
		return this.touches[i];
	};

	/*
	Iterator for the collection of `Touch` objects.
	@param fn {function}: the callback function for each `Touch` object. The 1st parameter is the `Touch` object, and 2nd is the 0-based index
	*/
	Touches.prototype.each = function(fn){
		for (var i=0; i < this.touches.length; i++) {
			fn(this.touches[i], i);
		}
	};

	// TODO: use getter instead for all get* method
	/*
	Returns the number of `Touch` object that it contains
	@return {int}: number of `Touch` object that it contains
	*/
	Touches.prototype.getLength = function(){
		return this.touches.length;
	};

	/*
	Returns the leftmost `Touch` object, based on its position
	@return {Touch}: the leftmost `Touch`
	*/
	Touches.prototype.getLeftMostTouch = function(){
		var leftMostTouch, leftMostPositionX;
		this.each(function(touch){
			if (leftMostPositionX === undefined || touch.position.x < leftMostPositionX) {
				leftMostPositionX = touch.position.x;
				leftMostTouch = touch;
			}
		});
		return leftMostTouch;
	};

	/*
	Returns the rightmost `Touch` object, based on its position
	@return {Touch}: the rightmost `Touch`
	*/
	Touches.prototype.getRightMostTouch = function(){
		var rightMostTouch, rightMostTouchX;
		this.each(function(touch){
			if (rightMostTouchX === undefined || touch.position.x > rightMostTouchX) {
				rightMostTouchX = touch.position.x;
				rightMostTouch = touch;
			}
		});
		return rightMostTouch;
	};

	Touches.prototype.getTopTouch = function(){};
	Touches.prototype.getBottomTouch = function(){};

	/*
	Returns the average displacement of all `Touch`es, in x and y axis separately
	@return {object}
		x {int}: average displacement along the x-axis
		y {int}: average displacement along the y-axis
	*/
	Touches.prototype.getAveragedDisplacement = function(){
		var displacement = { x: 0, y: 0 };
		this.each(function(touch){
			displacement.x += touch.displacement.x;
			displacement.y += touch.displacement.y;
		});
		displacement.x /= this.getLength();
		displacement.y /= this.getLength();
		return displacement;
	};

	/*
	Sort the `Touch`es object clockwise.
	@return {array}: an array of object with x, y co-ordinates
	*/
	Touches.prototype.sortTouchClockwise = function(){
		var points = [];
		this.each(function(touch, i){
			points.push(touch.position);
		});

		// Find the upper left point
		var upper = points[0];
		for(var i = 1; i < points.length; i++) {
			var temp = points[i];
			if(temp.y > upper.y || (temp.y == upper.y && temp.x < upper.x)) {
				upper = temp;
			}
		}

		// Helper function for calculating slope
		var getSlope = function(p1, p2) {
			var dy = p2.y - p1.y;
			var dx = p2.x - p1.x;
			return dy / dx;
		};

		// Define the sorting algorithm (clockwise)
		// From http://stackoverflow.com/questions/2855189/sort-latitude-and-longitude-coordinates-into-clockwise-ordered-quadrilateral
		var pointSort = function(p1, p2){
			// Exclude the 'upper' point from the sort (which should come first).
			if(p1 == upper) return -1;
			if(p2 == upper) return 1;

			// Find the slopes of 'p1' and 'p2' when a line is
			// drawn from those points through the 'upper' point.
			// var m1 = upper.slope(p1);
			var m1 = getSlope(p1, upper);
			// var m2 = upper.slope(p2);
			var m2 = getSlope(p2, upper);

			// 'p1' and 'p2' are on the same line towards 'upper'.
			if(m1 == m2) {
				// The point closest to 'upper' will come first.
				return p1.distance(upper) < p2.distance(upper) ? -1 : 1;
			}

			// If 'p1' is to the right of 'upper' and 'p2' is the the left.
			if (m1 <= 0 && m2 > 0) return -1;

			// If 'p1' is to the left of 'upper' and 'p2' is the the right.
			if (m1 > 0 && m2 <= 0) return 1;

			// It seems that both slopes are either positive, or negative.
			return m1 > m2 ? -1 : 1;
		};

		// Actually sort the points
		points = points.sort(pointSort);
		return points;
	};

	/*
	Return a scale factor of the area enclosed by the fingers, or distance between two fingers.
	@return {float}: area when two or more fingers, distance when two figner, 0 when one finger
	*/
	Touches.prototype.getScale = function(){
		var length = this.getLength();
		if (length === 0) {
			throw new Error("SwipeCore: Touches.getSize: There is no touch object");
		} else if (length === 1) {
			return 0;
		} else if (length === 2) {
			// Return distance between two points
			var pt1 = this.get(0).position, pt2 = this.get(1).position;
			var distance = SwipeCore.Geometry.distanceBtw(pt1, pt2);
			return distance;
		} else if (length === 3 ) {
			// Return distance between the centroid and the three points
			var pt1 = this.get(0).position, pt2 = this.get(1).position, pt3 = this.get(2).position;
			var centroid = this.getCentroid();
			var distance = SwipeCore.Geometry.distanceBtw(pt1, centroid) +
							SwipeCore.Geometry.distanceBtw(pt2, centroid) +
							SwipeCore.Geometry.distanceBtw(pt3, centroid);
			return distance;
		} else {
			var points = this.sortTouchClockwise();
			// Calculate the area based on sorted points
			var sum = 0;
			for (var i=0; i < points.length - 1; i++) {
				sum += points[i].x * points[i+1].y - points[i+1].x * points[i].y;
			}
			sum += points[points.length - 1].x * points[0].y - points[0].x * points[points.length - 1].y;
			sum = Math.abs(-sum / 2);
			return sum;
		}
	};


	/*
	Return x, y coordinate of the centroid, formed by the fingers.
	@return {object}: x, y coordintaes of the centroid. Return the only points when there is only one finger.
	*/
	Touches.prototype.getCentroid = function(){
		var length = this.getLength();
		if (length === 0) {
			throw new Error("SwipeCore: Touches.getCntroid: There is no touch object");
		} else if (length === 1) {
			// Only one point, return that point as centroid
			return this.get(0).position;
		} else if (length === 2) {
			// Return midpoint
			var pt1 = this.get(0).position, pt2 = this.get(1).position;
			var midpoint = {
				x: (pt1.x + pt2.x) / 2,
				y: (pt1.y + pt2.y) / 2
			};
			return midpoint;
		} else if (length === 3 ) {
			// Return the centroid of a triangle
			var pt1 = this.get(0).position, pt2 = this.get(1).position, pt3 = this.get(2).position;
			// Centroid = (A + B + C) / 3
			var centroid = {
				x: (pt1.x + pt2.x + pt3.x) / 3,
				y: (pt1.y + pt2.y + pt3.y) / 3
			};
			return centroid;
		} else {
			var area = this.getScale();
			var centroid = { x: 0, y: 0 };
			var points = this.sortTouchClockwise();
			// Append P0 to the end so that Pn = P0
			points.push(points[0]);
			for (var i=0; i < points.length - 1; i++) {
				var pt1 = points[i];
				var pt2 = points[i+1];
				var product = pt1.x * pt2.y - pt2.x * pt1.y;
				centroid.x += (pt1.x + pt2.x) * product;
				centroid.y += (pt1.y + pt2.y) * product;
			}
			centroid.x /= - 6 * area;
			centroid.y /= - 6 * area;
			console.log(centroid.x);
			return centroid;
		}
	};

	/*
	Return orientation of the touch gesture (in degree)
	@return {float}: Orientation of the gestures. Note: the initial orientation is not calibrated to 0.
	*/
	Touches.prototype.getOrientation = function(){
		var length = this.getLength();
		if (length < 2) {
			throw new Error("SwipeCore: Touches.getOrientation: requires 2 or more fingers");
		} else if (length === 2) {
			var pt1 = this.get(0).position, pt2 = this.get(1).position;
			var orientation = SwipeCore.Geometry.bearingBtw(pt1, pt2);
			return orientation;
		} else if (length === 3 ) {
			// TODO: figure out a better way to calculate the orientation with three fingers
			var pt1 = this.get(0).position, pt2 = this.get(1).position, pt3 = this.get(2).position;
			var orientation1 = SwipeCore.Geometry.bearingBtw(pt1, pt2);
			var orientation2 = SwipeCore.Geometry.bearingBtw(pt2, pt3);
			var orientation3 = SwipeCore.Geometry.bearingBtw(pt1, pt3);
			var orientation = (orientation1 + orientation2 + orientation3) / 3;
			return orientation1;
		} else {
			return this._rotation;
		}
	};

	var lastTouchEvent;
	var minNumFinger, maxNumFinger;

	// Internal handler for onTouchStart, return Touches object from the raw event data
	var enhanceTouchStart = function(e) {
		if (e instanceof MouseEvent) {
			e.touches = [e];
		} else if (e instanceof TouchEvent) {

		} else {
			throw new Error ("Input event not recognized");
		}

		var touches = new Touches(e, {});
		lastTouchEvent = touches;
		minNumFinger = touches.getLength();
		maxNumFinger = touches.getLength();

		return {
			type: e.type,
			touches: touches,
			originalEvent: e,
			minNumFinger: minNumFinger,
			maxNumFinger: maxNumFinger
		};
	};

	// Internal handler for onTouchMove, return Touches object from the raw event data
	var enhanceTouchMove = function(e) {

		if (e instanceof MouseEvent) {
			e.touches = [e];
		} else if (e instanceof TouchEvent) {

		} else {
			throw new Error ("Input event not recognized");
		}

		var touches = new Touches(e, {});
		lastTouchEvent = touches;
		minNumFinger = touches.getLength() < minNumFinger ? touches.getLength() : minNumFinger;
		maxNumFinger = touches.getLength() > maxNumFinger ? touches.getLength() : maxNumFinger;

		return {
			type: e.type,
			touches: touches,
			originalEvent: e,
			minNumFinger: minNumFinger,
			maxNumFinger: maxNumFinger
		};
	};

	// TODO: when there is no touchmove, touchend reports wrong data
	// TODO: should update the duration and etc if there is touchmove
	// Internal handler for onTouchMove, return Touches object from the raw event data
	var enhanceTouchEnd = function(e) {
		if (e instanceof MouseEvent) {
			e.touches = [e];
		} else if (e instanceof TouchEvent) {

		} else {
			throw new Error ("Input event not recognized");
		}

		startTouch = [], lastTouch = [];
		return {
			type: e.type,
			touches: lastTouchEvent,
			originalEvent: e,
			minNumFinger: minNumFinger,
			maxNumFinger: maxNumFinger
		};
	};

	// TODO: define a default constructor for NewGestureRecognizer
	// TODO: define a property (defaultOpts) which is used to override NewGestureRecognizer's opt
	// TODO: consider use another name (`public`) for public methods. Or just simply don't wrap them into method
	// TODO: make a detach method
	// TODO: consider to use other name than `extend`, for example ...
	SwipeCore.extend = function(opts) {
		var NewGestureRecognizer = function(el){
			if (el && el.DOCUMENT_NODE === 9) {
				this.el = el;
			} else {
				throw new Error("SwipeCore: element is not of a document node, or not a DOM element at all");
			}

			var gestures = SwipeCore.gestures();
			// Use subclass's constructor
			var overrideEl = opts.constructor.apply(this, Array.prototype.slice.call(arguments, 1));

			// Bind a events to a different el if given by subclass constrctor
			// Return if null is returned
			// NOTE: if the subclass does not explicitly return an eleemnt, undefined will be returned
			// Hence, listenerEl will be this.el
			var listenerEl;
			if (overrideEl === undefined)
				listenerEl = this.el;
			else if (overrideEl === null)
				return;
			else
				listenerEl = overrideEl;

			// Array-ify listernEl
			if (!Array.isArray(listenerEl)) listenerEl = [listenerEl];

			// Bind handlers with event listener
			var that = this;
			var started = false;

			var onTouchStart = function(e) {
				if (started) return;
				started = true;
				var enhancedEvent = enhanceTouchStart(e);
				opts.onTouchStart.call(that, enhancedEvent);
			};
			var onTouchMove = function(e){
				if (started === true){
					var enhancedEvent = enhanceTouchMove(e);
					opts.onTouchMove.call(that, enhancedEvent);
				}
			};
			var onTouchEnd = function(e){
				// prevent callback from happening until all fingers are lifted
				// and dont set `started` to false until all fingers are lifted
				if (!e.touches || e.touches.length === 0){
					started = false;
					var enhancedEvent = enhanceTouchEnd(e);
					opts.onTouchEnd.call(that, enhancedEvent);
				}
			};
			var endGestureIfNoFinger = function(e){
				if (!e.touches || e.touches.length === 0){
					started = false;
				}
			};

			// Public method: (re)attach event listeners for the element(s)
			this.attach = function(options) {
				if (opts.attach) opts.attach.call(this, options);
				for (var i=0; i<listenerEl.length; i++) {
					listenerEl[i].addEventListener(gestures.start, onTouchStart, false);
					listenerEl[i].addEventListener(gestures.move, onTouchMove, false);
					listenerEl[i].addEventListener(gestures.end, onTouchEnd, false);
					// Set started to false if the finger leaves the listenerEl
					window.addEventListener(gestures.end, endGestureIfNoFinger, false);
				}
			};

			// Public method: remove event listeners for the element(s)
			this.detach = function() {
				if (opts.detach) opts.detach.call(this);
				for (var i=0; i<listenerEl.length; i++) {
					listenerEl[i].removeEventListener(gestures.start, onTouchStart, false);
					listenerEl[i].removeEventListener(gestures.move, onTouchMove, false);
					listenerEl[i].removeEventListener(gestures.end, onTouchEnd, false);
					// Set started to false if the finger leaves the listenerEl
					window.removeEventListener(gestures.end, endGestureIfNoFinger, false);
				}
			};

			// Public method: purge everything within itself
			this.destroy = function() {
				if (opts.destroy) opts.destroy.call(this);
				this.detach();
				for (key in this) {
					delete this[key];
				}
			};

			// Finally, attach event listners
			this.attach({firstTime: true});
		};

		// Copy opts.public's method to NewGestureRecognizer's prototype
		for (key in opts.public) {
			NewGestureRecognizer.prototype[key] = opts.public[key];
		}

		// Return the new subclass
		return NewGestureRecognizer;
	};

	// TODO: also export to RequireJS / Ender?
	// TODO: make a Util method to allow subclass to easily export itself to a jQuery plugin

	// Export SwipeCore, taken from Underscore.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = SwipeCore;
		}
		exports.SwipeCore = SwipeCore;
	} else if (typeof define === 'function' && define.amd) {
		// Register as a named module with AMD.
		define('swipecore', function() {
			return SwipeCore;
		});
	} else {
		// Exported as a string, for Closure Compiler "advanced" mode.
		window['SwipeCore'] = SwipeCore;
	}

})(window, undefined);
