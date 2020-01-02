var fullTextSearch = {
  queryFullText: function() {
    var q = $('input#q').val();
    console.log(q);
    var googleBooksUrl = "https://www.googleapis.com/books/v1/volumes?q=" + q;
    fetch(googleBooksUrl)
      .then(response => response.json())
      .then(data => $("#full-text-results").append(JSON.stringify(data)))
    ;
  }
};
  
Blacklight.onLoad(function() {
  $('p#zero-results').each(function() {
    fullTextSearch.queryFullText();
  });
});
