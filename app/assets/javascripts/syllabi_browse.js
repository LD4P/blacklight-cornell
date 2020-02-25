// Book recommendation engine using Open Syllabus Project (opensyllabus.org)
// Created as a part of Linked Data for Production (ld4p.org)

const openSyllabus = {

  // Feature: Display books related to (coassigned with)
  // the book currently book being viewed in the catalog

  getCoassignedBooks: async function(suggestions) {
    const isbns = $("#isbns-json-data").html();
    const isbnsParam = JSON.parse(isbns).join(",");
    const coAssigned = await this.queryOspCoassignmentsApi(isbnsParam);
    if (!coAssigned) {
      return; // stop execution if API call does not work
    }
    for (const assignment of coAssigned) {
      const queryCatalog = await this.querySolrCheckSuggestion(assignment);
      if (this.hasSolrResults(queryCatalog)) {
        const result = queryCatalog["response"]["docs"][0];
        openSyllabus.formatAndListSuggestions(result, assignment); // write HTML
      }
    }
    window.bookcovers.onLoad(); // fill cover images
  },

  queryOspCoassignmentsApi: async function(isbnsParam) {
    try {
      const localRoute = "/browseld/osp_coassignments?isbns="; // internal API
      return await $.get(localRoute + isbnsParam);
    } catch (err) {
      return false;
    }
  },

  formatAndListSuggestions: function(result, isbns) {
    // Display the div if something is found
    $(".browse-syllabi").show(500);
    // Format author string if there is an author
    let authorNote = '';
    if (result["author_display"]) {
      const authorStringResponse = result["author_display"].split(",");
      const authorFirst2Elements = authorStringResponse.slice(0, 2).join();
      authorNote = ` by ${authorFirst2Elements}`;
    }
    // Set strings for title, href, and OCLC id
    const recomTitle = result["title_display"];
    const recomQuery = "/catalog?&q=" + isbns.join(" OR ");
    const oclcIdDisp = result["oclc_id_display"][0];
    // Compose the HTML that will be displayed on the page
    const htmlString = `
      <figure>
        <div class="imgframe">
          <a href="${recomQuery}">
            <img
              alt="${recomTitle}"
              class="bookcover"
              id="OCLC:${oclcIdDisp}"
              data-oclc="${oclcIdDisp}"
            />
          </a>
        </div>
        <figcaption>
          <a href="${recomQuery}">${recomTitle}</a>${authorNote}
        </figcaption>
      </figure>
    `;
    $("#recommended-list").append(htmlString);
  },

  // Feature: Display books related to a field of study
  // Checks books in a hidden table created by browseld/in_field.
  // Each book found in catalog is shown, until the end of a slice,
  // finishing with a "More" link to recurse for the next slice.

  showFoundBooksSlice: function(sliceSize, sliceNum) {
    // Prepare "More..." link at bottom of table
    const footerMoreBox = $("#footerMoreBox");
    $("#appendedMore").hide("slow", function() {
      $(this).remove();
    });
    // Iterate on current slice of list of books
    const fieldBookList = $("#fieldBookList tr");
    const bookListSlice = fieldBookList.slice(sliceNum - sliceSize, sliceNum);
    bookListSlice.each(function() {
      const row = $(this);
      row.find(".isbns").each(async function() {
        const isbns = JSON.parse($(this).text());
        const queryCatalog = await openSyllabus.querySolrCheckSuggestion(isbns);
        if (openSyllabus.hasSolrResults(queryCatalog)) {
          row.show(); // Show tr if it contains a book found in Solr catalog
        }
        // On last book in this slice, show "More..." link to run next slice
        if (row[0] === bookListSlice.last()[0]) {
          const nextSliceNum = sliceNum + sliceSize;
          footerMoreBox.append(`
            <button
              id="appendedMore"
              onClick="openSyllabus.showFoundBooksSlice(20,${nextSliceNum})"
            >More...</button>
          `);
        }
      });
    });
  },

  // Solr catalog checking functions used by both of above features
  // Used to check that a book is in the catalog before displaying it

  querySolrCheckSuggestion: async function(isbns) {
    const joinedIsbns = isbns.join(" OR ");
    const solrServer = $("#solr-server-url-data").html();
    const solrParams = "/select?&wt=json&rows=1&q=" + joinedIsbns;
    // Using JSONP to avoid CORS errors, but it prevents use of try/catch
    // https://forum.jquery.com/topic/jquery-ajax-with-datatype-jsonp-will-not-use-error-callback-if-request-fails
    // TODO: handle errors here
    return await $.ajax({
      url: solrServer + solrParams,
      type: "GET",
      dataType: "jsonp",
      jsonp: "json.wrf"
    });
  },

  // solrResults: result of querySolrCheckSuggestion
  hasSolrResults: function(solrResults) {
    const numFound = solrResults["response"]["numFound"];
    return numFound > 0;
  }

};

Blacklight.onLoad(function() {
  // Run syllabus coassignment code in item view
  $("body.catalog-show, body.blacklight-catalog-show").each(function() {
    openSyllabus.getCoassignedBooks();
  });
  // Run books in field code in syllabus browse
  $("body.browseld-in_field").each(function() {
    openSyllabus.showFoundBooksSlice(20, 20);
  });
});
