# -*- encoding : utf-8 -*-
class BrowseldController < ApplicationController
  include Blacklight::Catalog
  include BlacklightCornell::CornellCatalog
  before_action :heading
  #attr_accessible :authq, :start, :order, :browse_type
  @@browse_index_author = ENV['BROWSE_INDEX_AUTHOR'].nil? ? 'author' : ENV['BROWSE_INDEX_AUTHOR']
  @@browse_index_subject = ENV['BROWSE_INDEX_SUBJECT'].nil? ? 'subject' : ENV['BROWSE_INDEX_SUBJECT']
  @@browse_index_authortitle = ENV['BROWSE_INDEX_AUTHORTITLE'].nil? ? 'authortitle' : ENV['BROWSE_INDEX_AUTHORTITLE']
  @@browse_index_callnumber = ENV['BROWSE_INDEX_CALLNUMBER'].nil? ? 'callnum' : ENV['BROWSE_INDEX_CALLNUMBER']
  
  @@browse_subject = ENV['SUBJECT_SOLR'].nil? ? '' : ENV['SUBJECT_SOLR']
  def heading
   @heading='Browse'
  end
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
  	@yearrange = 400
  end
  
  ## These methods are called by the main ones above
   def retrieveInfoForString subject_string
   	require 'rsolr'
    solr = RSolr.connect :url => @@browse_subject
    response = solr.get 'select', :params => {:q=>"label_s:\"" + subject_string + "\"", :start=>0, :rows=>1}  
    return response 	
   end
end
