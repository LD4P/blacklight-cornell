// If zero results are found in searching the catalog, this code runs the search
// in Google Books full-text search API. Any results are looked up in the catalog.

var fullTextSearch = {

  // Pass the user's query to Google Books
  queryFullText: function() {
    var q = $('input#q').val();
    var googleBooksUrl = "https://www.googleapis.com/books/v1/volumes?q=" + q;
    fetch(googleBooksUrl)
      .then(response => response.json())
      .then(data => fullTextSearch.parseBooksData(data))
    ;
  },

  parseBooksData: function(googleBooksResults) {
    // ISBN types that will be extraced from Google Books results
    var queryKeys = ['ISBN_10', 'ISBN_13']
    // Iterate over each Goole Books result and see if it's in the catalog
    googleBooksResults['items'].forEach(function (gbResult) {
      // Discard identifiers that are not ISBNs
      var isbns = gbResult['volumeInfo']['industryIdentifiers'].filter(function(i){
        return queryKeys.includes(i['type'])
      })
      // Only search the catalog if there are ISBNs to search with
      if (isbns.length > 0) {
        // prepare Solr query string to search for a particular book
        var solrAddrs = fullTextSearch.getSolrAddrs();
        var BookQuery = isbns.map(x => x['identifier']).join(' OR isbnissn:');
        var solrQuery = solrAddrs + "/select?wt=json&rows=1&q=isbnissn:" + BookQuery;
        // run the Solr query to check catalog for the book
        $.ajax({
          url: solrQuery,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'json.wrf', // avoid CORS and CORB errors
          complete: function(response) {
            var numFound = response['responseJSON']['response']['numFound']
            if (numFound > 0) { // if found, prepare a link to the view of that book
              var title = response['responseJSON']['response']['docs'][0]['title_display']
              var idNum = response['responseJSON']['response']['docs'][0]['id']
              var cover = response['responseJSON']['response']['docs'][0]['oclc_id_display']
               fullTextSearch.addBookToView(
                '/catalog/' + idNum,
                title, // Use the catalog title rather than Google Books title
                gbResult['searchInfo']['textSnippet'],
                cover
              )
            }
          }
        });
      }
    })
    // Fill in book cover images
    setTimeout(function(){ window.bookcovers.onLoad() }, 1000);
  },

  // Add the new search results to the page
  addBookToView: function(href, title, excerpt, cover) {
    $("#full-text-results").append(
      '<div style="clear: left;">' +
      '<div style="float: left; padding: 0 15px 10px 0;"><img class="bookcover" id="OCLC:'+ cover +'" data-oclc="'+ cover +'" /></div>' +
      '<p><a href="' + href + '">' + title + '</a>' +
        '<br>' + excerpt +
        '<br><span style="font-size: small;">Excerpt from Google Books</span>' +
      '</p></div>'
      
    )
  },

  // Get a URL from a hidden div in the search page
  getSolrAddrs: function() {
    return $( "#solr-server-url-data" ).html();
  }

};
  
// Run code when the normal search process returns zero results
Blacklight.onLoad(function() {
  $('p#zero-results').each(function() {
    fullTextSearch.queryFullText();
  });
});
