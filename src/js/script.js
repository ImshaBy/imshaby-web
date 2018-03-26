(function($) {
	
	"use strict";

	//Hide Loading Box (Preloader)
	function handlePreloader() {
	    var preloader = '.preloader';

		if($(preloader).length){
			$(preloader).delay(500).fadeOut(500);
		}
	}
	
	
	//Update Header Style + Scroll Top
	function headerStyle() {
		var mainHeaderSelector = '.main-header',
			scrollToTopSelector = '.scroll-to-top',
            fixedTopHeaderclassNames = 'fixed-top-header';

		if($(mainHeaderSelector).length){
			var windowpos = $(window).scrollTop();
			if (windowpos >= 1) {
				$(mainHeaderSelector).addClass(fixedTopHeaderclassNames);
				$(scrollToTopSelector).fadeIn(300);
			} else {
				$(mainHeaderSelector).removeClass(fixedTopHeaderclassNames);
				$(scrollToTopSelector).fadeOut(300);
			}
		}
	}

	
	//Submenu Dropdown Toggle
	if($('.main-header li.dropdown .submenu').length){
		$('.main-header li.dropdown').append('<div class="dropdown-btn"></div>');
		
		//Dropdown Button
		$('.main-header li.dropdown .dropdown-btn').on('click', function() {
			$(this).prev('.submenu').slideToggle(500);
		});
	}
	
	
	var tabBtnSelector = '.schedule-box .tab-btn',
		tabSelector = '.schedule-box .tab',
		body = 'html body',
		scrollToTop = '.scroll-to-top',
		classNames = {
			active: 'active',
			current: 'current',
			activeBox: 'active-box'
		};
	
	//Schedule Box Tabs
	if($('.schedule-box').length){
		
		//Tabs
		$(tabBtnSelector).on('click', function() {
			var target = $($(this).attr('data-id')),
				windowWidth = $(window).width();

			$(tabBtnSelector).removeClass(classNames.active);
			$(this).addClass(classNames.active);
			$(tabSelector).fadeOut(0);
			$(tabSelector).removeClass(classNames.current);
			$(target).fadeIn(300);
			$(target).addClass(classNames.current);

			if (windowWidth <= 700) {
				$(body).animate({
				   scrollTop: $('.tabs-box').offset().top
				 }, 1000);
			}
		});
		
	}

	
	// Scroll to top
	if($(scrollToTop).length){
		$(scrollToTop).on('click', function() {

		   $(body).animate({
			   scrollTop: $(body).offset().top
			 }, 1000);
	
		});
	}

	// Elements Animation
	if($('.wow').length){
		var wow = new WOW(
		  {
			boxClass:     'wow',      // animated element css class (default is wow)
			animateClass: 'animated', // animation css class (default is animated)
			offset:       0,          // distance to the element when triggering the animation (default is 0)
			mobile:       true,       // trigger animations on mobile devices (default is true)
			live:         true       // act on asynchronously loaded content (default is true)
		  }
		);
		wow.init();
	}

/* ==========================================================================
   When document is ready, do
   ========================================================================== */
   
	$(document).on('ready', function() {
		headerStyle();
	});

/* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */
	
	$(window).on('scroll', function() {
		headerStyle();
	});
	
/* ==========================================================================
   When document is loading, do
   ========================================================================== */
	
	$(window).on('load', function() {
	    var parishListCarousel = ".parish-list-carousel";

		handlePreloader();

        $(parishListCarousel).mCustomScrollbar({
            axis: "x",
            theme: "dark"
        });
	});
	

})(window.jQuery);