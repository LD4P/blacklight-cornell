# frozen_string_literal: true
class AutosuggestController < CatalogController  
  include Blacklight::Bookmarks

  def get_suggestions
    # eliminate commas from the search term; e.g. "einstein, albert"
    query = params["term"].gsub(",","")
    solr_url = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=" + query.to_s;
    result = get_solr_response(solr_url)
    docs = result["response"]["docs"]
    # Will need the highlighting later for variants
    highlights = result["highlighting"]
    # group the solr docs by type: author, subject, etc.
    grouped = docs.group_by { |h| h["type_s"]}
    grouped = grouped.sort.to_h
    # compile an array of the preferred labels
    pseudos = [""]
    tmp_hash = {}
    docs.each do |d|
      tmp_hash = eval(d["pseudonyms_ss"][0])  if d["pseudonyms_ss"].present?
      pseudos << tmp_hash[:label]  if !tmp_hash.empty?
      tmp_hash = {}
    end
    my_hash = {}
    # now loop through each group and sort by rank
    grouped.each do |k, v|
      x = v.sort_by { |k| -k["rank_i"] }
      autosuggest_terms = []
      # Take the top 6 in each group.
      x.take(6).each do |i|
        add_term = true
        # Special processing for variants and pseudonymns. If the query term doesn't match a preferred 
        # label, we have a variant or pseudonym.
        if !term_matches_label(query.downcase,i["label_s"])
          # For rare cases where query term matches the variant of a preferred label where that preferred label
          # is a pseudonym_ss for a match on the query term. E.g., term = "smith" and "smith" is part of a variant
          # of Joyce Carol Oates, while JCO is a pseudonym_ss for Rosamnd Smith.
          if pseudos.join(", ").downcase.include?(i["label_s"].downcase)
            add_term = false
          end
          # Whether it's a variant or pseudonym, use the id to grab the suggested label from the highlighting hash.
          tmp_string = highlights[i["id"]]["label_suggest"][0].gsub("<em>","").gsub("</em>","")
          # ensure the query term matches a variant and not a pseudonym
          if !i["pseudonyms_t"].present?
            i["variant"] = tmp_string unless tmp_string == i["label_s"]
          # query term doesn't match a variant, but does it match a pseudonym
          elsif term_matches_label(query.downcase,i["pseudonyms_t"].join(","))
            # pseudonyms with no catalog entries get marked as variants (the "aka" display)
            i["variant"] = tmp_string unless tmp_string == i["label_s"]
          end
        end
        # If this solr doc has any pseudonymns_ss labels, add them here. 
        # They'll appear as "see also" items in the UI. 
        if i["pseudonyms_ss"].present?
          i["pseudonym"] = []
          i["pseudonyms_ss"].each do |p|
            p_h = eval(p)
            i["pseudonym"] << p_h[:label] + " <span>(" + p_h[:rank].to_s + ")</span>"
          end
        end
        if i["wd_description_s"].present?
          punc = " " if i["label_s"][-1] == "."
          punc = ". " if i["label_s"][-1] != "."
          i["label_s"] = i["label_s"] + punc + " <span>" + i["wd_description_s"] + "</span>"
        end
        autosuggest_terms << i unless add_term == false
      end
      my_hash[k.capitalize] = autosuggest_terms
    end
    items = prep_autosuggest_items(my_hash)
    respond_to do |format|
      format.json { render json: items }
    end
  end
  
  def prep_autosuggest_items(my_hash)
    items = [];
    my_hash.each do |k, v|
      items << k + "s"
      v.each do |i|
        tmpHash = {}
        pseudoHash = {}
        tmpHash["label"] = i["label_s"] + " <span>(" + i["rank_i"].to_s + ")</span>";
        tmpHash["type"] = i["type_s"];
        tmpHash["value"] = i["label_s"];
        if i["variant"].present? 
          tmpHash["label"] += "<li style='margin-left:15px;'><em>aka:</em> " + i["variant"] + "</li>";
        end
        items << (tmpHash);

        # pseudonyms have to go into the hash as separate items, and after the preferred label,
        # because they can be searched individually, unlike variants
        if i["pseudonym"].present? && i["pseudonym"].length > 0
          the_type = i["type_s"];
          i["pseudonym"].each do |l|
            pseudoHash["label"] = "<div style='margin:-6px 0 0 15px;'><em>see also:</em> " + l + "</div>";
            pseudoHash["type"] = the_type;
            pseudoHash["value"] = l;
            items << pseudoHash
            pseudoHash = {}
          end
        end
      end
    end
    return items
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
      return label_s.match?(/\b#{query}.*\b/i)
    end
  end

  def get_solr_response(solr_url)
    url = URI.parse(solr_url)
    resp = Net::HTTP.get_response(url)
    data = resp.body
    result = JSON.parse(data)
    return result
  end
end 
