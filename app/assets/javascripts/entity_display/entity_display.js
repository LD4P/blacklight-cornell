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
    this.markers = {};
  } 
   
  //initialize function
  init() {
    this.baseUrl = $("#displayContainer").attr("base-url");
    this.timeline = this.initTimeline("subject-timeline");
    this.mapInfo = this.initMap();
    this.overlay = this.mapInfo["overlay"];
    this.map = this.mapInfo["map"];
    //this.processSpatialInfo(this.overlay);
    //Load uri and periodo data
    this.load(this.uri, periododata, this.overlay);
    $("#displayAll").removeAttr("checked");
    this.bindEventListeners();
  }
  
  bindEventListeners() {
    $('#searchTabs a').on('click', function (e) {
      e.preventDefault();
      $(this).tab('show');
    })
    
    var eThis = this;
    $("#displayAll").on("change", function(e) {
      if(this.checked) {
        //alert("checked");
        eThis.populateAllSubjects();
      } else {
        //alert("not checked");
        eThis.removeUnrelatedSubjects().bind(eThis);
      }
    });
    
  }

  populateAllSubjects() {
    //alert("populate!");
    //Query LCSH index to retrieve all subjects that have any temporal information or any location information
    //Transform temporal information into articles on timeline and add, designating as "removable" so the removal function will work
    //Transform 
    this.getAllSolrTempGeoDocs(this.displayAllTempGeo.bind(this));

  }
  
  removeUnrelatedSubjects() {
    //alert("remove!");
    this.timeline.articles = [];
    //this.timeline.requestRedraw();
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
    var hasComponents = this.hasComponents(doc);
    //Check to see that main document has temporal information
    
    if(hasTime) {
      this.hasTimeInfo = true;
      this.plotSubjectOnTimeline(this.timeline, doc);
      this.displayTimeText(doc);
    } 
    
    //Retrieve related solr documents
    //Before this is executed, we know whether or not the primary subject has temporal and geographic info
    this.retrieveRelatedSolrDocs(doc);
    
    //Need to find a better way to chain this or move it elsewhere
    this.getCatalogWorksAboutSubject(this.uri, this.label);
    this.getLCCN(this.uri, this.label);
    
    //Get map information
    if(hasMap) {
      this.displayMapText(doc);
      this.processMapInfo(doc, this.overlay);
    }
    
    //If there are components (individual), list those and get descriptions where possible and "works about"
    if(hasComponents) {
      this.displayComponents(doc);
    }
    
  }
  
  //check f any components exist
  hasComponents(doc) {
    return ("components_json_s" in doc);
  }
  
  displayComponents(doc) {
    var components = doc["components_json_s"];
    var cJSON = JSON.parse(components);
    var eThis = this;
    if(cJSON && cJSON.length > 0) {
      $.each(cJSON, function(i, v) {
        var uri = v["uri"];
        var label = v["label"];
        $("#description").append("<div role='descComponent' uri='" + uri + "'>" + label + "<span class='component-works' uri='" + uri + "'></span></div>");  
        eThis.getWikidataInfo(uri, eThis.addComponentDescriptionInfo.bind(eThis));
        //Also get information about works about in the catalog for this component
        eThis.getCatalogWorksAboutComponent(uri, label);
      });
    }
    
    
  }
  
  
  
  addComponentDescriptionInfo(uri, data) {
    var htmlDisplay = this.generateComponentDescription(uri, data);
    $("div[role='descComponent'][uri='" + uri + "']").append(htmlDisplay);
  }
  
  generateComponentDescription(uri, data) {
    var htmlDisplay = "";
    if("description" in data) {
      htmlDisplay = ": <span class='capitalize'>" + data["description"] + "</span>";
    }
    return htmlDisplay;
  }
  
  
  displayTimeText(doc) {
    $("#timeInfo").removeClass("d-none");
    var temporalFields = ["periodo_start_i", "periodo_stop_i", "temp_start_i", "temp_stop_i"];
    var startTime = this.retrieveAvailableField(["periodo_start_i", "temp_start_i"], doc);
    var endTime = this.retrieveAvailableField(["periodo_stop_i", "temp_stop_i"], doc);
    var displayText = (startTime != null)? startTime : "";
    displayText += (endTime != null)? " - " + endTime : "";
    $("#mainTime").html(displayText);

  }
  
  displayMapText(doc) {
    $("#locationInfo").removeClass("d-none");
    //Currently we are making a decision of preferring the PeriodO to the label, but this may change
    var locations = this.retrieveAvailableField([ "spatial_coverage_label_ss", "geo_label_ss"], doc);
    if(locations != null) {
      $("#mainLocations").html(locations.join(", "));
    }
    
  }
   
  //for a Solr document, check if temporal information, either from period o or from another source exists
  hasTimelineInfo(doc) {
    var temporalFields = ["periodo_start_i", "periodo_stop_i", "temp_start_i", "temp_stop_i"];
   return this.hasFieldInDoc(temporalFields, doc);
  }
  
  hasGeographicInfo(doc) {
    var geographicFields = ["spatial_coverage_ss", "geo_wd_ss"];
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
  
  //Depending on the ordering of the fields in array, returns the first value returned
  retrieveAvailableField(fieldArray, doc) {
    var value = null;
    $.each(fieldArray, function(k, v) {
      if(v in doc) {
        value = doc[v];
        //to break out of the each loop
        return false;
      }
    });
    return value;
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
    var uri = doc["uri_s"];
    var label = doc["label_s"];
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
        this.handleNoPrimaryTime(this.timeline, uri);
      }
    }
    
    if(this.hasGeographicInfo(doc)) {
      this.processMapInfo(doc, this.overlay);
    }
    //the above relies on the call for grabbing broader and narrower information for map and timeline display
    //the broader/narrower display in the top section still relies entirely on a live LCSH call
    //this.getCatalogWorksAboutRelatedSubjects(uri, label);
        
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
  
  //Method to retrieve all documents
  getAllSolrTempGeoDocs(callback, callbackData) {
    var baseURL = $("#displayContainer").attr("base-url");
    var solrDocCall = $.ajax({
      "url": baseURL+ "proxy/lcshsearch?tempgeo=true",
      "type": "GET",
      "success" : function(data) {
        
        if("response" in data && "docs" in data["response"] && data["response"]["docs"].length > 0) {
          var docs = data["response"]["docs"];
          if(callbackData) {
            callback(docs, callbackData);
          } else {
            callback(docs);
          }
        } 
        
      }
    });
    return solrDocCall;
  }
  
  displayAllTempGeo(docs) {
    var eThis = this;
    $.each(docs, function(i, v) {
      eThis.displayUnrelatedSubject(v);
    });
  }
  
  //this is the regular display of related subject minus other functionality so some refactoring could occur here
  displayUnrelatedSubject(doc) {
      var uri = doc["uri_s"];
      var label = doc["label_s"];
     
      if(this.hasTimelineInfo(doc)) {
        //Check if not already on timeline
        var a = this.timeline.getArticleById(uri);
        if(!a) {
          this.plotRelatedSubjectOnTimeline(this.timeline, doc, "unrelated");
        }
      }
      
      if(this.hasGeographicInfo(doc)) {
        //this.processMapInfo(doc, this.overlay);
      }          
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
    if ("spatial_coverage_label_ss" in doc || "geo_label_ss" in doc) {
      var spatial_label = ("spatial_coverage_label_ss" in doc) ? doc["spatial_coverage_label_ss"]: doc["geo_label_ss"];
      article["spatial_label"] =  spatial_label;
    } 
    
    if ( "spatial_coverage_ss" in doc || "geo_wd_ss" in doc) {
      var spatial_uris = ( "spatial_coverage_ss" in doc ) ? doc["spatial_coverage_ss"]: doc["geo_wd_ss"];
      article["spatial_coverage_ss"] =  spatial_uris;
      //article["spatialMarkers"] = this.markers; 
    }
    
    if("wikidata_uri_s" in doc) {
      article["wikidata_uri"] = doc["wikidata_uri_s"];
    }
    
    if("components_json_s" in doc) {
      article["components"] = doc["components_json_s"];
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
    //Clear out html
    $("#timelineInfo").html("");
    var articleType = article["data"]["articleType"];
    var labelDisplay = "Subject";
    //Commenting this out for now
    //For some reason, all subjects are displaying as narrower
    //Ensure that article type works correctly
    //console.log(articleType);
    /*
    if(articleType != "primary") {
      labelDisplay = (articleType == "broader")? "Broader ": (articleType == "narrower") ? "Narrower ": "Related ";
      labelDisplay += "Subject";
    }*/
    var htmlDisplay = "<h4>" + labelDisplay + ": " + article.title + "<span class='subject-panel-works' uri='" + article["data"]["id"] + "'></span></h4>";
    
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
    
    if("spatial_coverage_ss" in article["data"]) {
      var spatialUris = article["data"]["spatial_coverage_ss"];
      var eThis = this;
      var highlightIcon = this.getHighlightIcon();
      $.each(spatialUris, function(k, v) {
        if(v in eThis.markers) {
          var m = eThis.markers[v];         
          m.setIcon(highlightIcon);
        }
      });
     
      //var m = article["data"]["spatialMarkers"][u];
      //m.setIcon("https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png");
    }
    
    //
   
    
    htmlDisplay += "<div role='components'></div>";
    $("#timelineInfo").html(htmlDisplay);
    
    if(articleType != "primary" && "wikidata_uri" in article["data"]) {
      //htmlDisplay += "<div id='wikidataPanel'></div>";
      //need to work out URI
      //this.getWikidataInfoForWDURI(article["data"]["wikidata_uri"], this.displayPanelWikidataInfo);
      this.getWikidataInfo(article["data"]["id"], this.displayPanelWikidataInfo.bind(this));
    }
    if("components" in article["data"]) {
      var components = article["data"]["components"];
      var cJSON = JSON.parse(components);
      //This should result in an array 
      this.getComponentsWikidataInfo(cJSON);
    }
    
  }
  
  //toggle all icons
  highlightIcon(marker) {
    var highlightIcon = this.getHighlightIcon();
    marker.setIcon(highlightIcon);
  }
   
  resetIcons() {
    var defaultIcon = this.getDefaultIcon();
    $.each(this.markers, function(k, v) {
      v.setIcon(defaultIcon);
    });
  }
  
  getHighlightIcon() {
    var highlightIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    return highlightIcon;
  }
  
  getDefaultIcon() {
    var defaultIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    return defaultIcon;
  }
  
  displayPanelWikidataInfo(uri, data) {
    var htmlDisplay = this.generatePanelWikidataInfo(uri, data);
    $("#timelineInfo").append(htmlDisplay);
    
  }
  
  generatePanelWikidataInfo(uri, data) {
    var htmlDisplay = "";
    if("image" in data) {
      htmlDisplay += "<div class='entityImage float-left'><img class='img-thumbnail rounded'  src='" + data.image + "'></div>";
    }
  
    if("description" in data) {
      htmlDisplay += "<div class='float-left capitalize w-50'>" + data["description"] + "</div>";
    }
    
    htmlDisplay = "<div class='float-none'>" + htmlDisplay + "</div>";
    return htmlDisplay;
  }
  
  addComponentPanelInfo(uri, data) {
    var htmlDisplay = this.generatePanelWikidataInfo(uri, data);
    $("div[role='component'][uri='" + uri + "']").append(htmlDisplay);
  }
  
  getComponentsWikidataInfo(cJSON) {
    var eThis = this;
    if(cJSON && cJSON.length > 0) {
      $.each(cJSON, function(i, v) {
        var uri = v["uri"];
        var label = v["label"];
        $("div[role='components']").append("<div class='float-none clearfix' role='component' uri='" + uri + "'>" + label + "<span class='component-panel-works' uri='" + uri + "'></span></div>");  
        eThis.getWikidataInfo(uri, eThis.addComponentPanelInfo.bind(eThis));
        //could turn this into a promise so the next ajax call is fired afterwards
        eThis.getCatalogWorksAboutPanelComponent(uri, label);
      });
    }
    
  }
  //refactor with above to make cleaner
  
  
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
    //this.searchDigitalCollectionFacet("fast_topic_facet", digLabel, baseUrl);
    this.searchDigitalCollectionFacet("subject_tesim", digLabel, baseUrl);

    //Catalog results
    this.getCatalogResults(digLabel, baseUrl);
    this.searchRepositories(digLabel, baseUrl);
  
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
    var narrowerDisplay = this.generateHierarchyCategory(narrowerURIs, "Narrower", dataHash, baseUrl);
    
    //if both broader and narrower to be displayed, also put in "arrow"
    $("#broader").append(broaderDisplay);
    $("#narrower").append(narrowerDisplay);
   // var closeDisplay = this.generateHierarchyCategory(closeURIs, "Similar", dataHash, null);
   // $("#close").append(closeDisplay);
    
    //For each of the broader and narrower URIs, see if counts can be retrieved from production 
    //If broader/narrower info relies on index instead, this code will need to be consolidated with that section
    var eThis = this;
    $.each(broaderURIs, function(i, v) {
      var label = dataHash[v["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
      var uri = v["@id"].replace("http://","https://");
      eThis.getCatalogWorksAboutRelatedSubjects(uri, label);
    });
    $.each(narrowerURIs, function(i, v) {
      var label = dataHash[v["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
      var uri = v["@id"].replace("http://","https://");
      eThis.getCatalogWorksAboutRelatedSubjects(uri, label);
    });

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
         var linkHtml = "<a href='" + link + "'>Details</a>";
         //return label + " <a href='" + link + "'>See Details</a>" ;
         return "<div class='col-md'>" + label + "<span class='author-works' uri='" + uri + "'></span></div><div class='col-md'>" + linkHtml + "</div>" ;
      });
      //display = 
      //"<h6>" + heading + "</h6><ul><li>" + displayArray.join("</li><li>") + "</li></ul>";
      display = 
        "<div class='row h5 bento_item_title'>" + heading + "</div>" + 
        "<div class='row'>" + displayArray.join("</div><div class='row'>") + "</div>";
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
  
  getWikidataInfoForWDURI(WDURI, callback) {
       var wikidataEndpoint = "https://query.wikidata.org/sparql?";
        var sparqlQuery = "SELECT ?image ?description WHERE {"
             + " OPTIONAL {<" + WDURI + "> wdt:P18 ?image . }"
             + " OPTIONAL {<" + WDURI + "> schema:description ?description . FILTER(lang(?description) = \"en\")}"
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
               callback(WDURI, wikidataParsedData);
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
     $("#mainImage").removeClass("d-none");
     $("#mainImage").html("<img class='img-fluid imgDisplay d-block mx-auto' src='" + data.image + "'>");
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
    var lookupURL = baseUrl + "proxy/digbento?q=" + facetValue + "&search_field=subject&per_page=3";
    $.ajax({
      url : lookupURL,
      type: "GET",
      context:this,
      success : function (data) {
        if(data != null) {
          var documents = $(data).find("#entity-results");          
          if(documents.length) {
            $("#digitalSearch").html(documents.html());
          }
        } 
      }
    }); 
  }
  
  /*
  searchDigitalCollectionFacet(facetName, facetValue, baseUrl) {
    //Facet value is a json array so need to get first value out
   
    //var dcFacetName = (facetName === "fast_topic_facet") ?  "subject_tesim": facetName;
    var dcFacetName = "subject_tesim";
    var thumbnailImageProp = "media_URL_size_0_tesim";
    //var thumbnailImageProp = "awsthumbnail_tesim";
      var lookupURL = baseUrl + "proxy/facet?facet_field=" + dcFacetName + "&rows=3&facet_value=" + facetValue;
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
              var itemDisplay = "";
              var result = results[l];
              var id = result["id"];
              var title = result["title_tesim"][0];
              var digitalURL = "http://digital.library.cornell.edu/catalog/" + id;
              var counter = l + 1;
              var titleDisplay = "<h2 class='blacklight-title_display'>" + counter + ". <a href='" + digitalURL + "' target='_blank'>" + title + "</a></h2>";
              
              var imageContent = "";
              if(thumbnailImageProp in result && result[thumbnailImageProp].length) {
                var imageURL = result[thumbnailImageProp][0];
                imageContent = "<a  target='_blank' title='" + title + "' href='" + digitalURL + "'><img style='max-width:90%;'  src='" + imageURL + "'></a>";
              }
              
              if(imageContent != "") {
                itemDisplay += "<div style='float:none;clear:both;'><div style='float:left;margin-bottom:5px;width:15%'>" + imageContent + "</div>";
              }
              //resultsHtml += this.generateLink(digitalURL, title);
              itemDisplay += titleDisplay;

              if(imageContent != "") {
                itemDisplay += "</div>";
              }
              itemDisplay = '<div class="document blacklight-book row">' + 
              '<div class="document-data col-lg">' + itemDisplay + "</div></div>";
              resultsHtml += itemDisplay;
              
            }
            //$("#dig-search-anchor").attr("href","http://digital.library.cornell.edu/?f[" + dcFacetName + "][]=" + dcFacetValue);
            
            if("response" in data && "pages" in data["response"] && "total_count" in data["response"]["pages"]) {
              var total = data["response"]["pages"]["total_count"];
              var searchURL = "http://digital.library.cornell.edu/?f[subject_tesim][]=" + facetValue;
              var showNumber = (parseInt(total) > 3)? 3: total;
              var pages = "<a href='" + searchURL + "'>Search Results for " + facetValue + ":<strong>1</strong> - <strong>" + showNumber + "</strong> of <strong>" + total + "</strong></a>";
              resultsHtml = "<div>" + pages + "</div>" + resultsHtml;
            }
            
            
            
            $("#digitalSearch").html(resultsHtml);
            
          }
        }
      });
      
    
    
  }
  */
  searchRepositories(value, baseUrl) {
    
    //This relies on the bento box information retrieval and display
       
      var lookupURL = baseUrl + "institutional_repositories/index?view=entity&search_field=subject&per_page=3&q=" + value;
      $.ajax({
        url : lookupURL,
        type: "GET",
        context:this,
        success : function (data) {
          if(data != null) {
            var documents = $(data).find("#entity-results");          
            if(documents.length) {
              $("#repositoriesSearch").html(documents.html());
            }
          } 
        }
      }); 
  }
  
  /*
  searchRepositories(value, baseUrl) {
    var thumbnailImageProp = "media_URL_size_0_tesim";
    //var thumbnailImageProp = "awsthumbnail_tesim";
      var lookupURL = baseUrl + "proxy/reposearch?q=" + value;
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
              var itemDisplay = "";
              var result = results[l];
              var id = result["id"];
              var title = result["title_tesim"][0];
              var digitalURL = result["identifier_tesim"][0];
              var counter = l + 1;
              var titleDisplay = "<h2 class='blacklight-title_display'>" + counter + ". <a href='" + digitalURL + "' target='_blank'>" + title + "</a></h2>";
              
              var imageContent = "";
              if(thumbnailImageProp in result && result[thumbnailImageProp].length) {
                var imageURL = result[thumbnailImageProp][0];
                imageContent = "<a  target='_blank' title='" + title + "' href='" + digitalURL + "'><img style='max-width:90%;'  src='" + imageURL + "'></a>";
              }
              
              if(imageContent != "") {
                itemDisplay += "<div style='float:none;clear:both;'><div style='float:left;margin-bottom:5px;width:15%'>" + imageContent + "</div>";
              }
              //resultsHtml += this.generateLink(digitalURL, title);
              itemDisplay += titleDisplay;

              if(imageContent != "") {
                itemDisplay += "</div>";
              }
              itemDisplay = '<div class="document blacklight-book row">' + 
              '<div class="document-data col-lg">' + itemDisplay + "</div></div>";
              resultsHtml += itemDisplay;
              
            }
            //$("#dig-search-anchor").attr("href","http://digital.library.cornell.edu/?f[" + dcFacetName + "][]=" + dcFacetValue);
            
            if("response" in data && "numFound" in data["response"]) {
              var total = data["response"]["numFound"];
              //var searchURL = "http://digital.library.cornell.edu/?f[subject_tesim][]=" + facetValue;
              var showNumber = (parseInt(total) > 3)? 3: total;
              var pages = "Search Results for " + value + ":<strong>1</strong> - <strong>" + showNumber + "</strong> of <strong>" + total + "</strong>";
              resultsHtml = "<div>" + pages + "</div>" + resultsHtml;
            }
            
            
            
            $("#repositoriesSearch").html(resultsHtml);
            
          }
        }
      }); 
  }*/
  
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
    var sparqlQuery = "SELECT  ?itemLabel ?wlon ?slat ?elon ?nlat ?clon ?clat WHERE {"
      + "VALUES (?item) {(<" + uri + ">)}"
      + "OPTIONAL {<" + uri + "> wdt:P625 ?coords . BIND(geof:longitude(?coords) AS ?clon) BIND(geof:latitude(?coords) AS ?clat) }"
      + "OPTIONAL {<" + uri + "> wdt:P1335 ?w ; wdt:P1333 ?s; wdt:P1334 ?e; wdt:P1332 ?n . BIND( geof:longitude(?w) AS ?wlon) BIND(geof:latitude(?s) AS ?slat) BIND(geof:longitude(?e) AS ?elon) BIND(geof:latitude(?n) AS ?nlat)}"
      + " SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }"
      + "} ";
  //console.log(sparqlQuery);
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
            var label = binding["itemLabel"]["value"];
            var geoInfo = this.generateCoordinateInfo(binding);
           
            if("Point" in geoInfo) {
              var lat = geoInfo["Point"]["lat"];
              var lon = geoInfo["Point"]["lon"];
                // mymap.setView([lat,lon], 10);
              //var link = "<a href='#' auth='" + label + "'>" + label + ":" + facetValue + "</a>";
              var link = label;
              var marker = this.addPointOverlay(overlay, lat, lon, link, true);
              marker.on("click", this.mapMarkerClick.bind(this));
              marker["uri"] = uri;
              marker["label"] = label;
              this.markers[uri] = marker;
              //map.setView
            }
  
           }
        }
  
      }
  
    });
  
  }
  
  mapMarkerClick(e) {
    
    var uri = e.target.uri;
    var label = e.target.label;
    this.getWikidataInfoForWDURI(uri, this.displayMarkerPanel);
    //alert(uri);
    var htmlDisplay = label;
    //Get number of subjects and results associated with this particular location?
    //Across the catalog?
    //Location FOR a particular subject heading
    
   
    $("#timelineInfo").html(htmlDisplay);
  }
  
  displayMarkerPanel(uri, data) {
    var htmlDisplay = "";
    if("image" in data) {
      htmlDisplay += "<div class='entityImage float-left'><img class='img-thumbnail rounded'  src='" + data.image + "'></div>";
    }
  
    if("description" in data) {
      htmlDisplay += "<div class='float-left capitalize'>" + data["description"] + "</div>";
    }
    
    htmlDisplay = "<div class='float-none'>" + htmlDisplay + "</div>";
    $("#timelineInfo").append(htmlDisplay);
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
    var marker = null;
    if(lat && lon) {
      marker = L.marker([lat, lon]);
      marker.bindPopup(link);
      if(highlight) {
        var defaultIcon = this.getDefaultIcon();
        marker = L.marker([lat, lon], {icon: defaultIcon});
        marker.bindPopup(link);
      } 
      overlay.addLayer(marker);
    }
    return marker;
  }
  
  initMap () {
    var overlay = L.layerGroup();
  
    var mymap= L.map('map', {minZoom: 1,
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
  
  processMapInfo(doc, overlay) {
    //      var geographicFields = ["spatial_coverage_ss", "geo_uri_ss"];
    var eThis = this;
    if("spatial_coverage_ss" in doc && "spatial_coverage_label_ss") {
      var spatialCov = doc["spatial_coverage_ss"];
      var labels = doc["spatial_coverage_label_ss"];
      $.each(spatialCov, function(i, v) {   
        var wduri = v;
        //if a marker doesn't already exist
        //if(!wduri in eThis.markers) {
          //if(wduri in eThis.markers) console.log("in  marker already");
         label = labels[i] || "";
          eThis.getMapInfoForURI(v, label, overlay);   
        //}
      });
    } else if("geo_wd_ss" in doc && "geo_label_ss") {
      var spatialCov = doc["geo_wd_ss"];
      var labels = doc["geo_label_ss"];
      $.each(spatialCov, function(i, v) {   
        var wduri = v;
        //if a marker doesn't already exist
        //if(!wduri in eThis.markers) {
          //if(wduri in eThis.markers) console.log("in  marker already");
         label = labels[i] || "";
          eThis.getMapInfoForURI(v, label, overlay);   
        //}
      });
    } 
  }
  
  /*
  getCatalogResults(fastHeading, baseUrl) {
    //empty out 
    this.clearSearchResults();
    //Multiple possibilities for subject search, with person etc. also possible in which case search field changes
    var searchLink = baseUrl + "?q=\"" + fastHeading + "\"&search_field=subject_topic_browse&rows=3";
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
  
  */
  clearSearchResults() {
    $("#page-entries").html("");
    $("#documents").html("");
  }
  
  
  getCatalogResults(subject, baseUrl) {
  //The issue is that search_field=subject needs to map to something useful
    //To handle compponents, ensure that subject replaces "--" with " > "
    subject = subject.replace(/--/g, " > ");
    var lookupURL = baseUrl + "proxy/mainsearch?q=" + subject + "&search_field=subject&per_page=3";
    $.ajax({
      url : lookupURL,
      type: "GET",
      context:this,
      success : function (data) {
        if(data != null) {
          var documents = $(data).find("#entity-results");          
          if(documents.length) {
            $("#documents").html(documents.html());
          }
        } 
      }
    }); 
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
  
  //For broader and narrower, also do a call and then populate that particular section
  //TODO: This functionality may need to be reviewed and or merged with some of the other calls
  getCatalogWorksAboutRelatedSubjects(uri, label) {
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
          this.displayWorksAboutRelatedSubject(uri, counts);
        }
      }
    });
  }
  
  displayWorksAboutRelatedSubject(uri, counts) {
    if("worksAbout" in counts) {
      var c = counts["worksAbout"];
      if(c > 0) {
        $("span.author-works[uri='" + uri + "']").html("(Works About: " + c + ")");
      }
    }
    if("worksBy" in counts) {
      var c = counts["worksBy"];
      if(c > 0) {
        $("span.author-works[uri='" + uri + "']").append("(Works By: " + c + ")");
      }
    }
  }
  
  getCatalogWorksAboutComponent(uri, label) {
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
          this.displayWorksAboutComponent(uri, counts);
        }
      }
    });
  }
  
  displayWorksAboutComponent(uri, counts) {
    if("worksAbout" in counts) {
      var c = counts["worksAbout"];
      if(c > 0) {
        $("span.component-works[uri='" + uri + "']").html("(Works About: " + c + ")");
      }
    }
    if("worksBy" in counts) {
      var c = counts["worksBy"];
      if(c > 0) {
        $("span.component-works[uri='" + uri + "']").append("(Works By: " + c + ")");
      }
    }
  }
  
  //Refactor since this repeats the above and is only missing the callback
  getCatalogWorksAboutPanelComponent(uri, label) {
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
          this.displayWorksAboutPanelComponent(uri, counts);
        }
      }
    });
  }
  
  displayWorksAboutPanelComponent(uri, counts) {
    if("worksAbout" in counts) {
      var c = counts["worksAbout"];
      if(c > 0) {
        $("span.component-panel-works[uri='" + uri + "']").html("(Works About: " + c + ")");
      }
    }
    if("worksBy" in counts) {
      var c = counts["worksBy"];
      if(c > 0) {
        $("span.component-panel-works[uri='" + uri + "']").append("(Works By: " + c + ")");
      }
    }
  }
  
  
  displayWorksAboutSubject(counts) {
    if("worksAbout" in counts) {
      $("#worksAbout").html("Works About: " + counts["worksAbout"] + "<br>");
    }
    if("worksBy" in counts) {
      $("#worksAbout").append("Works By: " + counts["workBy"]);
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