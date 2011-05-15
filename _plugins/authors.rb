module Jekyll
  
  class AuthorGenerator < Generator
    safe true
    
    attr_reader :site
    
    def generate(site)
      @site = site
      site.config['authors'] ||= {}
      authors = read_authors(site.config['authors']['directory'] || '_authors')
      
      site.authors = authors
      authors = authors.inject({}) do |index, author|
        index.merge(author.author_id => author)
      end
      
      # now that we have author pages we need to cross reference posts with authors
      site.posts.each do |post|
        $stderr.puts "#{post.id} not published: yes " and next unless post.published
        if post_authors = post.data['author']
          post_authors = [post_authors] unless post_authors.kind_of?(Array)
          post.data['author'] = post_authors.inject([]) do |author_data, author|
            author_id = author.downcase.strip.gsub(/[\s]+/,'-')
            if authors.key? author_id
              authors[author_id].posts << post
              author_data << authors[author_id] 
            end
            author_data
          end
        end
        
        
      end
      
    end
    
    def read_authors(bio_dir, base_dir='')
      base = File.join(site.source, base_dir, bio_dir)
      return unless File.exists?(base)
      entries = site.filter_entries(Dir.entries(base))
      
      entries.collect do |f|
        author_page = AuthorPage.new(self.site, site.source, bio_dir, f)
        site.pages << author_page
        
        author_page
        
      end
      
    end
    
  end
  
  class AuthorPage < Page
    
    attr_accessor :posts
    
    def initialize(*args)
      @posts = []
      super(*args)
      
      self.data['title'] = self.data['name'] unless self.data.key? 'title'
      
    end
    
    def author_name
      self.data && self.data['name']
    end
    
    def author_id
      @author_id ||= self.author_name.downcase.strip.gsub(/[\s]+/,'-')
    end
    
    def permalink
      return super if super
      '/' + (site.config['authors']['prefix'] || 'authors') + '/' + author_id + self.output_ext
    end
    
    def destination(dest)
      path = File.join(dest, CGI.unescape(self.url))
      path = File.join(path, "index.html") if self.url =~ /\/$/
      path
    end
    
    def to_liquid
      self.data.deep_merge({
        "author_id"  => self.author_id,
        "url"        => self.url,
        "posts"      => self.posts,
        "content"    => self.content })
    end
    
    def render(*args)
      super(*args)
    end
        
    
  end
  
  class Site
    alias_method :site_payload_without_authors, :site_payload
    
    attr_accessor :authors
    
    def site_payload
      payload = site_payload_without_authors
      payload['site']['authors'] = self.authors
      payload
    end
    
  end
  
  
end