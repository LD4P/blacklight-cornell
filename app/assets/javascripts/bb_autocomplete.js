// Add autocomplete for the main site search box — ony for Best Bets results
(function ($) {
  $(document).ready(function() {

    if ($('#qq').length) {
      $('#q').autocomplete({
        source: location.protocol + "//bestbets.library.cornell.edu/match/" + $('#q').val(),
        minLength: 2,
        select: function(event, ui) {
          var url = ui.item.url;
          if (url != '#') {
            location.href = url;
          }
        }
      })
      // This next section is just to add the little external link icon (the <i> class) 
      // after the label in the results list!
      // It can be completely removed if all you need is basic autocomplete
      .data('ui-autocomplete')._renderItem = function(ul, item) {
        return $('<li>')
          .data('item.ui-autocomplete', item)
          .append('<a>' + item.name + '&nbsp;&nbsp;<i class="fa fa-external-link"></i>')
          .append()
          .appendTo(ul);
      }
    }
  });
})(jQuery);

// When the IE9 warning message is dismissed, send an AJAX call to the server
// to remember that fact in the user session so that he/she doesn't keep seeing
// the same message
function hideIE9Warning() {
    $.post('/backend/dismiss_ie9_warning');
}
