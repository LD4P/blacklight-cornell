# frozen_string_literal: true
class AutosuggestController < CatalogController  
  include Blacklight::Bookmarks

  def get_suggestions
    query = params["json"].gsub(",","")
    if  query.strip.include? " "
      query_array = query.split
      if query_array.size == 2
        x = SUGGESTIONS.select{|x| x["label"].match(/\b#{query_array[0]}\b.*#{query_array[1]}|\b#{query_array[1]}\b.*#{query_array[0]}/i)}
      elsif query_array.size == 3
        x = SUGGESTIONS.select{|x| x["label"].match(/\b#{query_array[0]}\b.*#{query_array[1]}.*#{query_array[2]}|\b#{query_array[1]}\b.*#{query_array[0]}.*#{query_array[2]}|\b#{query_array[2]}\b.*#{query_array[0]}.*#{query_array[1]}/i)}
      elsif query_array.size == 4
        x = SUGGESTIONS.select{|x| x["label"].match(/\b#{query_array[0]}\b.*#{query_array[1]}.*#{query_array[2]}.*#{query_array[3]}|\b#{query_array[1]}\b.*#{query_array[0]}.*#{query_array[2]}.*#{query_array[3]}|\b#{query_array[2]}\b.*#{query_array[0]}.*#{query_array[1]}.*#{query_array[3]}|\b#{query_array[3]}\b.*#{query_array[0]}.*#{query_array[1]}.*#{query_array[2]}/i)}
      end
    else
      x = SUGGESTIONS.select{|x| x["label"].match?(/\b#{query}\b/i)}
    end
    grouped = x.group_by { |h| h["type"]}
    my_hash = {}
    grouped.each do |k, v|
      x = v.sort_by { |k| -k["rank"] }
      my_hash[k.capitalize] = x[0...6]
    end
    respond_to do |format|
      format.json { render json: my_hash }
    end
  end
  
  def original_get_suggestions
    query = params["json"].gsub(",","")
    if  query.strip.include? " "
      assume_two = query.split
      x = SUGGESTIONS.select{|x| x["label"].match(/\b#{assume_two[0]}\b.*#{assume_two[1]}|\b#{assume_two[1]}\b.*#{assume_two[0]}/i)}
    else
      x = SUGGESTIONS.select{|x| x["label"].match?(/\b#{query}\b/i)}
    end
    grouped = x.group_by { |h| h["type"]}
    my_hash = {}
    grouped.each do |k, v|
      x = v.sort_by { |k| -k["rank"] }
      my_hash[k.capitalize] = x[0...5]
    end
    respond_to do |format|
      format.json { render json: my_hash }
    end
  end
  
  # Query solr endpoint 
  def get_suggestions_solr
    query = params["json"].gsub(",","")
    solr_url = ENV["SUGGEST_SOLR"] +  "/select?q=" +query + "&wt=json&rows=10&q.op=AND";
    # Add parameter q.op=AND to force matches on all terms
   	url = URI.parse(solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    my_hash = {}
    #Need to parse into what is expected based on original get_suggestions
    # Start with just authors
    if(result.key?("response") && result["response"].key?("docs") && result["response"]["docs"].length > 0)  
    	docs = result["response"]["docs"]
    	# Extracting only authors to begin with
    	authors = docs.select{|doc| doc["type_s"] == "author"}
    	display_authors = []
    	authors.each do |author|
    		display_authors << {"label" => author["label_s"], "type" => "author", "rank" => author["rank_i"]} 
    	end
    	my_hash["Author"] = display_authors
    end
    
    respond_to do |format|
      format.json { render json: my_hash }
    end
  end
end 
