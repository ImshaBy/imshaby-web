(function($) {
  "use strict";

  /**
   * Hide loading box
   */
  function handlePreloader() {
    var preloader = $('.preloader');

    if(preloader.length){
      preloader.delay(500).fadeOut(500);
    }
  }

  /**
   * Handle click on scroll to top button
   */
  function handleScrollToTopBtn () {
    var scrollToTop = $('.scroll-to-top'),
        body = $('html, body');

    if(scrollToTop.length){
      scrollToTop.on('click', function() {

        body.animate({
          scrollTop: body.offset().top
        }, 1000);
      });
    }
  }

  /* ==========================================================================
     When document is ready, do
     ========================================================================== */

  $(document).on('ready', function() {
    handleScrollToTopBtn();
  });

  /* ==========================================================================
     When document is loading, do
     ========================================================================== */

  $(window).on('load', function() {
    handlePreloader();
  });

})(window.jQuery);
