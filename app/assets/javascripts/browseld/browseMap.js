var browseMap = {
    onLoad: function() {
      browseMap.init();
      browseMap.loadData();
    },
    init:function() {
      this.overlay = L.layerGroup();

      this.mymap= L.map('map', {minZoom: 2,
          maxZoom: 18});
      this.mymap.setView([0, 0], 0);
      this.mymap.addLayer(this.overlay);

      L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{retina}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://carto.com/attributions">Carto</a>',
            maxZoom: 18,
            worldCopyJump: true,
            retina: '@2x',
            detectRetina: false
          }
        ).addTo(this.mymap);      
    },
    loadData:function() {
      var baseUrl = $("#map").attr("base-url"); 
      var loadURL = baseUrl + "proxy/mapbrowse";
      $.ajax({
          url: loadURL,
          type:'GET',
          dataType:'json',
          success:function(data) {
            if("facet_counts" in data && "facet_fields" in data["facet_counts"] && "fast_geo_facet" in data["facet_counts"]["facet_fields"]) {
              var geofacets = data["facet_counts"]["facet_fields"]["fast_geo_facet"];
              var geohash = browseMap.convertFacetCounts(geofacets);

                $.each( geohash, function( key, value ) {
                  browseMap.getCoordinates(key,value);
                });
             }          
          }
      });
      
    },
    convertFacetCounts:function(facetArray) {
      var hash = {};
      var len = facetArray.length;
      var counter = 0;
      var name = "";
      var count = 0;
      for(var i= 0; i < len; i++) {
        if(counter == 0) {
          name = facetArray[i];
          counter++;
        } else {
          count = facetArray[i];
          hash[name] = count;
          counter = 0;
        }
      }
      return hash;
    },
    //Get label, get FAST URI, get coordinates if possible from there or Wikidata
    getCoordinates:function(fastLabel, facetValue) {
     // var label = fastLabel.replace(/--/g, " > ")
     var label = fastLabel.replace(" > ", "--");

      var baseUrl = $("#map").attr("base-url"); 
      var searchURL =  "https://lookup.ld4l.org/authorities/search/linked_data/oclcfast_ld4l_cache/place?q=" + label + "&maxRecords=1";

        //var searchURL = baseUrl + "proxy/qafast?q=" + label
        $.ajax({
            url: searchURL,
            type:'GET',
            dataType:'json',
            success:function(data) {
              if(data.length) {
               if("label" in data[0]) {
                  var rlabel = data[0]["label"];
                  var rURI = data[0]["uri"];
                  browseMap.getGeoInfo(rlabel, rURI, facetValue);
               }
            }
          }
        })
    },
   getGeoInfo:function(fastLabel, fastURI, facetValue) {
      var fastLocalName = fastURI.substring(fastURI.lastIndexOf("/") + 1, fastURI.length);
      var wikidataEndpoint = "https://query.wikidata.org/sparql?";
      var sparqlQuery = "SELECT ?wURI ?wlon ?slat ?elon ?nlat ?clon ?clat WHERE {?wURI wdt:P2163 \""
        + fastLocalName
        + "\"."
        + "OPTIONAL {?wURI wdt:P625 ?coords . BIND(geof:longitude(?coords) AS ?clon) BIND(geof:latitude(?coords) AS ?clat) }"
        + "OPTIONAL {?wURI wdt:P1335 ?w ; wdt:P1333 ?s; wdt:P1334 ?e; wdt:P1332 ?n . BIND( geof:longitude(?w) AS ?wlon) BIND(geof:latitude(?s) AS ?slat) BIND(geof:longitude(?e) AS ?elon) BIND(geof:latitude(?n) AS ?nlat)}"
        + "} ";

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
              var geoInfo = browseMap.generateCoordinateInfo(binding);
              /*
              if("bbox" in geoInfo) {
                var bbox = geoInfo["bbox"];
                 var bboxBounds = L.bboxToBounds(bbox);
          mymap.fitBounds(bboxBounds);
            addBoundsOverlay(overlay, bboxBounds);
              }*/
              if("Point" in geoInfo) {
                var lat = geoInfo["Point"]["lat"];
                var lon = geoInfo["Point"]["lon"];
                  // mymap.setView([lat,lon], 10);
                browseMap.addPointOverlay(browseMap.overlay, lat, lon, fastLabel + ":" + facetValue);
              }

             }
          }

        }
      });
  },
 generateCoordinateInfo:function(binding) {
    var geoInfo = {};
    if("clon" in binding && "clat" in binding && "value" in binding["clon"] && "value" in binding["clat"]) {
      geoInfo["Point"] = {"lon": binding["clon"]["value"], "lat": binding["clat"]["value"]};
    }
    if("wlon" in binding && "slat" in binding && "elon" in binding && "nlat" in binding &&
        "value" in binding["wlon"] && "value" in binding["slat"] && "value" in binding["elon"] && "value" in binding["nlat"]) {
      geoInfo["bbox"] = binding["wlon"]["value"] + " " + binding["slat"]["value"] + " " + binding["elon"]["value"] + " " + binding["nlat"]["value"];
    }
    return geoInfo;
  },
  addBoundsOverlay : function(overlay, bounds) {
    console.log("add bounds overlay");
     if (bounds instanceof L.LatLngBounds) {
       console.log("Add polygon layer");
       overlay.addLayer(L.polygon([
         bounds.getSouthWest(),
         bounds.getSouthEast(),
         bounds.getNorthEast(),
         bounds.getNorthWest()
       ]));
     }
 },
 addPointOverlay : function(overlay, lat, lon, label) {
   if(lat && lon) {
     var marker = L.marker([lat, lon]);
     marker.bindPopup(label);
     overlay.addLayer(marker);
   }
 }
}

Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-browsemap") >= 0 ) {
    //From GBL code
    //{String} bbox Space-separated string of sw-lng sw-lat ne-lng ne-lat
     L.bboxToBounds = function(bbox) {
        bbox = bbox.split(' ');
        if (bbox.length === 4) {
          return L.latLngBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
        } else {
          throw "Invalid bounding box string";
        }
      };

    browseMap.onLoad();
  }
});  