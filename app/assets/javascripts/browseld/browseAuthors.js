var browseAuthors = {
    onLoad: function() {
      browseAuthors.loadTimeline();
      browseAuthors.bindEventHandlers();
    },
    bindEventHandlers: function() {
    
    },
    loadTimeline: function() {
      browseAuthors.getData();
    
    },
    getData: function() {
      //AJAX call to solr
      var baseUrl = $("#container").attr("base-url"); 
      var querySolr = baseUrl + "proxy/authorbrowse";
      $.ajax({
        "url": querySolr,
        "type": "GET",
        "success" : function(data) {              
          browseAuthors.displayData(data);
        }
      });
    },
    displayData: function(data) {
      var container = document.getElementById("container");
      var timeline1 = new Histropedia.Timeline( container,  browseAuthors.getTimelineOptions());
      
      //Convert data to format required to display
      var convertedData = browseAuthors.convertData(data);
      timeline1.load(convertedData); //show all is default but other options available
    },
    getTimelineOptions:function() {
      return {width:2000, height:400, 
        initialDate: {
        year: -3700,
        month: 1,
        day: 1
      },
      zoom: {
          initial: 50,
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
      var articleStyle = {width:70, border:{width:1}};
      //try  map, 
      $.each(docs, function(i, v) {
        if("loc_birthy_i" in v || "wd_birthy_i" in v || "wd_starty_i" in v  ) {
          
          var birthYear = ("loc_birthy_i" in v)? v["loc_birthy_i"] : ("wd_birthy_i" in v)? v["wd_birthy_i"]: v["wd_starty_i"];
          //if (parseInt(birthYear) < 2020) {
            var id = v["loc_uri_s"];
            var wdURI = v["wd_uri_s"];
            var n = wdURI.lastIndexOf('/');
            var wdName = wdURI.substring(n + 1);
            var displayName = ("authlabel_s" in v)? v["authlabel_s"] : wdName;
            var article = {id:id, title:displayName, from:{year: birthYear} , subtitle: id, style:articleStyle};
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
      $("#authorDetails").html(browseAuthors.generateAuthorDisplay(article));
      browseAuthors.displaySearchResults(article.data.id, article.data.title);
    },
    generateAuthorDisplay:function(article) {
      var uri = article.data.id;
      var title = article.data.title;
      var baseUrl = $("#container").attr("base-url"); 
      var searchLink = baseUrl + "?f[author_facet][]=" + title + "&q=&search_field=all_fields";
      return "<div uri='" + uri +"'><h1>" + title + "</h1>" + uri+ ":" + article.data.from.year + 
      "<a role='searchcatalog' href='" + searchLink + "'>Search Catalog</a>" + 
      "</div>";
    },
    displaySearchResults:function(uri, title) {
      var baseUrl = $("#container").attr("base-url"); 
      var searchLink = baseUrl + "?f[author_facet][]=" + title + "&q=&search_field=all_fields";
      $.ajax({
        "url": searchLink,
        "type": "GET",
        "success" : function(data) {     
          var documents = $(data).find("#documents");
          $("#documents").html(documents);
        }
      });
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-authors") >= 0 ) {
    browseAuthors.onLoad();
  }
});  