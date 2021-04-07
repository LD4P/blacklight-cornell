module BrowseHelper

  def search_field(headingType)
  	if headingType == "Personal Name" 
  		search_field = 'pers'
  	elsif headingType=="Corporate Name"
  		search_field = 'corp'
  	elsif headingType == "Event"
  		search_field = 'event'
  	elsif headingType == 'Geographic Name'
  		search_field = "geo"
  	elsif headingType == 'Chronological Term'
  		search_field = 'era'
  	elsif headingType == 'Genre/Form Term'
  		search_field = 'genr'
  	elsif headingType == "Topical Term"
  		search_field = 'topic'
  	elsif headingType=='Work'
  		search_field='work'
  	else search_field='all_fields'
  
  	end
  
  	return search_field
  end
  
  def browse_uri_encode (link_url)
      link_url = link_url.gsub('&','%26')
      link_url = link_url.gsub('"','%22')
  end
  	
  def call_number_browse_link(call_number)
  	link_url = '/browse?start=0&browse_type=Call-Number&authq=' + call_number
  	link_to(h(call_number), link_url)
  end

  def format_the_format(format, encoded_heading)
    html = ""
    f = format.split(" (")[0]
    case f
    when "Books"
      html = '<i class="fa fa-book"></i>'
      html += '<a id="facet_link_book" href="/?f%5Bformat%5D%5B%5D=Book&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Journals/Periodicals"
      html = '<i class="fa fa-book-open"></i>'
      html += '<a id="facet_link_journal_periodical" href="href="/?f%5Bformat%5D%5B%5D=Journal/Periodical&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Digital Collections"
      html = '<i class="fa fa-th-large"></i>'
      html += '<a id="facet_link_digital_collections" href="href="https://digital.library.cornell.edu/catalog?utf8=%E2%9C%93&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Manuscripts/Archives"
      html = '<i class="fa fa-archive"></i>'
      html += '<a id="facet_link_manuscript_archive" href="/?f%5Bformat%5D%5B%5D=Manuscript/Archive&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Maps"
      html = '<i class="fa fa-globe"></i>'
      html += '<a id="facet_link_map" href="/?f%5Bformat%5D%5B%5D=Map&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Musical Scores"
      html = '<i class="fa-musical-score"></i>'
      html += '<a id="facet_link_musical_score" href="/?f%5Bformat%5D%5B%5D=Musical%20Score&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Non-musical Recordings"
      html = '<i class="fa fa-headphones"></i>'
      html += '<a id="facet_link_non_musical_recording" href="/?f%5Bformat%5D%5B%5D=Non-musical%20Recording&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Videos"
      html = '<i class="fa fa-video-camera"></i>'
      html += '<a id="facet_link_video" href="/?f%5Bformat%5D%5B%5D=Video&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Computer Files"
      html = '<i class="fa fa-save"></i>'
      html += '<a id="facet_link_computer_file" href="/?f%5Bformat%5D%5B%5D=Computer%20File&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Databases"
      html = '<i class="fa fa-database"></i>'
      html += '<a id="facet_link_database" href="/?f%5Bformat%5D%5B%5D=Database&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Musical Recordings"
      html = '<i class="fa fa-music"></i>'
      html += '<a id="facet_link_musical_recording" href="/?f%5Bformat%5D%5B%5D=Musical%20Recording&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Theses"
      html = '<i class="fa fa-file-text-o"></i>'
      html += '<a id="facet_link_thesis" href="/?f%5Bformat%5D%5B%5D=Thesis&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Microforms"
      html = '<i class="fa fa-film"></i>'
      html += '<a id="facet_link_microform" href="/?f%5Bformat%5D%5B%5D=Microform&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    when "Miscellaneous"
      html = '<i class="fa fa-ellipsis-h"></i>'
      html += '<a id="facet_link_miscellaneous" href="/?f%5Bformat%5D%5B%5D=Miscellaneous&amp;q='
      html += encoded_heading + '&amp;search_field=all_fields">' + format + '</a>'
    end
    return html.html_safe
  end
end