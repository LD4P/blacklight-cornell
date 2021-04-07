//Knowledge Panel JS code

$(document).ready(function () {
    $("body").tooltip({
        selector: '[data-toggle="tooltip"]'
    });
    
    $(this).on('click','*[data-auth]',
      function (event) {
        var e = $(this);
        //e.off('click');
        event.preventDefault();
        // var baseUrl = e.attr("base-url")
        var baseUrl = $("#itemDetails").attr("base-url");
        var auth = e.attr("data-auth");
        var headingType = e.attr("heading-type");
        auth = auth.replace(/,\s*$/, "");
        // Also periods
        auth = auth.replace(/\.\s*$/, "");
        var authType = e.attr("data-auth-type");
        var catalogAuthURL = e.attr("datasearch-poload");
        // Set up container
        var contentHtml = "<div id='popoverContent' class='kp-content'>" + 
        "<div id='authContent' class='float-none clearfix'><div style='float:left;clear:both' id='imageContent'></div></div>" + 
        "<div id='wikidataContent' class='mt-2 float-none clearfix'></div>" + 
		"<div id='fullRecordLink' class='mt-1 w-100 text-right'></div>" + 
		"</div>";
        //,trigger : 'focus'
        e.popover({
          content : contentHtml,
          html : true,
          trigger: 'click'
        }).popover('show');
        // Get authority content
        $.get(catalogAuthURL, function (d) {
		  var authHtml = $.parseHTML($.trim("<div>" + d + "</div>"));
	      //Contains doesn't seem to work'		
		  $(authHtml).find("a").each(function() {
			var innerText = $(this).text();
			if($.trim(innerText).indexOf("Full record") > -1) {
				var oFullRecordLink = $(this)[0].outerHTML;
				d = d.replace(oFullRecordLink, "<div class='float-none'>&nbsp;&nbsp;</div>");
				var fullRecordLink = oFullRecordLink.replace("Full record", "View full record");
				//This can be replaced with another link if doing the entity page
				$("#fullRecordLink").html(fullRecordLink);
			} 
		  }); 
		  
          $("#authContent").append(d);
		  $("#authContent div.author-works").last().after("<div id='digitalCollectionsContent' class='author-works'></div>");
		//Moving this over here so we can add digital collections count after the html has been added
		// Add query to lookup digital collections
        searchDigitalCollections(baseUrl, getDigitalCollectionsQuery(auth, authType));
        });
       queryLOC(auth, authType, headingType);
        
      });
  
  //get label and text for full record
  function getFullRecordLink() {
	//var link =  
  }
 
  function queryLOC(auth, authType, headingType) {
    locPath = "names";
    rdfType = "PersonalName";
    // Even though LCSH has person names, querying /subjects for
    // names won't get you main resource
    // TODO: look into
    // id.loc.gov/authorities/names/label/[label]
    // for subject, LOC query will replace > with --
    // Digital collections will just use space for now
    var locQuery = auth;   
    if(authType == "subject") {
      if(headingType == "Geographic Name") {
        rdfType = "Geographic";
      }
      else if (headingType != "Personal Name") {
        locPath = "subjects";
        rdfType = "(Topic OR rdftype:ComplexSubject)";
      } 
      locQuery = locQuery.replace(/\s>\s/g, "--");
    }
    queryLOCSuggestions(locPath, locQuery, rdfType);
  }
  
  function getDigitalCollectionsQuery(auth, authType) {
    var digitalQuery = auth;
    if(authType == "subject") {    
        digitalQuery = digitalQuery.replace(/>/g, " ");
    }
    return digitalQuery;

  }
  
  function queryLOCSuggestions(locPath, locQuery, rdfType) {   
    var lookupURL = "http://id.loc.gov/authorities/" + locPath
    + "/suggest/?q=" + locQuery + "&rdftype=" + rdfType
    + "&count=1";
    $.ajax({
      url : lookupURL,
      dataType : 'jsonp',
      success : function (data) {
        urisArray = parseLOCSuggestions(data);
        if (urisArray && urisArray.length) {
          var locURI = urisArray[0]; 
          queryWikidata(locURI);
        }
      }
    });
  }
  
  //Get entity using the label directly
  //If this approach, then could also potentially parse returned JSON for related Wikidata URI
  function retrieveLOCEntityByLabel() {
    
  }

  // Function to lookup digital collections
  function searchDigitalCollections(baseUrl, authString) {
    var lookupURL = baseUrl + "proxy/search?q=" + authString;
    $.ajax({
      url : lookupURL,
      dataType : 'json',
      success : function (data) {
        // Digital collection results, append
        var results = [];
        //Just getting number of results
        if ("response" in data && "pages" in data["response"] && "total_count" in data["response"]["pages"]) {
			var totalCount = data["response"]["pages"]["total_count"];
			if(parseInt(totalCount) > 0) {
          		var link = "https://digital.library.cornell.edu/?q=" + authString + "&search_field=all_fields";
				var displayHtml = "Digital Collections: <a href='" + link + "'>" + totalCount + " results</a>";
				$("#digitalCollectionsContent").append(displayHtml);
			}
        }

      }
    });
  }

  // function to process results from LOC lookup

  function parseLOCSuggestions(suggestions) {
    var urisArray = [];
    if (suggestions && suggestions[1] !== undefined) {
      for (var s = 0; s < suggestions[1].length; s++) {
        // var l = suggestions[1][s];
        var u = suggestions[3][s];
        urisArray.push(u);
      }
    }
    return urisArray;

  }

  // Query wikidata
  //TODO: make label optional
  function queryWikidata(LOCURI) {
    // Given loc uri, can you get matching wikidata entities
    var wikidataEndpoint = "https://query.wikidata.org/sparql?";
    var localname = getLocalName(LOCURI);
    var sparqlQuery = "SELECT ?entity ?entityLabel WHERE {?entity wdt:P244 \""
      + localname
      + "\" SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}";
    $.ajax({
      url : wikidataEndpoint,
      headers : {
        Accept : 'application/sparql-results+json'
      },
      data : {
        query : sparqlQuery
      },
      success : function (data) {
        // Data -> results -> bindings [0] ->
        // entity -> value
        var wikidataParsedData = parseWikidataSparqlResults(data);
        var wikidataURI = wikidataParsedData['uriValue'];
        var authorLabel = wikidataParsedData['authorLabel'];
        // Do a popover here with the wikidata uri and the loc uri
        // if no wikidata uri then will just show null
        // Currently hide label 
        // For now, we are linking to items with authority files so we should have the label
        // Second, the label seems to be undefined in some cases
       
        // Get notable results
        if (wikidataURI != null) {
          var contentHtml = "<section class=\"kp-flexrow\"><div><h3>Wikidata Info " + 
          "<a href='" + wikidataURI + "' target='_blank' class='data-src'><img src='/assets/wikidata.png' /></a>" + 
          "</h3></section>";
          $("#wikidataContent").append(contentHtml);
          getImage(wikidataURI);
          getNotableWorks(wikidataURI);
          getPeopleInfluencedBy(wikidataURI);
          getPeopleWhoInfluenced(wikidataURI);
        }

      }

    });

  }

  // function to parse sparql query results from wikidata, getting URI
  // and author name
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
      }
    }
    return output;
  }

  // function to get localname from LOC URI
  function getLocalName(uri) {
    // Get string right after last slash if it's present
    // TODO: deal with hashes later
    return uri.split("/").pop();
  }

  // Wikidata notable works
  function getNotableWorks(wikidataURI) {
    var wikidataEndpoint = "https://query.wikidata.org/sparql?";
    var sparqlQuery = "SELECT ?notable_work ?title WHERE {<"
      + wikidataURI
      + "> wdt:P800 ?notable_work. ?notable_work wdt:P1476 ?title. ?notable_work wikibase:sitelinks ?linkcount . } ORDER BY DESC(?linkcount)";

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
		  //Only displaying up to three
		  bLength = (bLength < 3)? bLength: 3;
          var b;
          if (bindings.length) {
            var notableWorksHtml = "<div class='row mt-2'><div class='col heading'>Notable Works</div><div class='col'>";
            var notableHtmlArray = [];
            for (b = 0; b < bLength; b++) {
              var binding = bindings[b];
              if ("notable_work" in binding
                  && "value" in binding["notable_work"]
              && "title" in binding
              && "value" in binding["title"]) {
                var notableWorkURI = binding["notable_work"]["value"];
                var notableWorkLabel = binding["title"]["value"];
				//replaced method generateExternalLinks which will also put wikidata and LOC links
                notableHtmlArray.push(generateLinksWithoutExternal(notableWorkURI, notableWorkLabel, "Wikidata", ""));
              }
            }
            notableWorksHtml += "<div class='row'>" + notableHtmlArray.join("</div><div class='row'>") + "</div></div></div>";
            $("#wikidataContent").append(notableWorksHtml);
          }
        }
      }

    });
  }

  // Wikidata people who influenced the current author
  function getPeopleInfluencedBy(wikidataURI) {
    var wikidataEndpoint = "https://query.wikidata.org/sparql?";
    // var sparqlQuery = "SELECT ?influenceFor ?influenceForLabel WHERE
    // {?influenceFor wdt:P737 <" + wikidataURI + "> . SERVICE
    // wikibase:label { bd:serviceParam wikibase:language
    // \"[AUTO_LANGUAGE],en\". } } ORDER BY ASC(?influenceForLabel)";
    var sparqlQuery = "SELECT ?influenceFor ?locUri ?surname ?givenName ?surnameLabel ?givenNameLabel ( CONCAT(?surnameLabel, \", \" ,?givenNameLabel ) AS ?influenceForLabel ) WHERE { ?influenceFor wdt:P737 <"
      + wikidataURI
      + "> . ?influenceFor wdt:P734 ?surname . ?influenceFor wdt:P735 ?givenName . ?influenceFor wdt:P244 ?locUri . SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }} ORDER BY ASC(?surnameLabel)"

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
		  	bLength = (bLength < 3)? bLength: 3;
            var b;
            if (bindings.length) {
              var notableWorksHtml = "<div class='row mt-2'><div class='col heading'>Was influence for</div><div class='col'>";
              var notableHtmlArray = [];
              for (b = 0; b < bLength; b++) {
                var binding = bindings[b];
                if ("influenceFor" in binding
                    && "value" in binding["influenceFor"]
                && "influenceForLabel" in binding
                && "value" in binding["influenceForLabel"]) {
                  var iURI = binding["influenceFor"]["value"];
                  var iLabel = binding["influenceForLabel"]["value"];
                  var iLocUri = binding["locUri"]["value"] != undefined ? binding["locUri"]["value"] : "";
                  notableHtmlArray.push(generateLinksWithoutExternal(iURI, iLabel, "Wikidata", iLocUri));
                }
              }
              notableWorksHtml += "<div class='row'>" + notableHtmlArray.join("</div><div class='row'>") + "</div></div></div>";
              $("#wikidataContent").append(notableWorksHtml);
            }
          }
        }

      });
  }

  // Wikidata author influenced these people
  function getPeopleWhoInfluenced(wikidataURI) {
    var wikidataEndpoint = "https://query.wikidata.org/sparql?";
    // var sparqlQuery = "SELECT ?influencedBy ?influencedByLabel WHERE
    // {<" + wikidataURI + "> wdt:P737 ?influencedBy . SERVICE
    // wikibase:label { bd:serviceParam wikibase:language
    // \"[AUTO_LANGUAGE],en\". } } ORDER BY ASC(?influencedByLabel)";
    var sparqlQuery = "SELECT ?influencedBy ?locUri ?surname ?givenName ?surnameLabel ?givenNameLabel ( CONCAT(?surnameLabel, \", \" ,?givenNameLabel ) AS ?influencedByLabel ) WHERE { <"
      + wikidataURI
      + "> wdt:P737 ?influencedBy . ?influencedBy wdt:P734 ?surname . ?influencedBy wdt:P735 ?givenName . ?influencedBy wdt:P244 ?locUri . SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }} ORDER BY ASC(?surnameLabel)"

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
		  	bLength = (bLength < 3)? bLength: 3;

            var b;
            if (bindings.length) {
              var notableWorksHtml = "<div class='row mt-2'><div class='col heading'>Was influenced by</div><div class='col'>";
              var notableHtmlArray = [];
              for (b = 0; b < bLength; b++) {
                var binding = bindings[b];
                if ("influencedBy" in binding
                    && "value" in binding["influencedBy"]
                && "influencedByLabel" in binding
                && "value" in binding["influencedByLabel"]) {
                  var iURI = binding["influencedBy"]["value"];
                  var iLabel = binding["influencedByLabel"]["value"];
                  var iLocUri = binding["locUri"]["value"] != undefined ? binding["locUri"]["value"] : "";
                  notableHtmlArray.push(generateLinksWithoutExternal(iURI, iLabel, "Wikidata", iLocUri));
                }
              }
              notableWorksHtml += "<div class='row'>" + notableHtmlArray.join("</div><div class='row'>") + "</div></div></div>";
              $("#wikidataContent").append(notableWorksHtml);
              //$('[data-toggle="tooltip"]').tooltip();
            }
          }
          listExpander('whoinfluenced');
        }

      });
  }

  // Get Image
  function getImage(wikidataURI) {
    var wikidataEndpoint = "https://query.wikidata.org/sparql?";
    var sparqlQuery = "SELECT ?image WHERE {<" + wikidataURI
    + "> wdt:P18 ?image . }";

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
            var notableWorksHtml = "<img src=' ";
            var binding = bindings[0];
            if ("image" in binding && "value" in binding["image"] 
               && binding["image"]["value"]) {
              var image = binding["image"]["value"];
              var html = "<figure class='kp-entity-image float-left'><img src='" + image + "'><br><span class='kp-source'>Image: Wikidata</span></figure>";
              $("#imageContent").append(html);

            }
          }

        }
      }

    });
  }
  
  //Create both search link and outbound to entity link
  function generateExternalLinks(URI, label, sourceLabel, locUri) {
    var baseUrl = $("#itemDetails").attr("base-url");
    var keywordSearch = baseUrl + "catalog?q=" + label + "&search_field=all_fields";
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
    return "<a data-toggle='tooltip' data-placement='top' data-original-title='Search Library Catalog' href='" 
            + keywordSearch + "'>" + label + "</a> " + "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='" 
            + title + "' href='" + URI + "'><img src='/assets/" + image +".png' /></a>" + locHtml
  }

  function generateLinksWithoutExternal(URI, label, sourceLabel, locUri) {
    var baseUrl = $("#itemDetails").attr("base-url");
    var keywordSearch = baseUrl + "catalog?q=" + label + "&search_field=all_fields";
    var title = "See " + sourceLabel;
    var image = "wikidata";
    var locHtml = "";
   
    return "<a data-toggle='tooltip' data-placement='top' data-original-title='Search Library Catalog' href='" 
            + keywordSearch + "'>" + label + "</a> ";
  }

});

//Workings of "show more" links on knowledge panel lists
function listExpander(domString) {
  var list = $(".explist-" + domString + " li");
  var numToShow = 10;
  var moreButton = $("#expnext-" + domString);
  var lessButton = $("#expless-" + domString);
  var numInList = list.length;
  list.hide();
  if (numInList > numToShow) {
    moreButton.show();
  }
  list.slice(0, numToShow).show();

  moreButton.click(function () {
    var showing = list.filter(':visible').length;
    list.slice(showing - 1, showing + numToShow).fadeIn();
    var nowShowing = list.filter(':visible').length;
    if (nowShowing >= numInList) {
      moreButton.hide();
    }
    lessButton.show();
  });
  lessButton.click(function () {
    var showing = list.filter(':visible').length;
    list.slice(numToShow, showing+1).fadeOut('fast');
    lessButton.hide();
    moreButton.show();
  });
};

//Close popover when clicking outside
//TODO: Native popover functionality should allow for closing when clicking on the X and when clicking outside
//How has this been overridden and how can we maintain it?
$(document).mouseup(function (e) {
  var container = $(".popover");
  if (!container.is(e.target) && container.has(e.target).length === 0) {
    container.popover("hide");
  }
});
