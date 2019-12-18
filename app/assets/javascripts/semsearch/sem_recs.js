var semRecs = {
    onLoad: function() {
      semRecs.init();
      semRecs.bindEventHandlers();
    },
    init:function() {
      var query =  $("#semantic-recs").attr("query");
      if(query != "") {
        semRecs.retrieveSubjectRecs(query);
      }
    },
    bindEventHandlers: function() {
    
    },
    retrieveSubjectRecs:function(query) {
      //AJAX call to solr
      var baseUrl = $("#semantic-recs").attr("base-url"); 
      //Timing out through controller, need to review why
      //var queryUrl = baseUrl + "sem/qalookup?q=" + query;
      var queryUrl = "https://lookup.ld4l.org/authorities/search/linked_data/locsubjects_ld4l_cache?q=" + query + "&maxRecords=4&context=true";

      $.ajax({
        url: queryUrl,
        type: "GET",
         dataType:'json',
        success : function(data) {              
            semRecs.displayData(data);
        }
      });
    },
    displayData: function(data) {     
      //Convert data to format required to display
      var htmlResults = [];
      //This may be better with mapping
      $.each(data, function(i, v) {
        var item = semRecs.processResult(v);
        if(item != "") {
          htmlResults.push(semRecs.processResult(v));
        }
      });
      
      $("#semantic-results").html(htmlResults.join(","));
    },
    processResult: function(item) {
      var htmlArray = [];
      if("uri" in item && "label" in item) {
        var label = item["label"];
        if("context" in item) {
          var mappedContext = semRecs.processContext(item["context"]);
          if("Broader" in mappedContext && "values" in mappedContext["Broader"]) {
            var broader = mappedContext["Broader"]["values"];
            $.each(broader, function(i, v) {
              htmlArray.push(v["label"]);
            });
            
          }
          if("Narrower" in mappedContext && "values" in mappedContext["Narrower"]) {
            var narrower = mappedContext["Narrower"]["values"];            
            $.each(narrower, function(i, v) {
              htmlArray.push(v["label"]);
            });

          }
        }
      }
      return htmlArray.join(" ,");
    },
    //Take array of context and return hash by property name
    processContext: function(context) {
      var mappedContext = {};
      $.each(context, function(i, v) {
        if("property" in v) {
          mappedContext[v["property"]] = v;
        }
      });
      return mappedContext;
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("catalog-index") >= 0 ) {
    semRecs.onLoad();
  }
});  