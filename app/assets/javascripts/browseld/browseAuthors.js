var browseAuthors = {
    onLoad: function() {
      browseAuthors.loadTimeline();
      browseAuthors.bindEventHandlers();
    },
    bindEventHandlers: function() {
    
    },
    loadTimeline: function() {
      var testData = [{id:1, title:"Birkerte, M. , 1895-1982", from:{year: 1895}, to: {year:1982} }];
      var container = document.getElementById("container");
      var timeline1 = new Histropedia.Timeline( container, {} );
      timeline1.load(testData);
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-authors") >= 0 ) {
    browseAuthors.onLoad();
  }
});  