/*** Reordering functions, and will need to redo to use objects, etc.**/


class entityDisplay {
  constructor(uri) {
    //Constructor
    this.uri = uri;
    this.hasTimeInfo = false;
    this.hasRelatedTimeInfo = false;
    //save related subject solr docs
    this.broader = [];
    this.narrower = [];
  } 
   
  //initialize function
  init() {
    this.baseUrl = $("#displayContainer").attr("base-url");
    this.timeline = this.initTimeline("subject-timeline");
    this.mapInfo = this.initMap();
    this.overlay = this.mapInfo["overlay"];
    this.map = this.mapInfo["map"];
    this.processSpatialInfo(this.overlay);
    //Load uri and periodo data
    this.load(this.uri, periododata, this.overlay);
  }


  //Given a URI, load the LCSH resource
    
  load(uri, periododata, overlay) {
   //Afghanistan
   //var lcshURI = "https://id.loc.gov/authorities/names/n79063030";
    var lcshURI = "https://id.loc.gov/authorities/subjects/sh85001514";
    var fastURI = "http://id.worldcat.org/fast/798940";
    if(uri == "x") {
      this.loadLCSHResource(lcshURI,  periododata, overlay);
    } else {
      this.loadLCSHResource(uri, periododata, overlay);
    }
  }
  
  //Retrieve Solr document for this particular URI - also any classification information
  
  loadLCSHResource(uri, periododata, overlay) {
   //Retrieve LCSH JSON, broader and narrower relationships - AJAX calls retrieving relationships
   var lcshCall = this.getLCSHRelationships(uri, periododata, overlay, this.execRelationships.bind(this));
   //get Wikidata URI - AJAX call querying SPARQL endpoint to get and then display information
   this.getWikidataInfo(uri, this.displayWikidataInfo);
   
   //Use synchronous call here
   var solrDocCall = this.getInfoFromIndex(uri, overlay, this.timeline);
   //Solr doc call should get any info for this subject - as well as broader and narrower URIs.
   //Catalog and digital collections search depend on label
  
   //Issue: Timeline variable needs to be globally accessible
   //Also: make sure no articles added to timeline where dates aren't available
   /*
   var eThis = this;
   $.when(
       lcshCall,
       solrDocCall
     ).done(function() {
       eThis.getCatalogWorksAboutSubject(this.uri, this.label);
       eThis.getLCCN(this.uri, this.label);
      
     });
   
   */
   
  }
  
  
  //To do: Data should be stored somewhere for the object representing the entity
  // Cleaner separation of what happens post data retrieval
  //This represents data that should really be loaded at the beginning: Label included and timeline and geo info
  //relationships, wikidata info and other searches can occur after this is complete
  getInfoFromIndex(uri, overlay, timeline) {
    //Index depends on format that uses http://
    var uriString = uri.replace("https:/","http:/");
    //AJAX query LCSH search
    var solrDocCall = this.getSolrDocForURI(uriString, this.displayDocInformation.bind(this));
    return solrDocCall;
  }
  
  //Abstracting out display to a more comprehensive call (not just timeline)
  //Need to get broader and narrower information (solr documents) for main document
  displayDocInformation(doc) {
    this.label = doc["label_s"];
    //First, retrieve primary doc information
    var hasTime = this.hasTimelineInfo(doc);
    var hasMap = this.hasGeographicInfo(doc);
    //Check to see that main document has temporal information
    
    if(hasTime) {
      this.hasTimeInfo = true;
      this.plotSubjectOnTimeline(this.timeline, doc);
    } 
    
    //Retrieve related solr documents
    //Before this is executed, we know whether or not the primary subject has temporal and geographic info
    this.retrieveRelatedSolrDocs(doc);
    
    //Need to find a better way to chain this or move it elsewhere
    this.getCatalogWorksAboutSubject(this.uri, this.label);
    this.getLCCN(this.uri, this.label);
    
  }
   
  //for a Solr document, check if temporal information, either from period o or from another source exists
  hasTimelineInfo(doc) {
    var temporalFields = ["periodo_start_i", "periodo_stop_i", "temp_start_i", "temp_stop_i"];
   return this.hasFieldInDoc(temporalFields, doc);
  }
  
  hasGeographicInfo(doc) {
    var geographicFields = ["spatial_coverage_ss", "geo_uri_ss"];
   return this.hasFieldInDoc(geographicFields, doc);
    
  }
  
  hasFieldInDoc(fieldArray, doc) {
    var hasField= false;
    $.each(fieldArray, function(k, v) {
      if(v in doc) {
        hasField= true;
        //to break out of the each loop
        return false;
      }
    });
    return hasField;
  }
  
  
  //Check if broader or narrower have temporal information
  retrieveRelatedSolrDocs(doc) {
    var relatedDocs = {};
    var broaderURIs = [];
    var narrowerURIs = [];
    if("broader_ss" in doc) {
      broaderURIs = doc["broader_ss"];
    }
    if("narrower_ss" in doc) {
      narrowerURIs = doc["narrower_ss"];
    }
    
    //AJAX query to get solr documents for each related item
    var eThis = this;
    $.each(broaderURIs, function(k, v) {
      eThis.getSolrDocForURI(v, eThis.updateRelatedSolrDoc.bind(eThis), {"type":"broader"});
    });
    $.each(narrowerURIs, function(k, v) {
      eThis.getSolrDocForURI(v, eThis.updateRelatedSolrDoc.bind(eThis), {"type":"narrower"});
    });
    
  }
  
  updateRelatedSolrDoc(doc, callbackData) {
    var type = callbackData["type"];
    if(type == "broader") {
      //save broader document to the entity
      this.broader.push(doc);
    }
    if(type == "narrower") {
      this.narrower.push(doc);
    }
    if(this.hasTimelineInfo(doc)) {
      this.plotRelatedSubjectOnTimeline(this.timeline, doc, type);
      if(!this.hasTimeInfo && !this.hasRelatedTimeInfo) {
        //Set the timeline to 
        this.handleNoPrimaryTime(this.timeline, doc["uri_s"]);
      }
    }
    
  
    
  }
  
  /*
  transformToTimeline(doc) {
    var docURI = doc["uri_s"];
    var isPrimary = (docURI == this.uri); //it's the "primary" item to be displayed if it corresponds to the URI we loaded
 
    if(isPrimary) {
      this.plotSubjectOnTimeline(this.timeline, doc);
    } else {
      this.plotRelatedSubjectOnTimeline(this.timeline, doc);
    }
  }*/
  
  //retrieve Solr document matching a particular URI
  
  getSolrDocForURI(uriString, callback, callbackData) {
    var baseURL = $("#displayContainer").attr("base-url");
    var solrDocCall = $.ajax({
      "url": baseURL+ "proxy/lcshsearch?q=" + uriString,
      "type": "GET",
      "success" : function(data) {
        
        if("response" in data && "docs" in data["response"] && data["response"]["docs"].length > 0) {
          var docs = data["response"]["docs"];
          var doc = docs[0];
          if(callbackData) {
            callback(doc, callbackData);
          } else {
            callback(doc);
          }
        } 
        
      }
    });
    return solrDocCall;
  }
  
  
  

  
  //if primary call is false, check if other articles on the timeline and scroll to one of them
  handleNoPrimaryTime(timeline, uri) {
    var article = timeline.getArticleById(uri);
   if(article) { 
     var articleDate = "from" in article["data"]? article["data"]["from"]["year"]: ("to" in article["data"]? article["data"]["to"]["year"]: null);
     if(articleDate != null) {
       timeline.setStartDate((articleDate - 20).toString());
       this.hasRelatedTimeInfo = true;
     }
   }
  }
  
  //There may be more than one time period?
  //Pass array of start/end periods along with label
  plotSubjectOnTimeline(timeline, doc) {
   
    
    var start = ("periodo_start_i" in doc) ? doc["periodo_start_i"]: ("temp_start_i" in doc)? doc["temp_start_i"]: null;
    var stop = ("periodo_stop_i" in doc)? doc["periodo_stop_i"]: ("temp_stop_i" in doc)? doc["temp_stop_i"]: null;
    var initialDate = null;
    if(start != null) {
      initialDate = start;
    }
    else if(start == null && stop != null) {
      initialDate = stop;
    }
    
    if(initialDate != null) {
      timeline.setStartDate((initialDate - 20).toString());
      //timeline.requestRedraw();
      this.plotRelatedSubjectOnTimeline(timeline, doc, null);
      //This really should depend on the number of years, etc. being displayed 
    } 
   
  }
  
  //Create timeline article for Solr document
  generateArticleForDoc(doc) {
  //Generate article based on Solr document
    var label = doc["label_s"];
    var id = doc["uri_s"];
    var start = ("periodo_start_i" in doc) ? doc["periodo_start_i"]: ("temp_start_i" in doc)? doc["temp_start_i"]: null;
    var stop = ("periodo_stop_i" in doc)? doc["periodo_stop_i"]:  ("temp_stop_i" in doc)? doc["temp_stop_i"]:null;
    var article = {
        id: id,
        title: label
    };
   
    if(start != null) {
      article["from"] = {
          year: start
      } 
    };
    if(stop != null) {
      article["to"] = {
          year: stop
      } 
    };
    if ("spatial_coverage_label_ss" in doc) {
      var spatial_label = doc["spatial_coverage_label_ss"];
      article["spatial_label"] =  spatial_label;
    }
    //TODO: Add temporal component from solr document
    return article;
  }
  
  //This is true for any subject, whether the main one or not
  plotRelatedSubjectOnTimeline(timeline, doc, type) {
   var article = this.generateArticleForDoc(doc); 
   var articleType = (type != null)? type: "primary";
   article["articleType"] = articleType;  
   var articles = [];
   articles.push(article);
   timeline.load(articles);
   //alert("plot related subject:" + timeline.articles.length);
  }
  
  
  
  //There may be more than one map location
  plotSubjectOnMap() {
    
  }
  
  //Init timeline- return timeline object
  initTimeline(timelineId) {
   
    var container = $("#" + timelineId);
  
    //Create timeline without also setting initial date
    var eThis = this;
    var timeline = new Histropedia.Timeline( container, {
      width: 700,
      height: 350,
     zoom: {
       initial:40
     },
     article: {
       density: Histropedia.DENSITY_HIGH,
       distanceToMainLine: 200
     },
     onArticleClick: function(article) {
       eThis.onArticleClick(article);
     }
    }  );
    return timeline;
    
  }
  
  onArticleClick(article) {
    var articleType = article.articleType;
    var labelDisplay = "Subject";
    if(articleType != "primary") {
      labelDisplay = articleType == "broader"? "Broader ": "narrower" ? "Narrower ": "Related ";
      labelDisplay += "Subject";
    }
    var htmlDisplay = "<h4>" + labelDisplay + ": " + article.title + "</h4>";
    
    //If article has from and to, display that information
    var yearRange = "";
    var fromExists = false;
    if("from" in article["data"] && "year" in article["data"]["from"]) {
      yearRange += article["data"]["from"]["year"];
      fromExists = true;
    }
    if("to" in article["data"] && "year" in article["data"]["to"]) {
      var toYear = article["data"]["to"]["year"];
      yearRange += (fromExists)? " - ": "";
      yearRange += toYear;
    }
    yearRange = (yearRange != "")? "Years: " + yearRange: yearRange;
    htmlDisplay += yearRange;
    
    if("spatial_label" in article["data"]) {
      htmlDisplay += "<br/>Related regions: " + article["data"]["spatial_label"].join(", ");
    }
    $("#timelineInfo").html(htmlDisplay);
    
  }
  
  //retrieve LCSH Relationships
  getLCSHRelationships(uri, periododata, overlay, callback) {
    var eThis  = this;
    //context:this may have made callback unavailable?
    var lcshCall = $.ajax({
      "url": uri + ".jsonld",
      "type": "GET",
      "success" : function(data) {
        var relationships = eThis.extractLCSHRelationships(uri, data);
        callback(relationships, periododata, overlay);
      }
    });
    return lcshCall;
  }
  
  extractLCSHRelationships(inputURI, data) {
    var uri = inputURI.replace("https://","http://");
    var dataHash = this.processLCSHJSON(data);
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
  }
  //generate hash based on uris of ids to provide cleaner access given URI
  processLCSHJSON(jsonArray) {
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
  }
  
  //These separate functions should be more cleanly broken out
  execRelationships(relationships, periododata, overlay) {
    //Display label
    var label = relationships.label;
    $("#entityLabel #label").html("Subject: " + label);
    $("#displayContainer").attr("label", label);
    this.generateTree(relationships);
    //Label required for digital collections query (since doesn't use URI but string)
    var baseUrl = $("#displayContainer").attr("base-url");
    var uri = $("#displayContainer").attr("uri");
    var digLabel = label;
    //Test case
    if(uri == "x") {
     digLabel = "Sagan, Carl, 1934-1996";
    }  
    //Timeline
    var lcsh = relationships.uri + ".html";
    var mappedData = this.mapData(periododata, lcsh);
    
    //Update timeline with broader and narrower
    //Put in its own function
     //this.addToTimeline(relationships);
    
    //loadTimeline(periododata, relationships, mappedData);
    //Map
    var selectedPeriod = mappedData["lcshPeriod"];
    this.generateMapForPeriodo(selectedPeriod, overlay);
    //Digital collection results
    this.searchDigitalCollectionFacet("fast_topic_facet", digLabel, baseUrl);
    //Catalog results
    this.getCatalogResults(digLabel, baseUrl);
  
  }
  
  addToTimeline(relationships) {
    var broaderURIs = relationships.broaderURIs;
    var narrowerURIs = relationships.narrowerURIs;
    //For each of broader and narrower, add subjects to timeline for viewing
    $.each(broaderURIs, function(i, v) { 
      var uri = v["@id"];
      //This should be set to false and a different way of calculating where to zoom in should be selected
      this.getSolrDocForURI(uri, this.transformToTimeline.bind(this), {"primary":false});
    }.bind(this));
    
    $.each(narrowerURIs, function(i, v) { 
      var uri = v["@id"];
      this.getSolrDocForURI(uri, this.transformToTimeline.bind(this), {"primary":false});
    }.bind(this));
  }
  
  //
  
  generateTree(relationships) {
    var baseUrl = $("#displayContainer").attr("base-url");
    var dataHash = relationships.dataHash;
      var uri = relationships.uri;
      var label = relationships.label;
      var narrowerURIs = relationships.narrowerURIs;
      var closeURIs = relationships.closeURIs;
    var broaderURIs = relationships.broaderURIs;
    var broaderDisplay = this.generateHierarchyCategory(broaderURIs, "Broader", dataHash, baseUrl);
    $("#hierarchy").append(broaderDisplay);
    var narrowerDisplay = this.generateHierarchyCategory(narrowerURIs, "Narrower", dataHash, baseUrl);
    $("#hierarchy").append(narrowerDisplay);
    var closeDisplay = this.generateHierarchyCategory(closeURIs, "Similar", dataHash, null);
    $("#hierarchy").append(closeDisplay);
  }
  
  //Display broader, or narrower
  generateHierarchyCategory(uris, heading, dataHash, baseUrl) {
    var displayArray = [];
    var display = "";
    if(uris.length > 0) {
      displayArray = $.map(uris, function(v, i) {
        
         var label = dataHash[v["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
         var uri = v["@id"].replace("http://","https://");
         var link = (baseUrl != null)?  baseUrl + "/entity_display/display?uri=" + uri: uri;
         return label + " <a href='" + link + "'>See Details</a>" ;
      });
      display = 
      "<h4>" + heading + "</h4><ul><li>" + displayArray.join("</li><li>") + "</li></ul>";
    } 
    return display;
  }
  
  generateTreeTest(relationships) {
    var dataHash = relationships.dataHash;
    var uri = relationships.uri;
    var label = relationships.label;
    var narrowerURIs = relationships.narrowerURIs;
    var closeURIs = relationships.closeURIs;
    var broaderURIs = relationships.broaderURIs;
    treeData = [{"id":uri, "displayName":label, "hasChild":true, "isLoaded":true, "children":[]}];
    var closeData = $.map(closeURIs, function(val, i) {
       var euri = val["@id"];
        var elabel = dataHash[uri]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
        return {
          "id":euri, "displayName":elabel + "-" + euri, "isLoaded":true, "hasChild":true
        };
    });
    var narrowerData = $.map(narrowerURIs, function(val, i) {
       var euri = val["@id"];
        var elabel = dataHash[uri]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
        return {
          "id":euri, "displayName":elabel + "-" + euri, "isLoaded":true, "hasChild":true
        };
    });
  
  
  
    //treeData[0]["children"] = closeData;
    treeData[0]["children"] = narrowerData;
    //Adding broader data
    var broaderData = $.map(broaderURIs, function(val, i) {
           var euri = val["@id"];
            var elabel = dataHash[uri]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
            return {
              "id":euri, "displayName":elabel + "-" + euri, "isLoaded":true, "hasChild":true, "children":treeData
            };
    });
    console.log("Tree data is");
    console.log(broaderData);
    $("#hierarchy").tree({
        data: function(){
          return broaderData
        },
  onDemandData:  function () {
  return  broaderData[0]["children"]
  }
    });
  
  }
  
  getDigitalCollections(query) {
     //For subjects
     var q = query.replace(/>/g, " ");
  }
  //URI = LCSH URI
  getWikidataInfo(LOCURI, callback) {
     // Given loc uri, can you get matching wikidata entities
          var wikidataEndpoint = "https://query.wikidata.org/sparql?";
        var localname = this.getLocalLOCName(LOCURI);
         var sparqlQuery = "SELECT ?entity ?entityLabel ?image ?description WHERE {?entity wdt:P244 \"" + localname + "\" . "
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
              context:this,
              success : function (data) {
                var wikidataParsedData = this.parseWikidataSparqlResults(data);
                callback(LOCURI, wikidataParsedData);
              }
  
            });
  
  }
  
  parseWikidataSparqlResults(data) {
        var output = {};
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
      }
  
  getLocalLOCName(uri) {
  
        return uri.split("/").pop();
  }
  
  retrieveInfoForFAST(uri, callback) {
        var url = "https://lookup.ld4l.org/authorities/fetch/linked_data/oclcfast_ld4l_cache?format=jsonld&uri=" + uri;
  
        $.ajax({
          "url": url,
          "type": "GET",
          context: this,
          "success" : function(data) {
            var relationships = this.extractFASTRelationships(uri, data);
            callback(relationships);
          }
        });
      }
  
  extractFASTRelationships(uri, data) {
        var broaderURIs = [];
        var narrowerURIs = [];
        var closeURIs = [];
        var narrowerProperty = "skos:narrower";
        var broaderProperty = "skos:broader";
        var closeProperty = "skos:related";
        var labelProperty = "skos:prefLabel";
        //Data = @context, @graph = [ {@id: id..., etc.]
        var dataHash = processLCSHJSON(data["@graph"]);
        narrowerURIs = processFASTEntityJSON(dataHash, narrowerProperty, uri);
        broaderURIs = processFASTEntityJSON(dataHash, broaderProperty, uri);
        closeURIs = processFASTEntityJSON(dataHash, closeProperty, uri);
  
        var entity = dataHash[uri];
        var label = entity[labelProperty];
        return {uri:uri, dataHash: dataHash, label: label, narrowerURIs: narrowerURIs, broaderURIs: broaderURIs, closeURIs: closeURIs, exactMatchURIs:[]};
      }
  
  processFASTEntityJSON(dataHash, property, uri) {
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
      }
  
  
  
  
  displayWikidataInfo(uri, data) {
    
   $("#description").html("");
   if("image" in data) {
     $("#description").append("<img class='img-thumbnail rounded float-left' style='width:200px;height:200px' src='" + data.image + "'>");
   }
   if("uriValue" in data) {
     $("#entityLabel #wd").html("<a href='" + data["uriValue"] + "'>WD</a>");
     //$("#description").append("URI:" + data["uriValue"] + "<br/>");
   }
  
   if("description" in data) {
     $("#description").append(data["description"]);
   }
  
  }
  
  
  
  searchDigitalCollectionFacet(facetName, facetValue, baseUrl) {
    //Facet value is a json array so need to get first value out
   
    var dcFacetName = (facetName === "fast_topic_facet") ?  "subject_tesim": facetName;
    //var thumbnailImageProp = "media_URL_size_0_tesim";
    var thumbnailImageProp = "awsthumbnail_tesim";
      var lookupURL = baseUrl + "proxy/facet?facet_field=" + dcFacetName + "&facet_value=" + facetValue;
      $.ajax({
        url : lookupURL,
        dataType : 'json',
        context:this,
        success : function (data) {
          // Digital collection results, append
          var results = [];
          var resultsHtml = "";
          if ("response" in data && "docs" in data.response) {
            results = data["response"]["docs"];
            var len = results.length;
            var l;
            for (l = 0; l < len; l++) {
              var result = results[l];
              var id = result["id"];
              var title = result["title_tesim"][0];
              var digitalURL = "http://digital.library.cornell.edu/catalog/" + id;
              var imageContent = "";
              if(thumbnailImageProp in result && result[thumbnailImageProp].length) {
                var imageURL = result[thumbnailImageProp][0];
                imageContent = "<a  target='_blank' title='" + title + "' href='" + digitalURL + "'><img style='max-width:90%;'  src='" + imageURL + "'></a>";
              }
              resultsHtml += "<li>";
              if(imageContent != "") {
                resultsHtml += "<div style='float:none;clear:both;'><div style='float:left;margin-bottom:5px;width:15%'>" + imageContent + "</div>";
              }
              resultsHtml += this.generateLink(digitalURL, title);
              if(imageContent != "") {
                resultsHtml += "</div>";
              }
              resultsHtml += "</li>";
              
            }
            //$("#dig-search-anchor").attr("href","http://digital.library.cornell.edu/?f[" + dcFacetName + "][]=" + dcFacetValue);
            $("#digcol").append(resultsHtml);
            
          }
        }
      });
      
    
    
  }
  
  generateLink(URI, label) {
    return label  + " <a class='data-src' target='_blank' title='" + label + "' href='" + URI + "'><img src='/assets/dc.png' /></a>";
  }
  
  //Histropedia function
  loadTimeline(periododata, relationships, data) {
    //Relationships for close/same matches should show periodo where it exists
    var periodoURI = "";
    var uri = relationships.uri;
    var lcsh = uri + ".html";
    //Don't really need below b/c have the mappings loaded from the data itself
    if("closeURIs" in relationships && relationships["closeURIs"].length > 0) {
      var closeURIs = relationships["closeURIs"];
      var periodoPrefix = "http://n2t.net/ark";
      $.each(closeURIs, function(i, v) {
        if(v["@id"].startsWith(periodoPrefix)) {
          periodoURI = v;
        }
      });
    }
    
    //map data to fit histropedia display requirements
    var mappedData = data["mapArray"];
    var selectedPeriod = data["lcshPeriod"];
    //console.log("period o uri " + periodoURI);
    //Go to article
    //var article = timeline1.getArticleById(lcsh);
    var initialDateYear = 1590;
    //console.log(article.data);
    //if(article && "data" in article && "from" in article.data && "year" in article["data"]["from"]) {
    if(selectedPeriod && "start" in selectedPeriod && "in" in selectedPeriod["start"] && "year" in selectedPeriod["start"]["in"]) {
      var year = selectedPeriod["start"]["in"]["year"];
      //Set initial date to this year
      initialDateYear = parseInt(year);
      //var date = new Histropedia.Dmy(year,1,1)
      // pan to date, with date located on left edge of canvas
      //timeline1.goToDateAnim(date, { offsetX: timeline.width/2 });
      /*
      article.setOption({
        starred: true
      })*/
      //timeline1.setStartDate(date);
    }
    
   
    //Will this work with Jquery?
    //var container = document.getElementById("timeline");
    var container = $("#timeline");
  
    var timeline1 = new Histropedia.Timeline( container, {
     initialDate:{
       year: initialDateYear, //1830,
       month: 1,
       day: 1
     },
     zoom: {
       initial:30
     },
     article: {
       density: Histropedia.DENSITY_HIGH,
       distanceToMainLine: 250
     }
    } );
    timeline1.load(mappedData); 
    //Get article to trigger mouse down event
    //That said we COULD just set the style of the article to highlight it
    var article = timeline1.getArticleById(lcsh);
    article.setStyle({"color": "#003333", "header":{"text":{"color":"#fff"}}});
    
    //timeline1.activated(article);
   //None of these approaches appear to work
    /*
    var article = timeline1.getArticleById(lcsh);
    var screenPos = timeline1.canvas.offset();
    var registeredPosition = article.registeredPosition;
    var testPos = { left: registeredPosition.left - screenPos.left, top: registeredPosition.top - screenPos.top };
  
    article.clicked(testPos);
    */
    /*
    var registeredPosition = {"left": 139, "top": 910};
    console.log(registeredPosition);
    var e = jQuery.Event( "mousedown", { pageX: registeredPosition.left+ 10, pageY: registeredPosition.top - 10,
      originalEvent: {
        touches: [{
          pageX: registeredPosition.left + 10,
          pageY: registeredPosition.top - 10
        }]
      };
    } );
    console.log(e);
    var canvas = timeline1.canvas;
    canvas.trigger(e);
    //requires "original event"
   */
  }
  
  //map periodo
  //Also return the periodo info for just this LCSH URL
  mapData(periododata, lcshURL) {
    var periods = periododata["periods"];
    var p;
    var mapArray = [];
    var lcshPeriod = null;
    for(p in periods) {
      var period = periods[p];
     
      var periodoid = period["id"];
      var lcsh = period["url"];
      
      if(lcshURL == lcsh) {
        lcshPeriod = period;
      }
      
      var label = period["label"];
      var mapped = {"id": lcsh, "periodoid": periodoid, "title": label};
      if("start" in period && "in" in period["start"] && "year" in period["start"]["in"]) {
        mapped["from"] = {"year":period["start"]["in"]["year"]};
      }
      if("stop" in period && "in" in period["stop"] && "year" in period["stop"]["in"]) {
            mapped["to"] = {"year":period["stop"]["in"]["year"]};
      }
      mapArray.push(mapped);
    }
    //console.log(mapArray);
    return {"mapArray": mapArray, "lcshPeriod":lcshPeriod};
   }
  
  //Given periodo, get coordinates display map
  generateMapForPeriodo(selectedPeriod, overlay) {
    console.log("selected period");
    console.log(selectedPeriod);
    if(selectedPeriod && selectedPeriod != null && "spatialCoverage" in selectedPeriod) {
      var spArray = selectedPeriod["spatialCoverage"];
      $.each(spArray, function(i, v) {
        var id = v["id"];
        var label = v["label"];
        if(id.startsWith("http://www.wikidata.org")) {
          //console.log("wikidata URI is " + id);
          this.getMapInfoForURI(id, label, overlay);
        }
      }.bind(this));
    }
  }
  
  //Generate actual map using provided coordinates
  //Given an identifier, retrieve map coordinates 
  getMapInfoForURI(uri, label, overlay) { 
    var wikidataEndpoint = "https://query.wikidata.org/sparql?";
    var sparqlQuery = "SELECT ?wlon ?slat ?elon ?nlat ?clon ?clat WHERE {"
      + "OPTIONAL {<" + uri + "> wdt:P625 ?coords . BIND(geof:longitude(?coords) AS ?clon) BIND(geof:latitude(?coords) AS ?clat) }"
      + "OPTIONAL {<" + uri + "> wdt:P1335 ?w ; wdt:P1333 ?s; wdt:P1334 ?e; wdt:P1332 ?n . BIND( geof:longitude(?w) AS ?wlon) BIND(geof:latitude(?s) AS ?slat) BIND(geof:longitude(?e) AS ?elon) BIND(geof:latitude(?n) AS ?nlat)}"
      + "} ";
  console.log(sparqlQuery);
    $.ajax({
      url : wikidataEndpoint,
      headers : {
        Accept : 'application/sparql-results+json'
      },
      data : {
        query : sparqlQuery
      },
      context:this, //setting "this" within success call to the class "this"
      success : function (data) {
        if (data && "results" in data
            && "bindings" in data["results"]) {
          var bindings = data["results"]["bindings"];
          var bLength = bindings.length;
          var b;
           for (b = 0; b < bLength; b++) {
            var binding = bindings[b];
            var geoInfo = this.generateCoordinateInfo(binding);
           
            if("Point" in geoInfo) {
              var lat = geoInfo["Point"]["lat"];
              var lon = geoInfo["Point"]["lon"];
                // mymap.setView([lat,lon], 10);
              //var link = "<a href='#' auth='" + label + "'>" + label + ":" + facetValue + "</a>";
              var link = label;
              this.addPointOverlay(overlay, lat, lon, link, true);
              //map.setView
            }
  
           }
        }
  
      }
  
    });
  
  }
  
  generateCoordinateInfo(binding) {
    var geoInfo = {};
    if("clon" in binding && "clat" in binding && "value" in binding["clon"] && "value" in binding["clat"]) {
      geoInfo["Point"] = {"lon": binding["clon"]["value"], "lat": binding["clat"]["value"]};
    }
    if("wlon" in binding && "slat" in binding && "elon" in binding && "nlat" in binding &&
        "value" in binding["wlon"] && "value" in binding["slat"] && "value" in binding["elon"] && "value" in binding["nlat"]) {
      geoInfo["bbox"] = binding["wlon"]["value"] + " " + binding["slat"]["value"] + " " + binding["elon"]["value"] + " " + binding["nlat"]["value"];
    }
    return geoInfo;
  }
  
  addPointOverlay(overlay, lat, lon, link, highlight) {
    if(lat && lon) {
      var marker = L.marker([lat, lon]);
      marker.bindPopup(link);
      if(highlight) {
        var greenIcon = new L.Icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        marker = L.marker([lat, lon], {icon: greenIcon});
        marker.bindPopup(link);
      } 
      overlay.addLayer(marker);
    }
  }
  
  initMap () {
    var overlay = L.layerGroup();
  
    var mymap= L.map('map', {minZoom: 2,
        maxZoom: 18});
    mymap.setView([0, 0], 0);
    mymap.addLayer(overlay);
  
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{retina}.png', {
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://carto.com/attributions">Carto</a>',
          maxZoom: 18,
          worldCopyJump: true,
          retina: '@2x',
          detectRetina: false
        }
      ).addTo(mymap);   
    return {"overlay":overlay, "map": mymap};
  } 
  
  //Process spatial info and put all the points on
  processSpatialInfo(overlay) {
    //var spatialInfo -> array of all information with coordinates, mapping back to periodo
    var wdURIsVisited = {};
    var eThis = this;
    $.each(spatialInfo, function(i, v) {   
      var uri = v["uri"];//LCSH
      var wduri = v["wduri"];
      if(! (wduri in wdURIsVisited)) {
        wdURIsVisited[wduri] = [];
        wdURIsVisited[wduri].push(v);
        var label = v["label"];
        if("Point" in v) {
          var geoInfo = v["Point"];
          eThis.addPointOverlay(overlay, geoInfo["lat"], geoInfo["lon"], label, false);
        }
      } else {
        wdURIsVisited[wduri].push(v);
      }
    });
    //The other way to do this is $.each().bind
     
  } 
  
  getCatalogResults(fastHeading, baseUrl) {
    //empty out 
    this.clearSearchResults();
    //Multiple possibilities for subject search, with person etc. also possible in which case search field changes
    var searchLink = baseUrl + "?q=\"" + fastHeading + "\"&search_field=subject_topic_browse";
    var searchFAST = "<a href='" + searchLink + "'>Search Catalog</a>";
    $.ajax({
      "url": searchLink,
      "type": "GET",
      "success" : function(data) {     
        var documents = $(data).find("#documents");
        var pageEntries = $(data).find("span.page-entries");  
        if(documents.length) {
          $("#page-entries").html("<a href='" + searchLink + "'>Search Results for " + fastHeading + ": " + pageEntries.html() + "</a>");
          $("#documents").html(documents.html());
        }
      }
    });
  }
  clearSearchResults() {
    $("#page-entries").html("");
    $("#documents").html("");
  }
  
  //Get information from DbPedia
  
  //Methods to get information from other/related indices
  //Notice we will need to rely on labels in certain cases
  getCatalogWorksAboutSubject(uri, label) {
    //Do ajax request to proxy controller for subject heading search using this label
    var searchLabel = label.replace(/--/g," > ");
    var searchLink = this.baseUrl + "proxy/sauthsearch?q=" + searchLabel;
    $.ajax({
      "url": searchLink,
      "type": "GET",
      context: this,
      "success" : function(data) {     
        if("response" in data && "docs" in data["response"] && data["response"]["docs"].length > 0) {
          var doc = data["response"]["docs"]["0"];
          var counts_json = doc["counts_json"];
          var counts = JSON.parse(counts_json);
          this.displayWorksAboutSubject(counts);
        }
      }
    });
  }
  
  displayWorksAboutSubject(counts) {
    if("worksAbout" in counts) {
      $("#worksAbout").html("Works About: " + counts["worksAbout"] + "<br>");
    }
    if("worksBy" in counts) {
      $("#worksAbout").append("Works By: " + counts["worksAbout"]);
    }
  }
  
  //get LCCN
  getLCCN(uri, label) {
    var searchURI = uri.replace("https://", "http://");
    var searchLink = this.baseUrl + "proxy/bamsearch?q=" + searchURI;
    $.ajax({
      "url": searchLink,
      "type": "GET",
      context: this,
      "success" : function(data) {     
        if("response" in data && "docs" in data["response"] && data["response"]["docs"].length > 0) {
          var doc = data["response"]["docs"]["0"];
          var classification = doc["classification_ss"];//this will be an array
          this.displayClassificationBrowseLink(classification);
        }
      }
    });
  }
  
  displayClassificationBrowseLink(classification) {
    if(classification && classification.length) {
      var lccn = classification[0];
      var url = this.baseUrl + "browse?authq=" + lccn + "&browse_type=virtual";
      $("#classification").html("<a href='" + url + "'>Browse related call numbers</a>");
    }
    
  }
  
  

}
Blacklight.onLoad(function() {
  
  //Define method
  
  L.bboxToBounds = function(bbox) {
    bbox = bbox.split(' ');
    if (bbox.length === 4) {
      return L.latLngBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
    } else {
      throw "Invalid bounding box string";
    }
  };
  
  var eDisplay = new entityDisplay(uri);
  eDisplay.init();

  /*
  var timeline = initTimeline("subject-timeline");
  var mapInfo = initMap();
  var overlay = mapInfo["overlay"];
  var map = mapInfo["map"];
  processSpatialInfo(overlay);
  //Load uri and periodo data
  load(uri, periododata, overlay, timeline);*/
  
});  