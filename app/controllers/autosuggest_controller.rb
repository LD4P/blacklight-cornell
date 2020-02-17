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
end 
