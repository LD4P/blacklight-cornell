// https://id.loc.gov/authorities/names/suggest/?q=Twain,+Mark,+1835-1910
// id.loc.gov/authorities/names/label/[label]
var influencers = [];
var influenced = [];
var influencersDone = false;
var influencedDone = false;
var rootNodeImage = "";
var agentDashboard = {
    onLoad: function() {
      var localname = $("#loc_localname").val();
      agentDashboard.getWikiImage(localname);
      agentDashboard.getPublicationsList(localname);
      agentDashboard.getInfluenceFor(localname);
      agentDashboard.getInfluencedBy(localname);
      setTimeout(function(){ agentDashboard.buildInfluenceData(); }, 1500);
      agentDashboard.bindEventHandlers();
    },
    
    bindEventHandlers: function() {
        $('a[data-toggle="tab"]').click(function() {
            //console.log("clicked: " + $(this).attr("id"));
            var clicked = this;
            $('li.nav-link').each(function() {
                $(this).removeClass('active');
            });
            $(clicked).parent('li').addClass('active'); 
        });
        
    },

    // Get Image
    getWikiImage: function(localname) {
      console.log("LOC local name = " + localname);
      var wikidataEndpoint = "https://query.wikidata.org/sparql";
      var sparqlQuery = "SELECT ?image ?citizenship (group_concat(DISTINCT ?educated_at; separator = \", \") as ?education) WHERE { ?entity wdt:P244 " + localname + " . "
                        + " OPTIONAL {?entity wdt:P18 ?image . ?entity wdt:P27 ?citizenshipRoot . ?citizenshipRoot rdfs:label ?citizenship . FILTER (langMatches( lang(?citizenship), \"EN\" ) ) }"
                        + " OPTIONAL {?entity wdt:P69 ?educationRoot . ?educationRoot rdfs:label ?educated_at . FILTER (langMatches( lang(?educated_at), \"EN\" ) ) }"
                        + " } GROUP BY ?image ?citizenship LIMIT 1";
      //console.log("image sparqlQuery = " + sparqlQuery);
      $.ajax({
        url : wikidataEndpoint,
        headers : {
          Accept : 'application/sparql-results+json'
        },
        data : {
          query : sparqlQuery
        },
        success : function (data) {
            if ( data && "results" in data && "bindings" in data["results"] ) {
              var bindings = data["results"]["bindings"];
              if ( bindings['length'] > 0 ) {  
                if ( bindings[0]["image"] != undefined ) {       
                  imageUrl = bindings[0]["image"]["value"];
                  rootNodeImage = imageUrl;
                  $("#agent-image").attr("src",imageUrl);
                }
                if ( bindings[0]["citizenship"] != undefined && bindings[0]["citizenship"]["value"].length > 0 ) {
                  citizenship = bindings[0]["citizenship"]["value"];
                  $("dd.citizenship").text(citizenship);
                  $(".citizenship").removeClass("citizenship");
                }
                if ( bindings[0]["education"] != undefined && bindings[0]["education"]["value"].length > 0 ) {
                  education = bindings[0]["education"]["value"];
                  var tmpArray = $.unique(education.split(', '));
                  $("dd.education").text(tmpArray.join(", "));
                  $(".education").removeClass("education");
                }
              }
            }
        }

      });
    },
    
    // Wikidata people who influenced the current author
    getInfluenceFor: function(localname) {
      var wikidataEndpoint = "https://query.wikidata.org/sparql";
      var sparqlQuery = " SELECT (SAMPLE(?influenceFor) as ?influenceFor) ?influenceForLabel  (SAMPLE(?theImage) AS ?image)"
                        + " WHERE { ?entity wdt:P244 " + localname + " . ?influenceFor wdt:P737 ?entity . "
                        + " OPTIONAL { ?influenceFor wdt:P18 ?theImage . }"
                        + " SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }} GROUP BY ?influenceForLabel"
      $.ajax({
        url : wikidataEndpoint,
        headers : {
          Accept : 'application/sparql-results+json'
        },
        data : {
          query : sparqlQuery
        },
        success : function (data) {
            var listArray = []
            
            if ( data && "results" in data && "bindings" in data["results"] ) {
              var bindings = data["results"]["bindings"];
              if ( bindings['length'] > 0 ) {
                var bl = bindings['length'];
                var count = 0;
                var tmpHash = {};
                var sortedHash = {};
                var theImage = "";
                while ( count < bl ) {      
                    influenceForLabel = bindings[count]["influenceForLabel"]["value"];
                    if ( bindings[count]["image"]!= undefined )
                            theImage = bindings[count]["image"]["value"];
                    // get the last name
                    var surname = influenceForLabel.split(" ").pop();
                    // in case any surnames are the same, e.g. emily and charlotte bronte
                    surname = surname + influenceForLabel[0];
                    tmpHash[surname] = influenceForLabel;
                    influenced.push({name: influenceForLabel, image: theImage});
                    theImage = "";
                    count++
                }
                sortedHash = agentDashboard.sortHash(tmpHash);
                $.each(sortedHash, function(key, value) {
                    listArray.push(" " + value);
                });    
              }
            }
            if ( listArray.length > 0 ) {
                //$("#inf-for-dd").text(listArray);
                //$("#inf-for-dd").removeClass("influence");
                //$("#inf-for-dt").removeClass("influence");
            }
        }
      });
      influencedDone = true;
    },
    
    // Wikidata people who the current author influence
    getInfluencedBy: function(localname) {
      var wikidataEndpoint = "https://query.wikidata.org/sparql";
      var sparqlQuery = " SELECT (SAMPLE(?influencedBy) as ?influencedBy) ?influencedByLabel (SAMPLE(?theImage) AS ?image)"
                        + " WHERE { ?entity wdt:P244 " + localname + " . ?entity wdt:P737 ?influencedBy . "
                        + " OPTIONAL { ?influencedBy wdt:P18 ?theImage . }"
                        + " SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }} GROUP BY ?influencedByLabel"
      console.log("sparqlQuery: " + sparqlQuery);
      $.ajax({
        url : wikidataEndpoint,
        headers : {
          Accept : 'application/sparql-results+json'
        },
        data : {
          query : sparqlQuery
        },
        success : function (data) {
            var listArray = [];
            if ( data && "results" in data && "bindings" in data["results"] ) {
              var bindings = data["results"]["bindings"];
              if ( bindings['length'] > 0 ) {
                var bl = bindings['length'];
                var count = 0;
                var tmpHash = {};
                var sortedHash = {};
                var theImage = "";
                while ( count < bl ) {      
                    influencedByLabel = bindings[count]["influencedByLabel"]["value"];
                    if ( bindings[count]["image"]!= undefined && bindings[count]["image"]["value"].indexOf(".tif") == -1 )
                            theImage = bindings[count]["image"]["value"];
                    // get the last name
                    var surname = influencedByLabel.split(" ").pop();
                    // in case any surnames are the same, e.g. emily and charlotte bronte
                    surname = surname + influencedByLabel[0];
                    tmpHash[surname] = influencedByLabel;
                    influencers.push({name: influencedByLabel, image: theImage});
                    theImage = "";
                    count++
                }
                sortedHash = agentDashboard.sortHash(tmpHash);
                $.each(sortedHash, function(key, value) {
                    listArray.push(" " + value);
                });    
              }
            }
            if ( listArray.length > 0 ) {
                //$("#inf-by-dd").text(listArray);
                //$("#inf-by-dd").removeClass("influence");
                //$("#inf-by-dt").removeClass("influence");
            }
        }
      });
      influencersDone = true;
    },
    
    // Wikidata people who the current author influence
    getPublicationsList: function(localname) {
      var wikidataEndpoint = "https://query.wikidata.org/sparql";
      var sparqlQuery = " SELECT ?workUri ?pubDate ?label ?image ?isbn10 ?isbn13 ?oclc"
                        + " WHERE { ?entity wdt:P244 " + localname + " . ?workUri wdt:P50 ?entity . ?workUri wdt:P577 ?pubDate . ?workUri rdfs:label ?label . "
                        + " OPTIONAL { ?workUri wdt:P18 ?image . } "
                        + " OPTIONAL { ?workUri wdt:P957 ?isbn10 . } "
                        + " OPTIONAL { ?workUri wdt:P212 ?isbn13 . } "
                        + " OPTIONAL { ?workUri wdt:P243 ?oclc . } "
                        + " FILTER (langMatches( lang(?label), \"EN\" ) ) } ORDER BY ?pubDate"
        //console.log("sparqlQuery: " + sparqlQuery);
      $.ajax({
        url : wikidataEndpoint,
        headers : {
          Accept : 'application/sparql-results+json'
        },
        data : {
          query : sparqlQuery
        },
        success : function (data) {
            var articlesArray = [];
            var year_one = 1; 
            if ( data && "results" in data && "bindings" in data["results"] ) {
              var bindings = data["results"]["bindings"];
//              console.log("bindings: ", bindings);
              if ( bindings['length'] > 0 ) {
                var bl = bindings['length'];
                var count = 0;
                var current_label = "";
                var add_item = true;
                while ( count < bl ) {
                    var tmpHash = {};
                    // need this to avoid duplicates
                    //console.log("current_label = " + current_label);
                    //console.log("label = " + bindings[count]["label"]["value"]);
                    if ( current_label.indexOf(bindings[count]["label"]["value"]) >= 0 ) {
                        //console.log("duplicate]");
                        add_item = false;
                    } 
                    else {
                        //console.log("NOT a duplicate");
                        current_label = bindings[count]["label"]["value"]
                    }
                    if ( add_item ) {
                        var image = "";
                        if ( bindings[count]["image"] != undefined ) {
                          image = bindings[count]["image"]["value"];
                        }
                        var id = count + 1;
                        tmpHash['id'] = id;
                        tmpHash['title'] = current_label;
                        tmpHash['imageUrl'] = image;    
                        // get just the year if the pubDate contains more than that
                        var year_str = bindings[count]["pubDate"]["value"].substring(0,4);
                        tmpHash['subtitle'] = year_str;
                        var fromHash = {};
                        fromHash['year'] = parseInt(year_str);
                        tmpHash['from'] = fromHash;
                        if ( id == 1 ) {
                            year_one = (parseInt(year_str) - 1);
                        }
                        articlesArray.push(tmpHash);
                        //console.log("image = " + image);
                    }
                    else {
                        add_item = true;
                    }
                    count++
                }
              }
            }
           //console.log("articlesArray", articlesArray);
           agentDashboard.doTheTimelineDance(articlesArray, year_one);
        }
      });
    },
    
    buildInfluenceData: function() {
        console.log("buildInfluenceData");
        if ( influencersDone == false ) {
            agentDashboard.buildInfluenceData();
        }
        else if ( influencedDone == false ) {
            agentDashboard.buildInfluenceData();
        }
        else {
          var agentName = $('h2').text();
          var influenceData = new Object();
          influenceData.name = agentDashboard.recastName(agentName);
          influenceData.image = rootNodeImage;
          influenceData.root = true;
          influenceData.influencers = Object.assign([], influencers);
          influenceData.influenced = Object.assign([], influenced);
          if ( influencers.length == 0 ) {
              $('h3#influenced-by-hdr').text("");
              $('#influenced-by-container').removeClass("influence-header");
          }
          if ( influenced.length == 0 ) {
              $('h3#influence-for-hdr').text("");
              $('#influence-for-container').removeClass("influence-header");
          }
          if ( influencers.length == 0 && influenced.length == 0 ) {
              $("#influence-tab").addClass("influence");
          }
          else {
              generateChart(influenceData);
          }
        }
    },
    
    recastName: function(name) {
        // if there's no comma, just return the name
        if ( name.indexOf(",") == -1 ) {
            return name;
        }
        var tmpArray = name.split(",");
        return tmpArray[1] + " " + tmpArray[0];
    },

    doTheTimelineDance: function(articlesArray, year_one) {
		//console.log("timeline time");
        var container = document.getElementById("timeline-container");
  	    var timeline = new Histropedia.Timeline(container, agentDashboard.getTimelineOptions(year_one))
		timeline.load(articlesArray);  
    },

    getTimelineOptions:function(startDate) {
      //console.log("width = " + $('.tab-content').width());
      var divWidth = $('.tab-content').width() - 8;
      return {width:divWidth, 
        height:480, 
        verticalOffset: 50,
        shiftBceDates: true,
        initialDate: {
        year: startDate,
        month: 1,
        day: 1
      },
      zoom: {
          initial: 33,
          minimum: 0,
          maximum: 123, //changed default
          wheelStep: 0.1,
          wheelSpeed: 1,
          unitSize: { //new
            showMinorLabels: 48, //new
            minimum: 8 //new
          }
      }, 
      article: { 
        defaultStyle: {width:150},
        density: Histropedia.DENSITY_HIGH, autoStacking:{active:false},
        distanceToMainLine: 400,
        autoStacking: {
        	active: true,
        	rowSpacing: 50,
        	range: Histropedia.RANGE_ALL,
        	fitToHeight: true,
        	topGap: 10 // new values
        }
      },
      //onArticleClick: function(article) {
        //browseAuthors.onArticleClick(article);
      //}
     };
    },
    sortHash: function(tmpHash) {
      return Object.keys(tmpHash).sort().reduce((accumulator, currentValue) => {
              accumulator[currentValue] = tmpHash[currentValue];
              return accumulator;
            }, {})
    }
};

Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browse-info") >= 0 ) {
    agentDashboard.onLoad();
  }
});