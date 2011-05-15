require 'tempfile'
require 'find'

module Jekyll
      
  class Post
    
    include Process
    
    def render_with_video(*args)
      process_video(self.data['video_source']) if self.data['video_source']
      render_without_video(*args)
    end
    alias_method :render_without_video, :render
    alias_method :render, :render_with_video    
    
    def process_video(video)
      
      input = File.expand_path(File.join('_video_source', video))
      Find.find(File.expand_path('_video_source')) do |path|
        input = path if File.basename(path) == video
      end
      basename = File.basename(input, File.extname(input))
      output_directory = File.expand_path(File.join('_video_processed', basename))
      if File.exists?(input) && !File.directory?(output_directory)
        puts "Processing a video #{video}"
        thumb_directory = File.join(output_directory, 'thumbs')
        poster_directory = File.join(output_directory, 'posters')
        [output_directory, poster_directory, thumb_directory].each { |d| puts("Mkdir #{d}"); FileUtils.mkdir_p(d) }
        
        # 1) Home page
        output = StringIO.new
        file = Tempfile.new('info')
        info  = spawn "ffmpeg -i '#{input}'", :err => file.path
        wait
        
        match = nil
        file.each_line do |line|
          puts line
          break if match = line.match(/video:.*?([\d]{1,}x[\d]{1,})/i)
        end
        
        size = match[1]
        
        file.close
        
        puts "*" * 70
        puts info
        puts "*" * 70
        
        scale = ScaleOptions.new(size)
        puts "Make homepage video"
        spawn("ffmpeg -y -loglevel quiet -i '#{input}' -vcodec libx264 -b 500k #{scale.fit_options('140x106', :width)} -crf 22 -vpre slow -acodec libfaac -ab 96k -t 00:00:11 -ss 00:00:03 -threads 0 '#{File.join(output_directory,"#{basename}_small.mp4")}'", :out => "/dev/null", :err => '/dev/null')
        wait
        puts "done: #{$?}"
        
        puts "Make thumbnail video"
        spawn("ffmpeg -y -loglevel quiet -i '#{input}' -vcodec libx264 -b 500k #{scale.fit_options('74x60', :width)} -crf 22 -vpre slow -acodec libfaac -ab 96k -t 00:00:11 -ss 00:00:03 -threads 0 '#{File.join(output_directory,"#{basename}_thumb.mp4")}'", :out => "/dev/null", :err => '/dev/null')
        wait
        puts "done: #{$?}"
        
        # 4) Thumbs for profile
        puts "Make poster images"
        spawn "ffmpeg -y -loglevel quiet -i '#{input}' -r 2 #{scale.fit_options('640x480', :width)} -f image2 -vcodec mjpeg #{File.join(poster_directory,'poster%d.jpg')}", :out => "/dev/null", :err => "/dev/null"
        wait
        puts "done: #{$?}"

        puts "Make thumbnail images"
        spawn "ffmpeg -y -loglevel quiet -i '#{input}' -r 2 #{scale.fit_options('74x60', :width)} -f image2 -vcodec mjpeg #{File.join(thumb_directory,'thumb%d.jpg')}", :out => "/dev/null", :err => '/dev/null'
        wait
        puts "done: #{$?}"
        
        if File.extname(input) != 'mp4'
          puts "Make full size"
          spawn("ffmpeg -y -loglevel quiet -i '#{input}' -vcodec libx264 -b 500k #{scale.fit_options('640x480', :none)} -crf 22 -vpre slow -acodec libfaac -ab 96k -threads 0 '#{File.join(output_directory,"#{basename}.mp4")}'", :out => "/dev/null", :err => '/dev/null')
          wait
        else
          puts "Extname: #{File.extname(input)}"
          puts "Copy the video over"
          FileUtils.cp input, File.join(output_directory,"#{basename}.mp4")
        end

      else
        puts "Not processing #{input}"
      end
      
    end
    
  end
  
  class ScaleOptions
    
    attr_reader :width, :height
    
    def initialize(size)
      @width, @height = size.split('x').collect { |d| d.to_f }
    end
    
    def dimensions
      "#{width}x#{height}"
    end
    
    # mode
    # :none : don't crop or pad
    # :box : don't crop anything and add black letterboxing
    # :fill : fill the canvas with image and crop anything left over
    # :width : fit the full width and crop/pad height
    # :height : fit the full height and crop/pad width
    def fit_options(size, mode=:box)
      w, h = size.split('x').collect { |d| d.to_f }
      scale_base = (mode == :width || (mode == :box && width > height ) || (mode == :fill && width < height)) ? 'w' : 'h'
      # if we're alread too small don't do anything
      return '' if (scale_base == 'w' && width < w ) || (scale_base == 'h' && height < h)
      ratio = scale_base == 'w' ? w/width : h/height
      new_w = (((scale_base == 'w' ? w : ratio * width)/2).floor)*2
      new_h = (((scale_base == 'h' ? h : ratio * height)/2).ceil)*2
      
      new_w = w if scale_base == 'h' && w - new_w < 10
      new_h = h if scale_base == 'w' && h - new_h < 10
      
      
      options = "-s #{new_w.to_i}x#{new_h.to_i}"
      
      unless mode == :none
        if scale_base == 'w'
          # height may need some padding
          if new_h < h
            padtop = ((h-new_h)/4).floor * 2
            padbottom = ((h-new_h)/4).ceil * 2
            options << " -padtop #{padtop} -padbottom #{padbottom}"
          else
            # crop it
          end
        else
        end
      end
      puts "Sizing options: #{options}"
      options
      
    end
    
  end
  
end