var fullTextSearch = {
  queryFullText: function() {
    var q = $('input#q').val();
    console.log(q);
    var googleBooksUrl = "https://www.googleapis.com/books/v1/volumes?q=" + q;
    fetch(googleBooksUrl)
      .then(response => response.json())
      .then(data => fullTextSearch.parseBooksData(data))
    ;
  },

  parseBooksData: function(data) {
    data['items'].forEach(function (element) {
      // prepare Solr query string for a particular book
      var solrAddrs = fullTextSearch.getSolrAddrs();
      var BookQuery = element['volumeInfo']['industryIdentifiers'][0]['identifier'];
      var solrQuery = solrAddrs + "/select?wt=json&rows=1&q=" + BookQuery;
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
             fullTextSearch.addBookToView(
              '/catalog/' + idNum,
              title, // Use the catalog title rather than Google Books title
              element['searchInfo']['textSnippet']
            )
          }
        }
      });

      
    })
  },

  addBookToView: function(href, title, excerpt) {
    $("#full-text-results").append(
      '<p><a href="' + href + '">' + title + '</a>' +
        '<br>' +
        excerpt +
      '</p></div>'
    )
  },

  getSolrAddrs: function() {
    return $( "#solr-server-url-data" ).html();
  }

};
  
Blacklight.onLoad(function() {
  $('p#zero-results').each(function() {
    fullTextSearch.queryFullText();
  });
});
