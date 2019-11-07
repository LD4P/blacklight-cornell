// This code displays a timeline view of subject era facets

// This function places a request to each WorldCat URI in the era_browse view
var getSubjectEraTimeline = {
  onLoad: function() {
    $('#subject-eras tr').each(function(){   // for each row in the table
      $(this).find('.uri').each(function() { // get the element that holds
        var worldcatUri = $(this).text();   // the WorldCat URI
        
        $.ajax({ // The problem is, it's XML not JSONP.
          url: worldcatUri,
          type: 'GET',
          dataType: 'jsonp',
          jsonp: 'json.wrf', // avoid CORS and CORB errors
          complete: function(response) {
            console.log("Hey.....!")
          }
        });

      });
    });
  }

};

Blacklight.onLoad(function() {
  // Run subject era facet browse code in /browseld/eras
  $('body.browseld-eras').each(function() {
    getSubjectEraTimeline.onLoad();
  });
});
