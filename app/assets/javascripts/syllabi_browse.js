// This code displays book suggestions that come from Open Syllabus Project
// For the moment, OSP suggestions come from a custom server called Cosine
// Later, OSP is planning to implement an API to serve suggestions

// This function adds co-assigned work suggestions to the item view for a work
var getOpenSyllabusRecommendations = {
  getCoassignedBooks: function(suggestions) {
    // Get ISBNs of current book from the page DOM
    var isbns = $( "#isbn-box" ).html();
    var isbnParsed = JSON.parse(isbns);
    var isbnParams = "isbns[]=" + isbnParsed.join('&isbns[]=');
    // Get JSON array of arrays from Cosine API. Outer array is list of books, inner is list of ISNBs per book.
    $.get( "https://cosine-cul.herokuapp.com/api/coassigned?" + isbnParams, function( cosineResponse ) {
      var bookIsbnLists = JSON.parse(cosineResponse);
      var firstTenBooks = bookIsbnLists.slice(0, 20);
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
              // Display the div if something is found
              $(".browse-syllabi").show(500);
              // Format author string
              if (solrResponse["responseJSON"]["response"]["docs"][0]["author_display"]) {
                var authorStringResponse = solrResponse["responseJSON"]["response"]["docs"][0]["author_display"];
                var authorDividedByComma = authorStringResponse.split(",");
                var authorFirst2Elements = authorDividedByComma.slice(0,2).join();
              }
              var authorNote = (authorFirst2Elements ? ' by '+authorFirst2Elements : '');
              // Set strings for title, href, and OCLC id
              var recomTitle = solrResponse["responseJSON"]["response"]["docs"][0]["title_display"];
              var recomQuery = '/catalog?&q='+joinedList;
              var oclcIdDisp = solrResponse["responseJSON"]["response"]["docs"][0]["oclc_id_display"][0]
              // Compose the HTML that will be displayed on the page
              // The image is currently not working; I fear the script that fills it in runs too late
              var htmlString = '<figure><div class="imgframe"><a href="'+recomQuery+'"><img class="bookcover" id="OCLC:'+oclcIdDisp+'" data-oclc="'+oclcIdDisp+'" /></a></div><figcaption><a href="'+recomQuery+'">'+recomTitle+'</a> '+authorNote+'</figcaption></figure>'

              $("#recommended-list").append(htmlString);
            }
          }
        }).done(function(){
          // Fill in cover images
          
          setTimeout(function(){ window.bookcovers.onLoad() }, 500);
        });

      });
    });
  },

  // This function checks the catalog, in slices or pages, for works listed in an academic field
  checkFieldBooks: function(sliceSize, sliceNum) {
    // Prepare "More..." link at bottom of table
    var footerMoreBox = $('#footerMoreBox');
    $('#appendedMore').hide("slow", function(){ $(this).remove(); })
    // Iterate on current slice of list of books
    var fieldBookList = $('#fieldBookList tr');
    var bookListSlice = fieldBookList.slice(sliceNum-sliceSize, sliceNum);
    bookListSlice.each(function(){
      var row = $(this)
      row.find('.isbns').each(function() {
        var isbns = JSON.parse($(this).text());
        var joinedIsbns = isbns.join(' OR ');
        var solrUrl = "http://da-prod-solr8.library.cornell.edu/solr/ld4p2-blacklight/select?&wt=json&rows=0&q="+joinedIsbns;
        $.ajax({
          url: solrUrl,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'json.wrf', // avoid CORS and CORB errors
          complete: function(solrResponse) {
            var numFound = solrResponse["responseJSON"]["response"]["numFound"]
            if (numFound > 0) {
              row.show();
            }
            // On last book in this slice, show "More..." link to run next slice
            if (row[0] === bookListSlice.last()[0]) {
              var nextSliceNum = sliceNum + sliceSize;
              footerMoreBox.append(
                '<a id="appendedMore" href="javascript:getOpenSyllabusRecommendations.checkFieldBooks(20,'
                +nextSliceNum+
                ')">More...</a>');
            }
          }
        });
      });
    });
  }

};

Blacklight.onLoad(function() {
  // Run syllabus coassignment code in item view
  $('body.catalog-show').each(function() {
    getOpenSyllabusRecommendations.getCoassignedBooks();
  });
  // Run books in field code in syllabus browse
  $('body.browseld-in_field').each(function() {
    getOpenSyllabusRecommendations.checkFieldBooks(20,20);
  });
});
