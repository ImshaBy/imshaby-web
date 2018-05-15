(function($) {

  "use strict";

  var selectors = {
    preloader: '.preloader',
    mainHeader: '.main-header',
    scrollToTop: '.scroll-to-top'
  };

  //Hide Loading Box (Preloader)
  function handlePreloader() {
    if($(selectors.preloader).length){
      $(selectors.preloader).delay(500).fadeOut(500);
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

  function toggleTabs() {

    //Schedule Box Tabs
    if($('.schedule-box').length){

      //Tabs
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



  //Countdown Timer
  if($('#countdown-timer').length){
    $('#countdown-timer').countdown('2016/10/13', function(event) {
      var $this = $(this).html(event.strftime('' + '<div class="counter-column"><span class="count">%D</span><span class="colon">:</span><br>DAYS</div> ' + '<div class="counter-column"><span class="count">%H</span><span class="colon">:</span><br>HOURS</div>  ' + '<div class="counter-column"><span class="count">%M</span><span class="colon">:</span><br>MINUTES</div>  ' + '<div class="counter-column"><span class="count">%S</span><br>SECOND</div>'));
    });
  }

  // Scroll to top

  function handleScrollToTopBtn () {
    if($('.scroll-to-top').length){
      $(".scroll-to-top").on('click', function() {
        // animate
        $('html, body').animate({
          scrollTop: $('html, body').offset().top
        }, 1000);

      });
    }
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
    handleScrollToTopBtn();
    toggleTabs();
  });

  /* ==========================================================================
     When document is loading, do
     ========================================================================== */

  $(window).on('load', function() {
    handlePreloader();

    $(".carousel").mCustomScrollbar({
      axis: "x",
      theme: "dark"
    });
  });


})(window.jQuery);
