class BentoSearch::DigitalCollectionsEngine

  include BentoSearch::SearchEngine

  # Next, at a minimum, you need to implement a #search_implementation method,
  # which takes a normalized hash of search instructions as input (see documentation
  # at #normalized_search_arguments), and returns BentoSearch::Results item.
  #
  # The Results object should have #total_items set with total hitcount, and contain
  # BentoSearch::ResultItem objects for each hit in the current page. See individual class
  # documentation for more info.
  def search_implementation(args)

    # 'args' should be a normalized search arguments hash including the following elements:
    # :query, :per_page, :start, :page, :search_field, :sort
    Rails.logger.debug("mjc12test: BlacklightEngine search called. Query is #{args[:query]}}")
    bento_results = BentoSearch::Results.new

    # Format is passed to the engine using the configuration set up in the bento_search initializer
    # If not specified, we can maybe default to books for now.
    format = configuration[:blacklight_format] || 'Digital Collections'
    #q = URI::encode(args[:oq].gsub(" ","+"))
    #uri = "https://digital.library.cornell.edu/catalog.json?utf8=%E2%9C%93&q=#{q}&search_field=all_fields&rows=3"
    
    uri = search_request_uri(args)
    Rails.logger.info("URI is #{uri}")
    url = Addressable::URI.parse(uri)
    url.normalize

    portal_response = JSON.load(open(url.to_s))

    Rails.logger.debug "mjc12test: #{portal_response}"
    results = portal_response['response']['docs']

    results.each do |i|
      item = BentoSearch::ResultItem.new
      item.title = i['title_tesim'][0].to_s
      [i['creator_facet_tesim']].each do |a|
        item.authors << a
      end
      if i['collection_tesim'].present? && i['solr_loader_tesim'].present? && i['solr_loader_tesim'][0] == "eCommons"
      item.abstract = i['collection_tesim'][0].to_s + " Collection in eCommons"
      elsif i['collection_tesim'].present?
        item.abstract = i['collection_tesim'][0].to_s
      elsif i['description_tesim'].present?
        item.abstract = i['description_tesim'][0].to_s
      end
      if i['media_URL_size_0_tesim'].present?
        item.format_str = i['media_URL_size_0_tesim'][0].to_s
      #Adding AWS thumbnail - note this would affect all the places we see this information
      elsif i['awsthumbnail_tesim'].present? && i['awsthumbnail_tesim'].length > 0
      	item.format_str = i['awsthumbnail_tesim'][0].to_s
      end
      
      if i['date_tesim'].present?
        item.publication_date = i['date_tesim'][0].to_s
      end
      if i['solr_loader_tesim'].present? && i['solr_loader_tesim'][0] == "eCommons"
        item.link =i['handle_tesim'][0]
      else
      item.link = "http://digital.library.cornell.edu/catalog/#{i['id']}"
      # Adding image information
      
      #if i['media_URL_size_0_tesim'].present? && i['media_URL_size_0_tesim'].length > 0
      #	blink = BentoSearch::Link.new
      #	blink.label = "image"
      #	blink.url = i['media_URL_size_0_tesim'][0]
      #	item.other_links << blink
      #end
      #if i['awsthumbnail_tesim'].present? && i['awsthumbnail_tesim'].length > 0
      #	blink = BentoSearch::Link.new
      #	blink.label = "image"
      #	blink.url = i['awsthumbnail_tesim'][0]
      #	item.other_links << blink
      #end
     
    end
      bento_results << item
    end
    bento_results.total_items = portal_response['response']['pages']['total_count']

    return bento_results

  end
  
  # Add method to pick default mechanism or subject facet field mechanism
  def search_request_uri(args)
  	search_field = args[:search_field] || ""
  	if(search_field == "subject")
  		return field_search(args)
  	else
  		return keyword_search(args)
  	end
  	
  
  end
  
  def field_search(args)
  	dcFacetName =  "subject_tesim"
  	search_field = args[:search_field]
  	per_page = args[:per_page] || 3
  	Rails.logger.info("args #{args}")
    uri = "https://digital.library.cornell.edu/?f[" + dcFacetName + "][]=" + args[:oq] + "&rows=" + per_page.to_s + "&format=json";
  	return uri
  end
  
  def keyword_search(args)
 	q = URI::encode(args[:oq].gsub(" ","+"))
	uri = "https://digital.library.cornell.edu/catalog.json?utf8=%E2%9C%93&q=#{q}&search_field=all_fields&rows=3"
	return uri
  end


end
