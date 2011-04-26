var ChromelessPlayer = (function(){
  var listener_index = 0;
  var listeners = new Object();
  return {
    createListener:function(){
      listener_index += 1;
      var listener = {
        onStateChange: false,
        onProgress: false,
        onPlayback: false,
        onMouseOut: false,
        onMouseOver: false,
        onClick: false,
        guid: listener_index
      }
      listeners[listener_index] = listener;
      return listener;
    },
    getListener:function(guid){
      return listeners[guid];
    },
    onStateChange: function(state, guid){
      if(listeners[guid] && listeners[guid]['onStateChange']){
        listeners[guid]['onStateChange'](state);
      }
    },
    onProgress: function(progress, guid){
      if(listeners[guid] && listeners[guid]['onProgress']){
        listeners[guid]['onProgress'](progress);
      }
    },
    onPlayback: function(playback, guid){
      if(listeners[guid] && listeners[guid]['onPlayback']){
        listeners[guid]['onPlayback'](playback);
      }
    },
    mouse_rollOut: function(guid){
      var listener;
      if(listener = this.getListener(guid)){
        if(listener['onMouseOut']) listener['onMouseOut']();
      }
    },
    mouse_rollOver: function(guid){
      var listener;
      if(listener = this.getListener(guid)){
        if(listener['onMouseOver']) listener['onMouseOver']();
      }
    },
    mouse_click: function(guid){
      var listener;
      if(listener = this.getListener(guid)){
        if(listener['onClick']) listener['onClick']();
      }
    }
  }
})()