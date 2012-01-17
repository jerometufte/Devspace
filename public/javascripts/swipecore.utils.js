;(function(window, undefined) {
	var Utils = {};

	// Underscore: (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.

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

	// Underscore's default function
	// Fill the object in 1st parameter, with the default values in 2nd parameters.
	Utils.defaults = function(obj) {
		var obj = obj || {};
		var slice = Array.prototype.slice;
		each(slice.call(arguments, 1), function(source) {
			for (var prop in source) {
				if (obj[prop] == null) obj[prop] = source[prop];
			}
		});
		return obj;
	};

	// Underscore's extend method
	// Extend a given object with all the properties in passed-in object(s).
	Utils.extend = function(obj) {
		var slice = Array.prototype.slice;
		each(slice.call(arguments, 1), function(source) {
			for (var prop in source) {
				if (source[prop] !== void 0) obj[prop] = source[prop];
			}
		});
		return obj;
	};

	// Return a shallow-copied object
	Utils.clone = function(obj) {
		return Utils.defaults({}, obj);
	}

	Utils.searchStyleSheetsByTitle = function(title) {
		for (var i=0; i<document.styleSheets.length; i++) {
			if (document.styleSheets[i].title === title) {
				return i;
			}
		}
		return -1;
	};

	Utils.addStyleSheetsByTitle = function(title) {
		var cssNode = document.createElement('style');
		cssNode.type = "text/css";
		cssNode.rel = "stylesheet";
		cssNode.media = "screen";
		cssNode.title = title;
		document.getElementsByTagName("head")[0].appendChild(cssNode);
		return Utils.searchStyleSheetsByTitle(title);
	};

	Utils.addCSSRulesToStyleSheet = function(stylesheet, rules) {
		for (var i = 0; i < rules.length; i++) {
			stylesheet.addRule(rules[i].selector, rules[i].style);
		}
	};

	// Underscore's uniqueId function
	// Generate a unique integer id (unique within the entire client session).
	var idCounter = 0;
	Utils.uniqueId = function(prefix) {
		var id = idCounter++;
		return prefix ? prefix + id : id;
	}

	// Export the Utils object to window.SwipeCore
	if (window.SwipeCore && !window.SwipeCore.Utils) {
		window.SwipeCore.Utils = Utils;
	} else {
		throw new Error("SwipeCore.Util: SwipeCore is not defined in window, or SwipeCore.Utils is already defined");
	}
})(window, undefined);
