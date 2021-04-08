# -*- encoding : utf-8 -*-
class BrowseController < ApplicationController
  include Blacklight::Catalog
  include BlacklightCornell::CornellCatalog
  include BlacklightCornell::VirtualBrowse
  #include BlacklightUnapi::ControllerExtension
  before_action :heading
  before_action :redirect_catalog
  #attr_accessible :authq, :start, :order, :browse_type
  @@browse_index_author = ENV['BROWSE_INDEX_AUTHOR'].nil? ? 'author' : ENV['BROWSE_INDEX_AUTHOR']
  @@browse_index_subject = ENV['BROWSE_INDEX_SUBJECT'].nil? ? 'subject' : ENV['BROWSE_INDEX_SUBJECT']
  @@browse_index_authortitle = ENV['BROWSE_INDEX_AUTHORTITLE'].nil? ? 'authortitle' : ENV['BROWSE_INDEX_AUTHORTITLE']
  @@browse_index_callnumber = ENV['BROWSE_INDEX_CALLNUMBER'].nil? ? 'callnum' : ENV['BROWSE_INDEX_CALLNUMBER']
  def heading
   @heading='Browse'
  end

  def index
      base_solr = Blacklight.connection_config[:url].gsub(/\/solr\/.*/,'/solr')
      Rails.logger.info("es287_debug #{__FILE__} #{__LINE__}  = " + "#{base_solr}")
  
    Appsignal.increment_counter('browse_index', 1)
    authq = params[:authq]
    browse_type = params[:browse_type]
    if params[:start].nil?
      params[:start] = '0'
    end
    start = params[:start]
    if !authq.nil? and authq != "" and browse_type == "Author"
      dbclnt = HTTPClient.new
      p =  {"q" => '["' + authq.gsub("\\"," ").gsub('"',' ')+'" TO *]' }
      start = {"start" => start}
      if params[:order] == "reverse"
        p =  {"q" => '[* TO "' + authq.gsub("\\"," ").gsub('"',' ')+'"}' }
#        @headingsResultString = dbclnt.get_content(base_solr + "/author/reverse?&wt=json&" + p.to_param + '&' + start.to_param  )
#        @headingsResultString = @headingsResultString
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_author + "/reverse?&wt=json&" + p.to_param + '&' + start.to_param  )
        @headingsResultString = @headingsResultString
      else
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_author + "/browse?&wt=json&" + p.to_param + '&' + start.to_param )
      end
      if !@headingsResultString.nil?
         y = @headingsResultString
         @headingsResponseFull = JSON.parse(y)
         #@headingsResponseFull = eval(@headingsResultString)
      else
         @headingsResponseFull = eval("Could not find")
      end
      @headingsResponse = @headingsResponseFull['response']['docs']
      params[:authq].gsub!('%20', ' ')
    end
  
    if !params[:authq].nil? and params[:authq] != "" and params[:browse_type] == "Subject"
      dbclnt = HTTPClient.new
      p =  {"q" => '["' + params[:authq].gsub("\\"," ").gsub('"',' ') + '" TO *]' }
      if params[:start].nil?
        params[:start] = '0'
      end
      start = {"start" => params[:start].gsub("\\"," ")}
      if params[:order] == "reverse"
        p =  {"q" => '[* TO "' + params[:authq].gsub("\\"," ").gsub('"',' ')+'"}' }
  
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_subject + "/reverse?&wt=json&" + p.to_param + '&' + start.to_param  )
        @headingsResultString = @headingsResultString
      else
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_subject + "/browse?&wt=json&" + p.to_param + '&' + start.to_param  )
      end
      if !@headingsResultString.nil?
         y = @headingsResultString
         @headingsResponseFull = JSON.parse(y)
         #@headingsResponseFull = eval(@headingsResultString)
      else
         @headingsResponseFull = eval("Could not find")
      end
      @headingsResponse = @headingsResponseFull['response']['docs']
      params[:authq].gsub!('%20', ' ')
    end
  
    if !params[:authq].nil? and params[:authq] != "" and params[:browse_type] == "Author-Title"
      dbclnt = HTTPClient.new
      #Rails.logger.info("es287_debug #{__FILE__} #{__LINE__}  = #{Blacklight.solr_config.inspect}")
      #solr = Blacklight.solr_config[:url]
      p =  {"q" => '["' + params[:authq].gsub("\\"," ").gsub('"',' ') +'" TO *]' }
      start = {"start" => params[:start]}
      #Rails.logger.info("es287_debug #{__FILE__} #{__LINE__}  = " + "#{solr}/databases?"+p.to_param)
      #@dbResultString = dbclnt.get_content("#{solr}/databases?q=" + params[:authq] + "&wt=ruby&indent=true&defType=dismax")
      if params[:order] == "reverse"
        p =  {"q" => '[* TO "' + params[:authq].gsub("\\"," ").gsub('"',' ')+'"}' }
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_authortitle + "/reverse?&wt=json&" + p.to_param + '&' + start.to_param  )
        @headingsResultString = @headingsResultString
      else
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_authortitle + "/browse?wt=json&" + p.to_param + '&' + start.to_param  )
      end
      if !@headingsResultString.nil?
         y = @headingsResultString
         @headingsResponseFull = JSON.parse(y)
         #@headingsResponseFull = eval(@headingsResultString)
      else
         @headingsResponseFull = eval("Could not find")
      end
      @headingsResponse = @headingsResponseFull['response']['docs']
      params[:authq].gsub!('%20', ' ')
    end
    if !params[:authq].nil? and params[:authq] != "" and params[:browse_type] == "Call-Number"
      # http://da-prod-solr.library.cornell.edu/solr/callnum/browse?q=%7B!tag=mq%7D%5B%22HD8011%22%20TO%20*%5D
      call_no_solr = base_solr
      start = {"start" => params[:start]}
      dbclnt = HTTPClient.new
      if params[:order] == "reverse"
        p =  {"q" => '[* TO "' + params[:authq].gsub("\\"," ").gsub('"',' ') +'"}' }
        url = call_no_solr + "/" + @@browse_index_callnumber + "/reverse?wt=json&" + p.to_param + '&' + start.to_param
      else
        p =  {"q" => '["' + params[:authq].gsub("\\"," ").gsub('"',' ') +'" TO *]' }
        url = call_no_solr + "/" + @@browse_index_callnumber + "/browse?wt=json&" + p.to_param + '&' + start.to_param
      end
      if params[:fq]
        url = url + '&fq=' + params[:fq]
      end
      @headingsResultString = dbclnt.get_content( url )
      if !@headingsResultString.nil?
        y = @headingsResultString
        @headingsResponseFull = JSON.parse(y)
      else
        @headingsResponseFull = eval("Could not find")
      end
      @headingsResponse = @headingsResponseFull
      if @headingsResponse["response"]["docs"][0]['classification_display'].present?
        @class_display = @headingsResponse["response"]["docs"][0]['classification_display'].gsub(' > ',' <i class="fa fa-caret-right class-caret"></i> ').html_safe
      end
      params[:authq].gsub!('%20', ' ')
    end
    
    if !params[:authq].nil? and params[:authq] != "" and params[:browse_type] == "virtual"
      previous_eight = get_surrounding_docs(params[:authq],"reverse",0,8)
      next_eight = get_surrounding_docs(params[:authq],"forward",0,9)
      @headingsResponse = previous_eight.reverse() + next_eight
      params[:authq].gsub!('%20', ' ')
    end 
  end

  def info
    if !params[:authq].present? || !params[:browse_type].present?
      flash.now[:error] = "Please enter a complete query."
      render "index"
    else
      base_solr = Blacklight.connection_config[:url].gsub(/\/solr\/.*/,'/solr')
      Appsignal.increment_counter('browse_info', 1)
      Rails.logger.info("es287_debug #{__FILE__} #{__LINE__}  = " + "#{base_solr}")
      if !params[:authq].nil? and params[:authq] != ""
        dbclnt = HTTPClient.new
        p =  {"q" => '"' + params[:authq].gsub("\\"," ") +'"' }
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_author + "/browse?wt=json&" + p.to_param )
        if !@headingsResultString.nil?
          y = @headingsResultString
          @headingsResponseFull = JSON.parse(y)
           #@headingsResponseFull = eval(@headingsResultString)
        else
          @headingsResponseFull = eval("Could not find")
        end
        @headingsResponse = @headingsResponseFull['response']['docs']
        params[:authq].gsub!('%20', ' ')
      end

      if !params[:authq].nil? and params[:authq] != "" and params[:browse_type] == "Subject"
        dbclnt = HTTPClient.new
        p =  {"q" => '"' + params[:authq].gsub("\\"," ") +'"' }
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_subject + "/browse?wt=json&" + p.to_param )
        if !@headingsResultString.nil?
          y = @headingsResultString
          @headingsResponseFull = JSON.parse(y)
          #@headingsResponseFull = eval(@headingsResultString)
        else
          @headingsResponseFull = eval("Could not find")
        end
        @headingsResponse = @headingsResponseFull['response']['docs']
        params[:authq].gsub!('%20', ' ')
      end
      if !params[:authq].nil? and params[:authq] != "" and params[:browse_type] == "Author-Title"
        dbclnt = HTTPClient.new
        p =  {"q" => '"' + params[:authq].gsub("\\"," ") +'"' }
        @headingsResultString = dbclnt.get_content(base_solr + "/" + @@browse_index_authortitle + "/browse?wt=json&" + p.to_param )
        if !@headingsResultString.nil?
          y = @headingsResultString
          @headingsResponseFull = JSON.parse(y)
          #@headingsResponseFull = eval(@headingsResultString)
        else
          @headingsResponseFull = eval("Could not find")
        end
        @headingsResponse = @headingsResponseFull['response']['docs']
        params[:authq].gsub!('%20', ' ')
      end
      if !params[:authq].nil? and params[:authq] != "" and (params[:info_type].present? and params[:info_type] == "dashboard")
        heading = @headingsResponse[0]["heading"].gsub(/\.$/, '')
        search_url = "https://id.loc.gov/authorities/names/suggest/?q=" + heading + "&rdftype=PersonalName&count=1"
        url = URI.parse(URI.escape(search_url))
        resp = Net::HTTP.get_response(url)
        data = resp.body
        result = JSON.parse(data)
        @loc_localname = !result[3][0].blank? ? result[3][0].split("/").last.inspect : ""

        @formats = get_formats
      end
      respond_to do |format|
        format.html { render layout: !request.xhr? } #renders naked html if ajax
      end
    end
  end
  
  def get_formats
    query = transform_query(params[:authq])
    solr = RSolr.connect :url => ENV["SOLR_URL"]
    solr_response = solr.get 'select', :params => {
                                       :q => query,
                                       :rows => 0, # from sample single query; should set this dynamically?
                                       :group => true,
                                         'group.field' => 'format_main_facet',
                                         'group.limit' => 0,
                                         'group.ngroups' => 'true',
                                        :sort => 'score desc, pub_date_sort desc, title_sort asc',
                                        :fl => 'id,pub_date_display,format,fulltitle_display,fulltitle_vern_display,author_display,score,pub_info_display,availability_json',
                                        :mm => 1
                                      }

    Rails.logger.debug("mjc12test: BlacklightEngine2 search called. #{__FILE__} #{__LINE__} solr_response #{solr_response}")
    formats = solr_response['facet_counts']['facet_fields']['format']

    uri = "https://digital.library.cornell.edu/catalog.json?utf8=%E2%9C%93&q=#{params[:authq]}&search_field=all_fields&rows=3"
    url = Addressable::URI.parse(URI.escape(uri))
    url.normalize
    portal_response = JSON.load(open(url.to_s))
    if portal_response['response']['pages']['total_count'] > 0
      formats << "Digital Collections"
      formats << portal_response['response']['pages']['total_count']
    end
    f_count = 0
    tmp_array = []
    formats.each do |f|
      if f.class == String
        tmp_string = pluralize_format(f) + " (" + formats[f_count + 1].to_s + ")"
        tmp_array << tmp_string
      end
      f_count = f_count + 1
    end
    
    return tmp_array.sort
  end

  def redirect_catalog
    if params[:browse_type]
      if params[:browse_type].include?('catalog')
        field=params[:browse_type].split(':')[1]
        redirect_to "/catalog?q=#{CGI.escape params[:authq]}&search_field=#{field}"
      end
    end
  end

  def transform_query search_query
      # Don't do anything for already-quoted queries or single-term queries
      if search_query !~ /[\"\'].*?[\"\']/ and
          search_query !~ /AND|OR|NOT/
          #search_query =~ /\w.+?\s\w.+?/
        # create modified query: (+x +y +z) OR "x y z"
        new_query = search_query.split.map {|w| "+\"#{w}\""}.join(' ')
        Rails.logger.info("BENTO = #{new_query}")
        # (have to use double quotes; single returns an incorrect result set from Solr!)
        search_query =  "(#{new_query}) OR phrase:\"#{search_query}\""
      else
        if search_query.first == "'" and search_query.last == "'"
          search_query = search_query.gsub("'","")
          search_query = "(#{search_query}) OR phrase:\"#{search_query}\""
        end
        search_query
      end
  end

  def pluralize_format(format)
    case format
    when "Book"
      format = "Books"
    when "Journal/Periodical"
      format = "Journals/Periodicals"
    when "Manuscript/Archive"
      format = "Manuscripts/Archives"
    when "Map"
      format = "Maps"
    when "Musical Score"
      format = "Musical Scores"
    when "Non-musical Recording"
      format = "Non-musical Recordings"
    when "Video"
      format = "Videos"
    when "Computer File"
      format = "Computer Files"
    when "Database"
      format = "Databases"
    when "Musical Recording"
      format = "Musical Recordings"
    when "Thesis"
      format = "Theses"
    when "Microform"
      format = "Microforms"
    end
    return format
  end
end
