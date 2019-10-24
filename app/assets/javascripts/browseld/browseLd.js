var browseLd = {
    onLoad: function() {
      browseLd.bindEventHandlers();
    },
    bindEventHandlers: function() {
      //Clicking on LCCN category
      $("a").click(function(e) {
        return browseLd.handleLCCNClick(e, $(this));
      });
      //Clicking on subject
      $("#browsecontent").on("click", "div[headingtype='lcsh']", function(e) {
        return browseLd.handleLCSHClick(e, $(this));
      });
    },
    //Top level click, display appropriate div
    handleLCCNClick: function(e, target) {
      e.preventDefault();
      var heading = target.attr("heading");
      var headingtype = target.attr("headingtype");
      var headingTitle = target.attr("title");
      if (typeof headingtype !== typeof undefined && headingtype !== false) {
        //Hide the others
        $("div[headingtype='sub']").hide();
        //Show the appropriate sub categories of this top level LCCN category
        $("div[headingtype='sub'][heading='" + heading + "']").show();
      }
      var baseUrl = $("#classification_headings").attr("base-url");
      var querySolr = baseUrl + "proxy/subjectbrowse?q=" + heading;
      $.ajax({
        "url": querySolr,
        "type": "GET",
        "success" : function(data) {              
          browseLd.displaySubjectHeading(data, headingTitle);
        }
      });
      return false;
    },
    displaySubjectHeading:function(data, title) {
      var htmlDisplay = [];
      if("response" in data && "docs" in data["response"] && data["response"]["docs"].length) {
        var docs = data["response"]["docs"];
        var i;
        var len = docs.length;
        for(i = 0; i < len; i++) {
          var d = docs[i];
          htmlDisplay.push(browseLd.generateSubjectDisplay(d));
        }
      }
      $("#subjectcontent").html("<h5>Subject Headings for " + title + "</h5>" + htmlDisplay.join(" "));
    },
    generateSubjectDisplay: function(doc) {
      var html = "";
      var label = doc["label_s"];
      var uri = doc["uri_s"];
      var classification = doc["classification_s"];
      html += "<div headingtype='lcsh' uri='" + uri + "' label='" + label + "'>" + label + "</div>";
      return html;
    },
    handleLCSHClick: function(e, target) {
      e.preventDefault();
      var uri = target.attr("uri");
      var label = target.attr("label");
      $.ajax({
        "url": uri + ".jsonld",
        "type": "GET",
        "success" : function(data) {              
          browseLd.displaySubjectDetails(uri, label, data);
        }
      });
      return false;
    },
    displaySubjectDetails : function(uri, label, data) {
      var dataHash = browseLd.processLCSHJSON(data);
      var entity = dataHash[uri];
      var narrowerProperty = "http://www.loc.gov/mads/rdf/v1#hasNarrowerAuthority";
      var broaderProperty = "http://www.loc.gov/mads/rdf/v1#hasBroaderAuthority";
      var closeProperty = "http://www.loc.gov/mads/rdf/v1#hasCloseExternalAuthority";
      var narrowerURIs = [];
      var broaderURIs = [];
      var closeURIs = [];
      if(narrowerProperty in entity) {
        narrowerURIs = entity[narrowerProperty];
      }
      if(broaderProperty in entity) {
        broaderURIs = entity[broaderProperty];
      }
      if(closeProperty in entity) {
        closeURIs = entity[closeProperty];
      }
    
      $("#subjectdescription").html(browseLd.generateSubjectDetailsDisplay(uri, label, dataHash, narrowerURIs, broaderURIs, closeURIs));
      //Add searches
      var baseUrl = $("#classification_headings").attr("base-url");
      var fastURI = browseLd.extractFAST(closeURIs);
      var searchFAST = "";
      var searchLCSH = "<a href='" + baseUrl + "?q=" + label + "&search_field=subject_cts'>Search Catalog (Subject)</a>";

      if(fastURI != null) { 
       var fastLabel = browseLd.extractFASTLabel(fastURI, dataHash);
       searchFAST = "<a href='" + baseUrl + "?f[fast_topic_facet][]=" + fastLabel + "&q=&search_field=all_fields'>Search Catalog (FAST)</a>";
      }
      $("#subjectdescription").append(searchLCSH + "<br/>" + searchFAST);
      
    },
    processRelatedURIs : function(rArray, dataHash) {
      var display = [];
      var prefLabel = "http://www.w3.org/2004/02/skos/core#prefLabel";
      $.each(rArray, function(i,v) {
        var uri = v["@id"];
        display.push(browseLd.generateRelatedSubject(uri, dataHash[uri][prefLabel][0]["@value"]));
      });
      return display;
    },
    generateRelatedSubject: function(uri, label) {
      return "<li><a href='" + uri + "'>" + label + "</a></li>";
    },
    generateSubjectDetailsDisplay : function(uri, label, dataHash, narrowerURIs, broaderURIs, closeURIs) {
      var narrowerDisplay = browseLd.processRelatedURIs(narrowerURIs, dataHash);
      var broaderDisplay = browseLd.processRelatedURIs(broaderURIs, dataHash);
      var closeDisplay = browseLd.processRelatedURIs(closeURIs, dataHash);
      var broader = "<div><ul>" + broaderDisplay.join(" ") + "</ul></div>";
      var entity = "<div style='margin-left:5px'><h4>" + label + "</h4></div>";
      var narrower = "<div style='margin-left:20px'><ul>" + narrowerDisplay.join(" ") + "</ul></div>";
      var close = "<div><h5>Close Matches</h5><ul>" + closeDisplay.join(" ") + "</ul></div>";
      return broader + entity + narrower + close;
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
    extractFAST: function(array) {
      var returnURI = null;
      var fastPrefix = "http://id.worldcat.org/fast";
      $.each(array, function(i, v) {
        var uri = v["@id"];
        if(uri.startsWith(fastPrefix)) {
          returnURI = uri;
          return false;
        }
      });
      return returnURI;
    },
    extractFASTLabel: function(URI, dataHash) {
      var prefLabel = "http://www.w3.org/2004/02/skos/core#prefLabel";
      if(URI in dataHash && prefLabel in dataHash[URI] && dataHash[URI][prefLabel].length && "@value" in dataHash[URI][prefLabel][0]) {
        return dataHash[URI][prefLabel][0]["@value"];
      }
      return null;
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-subject") >= 0 ) {
    browseLd.onLoad();
  }
});  