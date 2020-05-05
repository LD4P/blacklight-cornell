// Add autocomplete for the main site search box — ony for Best Bets results
(function ($) {
  $(document).ready(function() {
    if ($('#q').length) {
      $('#q').autocomplete({
        source: function( request, response ) {
            $.ajax({
              url : "/search_ac?term=" + $('#q').val(),
              type: 'GET',
              dataType: "json",
              complete: function(data) {
                  x = JSON.parse(data["responseText"]);
                  items = [];
                  $.each(x, function(i,v) {
                      items.push(i + "s");
                      $.each(v, function() {
                        tmpHash = {}
                        pseudoHash = {}
                        tmpHash["label"] = this["label_s"] + " <span>(" + this["rank_i"] + ")</span>";
                        tmpHash["type"] = this["type_s"];
                        tmpHash["value"] = this["label_s"];
                        if ( this["variant"] != undefined ) {
                            tmpHash["label"] += "<li style='margin-left:15px;'><em>aka:</em> " + this["variant"] + "</li>";
                        }
                        items.push(tmpHash);

                        // pseudonyms have to go into the hash as separate items, and after the preferred label,
                        // because they can be searched individually, unlike variants
                        if ( this["pseudonym"] != undefined && this["pseudonym"].length > 0 ) {
                            console.log(this["pseudonym"].toSource());
                            var the_type = this["type_s"];
                            $.each(this["pseudonym"], function() {
                                pseudoHash["label"] = "<div style='margin:-6px 0 0 15px;'><em>See also:</em> " + this + "</div>";
                                pseudoHash["type"] = the_type;
                                pseudoHash["value"] = this;
                                items.push(pseudoHash);
                            });
                        }
                      });
                  });
                  response( items );
              }
            });
         },
         minLength: 3,
         select: function(event, ui) {
          if ( ui.item.type == "author" ) {
              $('#search_field').val('author/creator');
          }
          else {
              $('#search_field').val('subject');
          }
          if ( ui.item.label.indexOf("<span>") > -1 ) {
            $('#q').val(ui.item.label.substring(0,ui.item.label.indexOf(" <span>")));
          }
          if ( ui.item.label.indexOf("See also") > -1 ) {
            tmp = ui.item.label.replace("<em>See also:/<em>","");
            $('#q').val(ui.item.label.substring(ui.item.label.indexOf("</em>")+5,ui.item.label.indexOf(" <span>")));
          }
          $('form#search-form').submit();
          return false;
        }
      })
      .autocomplete( "instance" )._renderItem = function( ul, item ) {
          if ( item.label == "Authors" || item.label == "Locations" || item.label == "Subjects" || item.label == "Genres" ) {
              $x = $( "<li class='ui-autocomplete-category ac-li'>" );
              $x.html(item.label);
          }
          else {
              $x = $( "<li class='ac-menu-item'>" );
              $x.html(item.label);
          }
          return $x.appendTo(ul);
        };
    }
  });
})(jQuery);

// When the IE9 warning message is dismissed, send an AJAX call to the server 
// to remember that fact in the user session so that he/she doesn't keep seeing
// the same message
function hideIE9Warning() {
    $.post('/backend/dismiss_ie9_warning');
}
