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
                  items = JSON.parse(data["responseText"]);
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
             if ( ui.item.label.indexOf("see also") > -1 ) {
               tmp = ui.item.label.replace("<em>see also:/<em>","");
               $('#q').val(ui.item.label.substring(ui.item.label.indexOf("</em>")+6,ui.item.label.indexOf(" <span>")));
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
