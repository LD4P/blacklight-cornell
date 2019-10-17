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
  def heading
   @heading='Browse'
  end
  def subject
  	# Read the callhierarchy and call numbers json
  	filepath =Rails.public_path.join("data/callhierarchy.json")
  	@hierarchy = JSON.parse(File.read(filepath,:encoding => "UTF-8"))
  	@callhash = JSON.parse(File.read(Rails.public_path.join("data/callnumbers.json")),:encoding => "UTF-8")
  end
  
  def index
  end
  
  def authors
  	#Query solr index and pass back information for timeline as json
  end
end
