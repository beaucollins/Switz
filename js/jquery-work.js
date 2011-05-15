(function($){
  
  var overlay;
  var viewer;
  var lightbox;
  var mode = 'off';
  var current;
  var mask;
  var menu;
  var profile;
  var next_page_link;
  var prev_page_link;
  
  var work_page = function(thumb){
    var work = thumb.parent();
    return Math.floor(work.position().top/mask.height());
  }
  
  var current_page = function(){
    return -menu.position().top/mask.height();
  }
  
  var total_pages = function(){
    var t = Math.ceil($('.work_preview').filter(':not(.off)').length / 8);
    return t;
  }
  
  var minned = function(n, min){
    min = !min ? 0 : min;
    return n < 0 ? 0 : n;
  }
  
  
  var filetype = function(str){
    if(str == undefined) return 'other';
    if(/\.(jpeg|jpg)$/i.test(str)){
      type = 'image';
    }else if(/\.(flv|f4v|mp4|m4v)$/i.test(str)){
      type = 'video';
    }else{
      type = 'other';
    }
    return type;
  }
  
  //set up the overlay  
  $.fn.configurePages = function(){
    if(total_pages() > 1){
      next_page_link.click(function(e){
        e.preventDefault();
        menu.showWorkPage(current_page() + 1);
      });
      prev_page_link.click(function(e){
        e.preventDefault();
        menu.showWorkPage(current_page() - 1);
      });
      menu.bind('menu.page_changed', function(e, p){
        if(p == 0){
          prev_page_link.fadeOut('fast');
        }else{
          prev_page_link.fadeIn('tast');
        }
        if(p == total_pages()-1){
          next_page_link.fadeOut('fast');
        }else{
          next_page_link.fadeIn('fast');
        }
      }).trigger('menu.page_changed',[0]);
    }else{
      next_page_link.fadeOut('fast');
      prev_page_link.fadeOut('fast');
    }
  }
  
  
  
  $.fn.hasNext = function(){
    return this.parent().nextAll(':not(.off)').filter(':first').find('a').length > 0;
  }
  
  $.fn.hasPrev = function(){
    return this.parent().prevAll(':not(.off)').filter(':first').find('a').length > 0;
  }
  
  $.fn.nextWork = function(){
    var $next = this.parent().nextAll(':not(.off)').filter(':first').find('a').eq(0);
    if($next.length > 0) $next.showWork();
  }
  
  $.fn.previousWork = function(){
    var $prev = this.parent().prevAll(':not(.off)').filter(':first').find('a').eq(0);
    if($prev.length > 0) $prev.showWork();
  }
  
  var is_visible = function(thumb){
    var work = thumb.parent();
    if(work.position().top >= mask.height() - menu.position().top || work.position().top < -menu.position().top){
      return false;
    }else{
      return true;
    }
  }
  
  $.fn.workPager = function(container){
    if(!container) container = '.profile';

    profile = $(container).eq(0);
    menu = $('.work_samples').eq(0);
    mask = $('<div id="work_sample_mask"></div>').css({
      'height' : '140px',
      'overflow' : 'hidden'
    });
    menu.css({
      'height' : 'auto',
      'overflow' : 'visible',
      'position' : 'relative'
    }).wrap(mask);
    
    mask = $("#work_sample_mask");
      
    prev_page_link = $('<a id="work_page_prev_link" href="#"><span>-</span> back</a>');
    next_page_link = $('<a id="work_page_next_link" href="#">more <span>+</span></a>');
    profile.append(prev_page_link);
    profile.append(next_page_link);
    prev_page_link.hide();
    next_page_link.hide();
    profile.configurePages();
    
    
    
    var categories = new Array;
        
    this.each(function(i, e){
      var $element = $(e);
      $element.siblings().hide();
      var classes = $element.parent().attr('class').split(' ');
      $.merge(categories, $.grep(classes, function(a){ return a != 'work_preview' && $.inArray(a, categories) == -1}));
      var i;
      if(filetype($element.attr('href')) == 'image'){
        i = new Image();
        i.src = $element.attr('href');
      }
      var j;
      if(filetype($element.attr('preview')) == 'image'){
        j = new Image();
        j.src = $element.attr('preview');
      }
    });
    
    if(categories.length > 0){
      if(categories.length > 1) categories.unshift('All');
      $menu = $('<div id="work_filter"></div>)').append('<span id="filter_label">View:</span>');
      
      $.each(categories, function(index, item){
        var filter_switch = $('<a href="#">'+item.replace(/_/, ' ')+'</a>');
        $menu.append(filter_switch);
        filter_switch.click(function(e){
          e.preventDefault();
          var filter = $(this);
          if(!filter.hasClass('current')){
            $menu.find('a').removeClass('current');
            filter.addClass('current');
            $('#work_sample_mask').fadeOut('fast', function(){
              if(item == 'All'){
                $('.work_preview')
                  .show().removeClass('off');
              }else{
                $('.work_preview')
                  .hide().addClass('off')
                  .filter('.'+item).removeClass('off').show();
              }
              profile.configurePages();
              profile.showWorkPage(0);
              $(this).fadeIn('normal');
            });
          }
        });
      });
      $menu.find('a:not(:last)').after('<span>&bull;</span>');
      
      profile.append($menu);
      $menu
        .find('a:first')
        .addClass('current');
    }
    
    return this;
  }
  
  
  $.fn.showWorkPage = function(page, options){
    console.log("Animate", menu, page, total_pages()-1);
    if(page < 0 || page > total_pages() - 1) return;
    if(!options) options = {};
    options = $.extend({
      duration: 'fast'
    }, options);
    menu.trigger('menu.page_will_change', [page]);
    menu.animate({
      'top': (mask.height() * -page) + 'px'
    }, options.duration, function(){
      menu.trigger('menu.page_changed', [page])
    });
  }
  
  $.fn.slideIndex = function(){
    return $.inArray(this[0], this.parent().find('a')) + 1;
  }
  
  $.fn.slideTotal = function(){
    return this.parent().find('a').length;
  }
  
  $.fn.changeSlide = function(){
    var $this = this;
    
    $('#player_preview_image').fadeOut('fast', function(){
      
      var loading = $('<div class="loading_spinner"></div>').appendTo(viewer).css({opacity:0.75});
      
      var tmp_img = new Image;
      $(tmp_img).load(function(){
        loading.remove();
        var options = {
          'width' : tmp_img.width,
          'height' : tmp_img.height,
          'top' : ($(document).scrollTop() + (minned(overlay.height() - tmp_img.height) / 2)) + 'px',
          'left' : ($(document).scrollLeft() + (minned(overlay.width() - tmp_img.width) / 2)) + 'px'
        };
        viewer.animate(options, 'fast');
        $('#player_preview_image').attr('src', $this.attr('href')).fadeIn('fast');
        $('#work_player_slideshow_status').text($this.slideIndex() + ' of ' + $this.slideTotal());
      });
      tmp_img.src = $this.attr('href');
      
    });
  }
  
  $.fn.nextWorkSlide = function(){
    var $this = $(this);
    var $a = $this.next('a');
    if($a.length > 0){
      current = $a;
      current.changeSlide();
    }
  }
  
  $.fn.prevWorkSlide = function(){
    var $this = $(this);
    var $a = $this.prev('a');
    if($a.length > 0){
      current = $a;
      $a.changeSlide()
    }
  }
  
  
  
})(jQuery);


jQuery(document).ready(function(){
  if(jQuery('.profile').length > 0){
    jQuery('.profile .work_samples a:first-child').workPager();    
  }
});