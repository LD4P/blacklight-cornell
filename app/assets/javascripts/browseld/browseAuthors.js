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
      var baseUrl = $("#container").attr("base-url"); baseUrl = "http://hjk54-dev.library.cornell.edu/";
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
      var timeline1 = new Histropedia.Timeline( container, {} );
      
      //Convert data to format required to display
      var convertedData = browseAuthors.convertData(data);
      timeline1.load(convertedData, {width:2000, height:700, initialDate: {
          year: 1895,
          month: 1,
          day: 1
        },zoom: {
            initial: 20,
            minimum: 0,
            maximum: 123, //changed default
            wheelStep: 0.1,
            wheelSpeed: 1,
            unitSize: { //new
              showMinorLabels: 48, //new
              minimum: 8 //new
            }
        }, article: { defaultStyle: {width:50},
        density: Histropedia.DENSITY_HIGH, autoStacking:{active:false}}}); //show all is default but other options available
    },
    convertData: function(data) {
      var docs = data["response"]["docs"];
      var articles = [];
      var articleStyle = {width:60, border:{width:0}};
      //try  map, 
      $.each(docs, function(i, v) {
        if("wd_birthy_i" in v) {
          var birthYear = v["wd_birthy_i"];
          if (parseInt(birthYear) < 2020) {
            var id = v["loc_uri_s"];
            var wdURI = v["wd_uri_s"];
            var n = wdURI.lastIndexOf('/');
            var wdName = wdURI.substring(n + 1);
            var article = {id:id, title:wdName, from:{year: birthYear} , style:articleStyle};
            if("wd_deathy_i" in v) {
              article["to"] = {year: v["wd_deathy_i"]};
            }
            //testing image
            article["imageUrl"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Portrait_of_Charles_Dickens_%284671094%29.jpg/435px-Portrait_of_Charles_Dickens_%284671094%29.jpg";
            articles.push(article);
          }   
        }
      });
      return articles;
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-authors") >= 0 ) {
    browseAuthors.onLoad();
  }
});  