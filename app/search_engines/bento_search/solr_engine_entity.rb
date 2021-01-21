class BentoSearch::SolrEngineEntity

  include BentoSearch::SearchEngine
  include DisplayHelper

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
    bento_results = BentoSearch::Results.new
    # solr search must be transformed to match simple search transformation.
    # For some reason, does not recognize SearchController? Is it because this is called only from there?
    #q = SearchController.transform_query args[:query]
    q = args[:query]
    
    search_field = args[:search_field] || ""
    if(search_field == "subject")
    	q = "subject_topic_browse:\"" + q + "\""
    	#q_search_field = "subject_topic_browse"
    end
    Rails.logger.debug(configuration.solr_url)
    solr = RSolr.connect :url => configuration.solr_url
    solr_response = solr.get 'select', :params => {
                                        :q => q,
                                        :rows => args[:per_page] || 3,
                                        :sort => 'score desc, pub_date_sort desc, title_sort asc',
                                        :fl => 'id,pub_date_display,format,fulltitle_display,fulltitle_vern_display,author_display,score,pub_info_display,availability_json',
                                        :mm => 1
                                       }

    results = solr_response['response']['docs']
    
    results.each do |i|
      item = BentoSearch::ResultItem.new
      item = generate_result(i)
      bento_results << item
    end
    bento_results.total_items = solr_response['response']['numFound']
    
    
    #This does show ability to include custom data
    #result.custom_data = solr_response['grouped']['format_main_facet']['groups']
   

    return bento_results
    
  end
  
  def generate_result(d)
     item = BentoSearch::ResultItem.new
        if d['fulltitle_vern_display'].present?
          item.title = d['fulltitle_vern_display'] + ' / ' + d['fulltitle_display']
        else
          item.title = d['fulltitle_display']
        end
        [d['author_display']].each do |a|
          next if a.nil?
          # author_display comes in as a combined name and date with a pipe-delimited display name.
          # bento_search does some slightly odd things to author strings in order to display them,
          # so the raw string coming out of *our* display value turns into nonsense by default
          # Telling to create a new Author with an explicit 'display' value seems to work.
          item.authors << BentoSearch::Author.new({:display => a})
        end
        if d['pub_info_display']
          item.publisher = d['pub_info_display'][0]
        end
        if d['pub_date_display']
          item.year = d['pub_date_display'][0].to_s
          item.year.tr!('[]','')
        end
        #item.link = "http://" + @catalog_host + "/catalog/#{d['id']}"
        item.unique_id = "#{d['id']}"
        item.link = "/catalog/#{d['id']}"
          item.custom_data = {
            'url_online_access' => access_url_single(d),
            'availability_json' => d['availability_json'],
          }

        item.format = d['format']
       return item
    end


end