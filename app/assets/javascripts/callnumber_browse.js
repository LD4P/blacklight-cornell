var current_previous = "current previous";
var current_next = "current next";
var  carouselActions = {

  onLoad: function() {
      carouselActions.bindEventListeners();
      var carousel = $('#cn_carousel').width();
      var container = $('#outer_container').width();
      $('#cn_carousel').scrollLeft((container - carousel)/2, 1000);
      
  },
  
  bindEventListeners: function() {
      console.log("bind event listeners");
      
      
     var cnc_width = $('#cn_carousel').width();
     var cnc_lo = $('#cn_carousel').offset().left;
     var cnc_ro = (cnc_width + cnc_lo);
     
      $('#cn_carousel').on('scroll', function() {
          if ( $('#anchor').offset().left > cnc_ro ) {
              console.log("current_previous = " + current_previous);
            if ( carouselActions.isInViewport($('#outer_container').children().eq(2)) && $('#outer_container').children().first().children().eq(1).attr("data-callnumber") != current_previous ) {
                current_previous = $('#outer_container').children().first().children().eq(1).attr("data-callnumber");
                carouselActions.getPrevious($('#outer_container').children().first().children().eq(1).attr("data-callnumber"));
            }
            if ( $('#anchor').attr("data-status") == undefined ) { 
              $('#anchor').attr("data-status","not visible");
              label = $('#outer_container').children().first().children().eq(1).attr("data-class-label");
              var tmp_array = label.split(" > ")
        	  var class_array = []
        	  $.each(tmp_array, function() {
          		str = "<a href='/browse?authq="
          		tmp1 = this.substring(0,this.indexOf("-")).replace(/\s*$/,"")
          		str += tmp1 + "&browse_type=Call-Number'>" + this + "</a>"
          		class_array.push(str)        	      
        	  });
        	  $('#classification').html(class_array.toString().replace(/,/g, ' > '));
            }
          }
          else if ( $('#anchor').offset().left < (cnc_lo - $('#anchor').width()) ) {
              //$('#outer_container').children("div:nth-last-child(3)").children().eq(1).attr("data-callnumber")
              console.log("current_next = " + current_next);
              if ( carouselActions.isInViewport($('#outer_container').children("div:nth-last-child(3)")) && $('#outer_container').children().last().children().eq(1).attr("data-callnumber") != current_next ) {
                  current_next = $('#outer_container').children().last().children().eq(1).attr("data-callnumber");
                  carouselActions.getNext($('#outer_container').children().last().children().eq(1).attr("data-callnumber"));
              }
              if ( $('#anchor').attr("data-status") == undefined ) { 
                $('#anchor').attr("data-status","not visible");
                label = $('#outer_container').children().last().children().eq(1).attr("data-class-label");
                var tmp_array = label.split(" > ")
          	    var class_array = []
          	    $.each(tmp_array, function() {
            		str = "<a href='/browse?authq="
            		tmp1 = this.substring(0,this.indexOf("-")).replace(/\s*$/,"")
            		str += tmp1 + "&browse_type=Call-Number'>" + this + "</a>"
            		class_array.push(str)        	      
          	    });
          	  $('#classification').html(class_array.toString().replace(/,/g, ' > '));
              }
          }
          else {
            if ( $('#anchor').attr("data-status") == "not visible" ) {
              $('#anchor').removeAttr("data-status");
              $('#classification').html($('#classification').attr("data-anchor-label"));
            }
          }
      });
  },
  
  getPrevious: function(callnumber) {
      console.log("get previous = " + callnumber);
      var remote = true;
      $.ajax({
        url : "/get_previous?callnum=" + callnumber,
        type: 'GET',
        data: remote,
        complete: function(xhr, status) {
            console.log("got previous = " + callnumber);
        }
      });  
  },
  
  getNext: function(callnumber) {
      console.log("get next = " + callnumber);
      var remote = true;
      $.ajax({
        url : "/get_next?callnum=" + callnumber,
        type: 'GET',
        data: remote,
        complete: function(xhr, status) {
            console.log("got next = " + callnumber);
        }
      });  
  },
  
  isInViewport: function(element) {
      var cnc_width = $('#cn_carousel').width();
      var cnc_lo = $('#cn_carousel').offset().left;
      var cnc_ro = (cnc_width + cnc_lo);
      if ( $(element).offset().left > cnc_ro || $(element).offset().left < (cnc_lo - $(element).width()) ) {
          console.log("not in the viewport");
          return false;
      }
      else {
          console.log("in the viewport");
          return true;
      }
       
  }
  
  

};  
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("browse-index") >= 0 ) {
    carouselActions.onLoad();
  
  }
});  
