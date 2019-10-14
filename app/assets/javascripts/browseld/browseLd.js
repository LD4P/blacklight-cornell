var browseLd = {
    onLoad: function() {
      browseLd.bindEventHandlers();
    },
    bindEventHandlers: function() {
      //Clicking on LCCN category
      $("a").click(function(e) {
        return browseLd.handleLCCNClick(e, $(this));
      });
    },
    handleLCCNClick: function(e, target) {
      e.preventDefault();
      var heading = target.attr("heading");
      var baseUrl = $("#classification_headings").attr("base-url");
      var querySolr = baseUrl + "proxy/subjectbrowse?q=" + heading;
      $.ajax({
        "url": querySolr,
        "type": "GET",
        "success" : function(data) {              
          browseLd.displaySubjectHeading(data);
        }
      });
      return false;
    },
    displaySubjectHeading:function(data) {
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
    },
    generateSubjectDisplay: function(doc) {
      var html = "";
      var label = doc["label_s"];
      var uri = doc["uri_s"];
      var classification = doc["classification_s"];
      html += "<div uri='" + uri + "'>" + label + "</div>";
      return html;
    }
}

//Better to transform above into object later
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browseld-subject") >= 0 ) {
    browseLd.onLoad();
  }
});  