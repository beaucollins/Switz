# give it a profile url, it parses out the videos and makes posts for it

require 'open-uri'
require 'nokogiri'
require 'fileutils'
require 'yaml'

# %w{ derek_ruddy rick_mcquiston todd_grant jim_riswold glenn_rockowitz }.each do |name|

%w{ janet_champ charlotte_moore tarsha_rockowitz derek_ruddy rick_mcquiston todd_grant jim_riswold glenn_rockowitz jay_howard }.each do |name|
  url = "http://switzerlandwest.com/#{name}.html"
  puts ""
  puts "*" * 70
  puts name
  puts "*" * 70
  doc = Nokogiri::HTML::Document.parse open(url)
  FileUtils.mkdir name unless File.directory?(name)
  Dir.chdir(File.expand_path(name))
  doc.css('div.work_preview.print').each do |work|
    FileUtils.mkdir 'converted' unless File.directory?('converted')
    main = work.search('a:first-child')
    thumb = main.first.search('img')[0]['src']
    thumb = "/#{thumb}" unless thumb[0] == '/'
    thumb_file = File.basename(thumb)
    thumb_ext = File.extname(thumb)
    thumb_base = File.basename(thumb, thumb_ext)
    `wget http://switzerlandwest.com#{thumb}` unless File.exists?('converted/' +thumb_file)
    `convert #{thumb_file} -resize 74x60^ -gravity center -extent 74x60  converted/#{thumb_file}`
    
    title = main.first['title']
    images = work.search('a')
    parts = title.split("/").collect(&:strip)
    post = "/Users/bcollins/Sites/switzerlandwest/_posts/2011-02-02-#{title.gsub(/[^a-zA-Z]+/,'-')}.markdown"
    work = []
    images.each do |a|
      img = a['href']
      file = File.basename(img)
      ext = File.extname(file)
      base = File.basename(file, ext)
      puts file
      work << ('http://assets.switzerlandwest.com/images/' + name + '/' + file)
      `wget http://switzerlandwest.com#{img}` if !File.exists?('converted/'+file)
      `identify #{file}`
      `convert #{file} -background '#000000' -resize 640x480 -gravity center -extent 640x480   converted/#{file}`
    end
    frontmatter = {
      'layout' => 'print',
      'title' => parts.first.capitalize,
      'client' => parts[1].capitalize,
      'author' => name.split("_").collect(&:capitalize).join(" "),
      'thumb' => "http://assets.switzerlandwest.com/images/#{name}/#{thumb_file}"
    }
    frontmatter.merge! 'images' => work if work && !work.empty?
    File.open(post, 'w') do |f|
      f.puts YAML.dump(frontmatter)
      f.puts "---"
    end
    
  end
  Dir.chdir(File.join(Dir.pwd, '../'))
  
end

