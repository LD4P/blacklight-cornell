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
      embeddedPanel.displayPersonCard(embeddedPanel.uri, embeddedPanel.label);
      embeddedPanel.getWikidataInfoForAuthor(embeddedPanel.uri, embeddedPanel.displayWikidataInfoForAuthor);
      
      
    },
 
    //Could also get info from loc but for now let's just use this
   // Query wikidata
    //Do a combined query for image (optional) and some set of influences
    getWikidataInfoForAuthor: function(LOCURI, callback) {
      // Given loc uri, can you get matching wikidata entities
      var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var localname = embeddedPanel.getLocalLOCName(LOCURI);
      var sparqlQuery = "SELECT ?entity ?entityLabel ?image ?description  WHERE {?entity wdt:P244 \"" + localname + "\" . " 
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
          if ("description" in binding && "value" in binding["description"] 
          && binding["description"]["value"]) {
            output.description = binding["description"]["value"];
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
    displaySubjectCard: function(uri, label, context, ldsource) {
      var labelLink = embeddedPanel.generateLabelLink(ldsource, uri, label.replace(/--/g, " > "));
      var html = "<h5 class='card-subtitle'>" + labelLink + "</h5>";
    
      html += "<div class='card-text' role='context' uri='" + uri + "'>" + embeddedPanel.generateContextDisplay(context) + "</div>";
      html += "<div class='card-text'>Source: " + ldsource + "</div>";
      $("#subject-card").html(html);

    },
    generateLabelLink: function(ldsource, uri, label) {
      if(ldsource == "lcnaf") {
        var locLink = embeddedPanel.generateLOCLink(uri);
        //Assuming LCNAF author facet will work the same as what is used in the facet field
        var authorFacet =  embeddedPanel.generateFacetLink(label);
        return authorFacet + " " + locLink;

      }
      if(ldsource == "facet") {   
        var facetCatalogLink = embeddedPanel.generateTopicFacetLink(label);
        var iconLink = embeddedPanel.generateFASTIconLink(uri);
        return facetCatalogLink + " " + iconLink;
      }
      
      return label;
    },
    generateTopicFacetLink: function(label) {

      var facetLink = embeddedPanel.baseUrl + "?f[fast_topic_facet][]=" + label + "&q=&search_field=all_fields";

      return "<a href='" + facetLink + "'>" + label + "</a>";
    },
    generateFASTIconLink: function(uri) {
      return "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See OCLC FAST' href='" + uri + "'><img src='/assets/oclc.png' /></a>";
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
      var displayLabel = label.replace(/--/g, " > ");
        var propsArray = [];
        $.each(properties, function(k,v) {
          //Find better way to handle "data" attributes
       
          propsArray.push(k + "=\"" + v + "\"");
          
        });
        html += propsArray.join(" ");
      
      html += ">" + displayLabel + "</li>";
      return html;
    },
    //return narrower and broader specifically from QA context
    retrieveContextRelationships: function(item) {
      var relationships = {};
      if("context" in item) {
        var mappedContext = embeddedPanel.processContext(item["context"]);
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
      var narrowerDisplay = embeddedPanel.processRelatedURIs(narrowerURIs, relationships.dataHash);
      var broaderDisplay = embeddedPanel.processRelatedURIs(broaderURIs, relationships.dataHash);
      var exactDisplay = embeddedPanel.displayWikidataLink(exactMatchURIs, relationships.dataHash);
      var closeDisplay = embeddedPanel.displayWikidataLink(closeURIs, relationships.dataHash);
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
    //FAST is processed differently, this should be refactored further
    //or all the data, regardless of whether it's from the JSON-LD representation
    //OR context should have the same structure
    addFASTSubjectInfoToCard: function(relationships) {
      var requestingURI = relationships.uri;
      var narrowerURIs = relationships.narrowerURIs;
      var broaderURIs = relationships.broaderURIs;
      var exactMatchURIs = relationships.exactMatchURIs;
      var closeURIs = relationships.closeURIs;
      var narrowerDisplay = embeddedPanel.processFASTRelatedURIs(narrowerURIs, relationships.dataHash);
      var broaderDisplay = embeddedPanel.processFASTRelatedURIs(broaderURIs, relationships.dataHash);
      //var exactDisplay = embeddedPanel.processFASTRelatedURIs(exactMatchURIs, relationships.dataHash);
      var closeDisplay = embeddedPanel.processFASTRelatedURIs(closeURIs, relationships.dataHash);
     //Get card part that corresponds and add info
      var display = "";
      
      
      /*
      if(exactDisplay != "") {
        display += exactDisplay + "<br>";
      }*/
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
      return embeddedPanel.processRelatedURIs(wikidataURIs, dataHash);
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
        display.push(embeddedPanel.generateRelatedSubject(v.uri,v.label));
      });
     
      return display;
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
  
    processPersonResult: function(item) {
      var htmlArray = [];
      if("uri" in item && "label" in item) {
        var label = item["label"];
        var uri = item["uri"];
        //May need to pass along uri as well to get FAST facet link
        var generateFacetLink = "<a href='" + embeddedPanel.generateFacetLink(label) + "'>" + label + "</a>";
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
   generateFASTFacetLink: function(label) {
     var baseUrl = $("#semantic-recs").attr("base-url"); 
     //this isn't preserving the entire query and search parameters but a particular person can be explored
     var facet = baseUrl + "?f[fast_topic_facet][]=" + label;
     return "<a href='" + facet + "'>" + label + "</a>";
   },
   
   
   
    //Display person card
    displayPersonCard: function(uri, label) {
      var labelLink = embeddedPanel.generateLabelLink("lcnaf", uri, label.replace(/--/g, " > "));
      var titleHtml = labelLink + "<span role='emwduri' uri='" + uri + "'></span>";
      var html = "<div class='card-text' role='emwikidata' uri='" + uri + "'></div>";
      $("#embedded-header").html(titleHtml);
      $("#embedded-card").html(html);
    },
    displayWikidataInfoForAuthor: function(locuri, data) {
      var wikidataURI = data['uriValue'];
      var authorLabel = data['authorLabel'];
      //Add Wikidata icon
      if(wikidataURI != null) {
        var wikidataLink = embeddedPanel.generateWikidataLink(wikidataURI);
        $("span[role='emwduri'][uri='" + locuri + "']").html(wikidataLink);
      }
      var appendHtml = "";
      if("image" in data) {
        var imgHtml = "<img class='rounded float-left img-thumbnail w-25' src='" + data["image"] + "'>";
        appendHtml += imgHtml;
      }
      if("description" in data) {
        appendHtml += "<div class='float-left w-75'>" + data["description"] + "</div>";
      }
      if(appendHtml != "") {
        $("div[role='emwikidata'][uri='" + locuri + "']").html(appendHtml);
        

      }
      
    //Need to do this in a better way but this also calls query for notable work and appends
     embeddedPanel.getNotableWorks(locuri, wikidataURI);
      
      
    },
    
   getNotableWorks: function(locuri, wikidataURI) {
      var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var sparqlQuery = "SELECT ?notable_work ?title WHERE {<"
        + wikidataURI
        + "> wdt:P800 ?notable_work. ?notable_work wdt:P1476 ?title. ?notable_work wikibase:sitelinks ?linkcount . }  ORDER BY DESC(?linkcount)";

      $.ajax({
        url : wikidataEndpoint,
        headers : {
          Accept : 'application/sparql-results+json'
        },
        data : {
          query : sparqlQuery
        },
        success : function (data) {
          if (data && "results" in data
              && "bindings" in data["results"]) {
            var bindings = data["results"]["bindings"];
            var bLength = bindings.length;
            var b;
            if (bindings.length) {
              var notableWorksHtml = "<div>Notable works include:<ul><li>";
              var notableHtmlArray = [];
              for (b = 0; b < bLength; b++) {
                var binding = bindings[b];
                if ("notable_work" in binding
                    && "value" in binding["notable_work"]
                && "title" in binding
                && "value" in binding["title"]) {
                  var notableWorkURI = binding["notable_work"]["value"];
                  var notableWorkLabel = binding["title"]["value"];
                  notableHtmlArray.push(notableWorkLabel);
                }
              }
              notableWorksHtml += notableHtmlArray.join("</li><li>")
              + "</li></ul></div>";
              $("div[role='emwikidata'][uri='" + locuri + "']").append(notableWorksHtml);
            }
          }
        }

      });
    }
    
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("catalog-index") >= 0 &&
      $('#embedded-panel').length) {
    embeddedPanel.onLoad();
  }
});  