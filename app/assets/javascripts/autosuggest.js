// Add autocomplete for the main site search box — ony for Best Bets results
(function ($) {
  $(document).ready(function() {
    if ($('#q').length) {
        console.log("HERE I AM, TOO")
      $('#q').autocomplete({
        source: function( request, response ) {
            $.ajax({
              url : "/search_ac?json=" + $('#q').val(),
              type: 'GET',
              dataType: "json",
              complete: function(data) {
                  x = JSON.parse(data["responseText"]);
                  items = [];
                  $.each(x, function(i,v) {
                      items.push(i + "s");
                      $.each(v, function() {
                        tmpHash = {}
                        tmpHash["label"] = this["label"] + " <span>(" + this["rank"] + ")</span>";
                        tmpHash["type"] = this["type"];
                        tmpHash["value"] = this["label"];
                        items.push(tmpHash);
                      });
                  });
                  response( items );
              }
            });
         },
         minLength: 3,
         select: function(event, ui) {
             console.log("select " + ui.item.type);
          if ( ui.item.type == "author" ) {
              $('#search_field').val('author/creator');
          }
          else {
              $('#search_field').val('subject');
          }
          $('#q').val(ui.item.label.substring(0,ui.item.label.indexOf("<span>") -1));
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
