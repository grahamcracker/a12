function refreshEvents(){
  chrome.storage.local.get('events', function(items) {
    var events = items.events;
    var $loading = $(".console > .loading");
    var $events = $(".console > .events");

    $events.html("");

    if(typeof(events) === 'undefined'){
      $loading.html("No events yet!");
      return;
    }
    else if(events.length == 0){
      $loading.html("All events removed!");
    } else {
      $loading.hide();
      $events.show();
    }

    for(var i = 0; i < events.length; i++){
      var event = events[i];
      var event_class = (event.level == 1) ? '' : 'secondary';

      $events.append("<div class='event " + event_class + "'>"
        + "<div class='title'>" + event.title + "</div>"
        + "<div class='content'>" + event.content + "</div>"
        + "</div>");
    }

    $events.animate({ scrollTop: $events[0].scrollHeight}, 300);
  });
};

function clearEvents(){
  chrome.storage.local.set({events: []}, function(){
    refreshEvents();
  });
};

$(function(){
  refreshEvents();
  //setInterval(refreshEvents, 500);

  $(".clearConsole").on('click', function(){
    clearEvents();
  });
});
