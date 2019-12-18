class SemController < ApplicationController
  require 'net/http'

  
  # QA lookup enables retrieving direct search from LCSH/LCNAF
  #For some reason, this is timing out and it is unclear why
  def qalookup
   	require "net/http"
    label = params[:q]
  	query_url = "https://lookup.ld4l.org/authorities/search/linked_data/locsubjects_ld4l_cache?q=" + label + "&maxRecords=4&context=true"
    url = URI.parse(query_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    render :json => result  	
  end
  
end