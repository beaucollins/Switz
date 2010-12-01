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
      
      player = $('<div id="player_pane"><a href="#" id="player_back_button">Back</a> <div id="player_holder"></div></div>').hide();;
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
    
    // don't need this if there ain't no overflow
    if (scrollable_height() <= 0) { return };
    
    var mouse_x = 0;
    var mouse_y = 0;
    var scrollbar = $('<div id="player_scrollbar"></div>')
                        .insertAfter(sidebar)
                        .css({
                          position:'absolute',
                          top:'0',
                          right: '-15px',
                          width: '10px',
                          height: viewable_ratio() * sidebar.height(),
                          background: '#E62642',
                          borderRadius: '.5em'
                        })
                        .mousedown(function(e){
                          mouse_x = e.screenX;
                          mouse_y = e.screenY;
                          $('body').bind('mousemove', mouseFollower);
                          $('body').one('mouseup', function(e){
                            $('body').unbind('mousemove', mouseFollower);
                          })
                        });
                        
    var track = $("<div id='player_scrollbar_track'></div>")
                  .insertAfter(scrollbar)
                  .css({
                    position:'absolute',
                    top: 0,
                    right: '-10px',
                    height: sidebar.height() - 0,
                    width: '1px',
                    background: '#E62642'
                  });
    console.log(track);
                        
    var mouseFollower = function(e){
      e.preventDefault();
      var moved = e.screenY - mouse_y;
      var percent_scrolled = (scrollbar.position()['top'] + moved)/(sidebar.height() - 0 - scrollbar.height());

      var new_top = Math.round(percent_scrolled * scrollable_height());
      var t = sidebar.scrollTop();
      sidebar.scrollTop(new_top);
      if(t != sidebar.scrollTop()){
        mouse_y = e.screenY;
      }
    }
    
    sidebar.scroll(function(e){
      var r = viewable_ratio();
      var h = (sidebar.height() * r);
      scrolled = sidebar.attr('scrollTop'), scrollable_height();
      
      scrollbar.css({
        height: h-0,
        top: Math.round(scrolled * r)
      })
    });
    
    sidebar.mousewheel(function(e, delta){
      var t = sidebar.scrollTop();
      sidebar.scrollTop(sidebar.scrollTop() - (delta * 5));
      if(t != sidebar.scrollTop()){
        e.preventDefault();
      }
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
  
  $('#intro_videos video, #bio_thumbs a.thumb, a.recent_work').click(function(e){
    e.preventDefault();
    var url = '/player.html #player_content';
    player = $.setupPlayer( { parent: $('.content').parent() });
    player.find('#player_holder').load(url, function(){
      $.initializePlayer(player);
    });
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
      
    var outro = function(e){
      player.animate({
        left: '+' + contentWidth + 'px',
        opacity: 0
      },{
        duration: 300,
        specialEasing: {
          opacity: 'linear',
          left: 'easeOutCubic'
        },
        complete:function(){
          player.hide();
        }
      }); //animate
      $('.content')
        .animate({
          left: '0',
          opacity: 1,
          height: $('.content').data('original-height') + 'px'
        });
        
      $(window).unbind('beforeunload', outro);
    }
      
      player.one('back', outro);
      $(window).bind('beforeunload', outro);
    
  });
  
})