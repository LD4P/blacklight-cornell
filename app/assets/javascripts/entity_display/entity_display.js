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
function getLCSHRelationships(uri, periododata, callback) {
      $.ajax({
        "url": uri + ".jsonld",
        "type": "GET",
        "success" : function(data) {
          var relationships = extractLCSHRelationships(uri, data);
          callback(relationships, periododata);
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
function execRelationships(relationships, periododata) {
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
  loadTimeline(periododata, relationships);
  
  
  //Digital collection results
  searchDigitalCollectionFacet("fast_topic_facet", digLabel, baseUrl);
  
  

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

function loadLCSHResource(uri, periododata) {
  getLCSHRelationships(uri, periododata, execRelationships);
 //get equivalent peri.do
 //get Wikidata URI
 getWikidataInfo(uri, displayWikidataInfo);

}

function load(uri, periododata) {
 //Afghanistan
 //var lcshURI = "https://id.loc.gov/authorities/names/n79063030";
  var lcshURI = "https://id.loc.gov/authorities/subjects/sh85001514";
  var fastURI = "http://id.worldcat.org/fast/798940";
  if(uri == "x") {
    loadLCSHResource(lcshURI, periododata);
  } else {
    loadLCSHResource(uri, periododata);
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
function loadTimeline(periododata, relationships) {
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
  var data = mapData(periododata, uri + ".html");
  var mappedData = data["mapArray"];
  var selectedPeriod = data["lcshPeriod"];
  console.log("period o uri " + periodoURI);
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
   article: {
     density: Histropedia.DENSITY_HIGH,
     distanceToMainLine: 200
   }
  } );
  timeline1.load(mappedData);
  
 
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


Blacklight.onLoad(function() {
  load(uri, periododata);
});  