class ProxyController < ApplicationController
  require 'net/http'

  def search
    require "net/http"
    # Query parameter
    query = params[:q]
    digital_collections_url = "https://digital.library.cornell.edu/?q=" + query + "&search_field=all_fields&format=json";
    url = URI.parse(digital_collections_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    render :json => result
  end
  
  def facet
    require "net/http"
    # Query parameter
    facet_field = params[:facet_field]
    facet_value = params[:facet_value]
    rows = params[:rows] || 10
    digital_collections_url = "https://digital.library.cornell.edu/?f[" + facet_field + "][]=" + facet_value + "&rows=" + rows.to_s + "&format=json";
    Rails.logger.info digital_collections_url
    url = URI.parse(digital_collections_url)
    resp = Net::HTTP.get_response(url) 
    data = resp.body
    result = JSON.parse(data)
    render :json => result
  end
  
  ## Adding proxy for additional search indices
  
  def subjectbrowse
    require "net/http"
    # Query parameter
    query = params[:q]
    sep_solr_url = ENV["SUBJECT_SOLR"] + "/select?q=*:*&fq=classification_facet:" + query + "&wt=json&sort=label_s asc&rows=500";
    url = URI.parse(sep_solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    render :json => result 
  end
  
  def authorbrowse
    require "net/http"
    # Query parameter
    sort_query = params[:sort] || "wd_birthy_i asc"
    query = params[:q] || "*:*"
    rows = params[:rows] || 4000
    sep_solr_url = ENV["AUTHOR_SOLR"] + "/select?q=" +query + "&wt=json&sort=" + sort_query + "&rows=" + rows.to_s;
    #sep_solr_url = ENV["AUTHOR_SOLR"] + "/select?q=wd_birthy_i:[1700 TO 1900]&wt=json&sort=wd_birthy_i " + sort_dir + "&rows=1000";
    url = URI.parse(sep_solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    render :json => result 
  end
  
  #lookup specific author
  def authorlookup
  	require "net/http"
    # Query parameter
    query = params[:q] 
    sep_solr_url = ENV["AUTHOR_SOLR"] + "/select?q=authlabel_s:\"" +query + "\"&wt=json";
    url = URI.parse(sep_solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    render :json => result 
  end
  
  def mapbrowse
  	require 'rsolr'
    solr = RSolr.connect :url => ENV["SOLR_URL"]
    #q=*:*&rows=0&wt=json&facet=true&facet.field=fast_geo_facet&facet.limit=500
    response = solr.get 'select', :params => {:q=>"*:*", :start=>0, :rows=>0, :facet => true, "facet.field" => "fast_geo_facet", "facet.limit" => 500}  
    render :json => response	
  end
  
  def qafast
   require "net/http"
    label = params[:q]
  	query_url = "https://lookup.ld4l.org/authorities/search/linked_data/oclcfast_ld4l_cache/place?q=" + label + "&maxRecords=4"
    url = URI.parse(query_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    render :json => result  	
  end
  
  # Entity display
  def lcshsearch 
  	require 'rsolr'
  	uri = params[:q]
    solr = RSolr.connect :url => ENV["LCSH_SOLR"]
    response = solr.get 'select', :params => {:q=>"uri_s:\"" + uri + "\"" , :start=>0, :rows=>1}  
    render :json => response	
  end
  
  def bamsearch
  	require 'rsolr'
  	uri = params[:q]
    solr = RSolr.connect :url => ENV["SUBJECT_SOLR"]
    response = solr.get 'select', :params => {:q=>"uri_s:\"" + uri + "\"" , :start=>0, :rows=>1, :fl=>"classification_ss"}  
    render :json => response
  end
  
  ## Search the production so
  def sauthsearch
 	require 'rsolr'
  	label = params[:q] 
    solr = RSolr.connect :url => ENV["PROD_SUB"]
    #Leaving this out since subject may of multiple types
    #"headingTypeDesc:\"Topical Term\"",
   
    response = solr.get 'browse', :params => {:q=>label, :start=>0, :rows=>1, :fq=>[ "authority:true", "mainEntry:true"]}     
    render :json => response 	
  end
  
  #eCommons by way of digital collections
  def reposearch
  	require 'rsolr'
  	label = params[:q] 
    solr = RSolr.connect :url => ENV["REPOSITORIES_SOLR"]   
    Rails.logger.debug("URL")
    Rails.logger.debug(ENV["REPOSITORIES_SOLR"])
    response = solr.get 'select', :params => {:q=>"subject_tesim:\"" + label + "\"", :start=>0, :rows=>3, :fq=>[ "display_target_tesim:bento-prod"], :fl=>"*"}     
    #response = solr.get 'select', :params => {:q=>label, :start=>0, :rows=>3}     

    render :json => response 	
  end
  
  #Mechanism to funnel digital collections through bento box configuration and view
  def digbento
    @query = params["q"].nil? ? '' : params["q"]
    @oq = @query
    @page = params["page"].nil? ?  1 : params["page"]
    #Allowing parameter for rows
    @per_page = params["per_page"] || 10
    # Adding subject field specifically
    @search_field = params["search_field"].nil? ? '': params["search_field"]
    @results = BentoSearch.get_engine(:digitalCollections).search(@query, :oq => @oq,
      :per_page => @per_page, :page => @page, :search_field => @search_field)
    render "institutional_repositories/entity.html.erb"
  end
  
  def index
  end
  
  #get search results using bento box format
  def mainsearch
  	@query = params["q"].nil? ? '' : params["q"]
    @oq = @query
    @page = params["page"].nil? ?  1 : params["page"]
    #Allowing parameter for rows
    @per_page = params["per_page"] || 10
    # Adding subject field specifically
    @search_field = params["search_field"].nil? ? '': params["search_field"]
    @results = BentoSearch.get_engine(:solrEntity).search(@query, :oq => @oq,
      :per_page => @per_page, :page => @page, :search_field => @search_field)
    render "institutional_repositories/entity.html.erb"
  end
end
