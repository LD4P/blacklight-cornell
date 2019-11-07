var browseAuthors = {
    onLoad: function() {
      browseAuthors.init();
      browseAuthors.loadTimeline(null, null);
      browseAuthors.bindEventHandlers();
    },
    init:function() {
      this.yearRange = $("#yearRange").val();
      var container = document.getElementById("container");
      this.timeline = new Histropedia.Timeline( container,  browseAuthors.getTimelineOptions());
    },
    bindEventHandlers: function() {
      $("div[startYear]").click(function(){
         var startYear = $(this).attr("startYear");
         var endYear = $(this).attr("endYear");
         //clear out selection for all years
         $("div[startYear]").removeClass("selectedCard");
         $(this).addClass("selectedCard");
         //load data
         browseAuthors.loadTimeline(startYear, endYear);
      });
    },
    //first time for loading timeline
    loadTimeline: function(startYear, endYear) {
      browseAuthors.getData(startYear, endYear);
    },
    getData: function(startYear, endYear) {
      browseAuthors.retrieveDataFromIndex(startYear, endYear, browseAuthors.displayData);
    },
    retrieveDataFromIndex:function(startYear, endYear, callback) {
      //AJAX call to solr
      var baseUrl = $("#container").attr("base-url"); 
      var querySolr = baseUrl + "proxy/authorbrowse";
      if(startYear && endYear) {
        var endYear = parseInt(startYear) + parseInt(endYear);
        var range = "[" + startYear + " TO " + endYear + "]";
        querySolr += "?q=wd_birthy_i:" + range + " OR ld_birthy_i:" + range + "&sort=wd_birthy_i asc";
      }
      $.ajax({
        "url": querySolr,
        "type": "GET",
        "success" : function(data) {              
          callback(data);
          browseAuthors.timeline.setStartDate(new Histropedia.Dmy(startYear, 1,1));
        }
      });
    },
    displayData: function(data) {     
      //Convert data to format required to display
      var convertedData = browseAuthors.convertData(data);
      browseAuthors.timeline.load(convertedData); //show all is default but other options available
    },
    getTimelineOptions:function() {
      return {width:1200, height:400, 
        initialDate: {
        year: -3700,
        month: 1,
        day: 1
      },
      zoom: {
          initial: 40,
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
        defaultStyle: {width:50},
        density: Histropedia.DENSITY_HIGH, autoStacking:{active:false}
      },
      onArticleClick: function(article) {
        browseAuthors.onArticleClick(article);
      }
     };
    },
    convertData: function(data) {
      var docs = data["response"]["docs"];
      var articles = [];
      var articleStyle = {width:100, border:{width:1}};
      //try  map, 
      $.each(docs, function(i, v) {
        if("loc_birthy_i" in v || "wd_birthy_i" in v || "wd_starty_i" in v  ) {
          
          //Prefer start year and end year for display
          //Use birth year if start year not available
          //Use death if end year not available
          var birthYear = ("loc_birthy_i" in v)? v["loc_birthy_i"] : ("wd_birthy_i" in v)? v["wd_birthy_i"]: v["wd_starty_i"];
          var endYear = ("loc_deathy_i" in v)? v["loc_deathy_i"] : ("wd_deathy_i" in v)? v["wd_deathy_i"]: v["wd_endy_i"];
          //if (parseInt(birthYear) < 2020) {
            var id = v["loc_uri_s"];
            var wdURI = v["wd_uri_s"];
            var n = wdURI.lastIndexOf('/');
            var wdName = wdURI.substring(n + 1);
            var displayName = ("authlabel_s" in v)? v["authlabel_s"] : wdName;
            var article = {id:id, title:displayName, from:{year: birthYear} , to:{year: endYear}, style:articleStyle, originalData: v};
            if("wd_birthy_i" in v) {
              article["to"] = {year: v["wd_birthy_i"]};
            }
            //testing image
            if("wd_image_s" in v) {
              article["imageUrl"] = v["wd_image_s"];
            }
            //article["imageUrl"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Portrait_of_Charles_Dickens_%284671094%29.jpg/435px-Portrait_of_Charles_Dickens_%284671094%29.jpg";
            articles.push(article);
          //}   
        }
      });
      return articles;
    },
    onArticleClick:function(article) {
      //Clear out author details
      $("#authorDetails").html("");
      $("#authorDetails").html(browseAuthors.generateAuthorDisplay(article));
      browseAuthors.displaySearchResults(article.data.id, article.data.title);
    },
    generateAuthorDisplay:function(article) {
      var uri = article.data.id;
      var title = article.data.title;
      var baseUrl = $("#container").attr("base-url"); 
      //Get info from solr index with data we have and any additional from Wikidata that may be useful
      var searchLink = baseUrl + "?f[author_facet][]=" + title + "&q=&search_field=all_fields";
      displayHtml = "<div uri='" + uri +"'><h4><a href='" + searchLink + "'>" + title + "</a></h4>";
      var solrDoc = article.data.originalData;
    //Add LOC and Wikidata links
      var wikidataURI = article.data.originalData["wd_uri_s"];
      var locURI = article.data.originalData["loc_uri_s"];
      displayHtml += browseAuthors.generateLOCLink(locURI) + " " +  browseAuthors.generateWikidataLink(wikidataURI); 
      
      //displayHtml += JSON.stringify(article.data);
      
      var birth = "";
      var death = "";
     
      var birthSource = "LOC";
      var deathSource = "LOC";
      if("loc_birthy_i" in solrDoc) {
        birth = solrDoc["loc_birthy_i"];
      } else if ("wd_birthy_i" in solrDoc) {
        birth = solrDoc["wd_birthy_i"];
        birthSource = "Wikidata";
      }
      if("loc_deathy_i" in solrDoc) {
        death = solrDoc["loc_deathy_i"];
      } else if ("wd_deathy_i" in solrDoc) {
        death = solrDoc["wd_deathy_i"];
        deathSource = "Wikidata";
      }
    
     
      if(birth != "") {displayHtml += "<br/>Birth (" + birthSource + "): " + birth;}
      if(death != "") {displayHtml += "<br/>Death (" + deathSource + "): " + death;}

     
      if("wd_starty_i" in solrDoc) {
        var startActivity = solrDoc["wd_starty_i"];
        displayHtml += "<br/>Start Activity (Wikidata): " + startActivity;
      }
      if("wd_endy_i" in solrDoc) {
        var endActivity = solrDoc["wd_endy_i"];
        displayHtml += "<br/>End Activity (Wikidata): " + solrDoc["wd_endy_i"];
      }
      return displayHtml;

    },
    displaySearchResults:function(uri, title) {
      var baseUrl = $("#container").attr("base-url"); 
      var searchLink = baseUrl + "?f[author_facet][]=" + title + "&q=&search_field=all_fields";
      $("#documents").html("");
      $("#page-entries").html("");
      $.ajax({
        "url": searchLink,
        "type": "GET",
        "success" : function(data) {     
          var documents = $(data).find("#documents");
          $("#documents").html(documents);
          var pageEntries = $(data).find("span.page-entries");        
          $("#page-entries").html("<a href='" + searchLink + "'>Search Results: " + pageEntries.html() + "</a>");
        }
      });
    },
    //This is also employed in browseLd so should be refactored elsewhere
    generateLOCLink: function(uri) {
      var locHtml = "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='See Library of Congress' href='" + uri + ".html'><img src='/assets/loc.png' /></a>";
      return locHtml;
    },
    generateWikidataLink: function(uri) {
      var title = "Wikidata";
      return "<a target='_blank' class='data-src' data-toggle='tooltip' data-placement='top' data-original-title='" 
      + title + "' href='" + uri + "'><img src='/assets/wikidata.png' /></a>";
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-authors") >= 0 ) {
    browseAuthors.onLoad();
  }
});  