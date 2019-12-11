# -*- encoding : utf-8 -*-
class BrowseldController < ApplicationController
  include Blacklight::Catalog
  include BlacklightCornell::CornellCatalog
  before_action :heading

  def subject
  	# Read the callhierarchy and call numbers json
  	filepath = Rails.public_path.join("data/callhierarchy.json")
  	@hierarchy = JSON.parse(File.read(filepath,:encoding => "UTF-8"))
  	@callhash = JSON.parse(File.read(Rails.public_path.join("data/callnumbers.json")),:encoding => "UTF-8")
  end

  def index
  end

  def authors
  	#Query solr index and pass back information for timeline as json
  end

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

  def eras
    filename = Rails.public_path.to_s + "/data/subject_eras.json"
    era_file = File.read(filename)  # Read ndjson file from /data
    era_json = era_file.split("\n") # Parse each line as JSON
    era_data = era_json.map{|j| JSON.parse(j)}
    @subject_eras = era_data.map{|d| d[0]} # Remove [] layer

    @subject_eras.reverse!
  end

  private

  def heading
    @heading='Browse'
  end

end
