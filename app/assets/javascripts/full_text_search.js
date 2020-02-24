// If zero results are found in searching the catalog, this code runs the search
// in Google Books full-text search API. Any results are looked up in the catalog.

var fullTextSearch = {

  // Pass the user's query to full text search data sources
  queryFullText: function() {
    const query = $('input#q').val();
    fullTextSearch.queryGoogleBooks(query);
    fullTextSearch.queryHathiTrust(query);
  },

  queryGoogleBooks: function(query) {
    const googleBooksUrl = "https://www.googleapis.com/books/v1/volumes?q=" + query;
    fetch(googleBooksUrl)
      .then(response => response.json())
      .then(data => fullTextSearch.parseGoogleBooksData(data))
    ;
  },

  queryHathiTrust: function(query) {
    const hathiTrustPath = "./htrust/search?q=" + query;
    fetch(hathiTrustPath)
      .then(response => response.json())
      .then(data => fullTextSearch.parseHathiTrustData(data))
    ;
  },

  parseHathiTrustData: function(hathiTrustResults) {
    const subjects = hathiTrustResults['subjects'].map(x => x['label']);
    fullTextSearch.addSubjectsToView(subjects);
  },

  parseGoogleBooksData: function(googleBooksResults) {
    // Iterate over each Goole Books result and see if it's in the catalog
    googleBooksResults['items'].forEach(function (gbResult) {
      // Extract 2 ISBN types, add field name prefixes, put them in array
      var prefixedIsbns = gbResult['volumeInfo']['industryIdentifiers'].filter(function(i){
        return ['ISBN_10', 'ISBN_13'].includes(i['type'])
      }).map(x => 'isbnissn:' + x['identifier'])
      // Extract OCLC ids, add field name prefixes, put into array
      var prefixedOclcs = gbResult['volumeInfo']['industryIdentifiers'].filter(function(j){
        return ('OCLC' == j['identifier'].split(':')[0])
      }).map(y => 'number:' + y['identifier'].split(':')[1])
      // Merge the arrays of prefixed ISBN and OCLC identifiers
      var bookIdStrings = prefixedIsbns.concat(prefixedOclcs)      
      // Only search the catalog if there are one or more identifiers to search with
      if (bookIdStrings.length > 0) {
        // prepare Solr query string to search for a particular book
        var solrAddrs = fullTextSearch.getSolrAddrs();
        var BookQuery = bookIdStrings.join(' OR '); // boolean join the prefixed ids
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
      
    );
  },

  addSubjectsToView: function(subjects) {
    $("#sidebar").append(
      '<h3>Sujects</h3>' +
      '<ul style="list-style: none; padding: 0;">' +
        subjects.map(s => '<li><a href="/?f[fast_topic_facet][]='+s+'">'+s+'</a></li>').join('') +
      '<ul>'
    );
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

  queryWord: async function (word) {
    const sparqlQuery = "SELECT * {" +
      "VALUES ?lemma1 {'"+ word +"'@en}" +
      "?lexeme1 wikibase:lemma ?lemma1 ." +
      "?lexeme1 ontolex:sense ?sense1 ." +
      "?sense1 wdt:P5973 ?sense2 ." +
      "?lexeme2 wikibase:lemma ?synonym ." +
      "?lexeme2 ontolex:sense ?sense2 ." +
    "}"; // run a SPARQL query that gets synonymous lexemes
    const wikidataSparqlUrl = "https://query.wikidata.org/sparql?";
    const wikidataApiResult = await $.ajax({
      url:     wikidataSparqlUrl,
      headers: {Accept: 'application/sparql-results+json'},
      data:    {query: sparqlQuery}
    });
    return wikidataApiResult["results"]["bindings"].map(function (binding) {
      return binding['synonym']['value']
    }); // return an array of synonym strings
  },

  // find the first search hint with catalog results
  narrowSuggestions: async function (hints) {
    const solrAddress = fullTextSearch.getSolrAddrs();
    for (const hint of hints) {
      const solrUrl = solrAddress + "/select?&wt=json&rows=0&q=" + hint
      const solrResponse = await $.ajax({
        url: solrUrl,
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'json.wrf'
      });
      const numFound = solrResponse["response"]["numFound"]
      if (numFound > 0) {
        return hint;
        break
      }
    }
  },

  addSuggestionsToView: function (hint) {
    $("#main-container").prepend(
      'Did you mean <a href="?q='+hint+'">'+hint+'</a>?'
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
