/**
 * @fileOverview BEATMACHINE bootstrap JavaScript file
 * @author 
 * @version 0.9
 */

/**
 * @name BEATMACHINE
 * @namespace The global namespace for the BEATMACHINE.
 * @description The global namespace for the BEATMACHINE.
 * @requires Zepto or jQuery
 * @borrows BEATMACHINE-Ajax.load as ajax
 * @borrows BEATMACHINE-Ajax.abort as ajaxAbort
 * @borrows BEATMACHINE-UpdateScreen.location as updateScreen
 */
window.BEATMACHINE = (function(self, window, undefined){
	
	/**
	 * @name BEATMACHINE-_initialize
	 * @exports BEATMACHINE-_initialize as BEATMACHINE
	 * @function
	 * @description The initialize method that kicks off all BEATMACHINE functionality
	 */
	var _initialize = function() {

		// prevent bootstrap from executing twice
		if (self.initialized) {
			return;
		}
		
		// console overwrite for IE8
		if (window.console === undefined) { 
			window.console = {};
			console.log = function() {};
			console.error = function() {};
		}
		
		console.log('BEATMACHINE.initialize');

		// Set body now that DOM is available	
		BEATMACHINE.$body		= $('body');
		BEATMACHINE.$wrapper	= $('#wrapper');
		BEATMACHINE.$content	= $('#content');
		
		// if user is on desktop add desktop class, which hides create button
		// if user is on desktop, or has not received a message, init video overlay functionality
		if (!BEATMACHINE.HAS_TOUCH || !BEATMACHINE.IS_IOS) BEATMACHINE.$body.addClass('desktop');
		var hasMessage = $('#home').hasClass('has-message').toString();
		if (!BEATMACHINE.HAS_TOUCH || (!hasMessage && screen.width >=768)) BEATMACHINE.Video.initialize();
		
		// google analytics event tracking 
		var experience = 'desktop';
		if (BEATMACHINE.HAS_TOUCH) experience = (BEATMACHINE.IS_IOS) ? 'iOS' : 'touch-non-iOS';
		_gaq.push(['_trackEvent', 'experience', experience]);
		_gaq.push(['_trackEvent', 'hasMessage', hasMessage]);
		
		BEATMACHINE.$wrapper.find('.btn-screen').on('click', _clickBtnScreen);
		BEATMACHINE.$window.on('resize', _onResize).resize();

		// prevent bootstrap from executing twice
		self.initialized = true;
	},
	
	/**
	 * @name BEATMACHINE-_onResize
	 * @function
	 * @description
	 */	
	_onResize = function() {
		BEATMACHINE.$wrapper.css({
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		});
	},
	
	/**
	 * @name BEATMACHINE-_clickBtnScreen
	 * @function
	 * @description
	 */
	_clickBtnScreen = function() {
		var $this = $(this);
		var data = {};
		if ( $this.attr('data-message') != undefined ) data.text = $this.attr('data-message');

		BEATMACHINE.updateScreen( $this.attr('data-screen'), $this.attr('data-module'), data );
		return false;
	},
	
	/**
	 * @name BEATMACHINE-_getServiceUrl
	 * @function
	 * @exports BEATMACHINE-_getServiceUrl as BEATMACHINE.getServiceUrl
	 * @description Lets us store all service urls in one location. Manage easily switching between production data and static test data.
	 * @param {String} key The service we want a url for.
	 */
	_getServiceUrl = function(key) {
		
		var serviceUrls = {
			//create_message: '/services/post/create_message',
			create_message: '/beat/create',
			send_message: '/services/post/send_message'
		}
		
		if (serviceUrls[key]) {
			return serviceUrls[key];
		} else {
			return '';
		}
		
	};
	
	/**
	 * @name BEATMACHINE-UpdateScreen
	 * @namespace Manages screen transitions 
	 * @description Manages screen transitions
	 */
	self.UpdateScreen = (function(){
		
		config = {
			curr_screen: 'home'
		},
		
		/**
		 * @name BEATMACHINE-UpdateScreen-__fadeOut
		 * @description
		 * @param {string} screen
		 */
		__fadeOut = function(screen) {
			var el = $('#'+screen);
			el.animate({
				opacity : 0
			}, 200, "linear", function(){
				el.addClass('displayNone');
			});
		},
		
		/**
		 * @name BEATMACHINE-UpdateScreen-__fadeIn
		 * @description
		 * @param {string} screen
		 */
		__fadeIn = function(screen) {
			var el = $('#'+screen);
			el.removeClass('displayNone').animate({
				opacity : 1
			}, 200, "linear", function(){
				el.removeClass('displayNone');
			});
		},
		
		/**
		 * @name BEATMACHINE-UpdateScreen
		 * @exports BEATMACHINE-UpdateScreen-__location as BEATMACHINE-UpdateScreen.location
		 * @description
		 * @param {string} screen The ID of the screen we want to navigate to.
		 * @param {string} module The module we want to initialize for this screen.
		 * @param {object} data that can be transferred to next screen
		 */
		__location = function(screen, module, data) {
			console.log('BEATMACHINE-UpdateScreen.location');
			console.log('screen='+screen);
			console.log('module='+module);
			__fadeOut(config.curr_screen);
			__fadeIn(screen);
			config.curr_screen = screen;
			if (BEATMACHINE[module] && BEATMACHINE[module].initialize) {
				BEATMACHINE[module].initialize($('#'+screen),data);
			}
		};
		
		return {
			location: __location
		}
		
	}());
	
	/**
	 * @name BEATMACHINE-Ajax
	 * @namespace Sets up functionality specific to calling the abstracted Ajax methods.
	 * @description Sets up functionality specific to calling the abstracted Ajax methods.
	 * @private
	 */
	self.Ajax = (function(){
		
		/**
		 * @name BEATMACHINE-Ajax-__errorHandler
		 * @function
		 * @description This is the default functionality for displaying errors to the user.
		 * @param {mixed} error	The original error message.
		 * @param {function} errorFn If there is a custom error handler, use it instead of the default functionality.
		 * @param {number} status Status code for the error that occurred.
		 */
		var	__errorHandler = function(error, errorFn, status) {
				// if there is a custom error function, use that
				// else, do something with error message
				console.log("in __errorHandler");
				if (typeof errorFn === 'function') {
					errorFn(error);
				} else {
					if (!error || !error.length || (error === 'Not Found') || (error === 'Internal Server Error') || (error === 'OK')) {
						error = 'There was an error performing this action. Please try again later.';
					}
					// do something with error message
				}
			},
			
			/**
			 * @name BEATMACHINE-Ajax-__abort
			 * @exports BEATMACHINE-Ajax-__abort as BEATMACHINE-Ajax.abort
			 * @function
			 * @description Abort a specific XHR object.
			 * @param {object} $xhr The jQuery xhr object to abort.
			 */
			__abort = function($xhr) {
				if ($xhr) $xhr.abort();
			},
			
			/**
			 * @name BEATMACHINE-Ajax-__load
			 * @exports BEATMACHINE-Ajax-__load as Sandbox-Ajax.load
			 * @function
			 * @description An AJAX wrapper that abstracts the $.ajax method from our codebase.
			 * @param {string} url The url we are calling in the Ajax request.
			 * @param {object} [opts] The params used in this request are optional.
			 * @returns {object} $xhr The XHR object generated by this method call.
			 */
			__load = function(url, opts) {
				
				// if the url is not a string OR there is no length to the url
				if (typeof url !== 'string' || !url.length) {
					return;
				}


				// make sure opts is an object
				if (opts === undefined || typeof opts !== 'object') {
					opts = {};
				}

				// call the jquery ajax method
				var $xhr = $.ajax({
					url: url,
					type: opts.type || 'GET',
					data: opts || '',
					dataType: opts.dataType || 'html',
					error: function(xhr, status, error) {

						if (error !== 'abort') __errorHandler(error, opts.errorFn, status);

					},
					success: function(response, status, xhr) {

						if (opts.dataType === 'json') {

							if (response.status === false) {
								__errorHandler(response.error, opts.errorFn, status);
							} else {

								if (typeof opts.successFn === 'function') {
									opts.successFn(response);
								}
							}
						} else if (opts.$ele) {
							if (opts.append) {
								opts.$ele.append(response);
							} else {
								opts.$ele.empty().html(response.toSource());
							}
							if (typeof opts.successFn === 'function') opts.successFn();
						} else {

							if (typeof opts.successFn === 'function') opts.successFn(response);
						}
					},
					beforeSend: function(xhr, settings) {
						//if (opts.type && opts.type.toUpperCase() === 'POST') {
						//	xhr.setRequestHeader("X-CSRFToken", self.Util.getCookie('csrftoken'));
						//}
						// do not disable buttons for certain requests
						//if (!opts.cancelDisable) self.Messages.showLoading();
						//if (typeof opts.beforeFn === 'function') opts.beforeFn();
					},
					complete: function(xhr, status) {
						// do not disable buttons for certain requests
						//if (!opts.cancelDisable) self.Messages.hideLoading();
						//if (typeof opts.completeFn === 'function') opts.completeFn();
					}
				});
				
				return $xhr;
				
			};
			
    	/**
		 * Protected methods for the self.Ajax subclass
		 */
		return {
			abort: __abort,
			load: __load
		};
		
	})();
	
	// BEATMACHINE public variables & methods
	return {
		/**
		 * @name BEATMACHINE.HAS_TOUCH
		 * @description Defines if touch events are supported. */ 
		HAS_TOUCH: ('ontouchstart' in window),
		/**
		 * @name BEATMACHINE.IS_IOS
		 * @description Detects iOS operating system for proper messaging. */ 
		IS_IOS: ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false ),
		/**
		 * @name BEATMACHINE.$document
		 * @description Stored jQuery reference to document */
		$document: $(document),
		/**
		 * @name BEATMACHINE.$window
		 * @description Stored jQuery reference to window */
		$window: $(window),
		/**
		 * @name BEATMACHINE.$html
		 * @description Stored jQuery reference to html element */
		$html: $('html'),
		/**
		 * @name BEATMACHINE.$body
		 * @description Stored jQuery reference to body element */
		$body: null,
		/**
		 * @name BEATMACHINE.$wrapper
		 * @description Stored jQuery reference to #wrapper element */
		$wrapper: null,
		initialize: _initialize,
		getServiceUrl: _getServiceUrl,
		ajax: self.Ajax.load,
		ajaxAbort: self.Ajax.abort,
		updateScreen: self.UpdateScreen.location
	};

}(window.BEATMACHINE || {}, window, undefined));


// Initialize functionality
$(document).ready(BEATMACHINE.initialize);
