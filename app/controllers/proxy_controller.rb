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
    digital_collections_url = "https://digital.library.cornell.edu/?f[" + facet_field + "][]=" + facet_value + "&format=json";
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
    sort_dir = params[:sort] || "asc"
    query = params[:q]
    #loc_birthy_i:[1500 TO 1900]
    sep_solr_url = ENV["AUTHOR_SOLR"] + "/select?q=*:*&wt=json&sort=wd_birthy_i " + sort_dir + "&rows=1000";
    #sep_solr_url = ENV["AUTHOR_SOLR"] + "/select?q=wd_birthy_i:[1700 TO 1900]&wt=json&sort=wd_birthy_i " + sort_dir + "&rows=1000";
    url = URI.parse(sep_solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    render :json => result 
  end
  
end