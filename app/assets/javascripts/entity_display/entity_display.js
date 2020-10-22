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
function getLCSHRelationships(uri, callback) {
      $.ajax({
        "url": uri + ".jsonld",
        "type": "GET",
        "success" : function(data) {
          var relationships = extractLCSHRelationships(uri, data);
          callback(relationships);
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



function execRelationships(relationships) {
      generateTree(relationships);

}

function displayWikidataInfo(uri, data) {
 console.log(uri);
 console.log(data);
 $("#description").html("");
 if("uriValue" in data) {
   $("#description").html("<h4>URI</h4>" + data["uriValue"]);
 }
 if("description" in data) {
   $("#description").append("<h4>Description</h4>" + data["description"]);
 }
}

function loadLCSHResource(uri) {
  getLCSHRelationships(uri, execRelationships);
 //get equivalent peri.do
 //get Wikidata URI
 getWikidataInfo(uri, displayWikidataInfo);
}

function load() {
 //Afghanistan
 //var lcshURI = "https://id.loc.gov/authorities/names/n79063030";
  var lcshURI = "https://id.loc.gov/authorities/subjects/sh85001514";
  var fastURI = "http://id.worldcat.org/fast/798940";
  loadLCSHResource(lcshURI);
}

Blacklight.onLoad(function() {
  load();
});  