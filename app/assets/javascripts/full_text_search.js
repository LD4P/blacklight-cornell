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
      
    )
  },

  // Get a URL from a hidden div in the search page
  getSolrAddrs: function() {
    return $( "#solr-server-url-data" ).html();
  },

  // split query up by words and pass each to be synonymed
  findSynonyms: function() {
    var q = $('input#q').val();
    var words = q.split(" ");
    for (var word of words) {
      fullTextSearch.queryWord(word);
    }
  },

  queryWord: function (word) {
    var sparqlQuery = "SELECT * {" +
      "VALUES ?lemma1 {'"+ word +"'@en}" +
      "?lexeme1 wikibase:lemma ?lemma1 ." +
      "?lexeme1 ontolex:sense ?sense1 ." +
      "?sense1 wdt:P5973 ?sense2 ." +
      "?lexeme2 wikibase:lemma ?lemma2 ." +
      "?lexeme2 ontolex:sense ?sense2 ." +
    "}";
    var wikidataEndpoint = "https://query.wikidata.org/sparql?";
    $.ajax({
      url : wikidataEndpoint,
      headers : {
        Accept : 'application/sparql-results+json'
      },
      data : {
        query : sparqlQuery
      },
      success : function (data) {
        if (data && "results" in data && "bindings" in data["results"]) {
          var bindings = data["results"]["bindings"];
          if (bindings.length) {
            var binding = bindings[0];
            var synonym = binding["lemma2"]["value"]
            console.log(JSON.stringify(synonym));

          }
        }

      }
    });
  }
};
  
// Run code when the normal search process returns zero results
Blacklight.onLoad(function() {
  $('p#zero-results').each(function() {
    fullTextSearch.queryFullText();
    fullTextSearch.findSynonyms();
  });
});
