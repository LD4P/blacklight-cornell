class EntityDisplayController < ApplicationController
  require 'net/http'

  def display
    require "net/http"
    #Label for authorized heading for which we need to find the URI
    if(params.has_key?("qlabel"))
    	@qlabel = params["qlabel"]
    	urisArray = getURI(@qlabel)
    	if(urisArray.size > 0)
    		@uri = urisArray[0].gsub("http:","https:")
    	end
    	@result = getURI(@qlabel).to_s
    elsif(params.has_key?("uri"))
    	# Query parameter
    	@uri = params[:uri]
    end
    
  end
  
  def index
  end
  
  ## Get the URI for a label
  # Only for LCSH at the moment, to be expanded when needed
  def getURI(label)
  	 locPath = "subjects"
     rdfType = "(Topic OR rdftype:ComplexSubject)"
     query = label.gsub(/\s>\s/, "--")
     lookupURL = "https://id.loc.gov/authorities/" + locPath + "/suggest/?q=" + query + "&rdftype=" + rdfType + "&count=1"
    
    url = URI.parse(lookupURL)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    urisArray = []
    if (result && result[1]) 
      l = result[1].length - 1
      (0..l).each do |s|
        u = result[3][s];
        urisArray.push(u);
      end 
    end
    return urisArray
    #return result
    #return lookupURL
  end
  
   
  ## Testing if we can utilize solr search results 
  
  # Assuming subject search results for all
  #def getSearchTabResults(q, tab)
  	
  
  #end
  
  
  
  
  
end