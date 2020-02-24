// This code displays book suggestions that come from Open Syllabus Project

const getOpenSyllabusRecommendations = {

  // get co-assigned work suggestions & add to item view for a work
  getCoassignedBooks: async function(suggestions) {
    const isbns = $( "#isbns-json-data" ).html();
    const isbnParsed = JSON.parse(isbns);
    const isbnParams = isbnParsed.join(',');
    const coAssigned = await getOpenSyllabusRecommendations.queryOspCoassignmentsApi(isbnParams);
    for (const assignment of coAssigned) {
      const joinIsbn = assignment.join(' OR ');
      const queryCat = await getOpenSyllabusRecommendations.querySolrCheckSuggestion(joinIsbn);
      const numFound = queryCat["response"]["numFound"];
      if (numFound > 0) {
        const result = queryCat["response"]["docs"][0]
        getOpenSyllabusRecommendations.formatAndListSuggestions(result, joinIsbn); // write HTML
      }
    }
    setTimeout(function(){ window.bookcovers.onLoad() }, 300); // fill cover images
  },

  // get OSP coassigments via pass-through internal API
  queryOspCoassignmentsApi: function(isbnParams) {
    const localRoute = '/browseld/osp_coassignments?isbns=';
    return $.get(localRoute + isbnParams);
  },

  // check OSP coassigment suggestions against Solr catalog
  querySolrCheckSuggestion: function(joinIsbn) {
    const solrServer = $( "#solr-server-url-data" ).html();
    const solrParams = "/select?&wt=json&rows=1&q=" + joinIsbn;
    return $.ajax({
      url: solrServer + solrParams,
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'json.wrf'
    });
  },

  formatAndListSuggestions: function(result, joinIsbn) {
    // Display the div if something is found
    $(".browse-syllabi").show(500);
    // Format author string
    if (result["author_display"]) {
      var authorStringResponse = result["author_display"];
      var authorDividedByComma = authorStringResponse.split(",");
      var authorFirst2Elements = authorDividedByComma.slice(0,2).join();
    }
    const authorNote = (authorFirst2Elements ? ' by '+authorFirst2Elements : '');
    // Set strings for title, href, and OCLC id
    const recomTitle = result["title_display"];
    const recomQuery = '/catalog?&q='+joinIsbn;
    const oclcIdDisp = result["oclc_id_display"][0]
    // Compose the HTML that will be displayed on the page
    const htmlString = '<figure><div class="imgframe"><a href="'+recomQuery+'"><img class="bookcover" id="OCLC:'+oclcIdDisp+'" data-oclc="'+oclcIdDisp+'" /></a></div><figcaption><a href="'+recomQuery+'">'+recomTitle+'</a> '+authorNote+'</figcaption></figure>'
    $("#recommended-list").append(htmlString);
  },

  // This function checks a hidden HTML table of books and reveals those found in Solr
  // It works in slices or pages, finishing with a "More" link to recurse for the next slice
  showFoundBooksSlice: function(sliceSize, sliceNum) {
    // Prepare "More..." link at bottom of table
    const footerMoreBox = $('#footerMoreBox');
    // Get Solr URL from env var via the DOM
    const solrServerUrl = $( "#solr-server-url-data" ).html();
    $('#appendedMore').hide("slow", function(){ $(this).remove(); })
    // Iterate on current slice of list of books
    const fieldBookList = $('#fieldBookList tr');
    const bookListSlice = fieldBookList.slice(sliceNum-sliceSize, sliceNum);
    bookListSlice.each(function(){
      const row = $(this);
      row.find('.isbns').each(async function() {
        const isbns = JSON.parse($(this).text());
        const joinedIsbns = isbns.join(' OR ');
        const solrUrl = solrServerUrl + "/select?&wt=json&rows=0&q=" + joinedIsbns;
        const queryCat = await getOpenSyllabusRecommendations.querySolrCheckSuggestion(joinedIsbns);
        const numFound = queryCat["response"]["numFound"];
        if (numFound > 0) {
          row.show();
        }
        // On last book in this slice, show "More..." link to run next slice
        if (row[0] === bookListSlice.last()[0]) {
          const nextSliceNum = sliceNum + sliceSize;
          footerMoreBox.append(
            '<a id="appendedMore" href="javascript:getOpenSyllabusRecommendations.checkFieldBooks(20,'
            +nextSliceNum+
            ')">More...</a>'
          );
        }
      });
    });
  }

};

Blacklight.onLoad(function() {
  // Run syllabus coassignment code in item view
  $('body.catalog-show, body.blacklight-catalog-show').each(function() {
    getOpenSyllabusRecommendations.getCoassignedBooks();
  });
  // Run books in field code in syllabus browse
  $('body.browseld-in_field').each(function() {
    getOpenSyllabusRecommendations.showFoundBooksSlice(20,20);
  });
});
