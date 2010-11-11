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
  
  $('#intro_videos video').click(function(e){
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
          });
      });
    
  });
  
})