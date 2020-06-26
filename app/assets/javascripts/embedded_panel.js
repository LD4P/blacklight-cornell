var embeddedPanel = {
    onLoad: function() {
      embeddedPanel.init();
      embeddedPanel.retrieveAndDisplay();
    },
    init:function() {
      this.baseUrl =  $("#embedded-panel").attr("base-url");     
      this.uri = $("#embedded-panel").attr("uri");
      this.label = $("#embedded-panel").attr("label");
    },
    bindEventHandlers: function() {
      
       
    },
    retrieveAndDisplay: function() {
      var uri = embeddedPanel.uri;
      var label = embeddedPanel.label;
      var entityType = embeddedPanel.getEntityType(uri);
      if(entityType == "lcnaf" || entityType == "fast") {
        $("#embedded-panel").removeClass("d-none");
        embeddedPanel.displayCard(uri, label, entityType);
        if(entityType == "lcnaf") {
          embeddedPanel.getWikidataInfoForAuthor(uri, embeddedPanel.displayWikidataInfoForAuthor);
        }
        if(entityType == "fast") {
          embeddedPanel.retrieveInfoForFAST(uri,embeddedPanel.addFASTSubjectInfoToCard);
        }
        embeddedPanel.getAuthData(label, entityType);

        embeddedPanel.searchDigitalCollections(embeddedPanel.getDigitalCollectionsQuery(label, "author"));
      }
      
    },
    
    //Using the URI namespace, determine person or subject
    //LCNAF -> Person, FAST -> Subject.  Not handling LCGFT currently
    displayCard: function(uri, label, entityType) {
      if(entityType == "lcnaf") {
        embeddedPanel.displayPersonCard(uri, label);
      }
      if(entityType == "fast") {
        embeddedPanel.displaySubjectCard(uri, label);
      }
    },
    
    getEntityType:function(uri) {
      var lcnafPrefix = "id.loc.gov/authorities/names";
      var fastPrefix = "id.worldcat.org/fast";
      var postProtocol = uri.split("://");
      if(postProtocol[1].startsWith(lcnafPrefix)) {
        return "lcnaf";
      }
      if(postProtocol[1].startsWith(fastPrefix)) {
        return "fast";
      }
    },
    
    
 
    //Could also get info from loc but for now let's just use this
   // Query wikidata
    //Do a combined query for image (optional) and some set of influences
    getWikidataInfoForAuthor: function(LOCURI, callback) {
      // Given loc uri, can you get matching wikidata entities
      var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var localname = embeddedPanel.getLocalLOCName(LOCURI);
      var sparqlQuery = "SELECT ?entity ?entityLabel ?image ?description (GROUP_CONCAT(?work;separator=\"||\") AS ?works)" 
      	+	" WHERE {?entity wdt:P244 \"" + localname + "\" . " 
        + " OPTIONAL {?entity wdt:P18 ?image . }"
        + " OPTIONAL {?entity schema:description ?description . FILTER(lang(?description) = \"en\")}"  
        + " OPTIONAL {?entity wdt:P800 ?notable_work. ?notable_work wdt:P1476 ?title. ?notable_work wikibase:sitelinks ?linkcount . }"
        + " BIND(  CONCAT(str(?notable_work), \"|;|\", str (?title)) AS ?work) "
        + " SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}"
        + " GROUP BY ?entity ?entityLabel ?image ?description"
        + " ORDER BY DESC(?linkcount)";        
        
      $.ajax({
        url : wikidataEndpoint,
        headers : {
          Accept : 'application/sparql-results+json'
        },
        data : {
          query : sparqlQuery
        },
        success : function (data) {
          var wikidataParsedData = embeddedPanel.parseWikidataSparqlResults(data);
          callback(wikidataParsedData);
        }

      });

    },
    
    //Subject
    getWikidataInfoForLOCSubject: function(LOCURI, callback) {
      // Given loc uri, can you get matching wikidata entities
      var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var localname = embeddedPanel.getLocalLOCName(LOCURI);
      var sparqlQuery = "SELECT ?entity ?entityLabel ?image ?description" 
        + " WHERE {?entity wdt:P244 \"" + localname + "\" . " 
        + " OPTIONAL {?entity wdt:P18 ?image . }"
        + " OPTIONAL {?entity schema:description ?description . FILTER(lang(?description) = \"en\")}"  
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
          var wikidataParsedData = embeddedPanel.parseWikidataSparqlResults(data);
          callback(wikidataParsedData, null);
        }

      });

    },
    getWikidataInfoForWikidataURI: function(wikidataURI, callback) {
      // Given loc uri, can you get matching wikidata entities
      var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var localname = embeddedPanel.getLocalLOCName(wikidataURI);
      var sparqlQuery = "SELECT  ?entityLabel ?image ?description" 
        + " WHERE {" 
        + " OPTIONAL {wd:" + localname + " wdt:P18 ?image . }"
        + " OPTIONAL {wd:" + localname + " schema:description ?description . FILTER(lang(?description) = \"en\")}"  
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
          var wikidataParsedData = embeddedPanel.parseWikidataSparqlResults(data);
          callback(wikidataParsedData, wikidataURI);
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
          if ("description" in binding && "value" in binding["description"] 
          && binding["description"]["value"]) {
            output.description = binding["description"]["value"];
          }
          
          if ("works" in binding && "value" in binding["works"] 
          && binding["works"]["value"]) {
            works = binding["works"]["value"];
            //Convert to array of objects with uris and titles
            ws = works.split("||");
            wobjs = [];
            $.each(ws, function(i, v) {
              vArray = v.split("|;|");
              if(vArray.length == 2) {
                wobjs.push({"uri": vArray[0], "label": vArray[1]});
              }
            });
            if(wobjs.length > 0) {
              output.works = wobjs;
            }
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
  
   
 
    //Display subject card
    //When subject from list is clicked, populate the subject card
    displaySubjectCard: function(uri, label) {
      
      var labelLink = embeddedPanel.generateLabelLink("fast", uri, label.replace(/--/g, " > "));
      var titleHtml = labelLink;
      var iconLink = "Source: OCLC FAST" + embeddedPanel.generateIconLink(uri, "fast");
      var wdURISpan = "<span class='ml-1' role='emwduri'></span>";
      $("#embedded-header").html(titleHtml);
      $("#embedded-panel #embedded-source").html(iconLink + wdURISpan);
    },
    
    
    retrieveInfoForFAST: function(uri, callback) {
      //The problem with using auth lookup is it returns json (which is great) but it doesn't return labels for broader and narrower
      var url = "https://lookup.ld4l.org/authorities/fetch/linked_data/oclcfast_ld4l_cache?format=jsonld&uri=" + uri;
      //var url = "https://lookup.ld4l.org/authorities/show/linked_data/oclcfast_direct/" + id;
      //var url = uri + ".rdf.xml";
      $.ajax({
        "url": url,
        "type": "GET",
        "success" : function(data) {              
          var relationships = embeddedPanel.extractFASTRelationships(uri, data);
          callback(relationships);
        }
      });
    },
    
    extractFASTRelationships:function(uri, data) {
      var broaderURIs = [];
      var narrowerURIs = [];
      var closeURIs = [];
      var focusURIs = [];
      var narrowerProperty = "skos:narrower";
      var broaderProperty = "skos:broader";
      var closeProperty = "skos:related";
      var labelProperty = "skos:prefLabel";
      var foafFocusProperty = "foaf:focus";
      //Data = @context, @graph = [ {@id: id..., etc.]
      var dataHash = embeddedPanel.processLCSHJSON(data["@graph"]);
      narrowerURIs = embeddedPanel.processFASTEntityJSON(dataHash, narrowerProperty, uri);
      broaderURIs = embeddedPanel.processFASTEntityJSON(dataHash, broaderProperty, uri);
      closeURIs = embeddedPanel.processFASTEntityJSON(dataHash, closeProperty, uri);
      focusURIs = embeddedPanel.processFASTEntityJSON(dataHash, foafFocusProperty, uri);
      var entity = dataHash[uri];
      var label = entity[labelProperty];
      return {uri:uri, dataHash: dataHash, label: label, narrowerURIs: narrowerURIs, broaderURIs: broaderURIs, closeURIs: closeURIs, exactMatchURIs:[], focusURIs: focusURIs};      
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
          var label = "";
          if("skos:prefLabel" in uentity) {
           label = uentity["skos:prefLabel"];
          } else if ("rdfs:label" in uentity){
            label = uentity["rdfs:label"];
          }
          if(label != "") {
            returnURIs.push({uri:uri, label:label});
          }
        });
      }
      return returnURIs;
    },
    
    addFASTSubjectInfoToCard: function(relationships) {
      var requestingURI = relationships.uri;
      var narrowerURIs = relationships.narrowerURIs;
      var broaderURIs = relationships.broaderURIs;
      var exactMatchURIs = relationships.exactMatchURIs;
      var closeURIs = relationships.closeURIs;
      var focusURIs = relationships.focusURIs;
      var narrowerDisplay = embeddedPanel.processFASTRelatedURIs(narrowerURIs, relationships.dataHash);
      var broaderDisplay = embeddedPanel.processFASTRelatedURIs(broaderURIs, relationships.dataHash);
      //var exactDisplay = semRecs.processFASTRelatedURIs(exactMatchURIs, relationships.dataHash);
      var closeDisplay = embeddedPanel.processFASTRelatedURIs(closeURIs, relationships.dataHash);
      //var focusDisplay = embeddedPanel.processFASTRelatedURIs(focusURIs, relationships.dataHash);
     //Get card part that corresponds and add info
      var display = "";
      
      
      /*
      if(exactDisplay != "") {
        display += exactDisplay + "<br>";
      }*/
      if(closeDisplay != "") {
        display += "Related: " + closeDisplay.join(", ") + "<br>"; 
      }
      
      if(broaderDisplay != "") {
        display += "Broader: " + broaderDisplay.join(", ") + "<br>";        
      }
      if(narrowerDisplay != "") {
        display += "Narrower: " + narrowerDisplay.join(", ") + "<br>";        
      }
      $("#embedded-panel #subject-info").append(display);
      
      //if exact match or foaf focus includes a wikidata link, then use that to display info
      var wikidataURI = "";
      var locURI = "";
      var wuris = exactMatchURIs.concat(focusURIs);
      //return either Wikidata URI or LOC URI (and the very "first" one) found
      // Focus URIs may be related and not at the same conceptual level as the entity
      //Exact matches, if they exist, come first in the concatenated array so will be favored
      $.each(wuris, function(i,v) {
        var uri = v.uri;
        if(uri.startsWith("https://www.wikidata.org")) {
          wikidataURI = uri;
          return false;
        }
        if(uri.startsWith("http://id.loc.gov") || uri.startsWith("https://id.loc.gov")) {
          locURI = uri;
          return false;
        }
        
      });
      
      if(wikidataURI != "") {
        embeddedPanel.getWikidataInfoForWikidataURI(wikidataURI, embeddedPanel.displayWikidataForSubject);
      }
      else if(locURI != "") {
        //Call methods to retrieve LOC info
        embeddedPanel.getWikidataInfoForLOCSubject(locURI, embeddedPanel.displayWikidataForSubject);
      }

    },
    
    displayWikidataForSubject: function(data, uri) {      
      var wikidataURI = (uri != null) ? uri: data['uriValue'];
      //this should be changed back to entity label as variable and data, but here it just stands for label
      var authorLabel = data['authorLabel'];
      //Add Wikidata icon
      if(wikidataURI != null) {
        var wikidataLink = embeddedPanel.generateWikidataLink(wikidataURI);
        $("#embedded-panel span[role='emwduri']").html("Wikidata " + wikidataLink);
      }
      if("image" in data) {
        //var imgHtml = "<img class='rounded float-left img-thumbnail w-25' src='" + data["image"] + "'>";
        var imageUrl = data["image"];
        if(! imageUrl.toLowerCase().endsWith(".tif") &&  !imageUrl.toLowerCase().endsWith(".tiff")) {
          //Not handling tiff right now
          var imgHtml = "<img class='rounded img-thumbnail w-100 m-0' src='" + imageUrl + "'>";
          $("#embedded-panel #image-container").addClass("float-left w-25 m-1");
          $("#embedded-panel #image-container").html(imgHtml);
        }
      } 
      if("description" in data) {
        var wdDescription = data["description"];
        $("#embedded-panel #wd-description").html(wdDescription);
      } 
    },
    
    processFASTRelatedURIs: function(rArray) {
      var display = [];
      $.each(rArray, function(i,v) {
        display.push(embeddedPanel.generateRelatedSubject(v.uri,v.label));
      });
     
      return display;
    },
    generateRelatedSubject: function(uri, label) {
      var wikidataPrefix = "http://www.wikidata.org/";
      var fastPrefix = "http://id.worldcat.org/fast/";
      if(uri.startsWith(wikidataPrefix)) {
        return label + " " + embeddedPanel.generateWikidataLink(uri);
      } else if(uri.startsWith(fastPrefix)) {
        return embeddedPanel.generateFASTFacetLink(label);

      } else {
        return embeddedPanel.generateCatalogLCSHLink(label);
      }
    },
    
    ///Links
    
    
    generateLabelLink: function(ldsource, uri, label) {
      if(ldsource == "lcnaf") {
        //var locLink = embeddedPanel.generateLOCLink(uri);
        //Assuming LCNAF author facet will work the same as what is used in the facet field
        var authorFacet =  embeddedPanel.generateFacetLink(label);
        return authorFacet;
        //return authorFacet + " " + locLink;

      }
      if(ldsource == "fast") {   
        var facetCatalogLink = embeddedPanel.generateTopicFacetLink(label);
        //var iconLink = embeddedPanel.generateFASTIconLink(uri);
        //return facetCatalogLink + " " + iconLink;
        return facetCatalogLink;
      }
      
      return label;
    },
    generateIconLink: function(uri, ldsource) {
      var link = "";
      if(ldsource == "lcnaf") {
         link = embeddedPanel.generateLOCLink(uri);

      }
      if(ldsource == "fast") {   
        link = embeddedPanel.generateFASTIconLink(uri);
      
      }
      return link;
      
    },
    generateTopicFacetLink: function(label) {

      var facetLink = embeddedPanel.baseUrl + "?f[fast_topic_facet][]=" + label + "&q=&search_field=all_fields";

      return "<a href='" + facetLink + "'>" + label + "</a>";
    },
    generateFASTIconLink: function(uri) {
      return "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See OCLC FAST' href='" + uri + "'><img src='/assets/oclc.png' /></a>";
    },
  
    //copied from browseLd, generate LOC link
    generateLOCLink: function(uri) {
      if(typeof uri == "undefined" || uri == "") 
        return "";
      
      var locHtml = "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See Library of Congress' href='" + uri + ".html'><img src='/assets/loc.png' /></a>";
      return locHtml;
    
    },
    generateCatalogLCSHLink: function(label) {
      return "<a href='" + embeddedPanel.baseUrl + "?q=" + label + "&search_field=subject_cts'>" + label + "</a>";
    },
    generateWikidataLink: function(wikidataURI) {
      return "<a href='" + wikidataURI + "' target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See Wikidata'><img src='/assets/wikidata.png' /></a>";
    },
  
  
    generateFacetLink: function(label) {
      var authorFacet = embeddedPanel.baseUrl + "?f[author_facet][]=" + label;
      return "<a href='" + authorFacet + "'>" + label + "</a>";
    },
   generateFASTFacetLink: function(label) {
     var facet = embeddedPanel.baseUrl + "?f[fast_topic_facet][]=" + label;
     return "<a href='" + facet + "'>" + label + "</a>";
   },
   
   
   
   
   ///People related functions
    //Display person card
    displayPersonCard: function(uri, label) {
      var labelLink = embeddedPanel.generateLabelLink("lcnaf", uri, label.replace(/--/g, " > "));
      var titleHtml = labelLink;
      var iconLink = "Source: Library of Congress " + embeddedPanel.generateIconLink(uri, "lcnaf");
      var wdURISpan = "<span class='ml-1' role='emwduri'></span>";
      $("#embedded-header").html(titleHtml);
      $("#embedded-panel #embedded-source").html(iconLink + wdURISpan);
    },
    displayWikidataInfoForAuthor: function(data) {
      
      var wikidataURI = data['uriValue'];
      var authorLabel = data['authorLabel'];
      //Add Wikidata icon
      if(wikidataURI != null) {
        var wikidataLink = embeddedPanel.generateWikidataLink(wikidataURI);
        $("#embedded-panel span[role='emwduri']").html(" Wikidata " + wikidataLink);
      }
      if("image" in data) {
        //var imgHtml = "<img class='rounded float-left img-thumbnail w-25' src='" + data["image"] + "'>";
        var imageUrl = data["image"];
        if(! imageUrl.toLowerCase().endsWith(".tif") &&  !imageUrl.toLowerCase().endsWith(".tiff")) {
          //Not handling tiff right now
          var imgHtml = "<img class='rounded img-thumbnail w-100 m-0' src='" + imageUrl + "'>";
          $("#embedded-panel #image-container").addClass("float-left w-25 m-1");
          $("#embedded-panel #image-container").html(imgHtml);
        }
      } 
      if("description" in data) {
        var wdDescription = data["description"];
        $("#embedded-panel #wd-description").html(wdDescription);
      }
      
      if("works" in data) {
        var works = data["works"];
        //This should be an array with each object specifying wikidata URI and label
        embeddedPanel.displayNotableWorks(works);
      }
     
      
    //Need to do this in a better way but this also calls query for notable work and appends
     //embeddedPanel.getNotableWorks(locuri, wikidataURI);
     
      
    },
    
   displayNotableWorks: function(works) {
     var notableHtmlArray = [];
     $.each(works, function(i,v) {
       notableHtmlArray.push(embeddedPanel.generateExternalLinks(v.uri, v.label, "Wikidata", ""));
     });
      var notableWorksHtml = (works.length > 0) ? "<div>Notable works include: <ul><li>" + notableHtmlArray.join("</li><li>") + "</li></ul></div>" : "";
      $("#embedded-panel #notable-works").html(notableWorksHtml);
          
    },
    generateExternalLinks: function(URI, label, sourceLabel, locUri) {
      var keywordSearch = embeddedPanel.baseUrl + "catalog?q=" + label + "&search_field=all_fields";
      var title = "See " + sourceLabel;
      var image = "wikidata";
      var locHtml = "";
      if ( locUri.length > 0 ) {
          locHtml += "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See Library of Congress' href='http://id.loc.gov/authorities/names/"
                      + locUri + ".html'><img src='/assets/loc.png' /></a>"
      }
      if ( sourceLabel.indexOf("Digital") > -1 ) {
          image = "dc";
      }
      var displayLabel = (label.length > 45) ? label.substring(0, 45) + "...": label;
      return "<a data-toggle='tooltip' data-placement='top' data-original-title='Search Library Catalog' href='" 
              + keywordSearch + "'>" + displayLabel + "</a> " + "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='" 
              + title + "' href='" + URI + "'><img src='/assets/" + image +".png' /></a>" + locHtml
    },
    
    getAuthData: function(query, entityType) {
      
      if(entityType == "lcnaf" || entityType == "fast") {
        var url = embeddedPanel.baseUrl + "/browse/info?authq=" + query;
        url += (entityType == "lcnaf")? "&browse_type=Author&headingtype=Personal Name": "&browse_type=Subject&headingtype=Topical Term";
         $.get(url, function (d) {
          var authorWorksHtml = "";
          var authorWorks = $(d).filter("div.author-works");
          $(d).filter("div.author-works").each(function(i){authorWorksHtml += $(this).html()});
          $("#embedded-panel #authdata").html(authorWorks);
        });
      }
   
    },
    searchDigitalCollections: function(authString) {
      var lookupURL = embeddedPanel.baseUrl + "proxy/search?q=" + authString;
      $.ajax({
        url : lookupURL,
        dataType : 'json',
        success : function (data) {
          // Digital collection results, append
          var results = [];
          if ("response" in data && "docs" in data.response) {
            results = data["response"]["docs"];
            // iterate through array
            var resultsHtml = "<div><ul class=\"explist-digitalresults\">";
            var maxLen = 2;
            var numberResults = results.length;
            var len = results.length;
            if (len > maxLen)
              len = maxLen;
            var l;
            for (l = 0; l < len; l++) {
              var result = results[l];
              var id = result["id"];
              var title = result["title_tesim"];
              var digitalURL = "http://digital.library.cornell.edu/catalog/"
                + id;
              resultsHtml += "<li>" + embeddedPanel.generateExternalLinks(digitalURL, title[0], "Digital Library Collections", "") + "</li>";
       
            }

            resultsHtml += "</ul>";
            //Not showing contributors separately
            var displayHtml = "";
            //Only display this section if there are any digital collection results
            if(numberResults > 0) {
              var digColSearchURL = "https://digital.library.cornell.edu/?q=" + authString + "&search_field=all_fields";
              displayHtml += "<div>Digital Collections Results: " + 
              "<a class='data-src' href='" + digColSearchURL + "' target='_blank'><img src='/assets/dc.png' /></a>"          
              + resultsHtml
              + "</ul>";
            }  

            $("#embedded-panel #dig-cols").append(displayHtml);
            //listExpander('digitalresults');
            //listExpander('digitalcontributers');
          }

        }
      });
    },
    getDigitalCollectionsQuery: function(auth, authType) {
      var digitalQuery = auth;
      if(authType == "subject") {    
          digitalQuery = digitalQuery.replace(/>/g, " ");
      }
      return digitalQuery;

    }

    
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("catalog-index") >= 0 &&
      $('#embedded-panel').length) {
    embeddedPanel.onLoad();
  }
});  