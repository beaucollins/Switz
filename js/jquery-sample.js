(function($){
  
  var body_listener;
  var focused;
  
  $.fn.samplePlayer = function(){
    this
      .mouseover(function(e){
        focused = $(this).showSample();
      })
      .click(function(e){
        $(this).showWork();
      })
    return this;
  }
  
  $.fn.videoInstance = function(){
    return $(this).parent().find('.sample_video_player').eq(0);
  }
  
  $.fn.samplePlayerGuid = function(){
    if(this.data('player_guid') == undefined){
      var listener = ChromelessPlayer.createListener();
      var $this = this;
      this.data('player_guid', listener.guid);
      listener.onMouseOut = function(state){
        $this.hideSample();
      };
      listener.onClick = function(){
        $this.hideSample();
        $.slidePlayer($this.attr('href'));
      }
    }
    return this.data('player_guid');
  }
  
  $.fn.showSample = function(){
    $('a[data-sample]').hideSample();
    var $this = this;
    var sample = this.attr('data-sample');
    var player = $this.parent().find('.sample_video_player');
    if(player.length > 0){
      player.playVideo().show();
      return this;
    }
    if(sample && sample != ''){
      var container = $('<div class="sample_video_player"></div>')
      this.parent().append(container);
      container.flash({
        src: '/images/ChromelessPlayer.swf',
        width: this.width(),
        height: this.height(),
        wmode: 'transparent',
        flashvars: {
          'video' : sample,
          'width' : this.width(),
          'height' : this.height(),
          'auto_play' : 'yes',
          'loop' : 'yes',
          'guid' : $this.samplePlayerGuid(),
          'mouse_events' : 'yes',
          'mute' : 'yes',
          'scaleMode' : 'noBorder'
        }
      });
    }
    
    //hide all other samples
    
    return this;
  }
  
  $.fn.hideSample = function(){
    this.each(function(i,e){
      $(e).videoInstance().stopVideo().hide();
    })
    return this;
  }
  $.fn.stopVideo = function(){
    var flash = this.find('embed');
    if(flash && flash[0] != undefined){
      try{
        flash[0].stop();        
      }catch(e){
        
      }
    }
    return this;
  }
  $.fn.playVideo = function(){
    var flash = this.find('embed');
    if(flash[0] && flash[0] != undefined){
      try{
        flash[0].play();        
      }catch(e){
        
      }
    }
    return this;
  }
})(jQuery)

