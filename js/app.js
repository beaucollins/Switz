$.fn.storeHeight = function(){
  return this.each(function(){
    var $this = $(this);
    if(!$this.data('original-height')){
      $this.data( 'original-height', $this.height() );
      $this.css( { 'height' : $this.height() + 'px' } );
    }
  })
};


(function(){
  
  var player = null;
  
  $.setupPlayer = function(options){
    options = $.extend( {parent:$(document)}, options );
    var back_button
    if(!player){
      
      player = $('<div id="player_pane"><a href="#" id="player_back_button">Back</a><div id="media_pane"><video src="/video/sample_large.mp4" controls /></div></div>').hide();;
      options.parent.append(player);
      back_button = player.find('#player_back_button');
      back_button.click(function(e){
        e.preventDefault();
        player.trigger('back');
      });
    }
    
    return player;

  }
  
  $.initializePlayer = function(player){
    
    // setup the scrollbar if necessary
    var sidebar = player.find('#player_sidebar');
    // the amount of the area that is viewable as a percentage
    var viewable_ratio = function(){
      return sidebar.height() / sidebar.attr('scrollHeight');
    }
    // the amount of pixels we can scroll, changes when images are loaded
    
    var scrollable_height = function(){
      return sidebar.attr('scrollHeight') - sidebar.height();
    }
    var scrolled = 0;
    
    var mouse_x = 0;
    var mouse_y = 0;
    
    var scrollbar = $('<div id="player_scrollbar"></div>')
                        .insertAfter(sidebar)
                        .css({
                          position:'absolute',
                          top:'5px',
                          right: '5px',
                          width: '5px',
                          height: viewable_ratio() * sidebar.height(),
                          background: '#FFF',
                          opacity: 0.6,
                          borderRadius: '2px'
                        })
                        .mousedown(function(e){
                          mouse_x = e.screenX;
                          mouse_y = e.screenY;
                          $('body').bind('mousemove', mouseFollower);
                          $('body').one('mouseup', function(e){
                            $('body').unbind('mousemove', mouseFollower);
                          })
                        });
                        
    var mouseFollower = function(e){
      e.preventDefault();
      var moved = e.screenY - mouse_y;
      var new_top = (scrollbar.position()['top'] + moved - 5)/viewable_ratio();
      var t = sidebar.scrollTop();
      sidebar.scrollTop(new_top);
      if(t != sidebar.scrollTop()){
        mouse_y = e.screenY;
      }
    }
    
    sidebar.scroll(function(e){
      var r = viewable_ratio();
      var h = (sidebar.height() - 10) * r;
      scrolled = sidebar.attr('scrollTop'), scrollable_height();
      
      scrollbar.css({
        height: h,
        top: (scrolled * r) + 5
      })
    });
    
    sidebar.mousewheel(function(e, delta){
      e.preventDefault();
      sidebar.scrollTop(sidebar.scrollTop() - (delta * 2));
    });
    
    
  }
  
})();


$(document).ready(function(){
  
  $('#creative_navigation a, .creative_link')
    .mouseover(function(e){
      var $this = $(this);
      var $img = $this.find('img');
      if (!$this.data('original')) {
        $this.data('original', $img.attr('src'));
      };
      var original = $this.data('original');
      $img.attr('src', original.replace(/([\w]+).jpg/, '$1_over.jpg'))
    })
    .mouseout(function(){
      var $this = $(this);
      var $img = $this.find('img');
      $img.attr('src', $this.data('original'));
    });
  
  $('#intro_videos video, #bio_thumbs a.thumb').click(function(e){
    player = $.setupPlayer( { parent: $('.content').parent() });
    var contentWidth = $('.content').width();
    $('.content')
      .storeHeight()
      .animate({
        left: "-" + contentWidth + 'px',
        opacity: '0',
        height: '550px'
      }, {
        duration: 300,
        specialEasing: {
          opacity: 'linear',
          left: 'easeOutCubic'
        }
      });
    player
      .css({
        opacity: 0,
        left: '+' + contentWidth + 'px',
        height: '550px'
      })
      .show()
      .animate({
        left: 0,
        opacity: 1.0,
      }, {
        duration: 300,
        specialEasing: {
          opacity: 'linear',
          left: 'easeOutCubic'
        }
      });
      
      player.one('back', function(){
        player.animate({
          left: '+' + contentWidth + 'px',
          opacity: 0
        },{
          duration: 300,
          specialEasing: {
            opacity: 'linear',
            left: 'easeOutCubic'
        }}); //animate
        $('.content')
          .animate({
            left: '0',
            opacity: 1,
            height: $('.content').data('original-height') + 'px'
          }, function(){
            $('.content').css({height:'auto'});
          });
      });
    
  });
  
})