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
      
      //Click on subject will populate subject card
      $("#semantic-recs").on("click", "li[role='subject'][uri]", function(e) {
        var uri = $(this).attr("uri");
        var label = $(this).attr("label");
        var context = $(this).data("context");
        var ldsource = $(this).attr("ldsource");
        semRecs.displaySubjectCard(uri, label, context, ldsource);
        //If the source is LC
        if(ldsource == "lcsh" || ldsource == "annif") {
        //Also retrieve subject info from LCSH to include
          semRecs.retrieveInfoForLCSH(uri);
        }
        if(ldsource == "facet") {
          //USE the FAST URI to get Wikidata information
          semRecs.retrieveInfoForFAST(uri);
        }
        //Set color to active
        $("li[role='subject']").removeClass("active");
        $(this).addClass("active");
      });
      
      //Click on person will populate person card
      $("#semantic-recs").on("click", "li[role='person'][uri]", function(e) {
        var uri = $(this).attr("uri");
        var label = $(this).attr("label");
        var context = $(this).data("context");
        var ldsource = $(this).attr("ldsource");
        semRecs.displayPersonCard(uri, label, context, ldsource);
        //If the source is LC
        if(ldsource == "lcnaf" || ldsource == "author facet") {
        //Also retrieve additional author data such as contemporary info from the index
          semRecs.retrieveAuthorData(uri, label);
          //Retrieve Wikidata info where available
        }
        if(ldsource == "author facet") {
            //Use LCNAF URI to get Wikidata info
           semRecs.getWikidataInfoForAuthor(uri, semRecs.displayWikidataInfoForAuthor);
        }
        //Set color to active
        $("li[role='person']").removeClass("active");
        $(this).addClass("active");
      });
    },
    retrieveAndDisplay: function() {
      var query =  $("#semantic-recs").attr("query");
      if(query != "") {
        semRecs.retrieveSubjectRecs(query, semRecs.displaySubjectData);
        semRecs.retrievePeopleRecs(query, semRecs.displayPersonData);
        semRecs.retrieveAnnifRecs(query, semRecs.displaySubjectData);
        semRecs.processFacetValues(semRecs.displaySubjectData, semRecs.displayPersonData);
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
      //Asking without context to check for performance improvement
      var queryUrl = "https://lookup.ld4l.org/authorities/search/linked_data/locsubjects_ld4l_cache?q=" + query + "&maxRecords=8";

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
    //For a particular LCSH subject URI, get related information and display
    retrieveInfoForLCSH: function(uri) {
      semRecs.getLCSHRelationships(uri, semRecs.addSubjectInfoToCard);
    },
    retrieveInfoForFAST: function(uri) {
      //The problem with using auth lookup is it returns json (which is great) but it doesn't return labels for broader and narrower
      var url = "https://lookup.ld4l.org/authorities/fetch/linked_data/oclcfast_ld4l_cache?format=jsonld&uri=" + uri;
      //var url = "https://lookup.ld4l.org/authorities/show/linked_data/oclcfast_direct/" + id;
      //var url = uri + ".rdf.xml";
      $.ajax({
        "url": url,
        "type": "GET",
        "success" : function(data) {              
          var relationships = semRecs.extractFASTRelationships(uri, data);
          console.log(relationships);
          callback(relationships);
        }
      });
    },
    extractFASTRelationships:function(uri, data) {
      var broaderURIs = [];
      var narrowerURIs = [];
      var closeURIs = [];
      var narrowerProperty = "skos:narrower";
      var broaderProperty = "skos:broader";
      var closeProperty = "skos:related";
      var labelProperty = "skos:prefLabel";
      //Data = @context, @graph = [ {@id: id..., etc.]
      var dataHash = semRecs.processLCSHJSON(data["@graph"]);
      narrowerURIs = semRecs.processFASTEntityJSON(dataHash, narrowerProperty, uri);
      broaderURIs = semRecs.processFASTEntityJSON(dataHash, broaderProperty, uri);
      closeURIs = semRecs.processFASTEntityJSON(dataHash, closeProperty, uri);

      var entity = dataHash[uri];
      var label = entity[labelProperty];
      return {uri:uri, dataHash: dataHash, label: label, narrowerURIs: narrowerURIs, broaderURIs: broaderURIs, closeURIs: closeURIs};      
    },
    processFASTEntityJSON: function(dataHash, property, uri) {
      var returnURIs = [];
      var entity = dataHash[uri];
      if(property in entity) {
        var relationship = entity[property];
        if(!Array.isArray(relationship)) {
          relationship = [entity[property]];
        }      
        $.each(relationship, function (i,v) {
          var uri = v["@id"];
          var uentity = dataHash[uri];
          var label = uentity["skos:prefLabel"];
          returnURIs.push({uri:uri, label:label});
        });
      }
      return returnURIs;
    },
    addURIsForSubjectFacets: function(subjectLabels) {
      $.each(subjectLabels, function(i, v) {
        //Query FAST for URI
        semRecs.getFASTURI(v, semRecs.addFASTURI);
      });
    },
   
    addFASTURI: function(fastLabel, URI) {
      $("li[role='subject'][ldsource='facet'][label='" + fastLabel + "']").attr("uri", URI);
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
                    callback(label, "http://id.worldcat.org/fast/" + URI);
                 }
          }
      });
    },
   
    //copied from browseLd
    getLCSHRelationships: function(uri, callback) {
      $.ajax({
        "url": uri + ".jsonld",
        "type": "GET",
        "success" : function(data) {              
          var relationships = semRecs.extractLCSHRelationships(uri, data);
          callback(relationships);
        }
      });
    },
    extractLCSHRelationships: function(uri, data) {
      var dataHash = semRecs.processLCSHJSON(data);
      var entity = dataHash[uri];
      var narrowerProperty = "http://www.loc.gov/mads/rdf/v1#hasNarrowerAuthority";
      var broaderProperty = "http://www.loc.gov/mads/rdf/v1#hasBroaderAuthority";
      var closeProperty = "http://www.loc.gov/mads/rdf/v1#hasCloseExternalAuthority";
      var exactMatchProperty = "http://www.loc.gov/mads/rdf/v1#hasExactExternalAuthority";
      var labelProperty = "http://www.w3.org/2004/02/skos/core#prefLabel";
      var narrowerURIs = [];
      var broaderURIs = [];
      var closeURIs = [];
      var exactMatchURIs = [];

      if(narrowerProperty in entity) {
        narrowerURIs = entity[narrowerProperty];
      }
      if(broaderProperty in entity) {
        broaderURIs = entity[broaderProperty];
      }
      if(closeProperty in entity) {
        closeURIs = entity[closeProperty];
      }
      if(exactMatchProperty in entity) {
        exactMatchURIs = entity[exactMatchProperty];
      }
    
      var label = entity[labelProperty][0]["@value"];
      return {uri:uri, dataHash: dataHash, label: label, narrowerURIs: narrowerURIs, broaderURIs: broaderURIs, closeURIs: closeURIs, exactMatchURIs: exactMatchURIs};
    }, 
    //generate hash based on uris of ids to provide cleaner access given URI
    processLCSHJSON: function(jsonArray) {
      var len = jsonArray.length;
      var l;
      var jsonObj;
      var jsonHash = {};
      for(l = 0; l < len; l++) {
        jsonObj = jsonArray[l];
        var id = jsonObj["@id"];
        jsonHash[id] = jsonObj;
      }
      return jsonHash;
    },
    //Author/people information information
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
            processFunc(data, "semantic-person-results", "lcnaf");
        }
      });
    }, 
    //Copied partially from browseAuthor, should be refactored more
    retrieveDataFromAuthorIndex:function(uri, startYear, endYear, callback) {
      //AJAX call to solr
      var querySolr = semRecs.baseUrl + "proxy/authorbrowse";
      if(startYear && endYear) {
        
        var range = "[" + startYear + " TO " + endYear + "]";
        querySolr += "?q=(wd_birthy_i:" + range + " OR ld_birthy_i:" + range + ") AND (wd_deathy_i:" + range + " OR ld_deathy_i:" + range + ")&sort=wd_birthy_i asc&rows=5";
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
     
      var querySolr = semRecs.baseUrl + "proxy/authorlookup?q=" + label;
     
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
    addURIsForAuthorFacets: function(authorLabels) {
      $.each(authorLabels, function(i, v) {
        //Query FAST for URI
        semRecs.queryLCNAFSuggestions(v, semRecs.addPersonFacetURI);
      });
    },
    //LC lookup specifics
    //Get LCNAF suggestion based on label, copied from knowledge panel work
    queryLCNAFSuggestions: function(label, callback) {   
      var lookupURL = "http://id.loc.gov/authorities/names/suggest/?q=" + label + "&rdftype=PersonalName" + "&count=1";
      $.ajax({
        url : lookupURL,
        dataType : 'jsonp',
        success : function (data) {
          urisArray = semRecs.parseLOCSuggestions(data);
          if (urisArray && urisArray.length) {
            var locURI = urisArray[0]; 
            callback(label, locURI);
          }
        }
      });
    },
    
    //Add LCNAF URI for people
    addPersonFacetURI: function(label, uri) {
      $("li[role='person'][ldsource='author facet'][label='" + label + "']").attr("uri", uri);

    },
    // function to process results from LOC lookup

    parseLOCSuggestions: function(suggestions) {
      var urisArray = [];
      if (suggestions && suggestions[1] !== undefined) {
        for (var s = 0; s < suggestions[1].length; s++) {
          // var l = suggestions[1][s];
          var u = suggestions[3][s];
          urisArray.push(u);
        }
      }
      return urisArray;

    },
    // Query wikidata
    //Do a combined query for image (optional) and some set of influences
    getWikidataInfoForAuthor: function(LOCURI, callback) {
      // Given loc uri, can you get matching wikidata entities
      var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var localname = semRecs.getLocalLOCName(LOCURI);
      var sparqlQuery = "SELECT ?entity ?entityLabel ?image WHERE {?entity wdt:P244 \"" + localname + "\" . " 
        + " OPTIONAL {?entity wdt:P18 ?image . }"
        + " SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}";        
        
      $.ajax({
        url : wikidataEndpoint,
        headers : {
          Accept : 'application/sparql-results+json'
        },
        data : {
          query : sparqlQuery
        },
        success : function (data) {
          var wikidataParsedData = semRecs.parseWikidataSparqlResults(data);
          callback(LOCURI, wikidataParsedData);
        }

      });

    },

    // function to parse sparql query results from wikidata, getting URI
    // and author name
    parseWikidataSparqlResults: function(data) {
      output = {}
      if (data && "results" in data && "bindings" in data["results"]) {
        var bindings = data["results"]["bindings"];
        if (bindings.length) {
          var binding = bindings[0];
          if ("entity" in binding && "value" in binding["entity"]) {
            output.uriValue = binding["entity"]["value"];
          }
          if ("entityLabel" in binding
              && "value" in binding["entityLabel"]) {
            output.authorLabel = binding["entityLabel"]["value"];
          }
          if ("image" in binding && "value" in binding["image"] 
          && binding["image"]["value"]) {
            output.image = binding["image"]["value"];
          }
        }
      }
      return output;
    },

    // function to get localname from LOC URI
    getLocalLOCName:function (uri) {
      // Get string right after last slash if it's present
      // TODO: deal with hashes later
      return uri.split("/").pop();
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
          var props = {"label": label, "uri": uri, role:"subject", ldsource: source, class: "list-group-item p-0 mx-0 mb-1 mt-0 border-0"};
          if("context" in v) {
            var context = semRecs.retrieveContextRelationships(v);
            contextData[uri] = context;
          }
          htmlResults.push(semRecs.generateListItem(props));
        }
      });
       
      //$("#semantic-results").html("<ul class='list-unstyled'><li class='d-inline'>" + htmlResults.join("</li><li class='d-inline'>") + "</li></ul>");
      $("#" + elementId).html("<ul class='list-group'>" + htmlResults.join(" ") + "</ul>");
      //Add data
      
      $("li[role='subject'][uri]").each(function(i,v) {
        var uri = $(this).attr("uri");
        $(this).data("context", contextData[uri]);
      });
      
    },
    //Display subject card
    //When subject from list is clicked, populate the subject card
    displaySubjectCard: function(uri, label, context, ldsource) {
      var labelLink = semRecs.generateLabelLink(ldsource, uri, label.replace(/--/g, " > "));
      var html = "<h5 class='card-subtitle'>" + labelLink + "</h5>";
    
      html += "<div class='card-text' role='context' uri='" + uri + "'>" + semRecs.generateContextDisplay(context) + "</div>";
      html += "<div class='card-text'>Source: " + ldsource + "</div>";
      $("#subject-card").html(html);

    },
    generateLabelLink: function(ldsource, uri, label) {
      if(ldsource == "annif" || ldsource == "lcsh") {
        var locLink = semRecs.generateLOCLink(uri);
        var catalogLink = semRecs.generateCatalogLCSHLink(label);
        return catalogLink + " " + locLink;
      } 
      if(ldsource == "lcnaf") {
        var locLink = semRecs.generateLOCLink(uri);
        //Assuming LCNAF author facet will work the same as what is used in the facet field
        var authorFacet =  semRecs.generateFacetLink(label);
        return authorFacet + " " + locLink;

      }
      if(ldsource == "facet") {       
        return semRecs.generateTopicFacetLink(label);
      }
      if(ldsource == "author facet") {
        return semRecs.generateFacetLink(label);
      }
      return label;
    },
    generateTopicFacetLink: function(label) {
      var facetLink = semRecs.baseUrl + "?f[fast_topic_facet][]=" + label + "&q=&search_field=all_fields";
      return "<a href='" + facetLink + "'>" + label + "</a>";
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
    //Add LCSH URI info
    addSubjectInfoToCard: function(relationships) {
      var requestingURI = relationships.uri;
      var narrowerURIs = relationships.narrowerURIs;
      var broaderURIs = relationships.broaderURIs;
      var exactMatchURIs = relationships.exactMatchURIs;
      var closeURIs = relationships.closeURIs;
      var narrowerDisplay = semRecs.processRelatedURIs(narrowerURIs, relationships.dataHash);
      var broaderDisplay = semRecs.processRelatedURIs(broaderURIs, relationships.dataHash);
      var exactDisplay = semRecs.displayWikidataLink(exactMatchURIs, relationships.dataHash);
      var closeDisplay = semRecs.displayWikidataLink(closeURIs, relationships.dataHash);
     //Get card part that corresponds and add info
      var display = "";
      
      
      
      if(exactDisplay != "") {
        display += exactDisplay + "<br>";
      }
      if(closeDisplay != "") {
        display += "Close: " + closeDisplay + "<br>";        
      }
      if(broaderDisplay != "") {
        display += "Broader: " + broaderDisplay + "<br>";        
      }
      if(narrowerDisplay != "") {
        display += "Narrower: " + narrowerDisplay + "<br>";        
      }
      $("div[role='context'][uri='" + requestingURI + "']").append(display);

    },
    displayWikidataLink: function(rArray, dataHash) {
      //check for any URLs that start with Wikidata 
      var wikidataURIs = [];
      var wikidataPrefix = "http://www.wikidata.org/";
      $.each(rArray, function(i,v){
        var uri = v["@id"];
        if(uri.startsWith(wikidataPrefix)) {
          wikidataURIs.push(v);
        }
      });
      return semRecs.processRelatedURIs(wikidataURIs, dataHash);
    },
    processRelatedURIs : function(rArray, dataHash) {
      var display = [];
      var prefLabel = "http://www.w3.org/2004/02/skos/core#prefLabel";
      
      //Sort array by label
      //First generate array of objects with just uri and label
      var rHashes = rArray.map(function(v) {
        var uri = v["@id"];
        return {"uri": uri, "label": dataHash[uri][prefLabel][0]["@value"]};
      });
      rHashes.sort(function (a, b) {
        return (a.label > b.label) ? 1: ((a.label < b.label) ? -1: 0)
      });
      $.each(rHashes, function(i,v) {
        display.push(semRecs.generateRelatedSubject(v.uri,v.label));
      });
     
      return display;
    },
    generateRelatedSubject: function(uri, label) {
      var wikidataPrefix = "http://www.wikidata.org/";

      if(uri.startsWith(wikidataPrefix)) {
        return label + " " + semRecs.generateWikidataLink(uri);
      } else {
        return semRecs.generateCatalogLCSHLink(label);
      }
    },
    //copied from browseLd, generate LOC link
    generateLOCLink: function(uri) {
      var locHtml = "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See Library of Congress' href='" + uri + ".html'><img src='/assets/loc.png' /></a>";
      return locHtml;
    },
    generateCatalogLCSHLink: function(label) {
      return "<a href='" + semRecs.baseUrl + "?q=" + label + "&search_field=subject_cts'>" + label + "</a>";
    },
    generateWikidataLink: function(wikidataURI) {
      return "<a href='" + wikidataURI + "' target='_blank' class='data-src'><img src='/assets/wikidata.png' /></a>";
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
  
    generateFacetLink: function(label) {
      var baseUrl = $("#semantic-recs").attr("base-url"); 
      //this isn't preserving the entire query and search parameters but a particular person can be explored
      var authorFacet = baseUrl + "?f[author_facet][]=" + label;
      return "<a href='" + authorFacet + "'>" + label + "</a>";
    },
    //
    addContemporaries: function(uri, data) {
      var htmlArray = [];
      if("response" in data && "docs" in data["response"]) {
        var docs = data["response"]["docs"];
        $.each(docs, function(i,v) {
          if("authlabel_s" in v) {
            var label = v["authlabel_s"];
            console.log(label);
            var authLink = semRecs.generateFacetLink(label);
            htmlArray.push(authLink);
          }
        });
      }
      var html = htmlArray.length? "Contemporaries include:" + "<ul class='list-unstyled'><li>" + htmlArray.join("</li><li>") + "</li>" : "";
      $("div[role='contemporaries'][uri='" + uri + "']").html(html);
    },
  
    processFacetValues: function(subjectProcessFunc, personProcessFunc) {
      //Subject retrieval
      //This provides array of facet labels, but to get broader and narrower, we will need URIs
      var subjects = semRecs.retrieveSubjectFacetValues();
      var subjectData = $.map(subjects, function(v, i){
        return {label: v};
      });
      subjectProcessFunc(subjectData, "semantic-facet-results", "facet");
      semRecs.addURIsForSubjectFacets(subjects);
      //Author retrieval
      var authors = semRecs.retrieveAuthorFacetValues();
      var authorData =  $.map(authors, function(v, i){
        return {label: v};
      });
      personProcessFunc(authorData, "semantic-person-facet-results", "author facet");
      semRecs.addURIsForAuthorFacets(authors);

    },
    //Display subject results that can be clicked
    //Data: expected to be array of objects with at least URI and label
    //May include object for context
    displayPersonData: function(data, elementId, source) {     
      //Convert data to format required to display
      var htmlResults = [];
      //This may be better with mapping
      var contextData = {};
      $.each(data, function(i, v) {
        if("label" in v) {
          var label = v["label"];
          var uri = "uri" in v? v["uri"]: null;      
          var props = {"label": label, "uri": uri, role:"person", ldsource: source, class: "list-group-item p-0 mx-0 mb-1 mt-0 border-0"};
          htmlResults.push(semRecs.generateListItem(props));
        }
      });
       
      $("#" + elementId).html("<ul class='list-group'>" + htmlResults.join(" ") + "</ul>");
      
    },
    
    //Display person card
    displayPersonCard: function(uri, label, context, ldsource) {
      var labelLink = semRecs.generateLabelLink(ldsource, uri, label.replace(/--/g, " > "));
      var html = "<h5 class='card-subtitle'>" + labelLink + "</h5>";
      html += "<div class='card-text' role='wikidata' uri='" + uri + "'></div>";
      html += "<div class='card-text' role='contemporaries' uri='" + uri + "'></div>";
      html += "<div class='card-text'>Source: " + ldsource + "</div>";
      $("#person-card").html(html);
    },
    displayWikidataInfoForAuthor: function(locuri, data) {
      var wikidataURI = data['uriValue'];
      var authorLabel = data['authorLabel'];
      
      if("image" in data) {
        var imgHtml = "<img class='rounded float-left img-thumbnail w-25' src='" + data["image"] + "'>";
        $("div[role='wikidata'][uri='" + locuri + "']").append(imgHtml);
      }
    }
    
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("catalog-index") >= 0 ) {
    semRecs.onLoad();
  }
});  