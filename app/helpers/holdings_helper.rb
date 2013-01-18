module HoldingsHelper

  def process_online_title(title)
    title.to_s.gsub(/^Full text available from /, '').gsub(/(\d{1,2})\/\d{1,2}(\/\d{4})/,'\1\2')
  end

  def xadd_display_elements(entries)
  entries
  end

  def add_display_elements(entries)

    entries.each do |entry|

      # location links
      # location = Location.match_location_text(entry['location_name'])
      entry['location'] = entry['location_name']

#      if location && location.category == "physical"
#        check_at = DateTime.now
#        entry['location_link'] = link_to(entry['location_name'], location_display_path(CGI.escape(entry['location_name'])), :class => :location_display)
#      else
#        entry['location_link'] = entry['location_name']
#      end

#      if location && location.library && (hours = location.library.hours.find_by_date(Date.today))
#        entry['hours'] = hours.to_opens_closes
#      end

      # add status icons
      entry['copies'].each do |copy|
        copy['items'].each_pair do |message,details|
          details['image_link'] = image_tag("icons/" + details['status'] + ".png")
        end
      end

    end

    sort_item_statuses(entries)

    entries

  end

  ITEM_STATUS_RANKING = ['available', 'some_available', 'not_available', 'none', 'online']

  def sort_item_statuses(entries)

    entries.each do |entry|
      entry['copies'].each do |copy|
        items = copy['items']
        copy['items'] = items.sort_by { |k,v| ITEM_STATUS_RANKING.index(v['status']) }
      end
    end

    # NOTE: This sort_by step changes the copy[:items] structure from:
    #       {message => {:status => , :count => , etc.}, ...}
    #     to:
    #       [[message, {:status => , :count => , etc.}], ...]
    # in order to preserve the sort order.

  end

  def extract_google_bibkeys(document)

    bibkeys = []

    unless document["isbn_t"].nil?
      bibkeys << document["isbn_t"]
    end

    unless document["oclc_display"].nil?
      bibkeys << document["oclc_display"].collect { |oclc| "OCLC:" + oclc.gsub(/^oc[mn]/,"") }.uniq
    end

    unless document["lccn_display"].nil?
      bibkeys << document["lccn_display"].collect { |lccn| "LCCN:" + lccn.gsub(/\s/,"").gsub(/\/.+$/,"") }
    end

    bibkeys.flatten

  end

end

