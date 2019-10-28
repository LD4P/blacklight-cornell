// This code displays book suggestions that come from Open Syllabus Project
// For the moment, OSP suggestions come from a custom server called Cosine
// Later, OSP is planning to implement an API to serve suggestions

var getOpenSyllabusRecommendations = {
  onLoad: function(suggestions) {
    // Get ISBNs of current book from the page DOM
    var isbns = $( "#isbn-box" ).html();
    var isbnParsed = JSON.parse(isbns);
    var isbnParams = "isbns[]=" + isbnParsed.join('&isbns[]=');
    // Get JSON array of arrays from Cosine API. Outer array is list of books, inner is list of ISNBs per book.
    $.get( "https://cosine-cul.herokuapp.com/api/coassigned?" + isbnParams, function( cosineResponse ) {
      var bookIsbnLists = JSON.parse(cosineResponse);
      var firstTenBooks = bookIsbnLists.slice(0, 9);
      // Iterate over each book (ISBN list) among the first 10
      firstTenBooks.forEach(function(list){
        // Transform each ISBN list into a query string joined with ORs
        var joinedList = list.join(' OR ');
        // Query the Cornell Library catalog Solr (later: don't hardcode URL)
        solrUrl = "http://da-prod-solr8.library.cornell.edu/solr/ld4p2-blacklight/select?&wt=json&rows=1&q="+joinedList
        $.ajax({
          url: solrUrl,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'json.wrf', // avoid CORS and CORB errors
          complete: function(solrResponse) {
            var numFound = solrResponse["responseJSON"]["response"]["numFound"]
            // When results in the catalog are found, add them to the page
            if (numFound > 0) {
              // Remove "none" from display if somethign is found
              $("#none-list").empty();
              // Format author string
              if (solrResponse["responseJSON"]["response"]["docs"][0]["author_display"]) {
                var authorStringResponse = solrResponse["responseJSON"]["response"]["docs"][0]["author_display"];
                var authorDividedByComma = authorStringResponse.split(",");
                var authorFirst2Elements = authorDividedByComma.slice(0,2).join();
              }
              var authorNote = (authorFirst2Elements ? ' by '+authorFirst2Elements : '');
              // Set strings for title and href
              var recomTitle = solrResponse["responseJSON"]["response"]["docs"][0]["title_display"];
              var recomQuery = 'http://localhost:3000/catalog?&q='+joinedList;
              $("#recommended-list").append('<li><a href="'+recomQuery+'">'+recomTitle+'</a>'+authorNote+'</li>');
            }
          }
        });
      });
    });
  }
};

Blacklight.onLoad(function() {
  $('body.catalog-show').each(function() {
    getOpenSyllabusRecommendations.onLoad();
  });
});
