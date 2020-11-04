function generateTree(relationships) {
  var dataHash = relationships.dataHash;
    var uri = relationships.uri;
    var label = relationships.label;
    var narrowerURIs = relationships.narrowerURIs;
    var closeURIs = relationships.closeURIs;
  var broaderURIs = relationships.broaderURIs;

  if(broaderURIs.length > 0) {
    var broaderDisplay = $.map(broaderURIs, function(v, i) {
      console.log(v);
       var blabel = dataHash[v["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
       return blabel + "-" + v["@id"];
    });
    $("#hierarchy").append(
    "<h4>Broader</h4><ul><li>" + broaderDisplay.join("</li><li>") + "</li></ul>"
    );
  }  
if(narrowerURIs.length > 0) {
    var narrowerDisplay = $.map(narrowerURIs, function(v, i) {
       var blabel = dataHash[v["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
       return blabel + "-" + v["@id"];
    });
    $("#hierarchy").append(
    "<h4>Narrower</h4><ul><li>" + narrowerDisplay.join("</li><li>") + "</li></ul>"
    );
  }

  if(closeURIs.length > 0) {
      var closeDisplay = $.map(closeURIs, function(v, i) {
         var blabel = dataHash[v["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"];
         return blabel + "-" + v["@id"];
      });
      $("#hierarchy").append(
      "<h4>Similar</h4><ul><li>" + closeDisplay.join("</li><li>") + "</li></ul>"
      );
  }


}
function generateTreeTest(relationships) {
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

function getDigitalCollections(query) {
   //For subjects
   var q = query.replace(/>/g, " ");
}
//URI = LCSH URI
function getWikidataInfo(LOCURI, callback) {
   // Given loc uri, can you get matching wikidata entities
        var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var localname = getLocalLOCName(LOCURI);
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
            success : function (data) {
              var wikidataParsedData = parseWikidataSparqlResults(data);
              callback(LOCURI, wikidataParsedData);
            }

          });

}

 function parseWikidataSparqlResults(data) {
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
    }

function  getLocalLOCName(uri) {

      return uri.split("/").pop();
}
function getLCSHRelationships(uri, periododata, overlay, callback) {
      $.ajax({
        "url": uri + ".jsonld",
        "type": "GET",
        "success" : function(data) {
          var relationships = extractLCSHRelationships(uri, data);
          callback(relationships, periododata, overlay);
        }
      });
    }
    function extractLCSHRelationships(inputURI, data) {
      var uri = inputURI.replace("https://","http://");
      var dataHash = processLCSHJSON(data);
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
    function processLCSHJSON(jsonArray) {
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
function retrieveInfoForFAST(uri, callback) {
      var url = "https://lookup.ld4l.org/authorities/fetch/linked_data/oclcfast_ld4l_cache?format=jsonld&uri=" + uri;

      $.ajax({
        "url": url,
        "type": "GET",
        "success" : function(data) {
          var relationships = extractFASTRelationships(uri, data);
          callback(relationships);
        }
      });
    }

    function extractFASTRelationships(uri, data) {
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
    function processFASTEntityJSON(dataHash, property, uri) {
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


//These separate functions should be more cleanly broken out
function execRelationships(relationships, periododata, overlay) {
  //Display label
  var label = relationships.label;
  $("#entityLabel").append("<br>" + label);
  $("#displayContainer").attr("label", label);
      generateTree(relationships);
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
  var mappedData = mapData(periododata, lcsh);
  loadTimeline(periododata, relationships, mappedData);
  //Map
  var selectedPeriod = mappedData["lcshPeriod"];
  generateMapForPeriodo(selectedPeriod, overlay);
  //Digital collection results
  searchDigitalCollectionFacet("fast_topic_facet", digLabel, baseUrl);
  //Catalog results
  getCatalogResults(digLabel, baseUrl);
  
  

}

function displayWikidataInfo(uri, data) {
 console.log(uri);
 console.log(data);
 $("#description").html("");
 if("image" in data) {
   $("#description").append("<img class='img-thumbnail rounded float-left' style='width:200px;height:200px' src='" + data.image + "'>");
 }
 if("uriValue" in data) {
   $("#description").append("URI:" + data["uriValue"] + "<br/>");
 }

 if("description" in data) {
   $("#description").append("<br/>Description:" + data["description"]);
 }

}

function loadLCSHResource(uri, periododata, overlay) {
  getLCSHRelationships(uri, periododata, overlay, execRelationships);
 //get equivalent peri.do
 //get Wikidata URI
 getWikidataInfo(uri, displayWikidataInfo);

}

function load(uri, periododata, overlay) {
 //Afghanistan
 //var lcshURI = "https://id.loc.gov/authorities/names/n79063030";
  var lcshURI = "https://id.loc.gov/authorities/subjects/sh85001514";
  var fastURI = "http://id.worldcat.org/fast/798940";
  if(uri == "x") {
    loadLCSHResource(lcshURI, periododata, overlay);
  } else {
    loadLCSHResource(uri, periododata, overlay);
  }
}

function searchDigitalCollectionFacet(facetName, facetValue, baseUrl) {
  //Facet value is a json array so need to get first value out
 
  var dcFacetName = (facetName === "fast_topic_facet") ?  "subject_tesim": facetName;
  //var thumbnailImageProp = "media_URL_size_0_tesim";
  var thumbnailImageProp = "awsthumbnail_tesim";
    var lookupURL = baseUrl + "proxy/facet?facet_field=" + dcFacetName + "&facet_value=" + facetValue;
    $.ajax({
      url : lookupURL,
      dataType : 'json',
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
            resultsHtml += generateLink(digitalURL, title);
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

function generateLink(URI, label) {
  return label  + " <a class='data-src' target='_blank' title='" + label + "' href='" + URI + "'><img src='/assets/dc.png' /></a>";
}

//Histropedia function
function loadTimeline(periododata, relationships, data) {
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
function mapData(periododata, lcshURL) {
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
function generateMapForPeriodo(selectedPeriod, overlay) {
  console.log("selected period");
  console.log(selectedPeriod);
  if("spatialCoverage" in selectedPeriod) {
    var spArray = selectedPeriod["spatialCoverage"];
    $.each(spArray, function(i, v) {
      var id = v["id"];
      var label = v["label"];
      if(id.startsWith("http://www.wikidata.org")) {
        //console.log("wikidata URI is " + id);
        getMapInfoForURI(id, label, overlay);
      }
    });
  }
}

//Generate actual map using provided coordinates
//Given an identifier, retrieve map coordinates 
function getMapInfoForURI(uri, label, overlay) { 
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
    success : function (data) {
      if (data && "results" in data
          && "bindings" in data["results"]) {
        var bindings = data["results"]["bindings"];
        var bLength = bindings.length;
        var b;
         for (b = 0; b < bLength; b++) {
          var binding = bindings[b];
          var geoInfo = generateCoordinateInfo(binding);
         
          if("Point" in geoInfo) {
            var lat = geoInfo["Point"]["lat"];
            var lon = geoInfo["Point"]["lon"];
              // mymap.setView([lat,lon], 10);
            //var link = "<a href='#' auth='" + label + "'>" + label + ":" + facetValue + "</a>";
            var link = label;
            addPointOverlay(overlay, lat, lon, link, true);
            //map.setView
          }

         }
      }

    }

  });

}

function generateCoordinateInfo(binding) {
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

function addPointOverlay(overlay, lat, lon, link, highlight) {
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

function initMap () {
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
function processSpatialInfo(overlay) {
  //var spatialInfo -> array of all information with coordinates, mapping back to periodo
  var wdURIsVisited = {};
  $.each(spatialInfo, function(i, v) {   
    var uri = v["uri"];//LCSH
    var wduri = v["wduri"];
    if(! (wduri in wdURIsVisited)) {
      wdURIsVisited[wduri] = [];
      wdURIsVisited[wduri].push(v);
      var label = v["label"];
      if("Point" in v) {
        var geoInfo = v["Point"];
        addPointOverlay(overlay, geoInfo["lat"], geoInfo["lon"], label, false);
      }
    } else {
      wdURIsVisited[wduri].push(v);
    }
  });
   
}
function getCatalogResults(fastHeading, baseUrl) {
  //empty out 
  clearSearchResults();
  //Multiple possibilities for subject search, with person etc. also possible in which case search field changes
  var searchLink = baseUrl + "?q=" + fastHeading + "&search_field=subject_topic_browse";
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
function clearSearchResults() {
  $("#page-entries").html("");
  $("#documents").html("");
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
  var mapInfo = initMap();
  var overlay = mapInfo["overlay"];
  var map = mapInfo["map"];
  processSpatialInfo(overlay);
  //Load uri and periodo data
  load(uri, periododata, overlay);
  
});  