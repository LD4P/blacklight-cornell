var semRecs = {
    onLoad: function() {
      semRecs.init();
      semRecs.bindEventHandlers();
      semRecs.retrieveAndDisplay();
    },
    init:function() {
      this.baseUrl =  $("#semantic-recs").attr("base-url");      
    },
    bindEventHandlers: function() {
      $("#semantic-recs").on("click", "span[role='heading'][uri]", function(e) {
        var uri = $(this).attr("uri");
        var label = $(this).attr("label");
        return semRecs.retrieveAuthorData(uri, label);
      });
    },
    retrieveAndDisplay: function() {
      var query =  $("#semantic-recs").attr("query");
      if(query != "") {
        semRecs.retrieveSubjectRecs(query, semRecs.displayData);
        semRecs.retrievePeopleRecs(query, semRecs.displayPersonData);
        semRecs.retrieveAnnifRecs(query);
        semRecs.processFacetValues();
      }
    },
    //All data retrieval methods
    //DAVE's LCSH lookup - matches based on string matching against preferred and variant labels
    //Returns data with uris and labels as well as extended context for subject headings
    retrieveSubjectRecs:function(query, processFunc) {
      //AJAX call to solr
      //var baseUrl = $("#semantic-recs").attr("base-url"); 
      //Timing out through controller, need to review why
      //var queryUrl = baseUrl + "sem/qalookup?q=" + query;
      var queryUrl = "https://lookup.ld4l.org/authorities/search/linked_data/locsubjects_ld4l_cache?q=" + query + "&maxRecords=8&context=true";

      $.ajax({
        url: queryUrl,
        type: "GET",
         dataType:'json',
        success : function(data) {              
            processFunc(data);
        }
      });
    },
    //LCNAF RWO lookup 
    retrievePeopleRecs:function(query, processFunc) {
      //AJAX call to solr
      var baseUrl = $("#semantic-recs").attr("base-url"); 
      //Timing out through controller, need to review why
      //var queryUrl = baseUrl + "sem/qalookup?q=" + query;
      var queryUrl = "https://lookup.ld4l.org/authorities/search/linked_data/locnames_rwo_ld4l_cache/person?q=" + query + "&maxRecords=8";

      $.ajax({
        url: queryUrl,
        type: "GET",
         dataType:'json',
        success : function(data) {              
            processFunc(data);
        }
      });
    }, 
    //Display methods
  
   
    //Display subject results
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
       
      $("#semantic-results").html("<ul class='list-unstyled'><li class='d-inline'>" + htmlResults.join("</li><li class='d-inline'>") + "</li></ul>");
    },
    processResult: function(item) {
      var htmlArray = [];
      if("uri" in item && "label" in item) {
        var label = item["label"];
        htmlArray.push(label);
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
      return htmlArray.join(", ");
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
    },
    //Get people info
    displayPersonData: function(data) {     
      //Convert data to format required to display
      var htmlResults = [];
      //This may be better with mapping
      $.each(data, function(i, v) {
        var item = semRecs.processPersonResult(v);
        if(item != "") {
          htmlResults.push(semRecs.processPersonResult(v));
        }
      });
      
      $("#semantic-person-results").html("<ul><li>" + htmlResults.join("</li><li>") + "</li></ul>");
    },
    processPersonResult: function(item) {
      var htmlArray = [];
      if("uri" in item && "label" in item) {
        var label = item["label"];
        var uri = item["uri"];
        //May need to pass along uri as well to get FAST facet link
        var generateFacetLink = "<a href='" + semRecs.generateFacetLink(label) + "'>" + label + "</a>";
        htmlArray.push(generateFacetLink + "<span role='heading' uri='" + uri + "' label='" + label + "'>&nbsp;Related</span><div role='contemporaries' uri='" + uri + "'></div>");      
      }
      return htmlArray.join(", ");
    },
    //Copied partially from browseAuthor, should be refactored more
    retrieveDataFromAuthorIndex:function(uri, startYear, endYear, callback) {
      //AJAX call to solr
      var baseUrl = $("#semantic-recs").attr("base-url"); 
      var querySolr = baseUrl + "proxy/authorbrowse";
      if(startYear && endYear) {
        
        var range = "[" + startYear + " TO " + endYear + "]";
        querySolr += "?q=(wd_birthy_i:" + range + " OR ld_birthy_i:" + range + ") AND (wd_deathy_i:" + range + " OR ld_deathy_i:" + range + ")&sort=wd_birthy_i asc&rows=10";
      }
      $.ajax({
        "url": querySolr,
        "type": "GET",
        "success" : function(data) {              
          callback(uri, data);
        }
      });
    },
    //Could also get info from loc but for now let's just use this
    retrieveAuthorData: function(uri, label) {
      //Get author from author index and get birth and death info if it exists
      //AJAX call to solr
      var baseUrl = $("#semantic-recs").attr("base-url"); 
      var querySolr = baseUrl + "proxy/authorlookup?q=" + label;
     
      $.ajax({
        "url": querySolr,
        "type": "GET",
        "success" : function(data) {              
          if("response" in data && "docs" in data["response"]) {
            var docs = data["response"]["docs"];
            if(docs.length) {
              var doc = docs[0];
              var birthyear = null, deathyear = null;
              if("wd_birthy_i" in doc) {
                birthyear = doc["wd_birthy_i"];
              } else if("loc_birthy_i" in doc) {
                birthyear = doc["loc_birthy_i"];
              }
              if("wd_deathy_i" in doc) {
                deathyear = doc["wd_deathy_i"];
              } else if("loc_deathy_i" in doc) {
                deathyear = doc["loc_deathy_i"];
              }
              if(birthyear != null && deathyear != null) {
                semRecs.retrieveDataFromAuthorIndex(uri, birthyear, deathyear, semRecs.addContemporaries);

              }
            }
          }
        }
      });
    },
    generateFacetLink: function(label) {
      var baseUrl = $("#semantic-recs").attr("base-url"); 
      //this isn't preserving the entire query and search parameters but a particular person can be explored
      return baseUrl + "?f[author_facet][]=" + label;
    },
    //
    addContemporaries: function(uri, data) {
      var htmlArray = [];
      if("response" in data && "docs" in data["response"]) {
        var docs = data["response"]["docs"];
        $.each(docs, function(i,v) {
          if("authlabel_s" in v) {
            htmlArray.push(v["authlabel_s"]);
          }
        });
      }
      $("div[role='contemporaries'][uri='" + uri + "']").html(htmlArray.join(", "));
    },
    retrieveAuthorFacetValues:function() {
      var authorFacetValues = $("#semantic-recs").attr("author-facet");
      return JSON.parse(authorFacetValues);
    },
    retrieveSubjectFacetValues:function() {
      var subjectFacetValues = $("#semantic-recs").attr("subject-facet");
      return JSON.parse(subjectFacetValues);
    },
    processFacetValues: function() {
      var authors = semRecs.retrieveAuthorFacetValues();
      var subjects = semRecs.retrieveSubjectFacetValues();
      $("#semantic-facet-results").html(subjects.join(", "));
      $("#semantic-person-facet-results").html(authors.join(", "));

    },
    retrieveAnnifRecs: function(query) {
      //AJAX request to grab annif recommendations
      //Returns URIS and labels, append to section
      var annifUrl = semRecs.baseUrl + "annif/v1/projects/tfidf-en/suggest";
    
      var jqxhr = $.post( annifUrl, {text: query, limit: 10})
        .done(function(data) {
          if("results" in data && data["results"].length) {      
            var results = data["results"];
            var html = "ANNIF:" + $.map(results, function(v,i) {return v.label}).join(", ");
            $("#annif-results").html(html);
          }
        })
        
       
    }
    
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("catalog-index") >= 0 ) {
    semRecs.onLoad();
  }
});  