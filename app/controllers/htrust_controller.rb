class HtrustController < ApplicationController
  require 'net/http'
  require 'nokogiri' 
  require 'json' 
  
  def search
    require "net/http"
    # Query parameter
    query = params[:q]
  	xmlfile = retrieveXML(query)
  	result = {}.to_json
  	if !xmlfile.nil?
  		result = processXML(xmlfile)
   		
  	end
  	render :json => result  
  end
  
  # process XML from HathiTrust and return object with search results as well as subject headings
  def processXML(xmlfile)
	doc = Nokogiri::XML(xmlfile)
	subjects = []
	results = []
	doc.xpath("//facetField[@name='Subject']/facetValue/@name").each do |facetField|
    	subjects << {"label": facetField.text}
	end
	  
	doc.xpath("//SearchResults/A_RESULTS/Item").each do |item|
    	bookID = item.xpath("bookID").text
    	ids = bookID.split(",").map do|id| 
    			source, val = id.split(":")
    			{source => val}
    		end	
    	title = item.xpath("Title").text
    	results << {"bookID": bookID, "title": title, "ids": ids}
	end
	
	return {"subjects":subjects, "results": results}.to_json
  	
  end
  
  #def retrieveXML(query)
  #  return nil if query.blank?
 # 	if(query.downcase == "akestor, king of paphos")
 # 		filepath =Rails.public_path.join("htrustXML/akestor_ls_results.xml")
 # 		xmlfile = File.open(filepath)
 # 		return xmlfile
 # 	end
 # 	return nil
  	
  #end
  
  def retrieveXML(query)
    require "net/http"
    return nil if query.blank?
 	# Call URL with query
    h_url = ENV["HATHI_TRUST"] + query + ";debug=xml";
    url = URI.parse(h_url)
    resp = Net::HTTP.get_response(url)
    xmlfile = resp.body
	return xmlfile  
  end
  
 
end