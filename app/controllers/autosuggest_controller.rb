# frozen_string_literal: true
class AutosuggestController < CatalogController  
  include Blacklight::Bookmarks

  def get_suggestions
    # eliminate commas from the search term; e.g. "einstein, albert"
    query = params["term"].gsub(",","")
    solr_url = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=50&q=" + query.to_s;
    url = URI.parse(solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    docs = result["response"]["docs"]
    # Will need the highlighting later for variants
    highlights = result["highlighting"]
    # group the solr docs by type: author, subject, etc.
    grouped = result["response"]["docs"].group_by { |h| h["type_s"]}
    grouped = grouped.sort.to_h
    # compile an array of the preferred labels
    labels = docs.map{|n| n["label_s"]}
    my_hash = {}
    # now loop through each group and sort by rank
    grouped.each do |k, v|
      x = v.sort_by { |k| -k["rank_i"] }
      autosuggest_terms = []
      # special processing for variants and pseudonymns
      x.each do |i|
        unless autosuggest_terms.join(",").downcase.include?(i["label_s"].downcase) || 
          autosuggest_terms.join(",").downcase.include?(i["label_s"].gsub(/\.$/, '').downcase)
          # if the query term doesn't match a preferred label, we have a variant or pseudonym.
          if !term_matches_label(query.downcase,i["label_s"])
            # Whether it's a variant or pseudonym, use the id to grab the suggested label from the highlighting hash.
            tmp_string = highlights[i["id"]]["label_suggest"][0].gsub("<em>","").gsub("</em>","")
            # ensure the query term matches a variant and not a pseudonym
            if !i["pseudonyms_t"].present?
              i["variant"] = tmp_string unless tmp_string == i["label_s"]
              autosuggest_terms << i
            # query term doesn't match a variant, but does it match a pseudonym
            elsif term_matches_label(query.downcase,i["pseudonyms_t"].join(","))
              # We only want pseudonyms that are not catalog entries (they won't be in the preferred labels array).
              if !labels.join(",").downcase.include?(tmp_string.downcase)
                # pseudonyms with no catalog entries get marked as variants (the "aka" display)
                i["variant"] = tmp_string unless tmp_string == i["label_s"]
                
                # there could be other pseudonyms, some with catalog entries. loop through them and check
                # if any have entries, add them to the hash. The has_catalogue_pseudonym method returns 0 when
                # the pseudonym does not have entries, and it returns the rank_i value when there are entries.
                i["pseudonym"] = []
                i["pseudonyms_ss"].each do |p|
                  rank = has_catalogued_pseudonym(eval(p)[:uri])
                  if rank > 0
                    i["pseudonym"] << eval(p)[:label] + " <span>(" + rank.to_s + ")</span>"
                  end
                end
                autosuggest_terms << i
              end
            end
          else
            # If this solr doc has any pseudonymns and they're in the preferred labels array,
            # add them here. They'll appear as "see also" items in the UI. 
            # 
            if i["pseudonyms_t"].present?
              i["pseudonym"] = []
              i["pseudonyms_t"].each do |p|
                if labels.join(",").downcase.include?(p.downcase)
                  rank = docs.select{|n| n["label_s"] == p}.map{|r| r["rank_i"]}
                  # workaround for inconsistent use of periods at the end of preferred labels
                  if rank.empty?
                    rank = docs.select{|n| n["label_s"].gsub(/\.$/, '') == p}.map{|r| r["rank_i"]}
                  end
                  i["pseudonym"] << p + " <span>(" + rank[0].to_s + ")</span>"
                end
              end
            end
            autosuggest_terms << i
          end
        end
      end
      # take the top 6 in each group
      my_hash[k.capitalize] = autosuggest_terms[0...6]
    end    
    respond_to do |format|
      format.json { render json: my_hash }
    end
  end
  
  def term_matches_label(term,label_s)
    query = term.gsub(",","")
    if  query.strip.include? " "
      query_array = query.split
      if query_array.size == 2
        return label_s.match?(/\b#{query_array[0]}\b.*#{query_array[1]}|\b#{query_array[1]}\b.*#{query_array[0]}/i)
      elsif query_array.size == 3
        return label_s.match?(/\b#{query_array[0]}\b.*#{query_array[1]}.*#{query_array[2]}|\b#{query_array[1]}\b.*#{query_array[0]}.*#{query_array[2]}|\b#{query_array[2]}\b.*#{query_array[0]}.*#{query_array[1]}/i)
      elsif query_array.size == 4
        return label_s.match?(/\b#{query_array[0]}\b.*#{query_array[1]}.*#{query_array[2]}.*#{query_array[3]}|\b#{query_array[1]}\b.*#{query_array[0]}.*#{query_array[2]}.*#{query_array[3]}|\b#{query_array[2]}\b.*#{query_array[0]}.*#{query_array[1]}.*#{query_array[3]}|\b#{query_array[3]}\b.*#{query_array[0]}.*#{query_array[1]}.*#{query_array[2]}/i)
      end
    else
      return label_s.match?(/\b#{query}\b/i)
    end
  end

  def has_catalogued_pseudonym(uri)    
    solr_url = ENV["AUTOSUGGEST_URL"] + '/suggest/select?q=*:*&wt=json&fq=uri_s:"' + uri + '"';
    url = URI.parse(solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    if result["response"]["numFound"] == 0
      return 0
    else
      return result["response"]["docs"][0]['rank_i']
    end
  end

  def original_get_suggestions
    query = params["term"].gsub(",","")
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
end 
