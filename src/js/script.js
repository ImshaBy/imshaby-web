(function($) {

  "use strict";

  //Hide Loading Box (Preloader)
  function handlePreloader() {
    var preloader = $('.preloader');
    if(preloader.length){
      preloader.delay(500).fadeOut(500);
    }
  }

  function toggleScheduleTabs() {
    if($('.schedule-box').length){

      $('.schedule-box .tab-btn').on('click', function() {
        var target = $($(this).attr('data-id'));
        $('.schedule-box .tab-btn').removeClass('active');
        $(this).addClass('active');
        $('.schedule-box .tab').fadeOut(0);
        $('.schedule-box .tab').removeClass('current');
        $(target).fadeIn(300);
        $(target).addClass('current');
        var windowWidth = $(window).width();
        if (windowWidth <= 700) {
          $('html, body').animate({
            scrollTop: $('.tabs-box').offset().top
          }, 1000);
        }
      });
    }
  }

  // Scroll to top

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
    toggleScheduleTabs();
  });

  /* ==========================================================================
     When document is loading, do
     ========================================================================== */

  $(window).on('load', function() {
    handlePreloader();
  });


})(window.jQuery);
