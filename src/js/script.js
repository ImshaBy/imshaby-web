(function($) {

	"use strict";

	//Hide Loading Box (Preloader)
	function handlePreloader() {
	    var preloader = '.preloader';

		if($(preloader).length){
			$(preloader).delay(500).fadeOut(500);
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

	var body = 'html body',
		  scrollToTop = '.scroll-to-top';

	// Scroll to top
	if($(scrollToTop).length){
		$(scrollToTop).on('click', function() {

		   $(body).animate({
			   scrollTop: $(body).offset().top
			 }, 1000);

		});
	}

	$(window).on('load', function() {
	    var parishListCarousel = ".parish-list-carousel";

		  handlePreloader();

      $(parishListCarousel).mCustomScrollbar({
          axis: "x",
          theme: "dark"
      });

  });
})(window.jQuery);
