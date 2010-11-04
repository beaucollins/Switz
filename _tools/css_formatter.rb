path = File.expand_path('../css/switzerland.css')
processed = []
File.open(File.expand_path(path), 'r') do |f|
  File.open(File.dirname(path) << '/processed.css', 'w') do |p|
    f.each do |line|
      if matches = line.match(/([^{]+)(\{[^}]+\})/)
        selector = matches[1].strip
        rules = matches[2]
        tabbed = selector + (" " * (40-selector.length)) + rules      
        p.puts tabbed
      else
        p.puts line
      end
    end
  end
end