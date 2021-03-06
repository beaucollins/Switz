module VideoTags
  
  def linebreak_name(input)
    # find the space(s) and convert to <br>
    input.sub(/[\s]+/, "<br>")
  end
  
  def video_url(page)
    if source = page['video_source']
      extension = File.extname(source)
      basename = File.basename(source, extension)
      "http://switzerlandllc.com/assets/videos/#{basename}/#{basename}.mp4"
    end
  end
  
  def video_url_webm(page)
    if source = page['video_source']
      extension = File.extname(source)
      basename = File.basename(source, extension)
      "http://switzerlandllc.com/assets/videos/#{basename}/#{basename}.webm"
    end
  end
  
  def video_media_path(page)
    if source = page['video_source']
      extension = File.extname(source)
      basename = File.basename(source, extension)
      "http://switzerlandllc.com/assets/videos/#{basename}/"
    end
  end
  
  def video_thumbnail_image_url(page)
    if source = page['video_source']
      extension = File.extname(source)
      basename = File.basename(source, extension)
      "http://switzerlandllc.com/assets/videos/#{basename}/thumb.jpg"
    end
  end
  
  def video_poster_image_url(page)
    if source = page['video_source']
      extension = File.extname(source)
      basename = File.basename(source, extension)
      "http://switzerlandllc.com/assets/videos/#{basename}/poster.jpg"
    end
  end
  
  def video_thumbnail_url(page)
    if source = page['video_source']
      extension = File.extname(source)
      basename = File.basename(source, extension)
      "http://switzerlandllc.com/assets/videos/#{basename}/#{basename}_thumb.mp4"
    end
  end

  def video_home_url(page)
    if source = page['video_source']
      extension = File.extname(source)
      basename = File.basename(source, extension)
      "http://switzerlandllc.com/assets/videos/#{basename}/#{basename}_small.mp4"
    end
  end
  
  def comma_break(string)
    string.gsub(/,[\s]+/,"<br/>")
    
  end
  
  def with_title(string)
    credit = string.split(',').collect(&:strip)
    "<em>#{credit[1]}</em> #{credit[0]}"
  end
  
  
  
end

Liquid::Template.register_filter(VideoTags)