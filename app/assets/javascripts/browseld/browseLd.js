var browseLd = {
    onLoad: function() {
      //If anything has been selected then we need to display this
      browseLd.updateSelected();
      browseLd.bindEventHandlers();
    },
    bindEventHandlers: function() {
      //Clicking on LCCN category
      $("a[heading]").click(function(e) {
        return browseLd.handleLCCNClick(e, $(this));
      });
      //Clicking on expand
      $("#expandlccn").click(function(e) {
        //Show top level nav
        $("#toplevelnav").removeClass("d-lg-none");
        $("#toplevelnavheading").hide();
      });
      //Clicking on subject
      $("#browsecontent").on("click", "div[headingtype='lcsh']", function(e) {
        return browseLd.handleLCSHClick(e, $(this));
      });
      $("#subjectdescription").on("click", "li[lcsh='related'] i", function(e) {
        return browseLd.handleRelated(e, $(this));
      });
    },
    //Top level click, display appropriate div
    handleLCCNClick: function(e, target) {
      e.preventDefault();
      var heading = target.attr("heading");
      var headingtype = target.attr("headingtype");
      var headingTitle = target.attr("title");
      //Any time a top level category or second level LCCN is selected, also clear out any content or parameter values
      browseLd.clearContent();
      browseLd.clearParameterValues();
      if (typeof headingtype !== typeof undefined && headingtype !== false && headingtype == "nav") {
        //Hide the top level nav categories and show heading for this subject
        $("a[headingtype='nav']").removeClass("selectedCard");
        target.addClass("selectedCard");
        $("#toplevelnav").addClass("d-lg-none");
        $("#toplevelnavheading").show();
        //Hide the subheadings and show only the one that corresponds to this top level
        $("div[headingtype='sub']").hide();
        //Show the appropriate sub categories of this top level LCCN category
        $("div[headingtype='sub'][heading='" + heading + "']").show();
        //Highlight first subcategory
        //the other 
        $("a[role='subheading']").removeClass("selectedCard");
        $("a[role='subheadingtop']").addClass("selectedCard");
      } else {
        //Subheading has been selected
        $("a[role='subheading']").removeClass("selectedCard");
        target.addClass("selectedCard");       
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
      $("#subjectcontent").html(htmlDisplay.join(" "));
      //If a parameter is given for a particular subject heading, trigger clicking on it
      var lcsh = $("#lcsh").val();
      if(lcsh != "") {
        var selectedLCSH = $("div[headingtype='lcsh'][label='" + lcsh + "']");
        if(selectedLCSH.length) selectedLCSH.trigger("click");
      }
    },
    generateSubjectDisplay: function(doc) {
      var html = "";
      var label = doc["label_s"];
      var uri = doc["uri_s"];
      var classification = doc["classification_s"];
      var displayStyle = "";
      html += "<div headingtype='lcsh' uri='" + uri + "' label='" + label + "'>" + label + "</div>";
      return html;
    },
    handleLCSHClick: function(e, target) {
      e.preventDefault();
      var uri = target.attr("uri");
      //Highlight selection
      $("div[headingtype='lcsh']").removeClass("selectedCard");
      target.addClass("selectedCard");
      browseLd.getLCSHRelationships(uri, browseLd.displaySubjectDetails);
      return false;
    },
    displaySubjectDetails : function(relationships) {    
     //Get main entity info and link
     var label = relationships.label;
     var baseUrl = $("#classification_headings").attr("base-url");
     var fastURI = browseLd.extractFAST(relationships.closeURIs);
     var searchFAST = "";
     var searchFASTURL = "";
     var searchLCSHURL = baseUrl + "?q=" + label + "&search_field=subject_cts";
     if(fastURI != null) { 
       var fastLabel = browseLd.extractFASTLabel(fastURI, relationships.dataHash);
       searchFASTURL = baseUrl + "?f[fast_topic_facet][]=" + fastLabel + "&q=&search_field=all_fields";
       searchFAST = "<a href='" + searchFASTURL + "'>Search Catalog (FAST)</a>";
       browseLd.getCatalogResults(fastLabel);

     }
     
     var entityLink = (searchFASTURL != "")? searchFASTURL: searchLCSHURL;
     var locHtml = browseLd.generateLOCLink(relationships.uri);
     var downChevron =   "<i class='fa fa-chevron-down' aria-hidden='true'></i>";
     var entity = "<div><h4>" + downChevron + "<a href='" + entityLink + "'>" + label + "</a> " + locHtml + "</h4></div>";
     		
     //Add main level heading
     $("#subjectdescription").html(entity);
      $("#subjectdescription").append(browseLd.generateSubjectDetailsDisplay(relationships.uri, label, relationships.dataHash, relationships.narrowerURIs, relationships.broaderURIs, relationships.closeURIs));
      //Add searches
      var baseUrl = $("#classification_headings").attr("base-url");
      var fastURI = browseLd.extractFAST(relationships.closeURIs);
      var searchFAST = "";
      var searchLCSH = "<a href='" + baseUrl + "?q=" + label + "&search_field=subject_cts'>Search Catalog (Subject)</a>"; 
      //We are not appending actual links here
      //$("#subjectdescription").append(searchLCSH + "<br/>" + searchFAST);
      
    },
    generateLOCLink: function(uri) {
      var locHtml = "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See Library of Congress' href='" + uri + ".html'><img src='/assets/loc.png' /></a>";
      return locHtml;
    },
    //create array of item display
    processRelatedURIs : function(rArray, dataHash) {
      var display = [];
      var prefLabel = "http://www.w3.org/2004/02/skos/core#prefLabel";
      $.each(rArray, function(i,v) {
        var uri = v["@id"];
        display.push(browseLd.generateRelatedSubject(uri, dataHash[uri][prefLabel][0]["@value"]));
      });
      return display;
    },
    //Using chevrons and not li
    generateRelatedSubject: function(uri, label) {
      var locHtml = browseLd.generateLOCLink(uri);
      var baseUrl = $("#classification_headings").attr("base-url");
      var searchUrl = baseUrl + "?q=" + label + "&search_field=subject_cts";
      var rightChevron = "<i class='fa fa-chevron-right' aria-hidden='true' uri='" + uri + "'></i>";
      return "<li lcsh='related' uri='" + uri + "'>" + rightChevron + "<a href='" + searchUrl + "'>" + label + "</a>" + locHtml + "</li>";
    },
    generateSubjectDetailsDisplay : function(uri, label, dataHash, narrowerURIs, broaderURIs, closeURIs) {
      var narrowerDisplay = browseLd.processRelatedURIs(narrowerURIs, dataHash);
      var broaderDisplay = browseLd.processRelatedURIs(broaderURIs, dataHash);
      var closeDisplay = browseLd.processRelatedURIs(closeURIs, dataHash);
      var broader = "<div><ul>" + broaderDisplay.join(" ") + "</ul></div>";
      var entity = "<div><h4>" + label + "</h4></div>";
      var narrower = "<div><ul class='relatedTree'>" + narrowerDisplay.join(" ") + "</ul></div>";
      var close = "<div><h5>Close Matches</h5><ul>" + closeDisplay.join(" ") + "</ul></div>";
      //Include link to LOC source 
      //return broader + entity + narrower + close;
      //Leaving out close for now but may be able to do something different with display here
      return narrower;
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
    },
    //Given URL, can you get broader and narrower JSON
    getLCSHRelationships: function(uri, callback) {
        $.ajax({
          "url": uri + ".jsonld",
          "type": "GET",
          "success" : function(data) {              
            var relationships = browseLd.extractLCSHRelationships(uri, data);
            callback(relationships);
          }
        });
    },
    extractLCSHRelationships: function(uri, data) {
      var dataHash = browseLd.processLCSHJSON(data);
      var entity = dataHash[uri];
      var narrowerProperty = "http://www.loc.gov/mads/rdf/v1#hasNarrowerAuthority";
      var broaderProperty = "http://www.loc.gov/mads/rdf/v1#hasBroaderAuthority";
      var closeProperty = "http://www.loc.gov/mads/rdf/v1#hasCloseExternalAuthority";
      var labelProperty = "http://www.w3.org/2004/02/skos/core#prefLabel";
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
    
      var label = entity[labelProperty][0]["@value"];
      return {uri:uri, dataHash: dataHash, label: label, narrowerURIs: narrowerURIs, broaderURIs: broaderURIs, closeURIs: closeURIs};
    }, 
    getCatalogResults: function(fastHeading) {
      //empty out documents
      $("#documents").html("");
      var baseUrl = $("#classification_headings").attr("base-url"); 
      var searchLink = baseUrl + "?f[fast_topic_facet][]=" + fastHeading + "&q=&search_field=all_fields";
      var searchFAST = "<a href='" + searchLink + "'>Search Catalog</a>";
      $.ajax({
        "url": searchLink,
        "type": "GET",
        "success" : function(data) {     
          var documents = $(data).find("#documents");
          var pageEntries = $(data).find("span.page-entries");        
          $("#page-entries").html("<a href='" + searchLink + "'>Search Results for " + fastHeading + ": " + pageEntries.html() + "</a>");
          $("#documents").html(documents.html());
        }
      });
    },
    //When clicking on narrower relationship (or broader), retrieve the relationships and then show the appropriate display
    //This should toggle between expanding and collapsing, in the case of the former, we need to get data if it doesn't already exist
    handleRelated: function(e, target) {
      //For now, just getting narrower subjects
      var uri = target.attr("uri");
      console.log("Handle related function for " + uri);
      browseLd.toggleChevron(target);
      //Does narrower set already exist
      var ulTree = target.parent().find("ul.relatedTree[uri='" + uri + "']");
      if(ulTree.length) {
        if(ulTree.is(":visible")) 
          ulTree.hide();
        else 
          ulTree.show();
      } else {
        browseLd.getLCSHRelationships(uri, browseLd.displayNarrower);
      }
    },
    //display method for displaying narrower 
    displayNarrower: function(relationships) {
      var requestingURI = relationships.uri;
      var narrowerURIs = relationships.narrowerURIs;
      var broaderURIs = relationships.broaderURIs;
      //remove requesting URI from broader uri list of narrower object
      broaderURIs = broaderURIs.filter(function(u) {return u !== requestingURI});
      var narrowerDisplay = browseLd.processRelatedURIs(narrowerURIs, relationships.dataHash);
      var broaderDisplay = browseLd.processRelatedURIs(broaderURIs, relationships.dataHash);
      var broaderHtml = broaderDisplay.length? "Broader" + broaderDisplay.join(" ") : "";
      var narrowerHtml = narrowerDisplay.length? "Narrower" + narrowerDisplay.join(" ") : "";
      var display = narrowerDisplay.length || broaderDisplay.length? "<ul uri='" + requestingURI + "' class='relatedTree'>" +  broaderHtml + narrowerHtml + "</ul>": "";
      $("li[lcsh='related'][uri='" + requestingURI + "']").append(display);
    },
    toggleChevron: function(target) {
        //right = collapsed and should be expanded
        if (target.hasClass("fa-chevron-right")) {
          target.removeClass("fa-chevron-right");
          target.addClass("fa-chevron-down");
        }
        else {
          target.removeClass("fa-chevron-down");
          target.addClass("fa-chevron-right");
        }    
    },
    updateSelected:function() {
      //Are there top level and sublevel facets selected
      var topFacet = $("#subFacet").val();
      var subFacet= $("#subFacet").val();
      var lcsh = $("#lcsh").val();
      //subject headings used have classification values, which means they will have both a top level facet and a sub facet
      if(lcsh != "" && topFacet != "" && subFacet != "") {
        //Mimic selection of the appropriate sub facet
        //The facet will already be selected so we just need to find that element and trigger 
        browseLd.hideLCCNTopLevels();
        browseLd.selectLCCNSubheading($("a[heading='" + subFacet + "']"));
      }
    },
    //target in question can be either a tag for top level or lower level heading
    selectLCCNSubheading: function(target) {
      var heading = target.attr("heading");
      var headingtype = target.attr("headingtype");
      var headingTitle = target.attr("title");
    
      //Subheading has been selected
      $("a[role='subheading']").removeClass("selectedCard");
      target.addClass("selectedCard");       
      
     
      var baseUrl = $("#classification_headings").attr("base-url");
      var querySolr = baseUrl + "proxy/subjectbrowse?q=" + heading;
      $.ajax({
        "url": querySolr,
        "type": "GET",
        "success" : function(data) {              
          browseLd.displaySubjectHeading(data, headingTitle);
        }
      });
    }, 
    //Target = top level LCCN category which is being selected
    hideLCCNTopLevels: function() {
      $("#toplevelnav").addClass("d-lg-none");
      $("#toplevelnavheading").show();
    },
    //once a user has selected or navigated around, then go ahead and clear out the values
    clearParameterValues: function() {
      $("#subFacet").val("");
      $("#subFacet").val("");
      $("#lcsh").val("");
    },
    clearContent: function() {
      $("#subjectcontent").html("");
      $("#subjectdescription").html("");
      $("#page-entries").html("");
      $("#documents").html("");
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-subject") >= 0 ) {
    browseLd.onLoad();
  }
});  