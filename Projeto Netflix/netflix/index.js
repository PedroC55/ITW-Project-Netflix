(function ($) {

	$.fn.hoverscroll = function (params) {
		if (!params) { params = {}; }

		// Extend default parameters
		// note: empty object to prevent params object from overriding default params object
		params = $.extend({}, $.fn.hoverscroll.params, params);

		// Loop through all the elements
		this.each(function () {
			var $this = $(this);

			// prevent hoverscroll from being initialized several times
			if (this.__hsInitDone) {
				$.log('[HoverScroll] Init prevented because element is already a hoverscroll');
				return;
			}

			if (params.debug) {
				$.log('[HoverScroll] Trying to create hoverscroll on element ' + this.tagName + '#' + this.id);
			}

			// store handle to listcontainer
			var listctnr = $this.parent();

			// store hoverscroll container
			var ctnr = listctnr.parent();

			// Apply parameters width and height
			/*ctnr.width(params.width).height(params.height);
	
			listctnr.width(params.width).height(params.height);*/

			var size = 0;

			// Determine content width
			$this.children().each(function () {
				if ($(this).outerWidth) {
					size += $(this).outerWidth(true);
				}
			});
			// Apply computed width to listcontainer

			if (params.debug) {
				$.log('[HoverScroll] Computed content width : ' + size + 'px');
			}

			// Retrieve container width instead of using the given params.width to include padding
			if (ctnr.outerWidth) {
				size = ctnr.outerWidth();
			}

			if (params.debug) {
				$.log('[HoverScroll] Computed container width : ' + size + 'px');
			}

			// Define hover zones on container
			var zone = {
				1: { action: 'move', from: 0, to: 0.06 * size, direction: -1, speed: 16 },
				2: { action: 'move', from: 0.06 * size, to: 0.15 * size, direction: -1, speed: 8 },
				3: { action: 'move', from: 0.15 * size, to: 0.25 * size, direction: -1, speed: 4 },
				4: { action: 'move', from: 0.25 * size, to: 0.4 * size, direction: -1, speed: 2 },
				5: { action: 'stop', from: 0.4 * size, to: 0.6 * size },
				6: { action: 'move', from: 0.6 * size, to: 0.75 * size, direction: 1, speed: 2 },
				7: { action: 'move', from: 0.75 * size, to: 0.85 * size, direction: 1, speed: 4 },
				8: { action: 'move', from: 0.85 * size, to: 0.94 * size, direction: 1, speed: 8 },
				9: { action: 'move', from: 0.94 * size, to: size, direction: 1, speed: 16 }
			}

			// Store default state values in container
			ctnr[0].isChanging = false;
			ctnr[0].direction = 0;
			ctnr[0].speed = 1;


			/**
			 * Check mouse position relative to hoverscroll container
			 * and trigger actions according to the zone table
			 *
			 * @param x {Integer} Mouse X event position
			 * @param y {Integer} Mouse Y event position
			 */
			function checkMouse(x, y) {
				x = x - ctnr.offset().left;
				y = y - ctnr.offset().top;

				var pos;
				if (!params.vertical) { pos = x; }
				else { pos = y; }

				for (i in zone) {
					if (pos >= zone[i].from && pos < zone[i].to) {
						if (zone[i].action == 'move') { startMoving(zone[i].direction, zone[i].speed); }
						else { stopMoving(); }
					}
				}
			}


			/**
			 * Sets the opacity of the left|top and right|bottom
			 * arrows according to the scroll position.
			 */
			function setArrowOpacity() {
				if (!params.arrows || params.fixedArrows) { return; }

				var maxScroll;
				var scroll;

				if (!params.vertical) {
					maxScroll = listctnr[0].scrollWidth - listctnr.width();
					scroll = listctnr[0].scrollLeft;
				}
				else {
					maxScroll = listctnr[0].scrollHeight - listctnr.height();
					scroll = listctnr[0].scrollTop;
				}
				var limit = params.arrowsOpacity;

				// Optimization of opacity control by Josef Körner
				// Initialize opacity; keep it between its extremas (0 and limit) we don't need to check limits after init
				var opacity = (scroll / maxScroll) * limit;

				if (opacity > limit) { opacity = limit; }
				if (isNaN(opacity)) { opacity = 0; }

				// Check if the arrows are needed
				// Thanks to <admin at unix dot am> for fixing the bug that displayed the right arrow when it was not needed
				var done = false;
				if (opacity <= 0) {
					done = true;
				}

				if (opacity >= limit || maxScroll <= 0) {
					done = true;
				}

				// End of optimization
			}


			/**
			 * Start scrolling the list with a given speed and direction
			 *
			 * @param direction {Integer}	Direction of the displacement, either -1|1
			 * @param speed {Integer}		Speed of the displacement (20 being very fast)
			 */
			function startMoving(direction, speed) {
				if (ctnr[0].direction != direction) {
					if (params.debug) {
						$.log('[HoverScroll] Starting to move. direction: ' + direction + ', speed: ' + speed);
					}

					stopMoving();
					ctnr[0].direction = direction;
					ctnr[0].isChanging = true;
					move();
				}
				if (ctnr[0].speed != speed) {
					if (params.debug) {
						$.log('[HoverScroll] Changed speed: ' + speed);
					}

					ctnr[0].speed = speed;
				}
			}

			/**
			 * Stop scrolling the list
			 */
			function stopMoving() {
				if (ctnr[0].isChanging) {
					if (params.debug) {
						$.log('[HoverScroll] Stoped moving');
					}

					ctnr[0].isChanging = false;
					ctnr[0].direction = 0;
					ctnr[0].speed = 1;
					clearTimeout(ctnr[0].timer);
				}
			}

			/**
			 * Move the list one step in the given direction and speed
			 */
			function move() {
				if (ctnr[0].isChanging == false) { return; }

				setArrowOpacity();

				var scrollSide;
				if (!params.vertical) { scrollSide = 'scrollLeft'; }
				else { scrollSide = 'scrollTop'; }

				listctnr[0][scrollSide] += ctnr[0].direction * ctnr[0].speed;
				ctnr[0].timer = setTimeout(function () { move(); }, 50);
			}

			// Initialize "right to left" option if specified
			if (params.rtl && !params.vertical) {
				listctnr[0].scrollLeft = listctnr[0].scrollWidth - listctnr.width();
			}

			// Bind actions to the hoverscroll container
			ctnr
				// Bind checkMouse to the mousemove
				.mousemove(function (e) { checkMouse(e.pageX, e.pageY); })
				// Bind stopMoving to the mouseleave
				// jQuery 1.2.x backward compatibility, thanks to Andy Mull!
				// replaced .mouseleave(...) with .bind('mouseleave', ...)
				.bind('mouseleave', function () { stopMoving(); });

			// Bind the startMoving and stopMoving functions
			// to the HTML object for external access
			this.startMoving = startMoving;
			this.stopMoving = stopMoving;

			if (params.arrows && !params.fixedArrows) {
				// Initialise arrow opacity
				setArrowOpacity();
			}
			else {
				// Hide arrows
				$('.arrowleft, .arrowright, .arrowtop, .arrowbottom', ctnr).hide();
			}

			this.__hsInitDone = true;

			if ($.isFunction(params.create)) {
				params.create.call(this);
			}
		});

		return this;
	};


	// Backward compatibility with jQuery 1.1.x
	if (!$.fn.offset) {
		$.fn.offset = function () {
			this.left = this.top = 0;

			if (this[0] && this[0].offsetParent) {
				var obj = this[0];
				do {
					this.left += obj.offsetLeft;
					this.top += obj.offsetTop;
				} while (obj = obj.offsetParent);
			}

			return this;
		}
	}



	/**
	 * HoverScroll default parameters
	 */
	$.fn.hoverscroll.params = {
		vertical: false,      // Display the list vertically or not
		width: 400,        // Width of the list
		height: 50,         // Height of the list
		arrows: true,       // Display arrows to the left and top or the top and bottom
		arrowsOpacity: 0.7,    // Maximum opacity of the arrows if fixedArrows
		fixedArrows: false,     // Fix the displayed arrows to the side of the list
		rtl: false,		// Set display mode to "Right to Left"
		debug: false,       // Display some debugging information in firebug console

		create: function () { }
	};



	/**
	 * Log errors to consoles (firebug, opera) if exist, else uses alert()
	 */
	$.log = function () {
		try { console.log.apply(console, arguments); }
		catch (e) {
			try { opera.postError.apply(opera, arguments); }
			catch (e) {
				//            alert(Array.prototype.join.call(arguments, " "));
			}
		}
	};

})(jQuery);

$('.flix-items').hoverscroll({
	width: 720,
	arrows: false,
	debug: true
});
