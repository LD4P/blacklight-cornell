 module BrowseldHelper
 
def check_subject_browse_info(classes, value, remove)
	if ( !classes.nil? && classes.include?("filter-fast_topic_facet") || (!remove.nil? && remove == "?subject_cts"))
		return "<span><a href='browseld/subject?q=" + value + "' type='button' class='btn btn-outline-info btn-sm'>Browse</a></span>"
	end
	
	return ""
end
  
end