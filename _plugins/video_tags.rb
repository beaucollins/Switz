module VideoTags
  
  def linebreak_name(input)
    # find the space(s) and conver to <br>
    input.sub(/[\s]+/, "<br>")
  end
  
end

Liquid::Template.register_filter(VideoTags)