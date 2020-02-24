// Book recommendation engine using Open Syllabus Project (opensyllabus.org)
// Created as a part of Linked Data for Production (ld4p.org)

const openSyllabus = {

  // Feature: Display books related to (coassigned with)
  // the book currently book being viewed in the catalog

  getCoassignedBooks: async function(suggestions) {
    const isbns = $( "#isbns-json-data" ).html();
    const isbnParsed = JSON.parse(isbns);
    const isbnParams = isbnParsed.join(',');
    const coAssigned = await this.queryOspCoassignmentsApi(isbnParams);
    for (const assignment of coAssigned) {
      const joinIsbn = assignment.join(' OR ');
      const queryCat = await this.querySolrCheckSuggestion(joinIsbn);
      if (this.areSolrResults(queryCat)) {
        const result = queryCat["response"]["docs"][0]
        openSyllabus.formatAndListSuggestions(result, joinIsbn); // write HTML
      }
    }
    setTimeout(function(){ window.bookcovers.onLoad() }, 300); // fill cover images
  },

  queryOspCoassignmentsApi: function(isbnParams) {
    const localRoute = '/browseld/osp_coassignments?isbns='; // internal API
    return $.get(localRoute + isbnParams);
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
    const htmlString = `
      <figure>
        <div class="imgframe">
          <a href="${recomQuery}">
            <img class="bookcover" id="OCLC:${oclcIdDisp}" data-oclc="${oclcIdDisp}" />
          </a>
        </div>
        <figcaption>
          <a href="${recomQuery}">${recomTitle}</a>${authorNote}
        </figcaption>
      </figure>
    `
    $("#recommended-list").append(htmlString);
  },

  // Feature: Display books related to a field of study
  // Checks books in a hidden table created by browseld/in_field.
  // Each book found in catalog is shown, until the end of a slice, 
  // finishing with a "More" link to recurse for the next slice.

  showFoundBooksSlice: function(sliceSize, sliceNum) {
    // Prepare "More..." link at bottom of table
    const footerMoreBox = $('#footerMoreBox');
    // Get Solr URL from env var via the DOM
    $('#appendedMore').hide("slow", function(){ $(this).remove(); })
    // Iterate on current slice of list of books
    const fieldBookList = $('#fieldBookList tr');
    const bookListSlice = fieldBookList.slice(sliceNum-sliceSize, sliceNum);
    bookListSlice.each(function(){
      const row = $(this);
      row.find('.isbns').each(async function() {
        const isbns = JSON.parse($(this).text());
        const joinedIsbns = isbns.join(' OR ');
        const queryCat = await openSyllabus.querySolrCheckSuggestion(joinedIsbns);
        if (openSyllabus.areSolrResults(queryCat)) {
          row.show(); // Show tr if it contains a book found in Solr catalog
        }
        // On last book in this slice, show "More..." link to run next slice
        if (row[0] === bookListSlice.last()[0]) {
          const nextSliceNum = sliceNum + sliceSize;
          footerMoreBox.append(`
            <a
              id="appendedMore"
              href="javascript:openSyllabus.showFoundBooksSlice(20,${nextSliceNum})"
            >More...</a>
          `);
        }
      });
    });
  },

  // Solr catalog checking functions used by both of above features
  // Used to check that a book is in the catalog before displaying it

  querySolrCheckSuggestion: function(joinedIsbns) {
    const solrServer = $( "#solr-server-url-data" ).html();
    const solrParams = "/select?&wt=json&rows=1&q=" + joinedIsbns;
    return $.ajax({
      url: solrServer + solrParams,
      type: 'GET',
      dataType: 'jsonp',
      jsonp: 'json.wrf'
    });
  },

  areSolrResults: function(solrResults) { // result of querySolrCheckSuggestion
    const threshold = 0;
    const numFound = solrResults["response"]["numFound"];
    return (numFound > threshold);
  }

};

Blacklight.onLoad(function() {
  // Run syllabus coassignment code in item view
  $('body.catalog-show, body.blacklight-catalog-show').each(function() {
    openSyllabus.getCoassignedBooks();
  });
  // Run books in field code in syllabus browse
  $('body.browseld-in_field').each(function() {
    openSyllabus.showFoundBooksSlice(20,20);
  });
});
