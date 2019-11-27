# -*- encoding : utf-8 -*-
class BrowseController < ApplicationController
  include Blacklight::Catalog
  include BlacklightCornell::CornellCatalog
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
#          @headingsResultString = dbclnt.get_content(base_solr + "/author/reverse?&wt=json&" + p.to_param + '&' + start.to_param  )
#          @headingsResultString = @headingsResultString
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
       params[:authq].gsub!('%20', ' ')


       @previous_four = get_surrounding_docs(params[:authq].gsub("\\"," ").gsub('"',' '),"reverse",0,8)
       @next_four = get_surrounding_docs(params[:authq].gsub("\\"," ").gsub('"',' '),"forward",0,9)

       #Rails.logger.info("jgr25_debug #{__FILE__} #{__LINE__}  = headingResponse: " + @headingsResponse.inspect )
      end
    end
    
    def call_number_setup(callnumber,facet)
      callnumber = callnumber_cleanup(callnumber)
    	tmp_array = []
    	return_hash = {}
    	alpha = callnumber[0..1]
    	if alpha =~ /\d/ 
    		alpha = callnumber[0]
    	end
    	if facet.present?
      	facet.each do |callnum|
      		if callnum.include?(":")
      			a = callnum.split(":")
      			b = a[1][0..(a[1].index("-") -1)].gsub(" ","")
      			if b == alpha
      				tmp_array << callnum
      			end
      		end
      	end
      else
        tmp_array << ""
      end
    	tmp_array.sort { |a, b| a <=> b}
    	return_hash[callnumber] = tmp_array.last
    	return return_hash
    end

    def get_surrounding_docs(callnumber,direction,start,rows)
      base_solr_url = Blacklight.connection_config[:url].gsub(/\/solr\/.*/,'/solr')
      dbclnt = HTTPClient.new
      solrResponseFull = []
      return_array = []
      if direction == "reverse"
        q =  {"q" => '[* TO "' + callnumber.gsub("\\"," ").gsub('"',' ') +'"}' }
        url = base_solr_url + "/callnum/reverse?wt=json&" + q.to_param + '&start=' + start.to_s + '&rows=' + rows.to_s
      else
        q =  {"q" => '["' + callnumber.gsub("\\"," ").gsub('"',' ') +'" TO *]' }
        url = base_solr_url + "/callnum/browse?wt=json&" + q.to_param + '&start=' + start.to_s + '&rows=' + rows.to_s
      end
      solrResultString = dbclnt.get_content( url )
      if !solrResultString.nil?
        y = solrResultString
        solrResponseFull = JSON.parse(y)
         solrResponseFull["response"]["docs"].each do |doc|          
          tmp_hash = get_document_details(doc["bibid"])
          return_array.push(tmp_hash)
        end
        #return solrResponseFull["response"]["docs"]
      else
        return_array.push("Could not find")
      end
      return return_array
    end
    
    def get_document_details(id)
      tmp_hash = {}
      response, document = search_service.fetch(id)
      tmp_hash["id"] = response["response"]["docs"][0]["id"]
      tmp_hash["title"] = response["response"]["docs"][0]["title_display"]
      tmp_hash["format"] = response["response"]["docs"][0]["format"][0]
      tmp_hash["pub_date"] = response["response"]["docs"][0]["pub_date_display"]
      tmp_hash["availability"] = response["response"]["docs"][0]["availability_json"]
      cn = call_number_setup(response["response"]["docs"][0]["callnumber_display"][0],response["response"]["docs"][0]["lc_callnum_facet"])
      tmp_hash["callnumber"] = cn.keys[0]
      tmp_hash["class_label"] = cn.values[0].present? ? cn.values[0].gsub(":"," > ") : ""
      tmp_hash["img_url"] = get_googlebooks_image(response["response"]["docs"][0]["oclc_id_display"], response["response"]["docs"][0]["isbn_t"])

      Rails.logger.info("^^^^^^^^^ TITLE: " + response["response"]["docs"][0]["title_display"])
      return tmp_hash
    end

    def previous_callnumber
      Rails.logger.info("^^^^^^^^^^^^^^^^^^^^^^ PREVIOUS CALLNUMBER")
      @previous_doc =  get_surrounding_docs(params["callnum"],"reverse",0,8)
      respond_to do |format|
        format.js
      end
    end
    
    def next_callnumber
      Rails.logger.info("^^^^^^^^^^^^^^^^^^^^^^ NEXT CALLNUMBER")
      @next_doc =  get_surrounding_docs(params["callnum"],"forward",1,8)
      respond_to do |format|
        format.js
      end
    end
    
    def callnumber_cleanup(callnumber)
      callnumber.gsub("Oversize ","").gsub("Rare Books ","").gsub("ONLINE ","").gsub("Human Sexuality ","").gsub("Ellis ","").gsub("New & Noteworthy Books ","").gsub("A.D. White Oversize ","").sub("+ ","")
    end

    def get_googlebooks_image(oclc, isbn)
      if oclc.present?
        oclc_url = "https://books.google.com/books?bibkeys=OCLC:#{oclc[0]}&jscmd=viewapi&callback=?"
        result = Net::HTTP.get(URI.parse(oclc_url))
        result = eval(result.gsub("var _GBSBookInfo = ",""))
        if result.present? && result.values[0].present? && result.values[0][:thumbnail_url].present?
          return result.values[0][:thumbnail_url]
        end
      end
      if isbn.present?
        isbn_url = "https://books.google.com/books?bibkeys=OCLC:#{isbn[0]}&jscmd=viewapi&callback=?"
        result = Net::HTTP.get(URI.parse(isbn_url))
        result = eval(result.gsub("var _GBSBookInfo = ",""))
        if result.present? && result.values[0].present? && result.values[0][:thumbnail_url].present?
          return result.values[0][:thumbnail_url]
        end
      end
      return "/assets/generic_cover.jpg"
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
      respond_to do |format|
        format.html { render layout: !request.xhr? } #renders naked html if ajax
      end
    end
end

def redirect_catalog
  if params[:browse_type]
    if params[:browse_type].include?('catalog')
      field=params[:browse_type].split(':')[1]
      redirect_to "/catalog?q=#{CGI.escape params[:authq]}&search_field=#{field}"
    end
  end
end
end
