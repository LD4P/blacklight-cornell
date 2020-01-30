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
      //Click on person will show contemporary info
      $("#semantic-recs").on("click", "span[role='heading'][uri]", function(e) {
        var uri = $(this).attr("uri");
        var label = $(this).attr("label");
        return semRecs.retrieveAuthorData(uri, label);
      });
      
      //Click on subject will populate subject card
      $("#semantic-recs").on("click", "li[role='subject'][uri]", function(e) {
        var uri = $(this).attr("uri");
        var label = $(this).attr("label");
        var context = $(this).data("context");
        semRecs.displaySubjectCard(uri, label, context);
      });
    },
    retrieveAndDisplay: function() {
      var query =  $("#semantic-recs").attr("query");
      if(query != "") {
        semRecs.retrieveSubjectRecs(query, semRecs.displaySubjectData);
        semRecs.retrievePeopleRecs(query, semRecs.displayPersonData);
        semRecs.retrieveAnnifRecs(query, semRecs.displaySubjectData);
        semRecs.processFacetValues(semRecs.displaySubjectData);
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
            processFunc(data, "semantic-results", "lcsh");
        }
      });
    },   
    retrieveAnnifRecs: function(query, processFunc) {
      //AJAX request to grab annif recommendations
      //Returns URIS and labels, append to section
      var annifUrl = semRecs.baseUrl + "annif/v1/projects/tfidf-en/suggest";
    
      var jqxhr = $.post( annifUrl, {text: query, limit: 10})
        .done(function(data) {
          if("results" in data) {
            processFunc(data["results"], "annif-results", "annif");
          }
          /*
          if("results" in data && data["results"].length) {      
            var results = data["results"];
            var html = "ANNIF:" + $.map(results, function(v,i) {return v.label}).join(", ");
            $("#annif-results").html(html);
          }*/
        });       
    },
    retrieveSubjectFacetValues:function() {
      var subjectFacetValues = $("#semantic-recs").attr("subject-facet");
      return JSON.parse(subjectFacetValues);
    },
    retrieveAuthorFacetValues:function() {
      var authorFacetValues = $("#semantic-recs").attr("author-facet");
      return JSON.parse(authorFacetValues);
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
  
   
    //Display subject results that can be clicked
    //Data: expected to be array of objects with at least URI and label
    //May include object for context
    displaySubjectData: function(data, elementId, source) {     
      //Convert data to format required to display
      var htmlResults = [];
      //This may be better with mapping
      var contextData = {};
      $.each(data, function(i, v) {
        if("label" in v) {
          var label = v["label"];
          var uri = "uri" in v? v["uri"]: null;
          //"class":"d-inline" will show these inline
          var props = {"label": label, "uri": uri, role:"subject", ldsource: source};
          if("context" in v) {
            var context = semRecs.retrieveContextRelationships(v);
            contextData[uri] = context;
          }
          htmlResults.push(semRecs.generateListItem(props));
        }
      });
       
      //$("#semantic-results").html("<ul class='list-unstyled'><li class='d-inline'>" + htmlResults.join("</li><li class='d-inline'>") + "</li></ul>");
      $("#" + elementId).html("<ul class='list-unstyled'>" + htmlResults.join(" ") + "</ul>");
      //Add data
      
      $("li[role='subject'][uri]").each(function(i,v) {
        var uri = $(this).attr("uri");
        $(this).data("context", contextData[uri]);
      });

    },
    //Display subject card
    //When subject from list is clicked, populate the subject card
    displaySubjectCard: function(uri, label, context) {
      var html = "<div class='card-body'>" + 
      "<h5 class='card-title'>" + label.replace(/--/g, " > ") + "</h5>";
    
      html += semRecs.generateContextDisplay(context);
      html += "</div>";
      $("#subject-card").html(html);
      
    },
    generateContextDisplay: function(context) {
      var html = "";
      var htmlArray = [];
      if(context && ("narrower" in context || "broader" in context)) {
        if("narrower" in context) {
          var narrower = context["narrower"];
          $.each(narrower, function(i, v) {
            htmlArray.push(v["label"]);
          });
          html += "Narrower: " + htmlArray.join(", ");
        }
        if("broader" in context) {
          htmlArray = [];
          var broader = context["broader"];
          $.each(broader, function(i, v) {
            htmlArray.push(v["label"]);
          });
          if(html != "") html += "<br/>";
          html += "Broader: " + htmlArray.join(", ");
        }
      }
      return html;
    },
    generateListItem: function(properties) {
      var html = "<li ";
      var label = properties["label"];
        var propsArray = [];
        $.each(properties, function(k,v) {
          //Find better way to handle "data" attributes
       
          propsArray.push(k + "=\"" + v + "\"");
          
        });
        html += propsArray.join(" ");
      
      html += ">" + label + "</li>";
      return html;
    },
    //return narrower and broader specifically from QA context
    retrieveContextRelationships: function(item) {
      var relationships = {};
      if("context" in item) {
        var mappedContext = semRecs.processContext(item["context"]);
        if("Broader" in mappedContext && "values" in mappedContext["Broader"]) {
          relationships["broader"] = mappedContext["Broader"]["values"];            
        }
        if("Narrower" in mappedContext && "values" in mappedContext["Narrower"]) {
          relationships["narrower"] = mappedContext["Narrower"]["values"];            
        }
      }
      return relationships;
    },
    //for printing out all narrower and broader for particular item given context
    /*
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
    },*/
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
  
    processFacetValues: function(processFunc) {
      var authors = semRecs.retrieveAuthorFacetValues();
      $("#semantic-person-facet-results").html(authors.join(", "));
      //Subject retrieval
      //This provides array of facet labels, but to get broader and narrower, we will need URIs
      var subjects = semRecs.retrieveSubjectFacetValues();
      var subjectData = $.map(subjects, function(v, i){
        return {label: v};
      });
      processFunc(subjectData, "semantic-facet-results", "facets");
      var subjectData = semRecs.addURIsForSubjectFacets(subjects);
     // $("#semantic-facet-results").html(subjects.join(", "));
      //Subject retrieval

    },
    addURIsForSubjectFacets: function(subjectLabels) {
      $.each(subjectLabels, function(i, v) {
        //Query FAST for URI
        semRecs.getFASTURI(v, semRecs.addFASTURI);
      });
    },
    addFASTURI: function(fastLabel, URI) {
      $("li[role='subject'][ldsource='facets'][label='" + fastLabel + "']").attr("uri", URI);
    },
    getFASTURI: function(label, callback) {
      var topicFacet = "suggest50";
      var searchURL = "http://fast.oclc.org/searchfast/fastsuggest?query=" + label + "&fl=" + topicFacet + "&queryReturn=id,*&rows=2&wt=json&json.wrf=?";
      var URI = null;
      $.getJSON(searchURL,function(data){
       if(data && "response" in data && "docs" in data["response"] && data["response"]["docs"].length) {
                 var firstResult = data["response"]["docs"][0];
                 if("id" in firstResult && topicFacet in firstResult) {
                    var rlabel = firstResult[topicFacet];
                    var rId = firstResult["id"];
                    //Get rid of fst
                    rId = rId.slice(3);
                    URI = rId.replace(/^[0]+/g,"");
                    callback(label, URI);
                 }
          }
      });
    }
    
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("catalog-index") >= 0 ) {
    semRecs.onLoad();
  }
});  