# -*- encoding : utf-8 -*-
class BrowseldController < ApplicationController
  include Blacklight::Catalog
  include BlacklightCornell::CornellCatalog
  before_action :heading
  #attr_accessible :authq, :start, :order, :browse_type

  @@browse_subject = ENV['SUBJECT_SOLR'].nil? ? '' : ENV['SUBJECT_SOLR']
  
  def subject
  	# Read the callhierarchy and call numbers json
  	filepath =Rails.public_path.join("data/callhierarchy.json")
  	@hierarchy = JSON.parse(File.read(filepath,:encoding => "UTF-8"))
  	@callhash = JSON.parse(File.read(Rails.public_path.join("data/callnumbers.json")),:encoding => "UTF-8")
  	#Tried out "selected subject"
  	@selectedSubjectString = params[:q]
  	if(!@selectedSubjectString.nil? && @selectedSubjectString != "")
	  	response = retrieveInfoForString @selectedSubjectString
	  	@selectedSubjectURI = ""
	  	@numfound = response["response"]["numFound"]
	  	@top_facet = ""
	  	@sub_facet = ""
	  	if(@numfound > 0)
	  		doc = response["response"]["docs"][0]
	  		@selectedSubjectURI = doc["uri_s"]
	  		#Sort for consistency
	  		@selectedSubjectFacets = doc["classification_facet"].sort
	  		@selectedSubjectFacets.each do |facet|
	  			if facet.length == 1
	  				@top_facet = facet
	  			else
	  				@sub_facet = facet
	  			end
	  		end
	  	end
  	end
  	
  end
  
  def osp_coassignments
    (render json: [], status: 200; return) if params[:isbns].blank?

    range = 0..19 # return top 20 most assigned works
    token = ENV['OSP_API_TOKEN'] # Token in .env file
    isbns = params[:isbns] # ISBNs joined with commas
    cnctn = HTTPClient.get(
      "https://api.opensyllabus.org/coassignments/isbn/" + isbns,
      nil, # query not used by Open Syllabus Project's API
      {authorization: "Token #{token}"} 
    )
    json_body = JSON.parse(cnctn.content)
    # return empty results if ISBNs not found
    (render json: [], status: 200; return) unless json_body.kind_of?(Array)
    # sort and return top results if found
    sort_rank = json_body.sort_by{|a| a['count'] }.reverse
    top_items = sort_rank[range]
    isbn_nums = top_items.map{|b| b['isbns'].map{|c| c.to_i }}
    
    render json: isbn_nums, status: cnctn.status
  end
  
  def index
  end
  
  def authors
  	#Query solr index and pass back information for timeline as json
  	#@min_wdyear = -3759
  	#@max_wdyear = 2019 #hardcoded but can be programmed to do 
  	#@min_startyear = -631
  	#@max_startyear = 2019
  	@min_year = -3700
  	@max_year = 2019
  	@minyearrange = 100
  	@maxyearrange = 400
  	@rangecutoff = 1300
  end
  
  ## These methods are called by the main ones above
   def retrieveInfoForString subject_string
   	require 'rsolr'
    solr = RSolr.connect :url => @@browse_subject
    response = solr.get 'select', :params => {:q=>"label_s:\"" + subject_string + "\"", :start=>0, :rows=>1}  
    return response 	
   end
  
  ##geographic
  def browsemap
  	
  end
   
   ## Syllabi fields  
   def fields
    api = URI.parse("https://cosine-cul.herokuapp.com/api/cips")
    resp = Net::HTTP.get_response(api)
    parsed = JSON.parse(resp.body)
    @fields = parsed.sort{|a,b| a['field'] <=> b['field']}
  end

  def in_field
    api = URI.parse("https://cosine-cul.herokuapp.com/api/field?cip="+params[:cip])
    resp = Net::HTTP.get_response(api)
    @books = JSON.parse(resp.body)
  end
  
   private

  def heading
    @heading='Browse'
  end
end