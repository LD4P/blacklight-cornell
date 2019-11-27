var subjectsHash = {};
var workidHash = {};
var locUriArray = [];
var termArray = [];
var broaderArray = [];
var narrowerArray = [];
var relevantArray = [];
var ajaxCallStatus = {};
var ajaxCallCount = 0;
var mainHtml = '<div style="margin-top:12px"><a id="subjects-launch" href="#" class="lightboxLink" data-toggle="modal" data-target=".bd-example-modal-lg">'
                 + 'Browse related subjects <i class="fa fa-plus" style="margin-left:8px;font-size:12px"></i></a></div><div id="header" style="padding:2px 0 0 6px">'
                 + '<span id="subj-type" style="display:none">Broader terms</span></div><div id="subj-container" style="display:none;max-height:380px;overflow:auto">'
                 + '<div id="broader"></div><div id="relevant"></div><div id="narrower"></div></div>';
// background:rgba(204, 204, 204, 0.33);
var  processOclcData = {
  onLoad: function() {
    var subjects = $('#subjects').val().split('", "');
    if ( subjects.length ) {
      processOclcData.prepTheSubjects(subjects);
    }
    var workId = $('#work_id').val();
    var genre = $('#fast_genre').val()
    if ( workId.length && genre.indexOf("Fiction") == -1 ) {
      processOclcData.getOclcDataWorkId(workId);
    }
  },
  
  cleanUp: function(string) {
      return string.replace(/[~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=]/g, '');
  },

  prepTheSubjects: function(subjects) {
    $.each(subjects, function() {
      var term = this;
      // handle unusual subject formatting, e.g.: "SCIENCE / Life Sciences / Evolution"
      if ( term.indexOf("/") >= 0 ) {
          tmpArray = term.split("/");
          if ( tmpArray[0] === tmpArray[0].toUpperCase() ) {
              tmpArray.shift();
              term = tmpArray.join(">");
          }
          else {
              term = term.replace("/",">");
          } 
      }
      var count = (term.match(/>/g) || []).length;
      if ( count >= 3 ) {
        var tmpArray = term.split(">");
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(tmpArray[0]).toLowerCase() + processOclcData.cleanUp(tmpArray[1]).toLowerCase() + processOclcData.cleanUp(tmpArray[2]).toLowerCase()); 
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(tmpArray[0]).toLowerCase() + processOclcData.cleanUp(tmpArray[1]).toLowerCase()); 
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(tmpArray[0]).toLowerCase()); 
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(term).toLowerCase()); 
      }
      else if ( count == 2 ) {
        var tmpArray = term.split(">");
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(tmpArray[0]).toLowerCase() + processOclcData.cleanUp(tmpArray[1]).toLowerCase());  
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(tmpArray[0]).toLowerCase());  
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(term).toLowerCase()); 
      }
      else {
        processOclcData.getLocSubjectsData(processOclcData.cleanUp(term).toLowerCase());          
      }
    });  
  },

  getLocSubjectsData: function(term) {
      if ( $.inArray(term,termArray) == -1 ) {
          termArray.push(term);
          ajaxCallStatus[term.toLowerCase().replace(/ /g,'')] = "open";
          var authorityUrl = "https://lookup.ld4l.org/authorities/search/linked_data/locsubjects_ld4l_cache?maxRecords=1&context=true&q=" + term.replace(/ /g,'%20');
          $.ajax({
            url : authorityUrl,
            type: 'GET',
            dataType: 'json',
            complete: function(xhr, status) {
              var results = $.parseJSON(xhr.responseText);
              if ( results[0] != undefined 
                    && results[0]["label"].indexOf("family") == -1 
                    && $.inArray(results[0]["uri"],locUriArray) == -1 ) {
                        
                  var localName = results[0]["uri"].substring(results[0]["uri"].lastIndexOf("/") + 1, results[0]["uri"].length);
                  var theSubject = results[0]["label"];
                  //processOclcData.getLocDataViaDave(results[0]["uri"], "Subjects");
                  processOclcData.getRealLocData(results[0]["uri"]);
                  locUriArray.push(results[0]["uri"]);
              }
              ajaxCallStatus[term.toLowerCase().replace(/ /g,'')] = "closed";            }
          });
      }
  },
  
  getRealLocData: function(locUri) {
      var authorityUrl = locUri + ".json";
      var mainHash = {};
      ajaxCallStatus[locUri] = "open";
      $.ajax({
        url : authorityUrl,
        type: 'GET',
        dataType: 'json',
        complete: function(xhr, status) {
          var results = $.parseJSON(xhr.responseText);
          var resultsHash = {};
          var tmpHash = {};
          $.each(results, function() {
              resultsHash[this["@id"]] = this;
          });
          var sub = resultsHash[locUri];
          var broaderHtml = "";
          var narrowerHtml = '<div style="line-height:1.25;padding:8px 0 0 6px"></div>';
          var relevantHtml = '<div style="line-height:1.25;padding:8px 0 0 6px"></div>';
          tmpHash["label"] = sub["http://www.w3.org/2004/02/skos/core#prefLabel"] != undefined ? sub["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"] : sub["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"][0]["@value"];
          tmpHash["broader"] = sub["http://www.loc.gov/mads/rdf/v1#hasBroaderAuthority"] != undefined ? processOclcData.buildLabelArray(resultsHash, sub["http://www.loc.gov/mads/rdf/v1#hasBroaderAuthority"]) : [];
          tmpHash["relevant"] = sub["http://www.loc.gov/mads/rdf/v1#hasReciprocalAuthority"] != undefined ? processOclcData.buildLabelArray(resultsHash, sub["http://www.loc.gov/mads/rdf/v1#hasReciprocalAuthority"]) : [];
          tmpHash["narrower"] = sub["http://www.loc.gov/mads/rdf/v1#hasNarrowerAuthority"] != undefined ? processOclcData.buildLabelArray(resultsHash, sub["http://www.loc.gov/mads/rdf/v1#hasNarrowerAuthority"]) : [];
          tmpHash["external"] = sub["http://www.loc.gov/mads/rdf/v1#hasNarrowerExternalAuthority"] != undefined ? processOclcData.buildLabelArray(resultsHash, sub["http://www.loc.gov/mads/rdf/v1#hasNarrowerExternalAuthority"]) : [];
          mainHash[locUri] = tmpHash;
          // console.log("mainHash: " + mainHash.toSource());
          if ( !$.isEmptyObject(mainHash) ) {
            $.each(mainHash, function() {
              var x = this;
              if ( "narrower" in x ) {
                $.each(x["narrower"], function(){
                    if ( $.inArray(this.toString(),narrowerArray) == -1 )
                            narrowerArray.push(this.toString()); 
                });
                if ( "external" in x ) {
                    $.each(x["external"], function(){
                        if ( $.inArray(this.toString(),narrowerArray) == -1 )
                                narrowerArray.push(this.toString()); 
                     });
                }
                if ( narrowerArray.length ) {
                    $.each(narrowerArray.sort(), function(){
                       narrowerHtml += '<div style="line-height:1.25;padding:4px 0 0 6px">'
                                       + '<a class="hierarchical" href="/?click_to_search=true&amp;commit=search&amp;q=%22' 
                                       + this.replace("--"," > ").replace(" ","+") + '%22&amp;search_field=subject_cts">' + this.replace("--"," > ") + '</a></div>'; 
                     });
                }
              }
              if ( "broader" in x ) {
                $.each(x["broader"], function(){
                    if ( $.inArray(this.toString(),broaderArray) == -1 )
                            broaderArray.push(this.toString()); 
                });
              }
              if ( broaderArray.length ) {
                  $.each(broaderArray.sort(), function(){
                     broaderHtml +=  '<div style="line-height:1.25;padding:4px 0 0 6px">'
                                         + '<a class="hierarchical" href="/?click_to_search=true&amp;commit=search&amp;q=%22' 
                                         + this.replace("--"," > ").replace(" ","+") + '%22&amp;search_field=subject_cts">' + this.replace("--"," > ") + '</a></div>'; 
                   });
              }
              if ( "relevant" in x ) {
                $.each(x["relevant"], function(){
                    if ( $.inArray(this.toString(),relevantArray) == -1 )
                            relevantArray.push(this.toString()); 
                });
                if ( relevantArray.length ) {
                    $.each(relevantArray.sort(), function(){
                       relevantHtml +=  '<div style="line-height:1.25;padding:4px 0 0 6px">'
                                           + '<a class="hierarchical" href="/?click_to_search=true&amp;commit=search&amp;q=%22' 
                                           + this.replace("--"," > ").replace(" ","+") + '%22&amp;search_field=subject_cts">' + this.replace("--"," > ") + '</a></div>'; 
                     });
                }
              }
            });
            
            if ( !$('#subjects-launch').length ) {
                $('dd.blacklight-subject_json').append(mainHtml);
                $('#broader').html(broaderHtml);
                $('#relevant').html(relevantHtml);
                $('#narrower').html(narrowerHtml);
                processOclcData.toggleRelatedSubjects();
            }
            else {
                $('#broader').html(broaderHtml);
                $('#relevant').html(relevantHtml);
                $('#narrower').html(narrowerHtml);                
            }
            
            
          }
          processOclcData.assignFullBackgroundColors();
          ajaxCallStatus[locUri] = "closed";
          // console.log("ajaxCallStatus = " + ajaxCallStatus.toSource());
        } // complete
      });
  },
  
  buildLabelArray: function (resultsHash, auth) {
      var tmpArray = [];
      $.each(auth, function() {
         var label = resultsHash[this["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"] != undefined ? resultsHash[this["@id"]]["http://www.w3.org/2004/02/skos/core#prefLabel"][0]["@value"] : resultsHash[this["@id"]]["http://www.w3.org/2004/02/skos/core#authoritativeLabel"][0]["@value"]
         tmpArray.push(label);
      });
      return tmpArray;
  },  
   
  getOclcDataWorkId: function(workId) {
     $.ajax({
       url : "http://experiment.worldcat.org/entity/work/data/" +  workId + ".jsonld",
       dataType : "json",
       complete: function(xhr, status) {
         var response = JSON.parse(xhr.responseText);
         $.each(response["@graph"], function() {
             locLinks = [];
             if ( this["@id"] == ("http://worldcat.org/entity/work/id/" + workId)) {
                 $.each(this["about"], function(i, v) {
                     
                     if ( v.indexOf("http://id.loc.gov/authorities/subjects/") > -1 ) {
                         if ( $.inArray(v,locUriArray) == -1 ) {
                             processOclcData.getRealLocData(v);
                             locUriArray.push(v);
                         }
                     }
                     if ( v.indexOf("http://id.worldcat.org/fast/") > -1 ) {
                         id = v.substring(v.lastIndexOf("/") + 1,v.length);
                         processOclcData.getLocFastData(id);
                     }

                 });
                 // processOclcdata.getLocData(locLinks);
                 return false;
             }
       	});
       } 
     });
   },
   
   getLocFastData: function(id) {
       var authorityUrl = "https://lookup.ld4l.org/authorities/show/linked_data/oclcfast_direct/" + id;
       $.ajax({
         url : authorityUrl,
         type: 'GET',
         dataType: 'json',
         complete: function(xhr, status) {
           var results = $.parseJSON(xhr.responseText);
           var term = processOclcData.cleanUp(results["label"].toString().replace(/--/g,' ').toLowerCase());
           if ( $.inArray(term,termArray) == -1 ) {
               termArray.push(term);
               processOclcData.getLocSubjectsData(term);
           }
         }
       });
   },
   
   assignFullBackgroundColors: function() {
       var b = .333/$('#broader > div').length;
       var bCount = 1;
       var bLast = 0.2;
       $('#broader > div').each( function() {
           var tmp = b*bCount + .15;
           $(this).css("background","rgba(237, 235, 231, " + tmp.toString() + ")");
           bCount = bCount + 1;
       });
       var r = .333/$('#relevant > div').length;
       var rCount = 1;
       var lastB = "0.33";
       if ( $('#broader > div:last-child').attr('style') != undefined ) {
           var x = $('#broader > div:last-child').attr('style').substring($('#broader > div:last-child').attr('style').indexOf('rgba'),$('#broader > div:last-child').attr('style').indexOf('none')).replace(')','');
           lastB = x.substring(x.lastIndexOf('0.'),x.length);
       }
       $('#relevant > div').each( function() {
          var tmp = (r*rCount) + parseFloat(lastB);
          $(this).css("background","rgba(237, 235, 231, " + tmp.toString() + ")");
          rCount = rCount + 1; 
       });
       var n = .333/$('#narrower > div').length;
       var nCount = 1;
       var lastR = $('#relevant > div:last-child').attr('style').substring($('#relevant > div:last-child').attr('style').indexOf('rgba'),$('#relevant > div:last-child').attr('style').indexOf('none')).replace(')','');
       lastR = lastR.substring(lastR.lastIndexOf('0.'),lastR.length);
       $('#narrower > div').each( function() {
          var tmp = (n*nCount) + parseFloat(lastR) ;
          $(this).css("background","rgba(237, 235, 231, " + tmp.toString() + ")");
          nCount = nCount + 1; 
       });
   },

   assignShortBackgroundColors: function() {
       var l = ($('#broader > div').length + $('#relevant > div').length + $('#narrower > div').length);
       var o = .7/l;
       var c = 1;
       var last = 0.2;
       $('#broader > div').each( function() {
          var tmp = o*c + .15;
          $(this).css("background","linear-gradient(rgba(237, 235, 231, " + last.toString() + "), rgba(237, 235, 231, " + tmp.toString() + ")");
          last = tmp+0.05;
          c = c + 1; 
       });
       $('#relevant > div').each( function() {
           var tmp = o*c + .15;
           $(this).css("background","linear-gradient(rgba(237, 235, 231, " + last.toString() + "), rgba(237, 235, 231, " + tmp.toString() + ")");
           last = tmp+0.05;
           c = c + 1; 
       });
       $('#narrower > div').each( function() {
           var tmp = o*c + .15;
           $(this).css("background","linear-gradient(rgba(237, 235, 231, " + last.toString() + "), rgba(237, 235, 231, " + tmp.toString() + ")");
           last = tmp+0.05;
           c = c + 1; 
       });
   },

   checkContainerText: function() {
       if ( $('#subj-container').height() < 380 ) {
           $('#subj-type').text("Broader to narrower terms");
           $('#subj-container').css("overflow","hidden");
       }
   },

   toggleRelatedSubjects: function() {
     $('#subjects-launch').click(function() {
         if ( $('#subj-container').is(":visible") ) {
             $('#subj-type').hide();
             $('#subj-container').slideUp();
             $this.removeClass("fa-minus");
             $this.addClass("fa-plus");
         }
         else {
             var arrayLength = (broaderArray.length + narrowerArray.length + relevantArray.length);
             if ( arrayLength == 0 ) {
                 $('#subj-container').html("");
                 $('#subj-type').text("No additional subjects found.");
             }
             else if ( arrayLength > 16 ) {
                 if ( arrayLength > 60 ) {
                     processOclcData.assignFullBackgroundColors();
                 }
                 else {
                     if ( arrayLength < 20 ) {
                        $('#subj-type').text("Broader to narrower terms");
                     }
                     processOclcData.assignShortBackgroundColors();
                 }
             }
             else {
                 processOclcData.checkContainerText();
                 processOclcData.assignShortBackgroundColors();
             }
             $('#subj-type').show();
             $this = $('.fa-plus');
             $this.removeClass("fa-plus");
             $this.addClass("fa-minus");
             $('#subj-container').slideDown();

             if ( arrayLength > 19 ) {
               $('#subj-container').on('scroll', function() {
                 var broaderViewable = processOclcData.isInViewport($("#broader"), true) ;
                 var relevantViewable = processOclcData.isInViewport($("#relevant"), true) ;
                 var narrowerViewable = processOclcData.isInViewport($("#narrower"), true) ;
                 if ( broaderViewable ) {
                     $('#subj-type').text("Broader terms");
                 }
                 else if ( !broaderViewable && relevantViewable ) {
                     $('#subj-type').text("Relevant terms");
                 }
                 else if ( !broaderViewable && !relevantViewable ) {
                     $('#subj-type').text("Narrower terms");
                 }
               });
             }
         }
     });
   },
   
   isInViewport: function(element, partial) {
       
        var container = $("#subj-container");
        var contHeight = container.height();
        var contTop = container.scrollTop();
        var contBottom = contTop + contHeight ;

        var elemTop = $(element).offset().top - container.offset().top;
        var elemBottom = elemTop + $(element).height();

        var isTotal = (elemTop >= 0 && elemBottom <=contHeight);
        var isPart = ((elemTop < 0 && elemBottom > 0 ) || (elemTop > 0 && elemTop <= container.height())) && partial ;

        return  isTotal  || isPart ;
        
   }
    
};  
Blacklight.onLoad(function() {
  if ( $('body').prop('className').indexOf("catalog-show") >= 0 ) {
     processOclcData.onLoad();
  }
});  
