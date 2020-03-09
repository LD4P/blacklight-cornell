// If zero results are found in searching the catalog, this code runs the search
// in Google Books full-text search API. Any results are looked up in the catalog.

const fullTextSearch = {

  // Pass the user's query to full text search data sources
  queryFullText: async function() {
    const query = $("input#q").val();

    const gbResult = await this.queryGoogleBooks(query);
    const htResult = await this.queryHathiTrust(query);
    
    const gbParsed = await this.parseGoogleBooksData(gbResult);
    const htParsed = await this.parseHathiTrustData(htResult);

    // Fill in book cover images
    setTimeout(function(){ window.bookcovers.onLoad() }, 300);
  },

  queryGoogleBooks: async function(query) {
    const googleBooksUrl = "https://www.googleapis.com/books/v1/volumes?q=" + query;
    let data = await fetch(googleBooksUrl)
      .then(response => response.json())
      .then(data => data)
    ;
    return data;
  },

  queryHathiTrust: async function(query) {
    const hathiTrustPath = "./htrust/search?q=" + query;
    let data = await fetch(hathiTrustPath)
      .then(response => response.json())
      .then(data => data)
    ;
    return data;
  },

  parseHathiTrustData: async function(hathiTrustResults) {
    // HathiTrust API returns subject strings mostly similar to LCSH
    if (hathiTrustResults["subjects"]) {
      const subjects = hathiTrustResults["subjects"].map(x => x["label"]);
      fullTextSearch.addSubjectsToView(subjects);
    }
    // HathiTrust also has catalog results
    if (hathiTrustResults["results"]) {
      for (const htResult of hathiTrustResults["results"]) {
        // Extract OCLC and ISBN ids, add field name prefixes, put into array
        const bookIdStrings = [];
        for (const keyVal of htResult["ids"]) {
          if ("OCLC" in keyVal) {
            bookIdStrings.push("number:"+keyVal["OCLC"]);
          }
          if ("ISBN" in keyVal) {
            bookIdStrings.push("isbnissn:"+keyVal["ISBN"]);
          }
        }
        // Only search the catalog if there are one or more identifiers to search with
        if (bookIdStrings.length > 0) {
          // run the Solr query to check catalog for the book
          const solrResponse = await fullTextSearch.checkSolr(bookIdStrings);
          if (fullTextSearch.hasSolrResults(solrResponse)) {
            const snippet = htResult["title"]
            const from = "Result from HathiTrust"
            fullTextSearch.addBookToView(solrResponse, snippet, from);
          }
        }
      }
    }
  },

  parseGoogleBooksData: async function(googleBooksResults) {
    if (googleBooksResults["items"]) {
      // Iterate over each Goole Books result and see if it"s in the catalog
      googleBooksResults["items"].forEach(async function (gbResult) {
        // Extract 2 ISBN types, add field name prefixes, put them in array
        const prefixedIsbns = gbResult["volumeInfo"]["industryIdentifiers"].filter(function(i){
          return ["ISBN_10", "ISBN_13"].includes(i["type"])
        }).map(x => "isbnissn:" + x["identifier"]);
        // Extract OCLC ids, add field name prefixes, put into array
        const prefixedOclcs = gbResult["volumeInfo"]["industryIdentifiers"].filter(function(j){
          return ("OCLC" == j["identifier"].split(":")[0])
        }).map(y => "number:" + y["identifier"].split(":")[1]);
        // Merge the arrays of prefixed ISBN and OCLC identifiers
        const bookIdStrings = prefixedIsbns.concat(prefixedOclcs);  
        // Only search the catalog if there are one or more identifiers to search with
        if (bookIdStrings.length > 0) {
          // run the Solr query to check catalog for the book
          const solrResponse = await fullTextSearch.checkSolr(bookIdStrings);
          if (fullTextSearch.hasSolrResults(solrResponse)) {
            const excerpt = gbResult["searchInfo"]["textSnippet"]
            const from = "Excerpt from Google Books"
            fullTextSearch.addBookToView(solrResponse, excerpt, from);
          }
        }
      });
    }
  },

  // bookIdStrings: an array of OCLCs or ISBNs
  checkSolr: async function(bookIdStrings) {
    const bookQuery = bookIdStrings.join(' OR ');
    const solrAddrs = fullTextSearch.getSolrAddrs();
    const solrQuery = solrAddrs + "/select?wt=json&rows=1&q=" + bookQuery;
    return await $.ajax({
      url: solrQuery,
      type: "GET",
      dataType: "jsonp",
      jsonp: "json.wrf", // avoid CORS and CORB errors
    });
  },

  // solrResults: result of checkSolr function
  hasSolrResults: function(solrResults) {
    const numFound = solrResults["response"]["numFound"];
    return numFound > 0;
  },

  // Add the new search results to the page
  addBookToView: function(solrResponse, snippet, from) {
    const title = solrResponse["response"]["docs"][0]["title_display"]
    const idNum = solrResponse["response"]["docs"][0]["id"]
    const cover = solrResponse["response"]["docs"][0]["oclc_id_display"]
    const route = "/catalog/" + idNum
    $("#full-text-results").append(`
      <div style="clear: left;">
      <div style="float: left; padding: 0 15px 10px 0;"><img class="bookcover" id="OCLC:${cover}" data-oclc="${cover}" /></div>
      <p><a href="${route}">${title}</a>
      <br>${snippet}
      <br><span style="font-size: small;">${from}</span>
      </p></div> 
    `);
  },

  // Add subject links to the page from an array of strings
  addSubjectsToView: function(subjects) {
    $("#sidebar").append(`
      <h3>Subjects</h3>
      <ul style="list-style: none; padding: 0;">
        ${subjects.map(s => '<li><a href="/?search_field=subject_cts&q='+s+'">'+s+'</a></li>').join('')}
      <ul>
    `);
  },

  // Get a URL from a hidden div in the search page
  getSolrAddrs: function() {
    return $( "#solr-server-url-data" ).html();
  },

  // split query up by words, pass each to be synonymed, write one to document
  findSynonyms: async function() {
    const query = $('input#q').val();
    const words = query.split(" ");
    const hints = new Array
    for (const [index, word] of words.entries()) {
      const synonyms = await fullTextSearch.queryWord(word);
      for (const synonym of synonyms) {
        newWords = [...words]
        newWords[index] = synonym
        hints.push(newWords.join(' '))
      }
    }
    const topHint = await fullTextSearch.narrowSuggestions(hints);
    if (topHint !== undefined) {
      fullTextSearch.addSuggestionsToView(topHint);
    }
  },

  // Check Wikidata for synonyms for given word
  queryWord: async function (word) {
    // SPARQL query that gets synonymous lexemes, explained at
    // https://johnskinnerportfolio.com/blog/lexemes.html
    const sparqlQuery = `SELECT * {
      VALUES ?lemma1 {'${word}'@en}
      ?lexeme1 wikibase:lemma ?lemma1 .
      ?lexeme1 ontolex:sense ?sense1 .
      ?sense1 wdt:P5973 ?sense2 .
      ?lexeme2 wikibase:lemma ?synonym .
      ?lexeme2 ontolex:sense ?sense2 .
    }`;
    const wikidataSparqlUrl = "https://query.wikidata.org/sparql?";
    const wikidataApiResult = await $.ajax({
      url:     wikidataSparqlUrl,
      headers: {Accept: "application/sparql-results+json"},
      data:    {query: sparqlQuery}
    });
    return wikidataApiResult["results"]["bindings"].map(function (binding) {
      return binding["synonym"]["value"]
    }); // return an array of synonym strings
  },

  // find the first search hint with catalog results
  narrowSuggestions: async function (hints) {
    const solrAddress = fullTextSearch.getSolrAddrs();
    for (const hint of hints) {
      const solrUrl = solrAddress + "/select?&wt=json&rows=0&q=" + hint
      const solrResponse = await $.ajax({
        url: solrUrl,
        type: "GET",
        dataType: "jsonp",
        jsonp: "json.wrf"
      });
      const numFound = solrResponse["response"]["numFound"]
      if (numFound > 0) {
        return hint;
        break
      }
    }
  },

  // Show synonym to user as search suggestion
  addSuggestionsToView: function (hint) {
    $("#main-container").prepend(
      `Did you mean <a href="?q=${hint}">${hint}</a>?'`
    );
  }

};

// Run code when the normal search process returns zero results
Blacklight.onLoad(function() {
  $('p#zero-results').each(function() {
    fullTextSearch.queryFullText();
    fullTextSearch.findSynonyms();
  });
});