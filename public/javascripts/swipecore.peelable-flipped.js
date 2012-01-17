;(function(window, undefined) {

	var shouldReveal = function(ratio) {
		if (ratio > 0.1) return true;
		else return false;
	};

	var removeTransition = function() {
		$("#peel").add("#peel img").add("#under").add("#under #content").css({
			"-webkit-transition": ""
		});
	};

	var isParentOf = function($child, $parent) {
		var $c = $child;
		while (!$c.parent().is($("body"))) {
			if ($c.parent().is($parent)) return true;
			$c = $c.parent();
		}
		return false;
	};

	var addTransition = function() {
		$("#peel").add("#peel img").add("#under").add("#under #content").css({
			"-webkit-transition": "all .8s ease"
		});
	};

	var underContentHeight, underContentWidth;
	var setUnderContentDimentsion = function() {
		// Set the #under #content's height and width the same as #peelable
		underContentHeight = $(this.el).height();
		underContentWidth = $(this.el).width();
		$("#under #content").height(underContentHeight);
		$("#under #content").width(underContentWidth);
	};

	var transformEl = function(ratio) {
		var newCornerXOffset = ratio * (this.opts.final.peelOffset - this.opts.initial.peelOffset) + this.opts.initial.peelOffset;
		var newAngle = ratio * (this.opts.final.angle - this.opts.initial.angle) + this.opts.initial.angle;
		$("#corner #peel").css({
			"-webkit-transform": "rotate(" + newAngle + "deg) translate3d("+ newCornerXOffset +"px, 0, 0)"
		});
		$("#corner #under").css({
			"-webkit-transform": "rotate(" + newAngle + "deg) translate3d("+ newCornerXOffset +"px, 0, 0)"
		});

		// TODO: use memerized number instead of hardcorded number
		/* X: 920 = 1000 (width of #under) - 80 (translateX of #under) */
		/* Y: 57 = 2000 (height of #under) + -1000 (bottom of #under) - 943 (height of #under #content) */
		var newUnderXOffset = 1000 - newCornerXOffset;
		var newUnderYOffset = 2000 + -1000 - underContentHeight;
		$("#corner #under #content").css({
			"-webkit-transform": "translate3d(" + newUnderXOffset + "px, " + newUnderYOffset + "px, 0) rotate(" + -1 * newAngle + "deg)"
		});

		var newScaleX = ratio * (this.opts.final.scale.x - this.opts.initial.scale.x) + this.opts.initial.scale.x;
		var newScaleY = ratio * (this.opts.final.scale.y - this.opts.initial.scale.y) + this.opts.initial.scale.y;
		// TODO: the tan function is wild guess. figure out the geometry
		var newPeelImgBottomOffset = (1 + Math.tan(SwipeCore.Geometry.deg2Rad(this.opts.final.angle - newAngle))) * ratio * (this.opts.final.peelBottom - this.opts.initial.peelBottom) + this.opts.initial.peelBottom;
		// NOTE: must manipulate bottom instead of top for #corner #peel img, otherwise the animation will be jaggy
		$("#corner #peel img").css({
			"bottom": newPeelImgBottomOffset + "px",
			"-webkit-transform": "scale3d(" + newScaleX + ", " + newScaleY + ", 1)"
		});
	};

	var toggleOpenState = function(){
		if (this.opened) this.close();
		else this.open();
	};

	var revertToOriginalState = function(opts){
		if (this.opened) this.open(opts);
		else this.close(opts);
	};

	// TODO: change default peel image into a base64 image?
	// TODO: change class name to an arbitary query selector. hurdle: CSS styling
	var defaultOpts = {
		numFinger: 1,
		peelImage: "peel-flipped.png",
		bottomClassName: "bottom",
		initial: {
			angle: -18,
			peelOffset: 17,
			peelBottom: 993,
			scale: { x: 0.07, y: 0.04 }
		},
		final: {
			angle: -20,
			peelOffset: 405,
			peelBottom: 822,
			scale: { x: 1, y: 1 }
		}
	};

	var pointerEventsClear;
	var ratio = 0;
	var moved = false;
	var Peelable = SwipeCore.extend({
		constructor: function(opts) {
			var that = this;
			this.uid = SwipeCore.Utils.uniqueId();
			this.opts = SwipeCore.Utils.defaults(opts, defaultOpts);
			// var peelableStyleSheetIndex = SwipeCore.Utils.searchStyleSheetsByTitle("swipecore:peelable");
			// if (peelableStyleSheetIndex === -1) {
			// 	SwipeCore.Utils.addStyleSheetsByTitle("swipecore:peelable");
			// 	var peelableStyleSheet = document.styleSheets[document.styleSheets.length - 1];
			// 	SwipeCore.Utils.addCSSRulesToStyleSheet(peelableStyleSheet, this.opts.rules);
			// }
			this.opened = false;

			// Set-up DOM
			var bottomDom = document.querySelector("." + this.opts.bottomClassName);
			var contentHTML = bottomDom.innerHTML;
			this.el.removeChild(bottomDom);
			var corner = document.createElement("div");
			corner.id = "corner";
			corner.innerHTML = " \
				<div id='peel'> \
					<img src='" + this.opts.peelImage + "' alt=''> \
				</div> \
				<div id='under'> \
					<div id='content' class='" + this.opts.bottomClassName + "'>" + contentHTML +
					"</div> \
				</div> \
			";
			this.el.appendChild(corner);

			// TODO: optimimze performance. Memorize some values.
			setUnderContentDimentsion();
			this.close.call(this, {noTransition: true});

			window.addEventListener("resize", function(){
				removeTransition.call(that);
				revertToOriginalState.call(that, {noTransition: true});
				setUnderContentDimentsion.call(that);
			});
			window.addEventListener("orientationchange", function(){
				removeTransition.call(that);
				revertToOriginalState.call(that, {noTransition: true});
				setUnderContentDimentsion.call(that);
			});

			return [$("#peel img").get(0), $("#under").get(0)];
		},
		onTouchStart: function(e) {
			moved = false;
			ratio = this.opened ? 1 : 0;
			removeTransition.call(this);
		},
		onTouchMove: function(e) {
			moved = true;

			e.originalEvent.preventDefault();
			immediateToggle = false;
			var displacement = e.touches.getAveragedDisplacement().x;
			var discountFactor = 550;
			if (this.opened) ratio = (discountFactor + displacement) / discountFactor;
			else ratio = displacement / discountFactor;
			ratio = Math.min(1.3, ratio);
			ratio = Math.max(-0.2, ratio);
			if (ratio > 1) ratio = 1 + (ratio - 1) / 2;
			if (ratio < 0) ratio = ratio / 2;
			transformEl.call(this, ratio);
		},
		onTouchEnd: function(e) {
			var $target = $(e.touches.get(0).target);

			// TODO: avoid using return
			// When opened, clicking the peel image close the peel
			if (!moved && this.opened && ($target.is("#peel img") || $target.is("#content"))) {
				return this.close();
			// When close, clicking either the peel or the under (and its children) open the peel
			} else if (!moved && !this.opened && ( $target.is("#peel img") || $target.is("#under") || isParentOf($target, $("#under")) )) {
				return this.open();
			}

			if (shouldReveal(this.opened?(1-ratio):ratio)) {
				toggleOpenState.call(this);
			} else {
				revertToOriginalState.call(this);
			}
		},
		onTouchCancel: function(e){},
		public: { // Public functions
			open: function(opts) {
				this.opened = true;
				// TODO: use webkitTransitionEnd or opts.transitionLength instead of timeout and 800ms
				pointerEventsClear = window.setTimeout(function(){
					$("#under #content").css("pointer-events", "");
				}, 800);
				if (opts && opts.noTransition) removeTransition.call(this);
				else addTransition.call(this);
				transformEl.call(this, 1);
			},
			close: function(opts) {
				this.opened = false;
				// Clear the setting the pointer-events callback
				// TODO: what if open has been called twice (and pointerEventsClear has been set twice)
				// that close can only clear one of it?
				if (pointerEventsClear) window.clearTimeout(pointerEventsClear);
				$("#under #content").css("pointer-events", "none");
				if (opts && opts.noTransition) removeTransition.call(this);
				else addTransition.call(this);
				transformEl.call(this, 0);
			}
		}
	});

	// export Swipeable to window.SwipeCore object
	if (window.SwipeCore.Peelable) {
		throw new Error("Peelable is already loaded");
	} else {
		window.SwipeCore.Peelable = Peelable;
	}

	// export Peelable as jQuery plugin, if jQuery is loaded
	if (window.jQuery) {
		(function($) {
			$.fn.Peelable = function(swipeAxis, opts){
				var returnArray = [];
				this.each(function(){
					returnArray.push(new window.SwipeCore.Peelable(this, opts));
				});
				if (returnArray.length <= 1) returnArray = returnArray[0];
				return returnArray;
			}
		})(window.jQuery);
	}

})(window, undefined);
