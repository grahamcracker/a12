heatmapURLs = [];
heatpoints = [];

function refreshEvents(){
  chrome.storage.local.get('events', function(items) {
    var events = items.events;
    var $loading = $(".console > .loading");
    var $events = $(".console > .events");

    // load events

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

    // load heatmaps
    var $heatmapSelector = $("#heatmapSelector");

    chrome.storage.local.get({heatmaps: {}}, function(s) {
      var heatmaps = s.heatmaps;

      $heatmapSelector.html("");

      $.each(heatmaps, function(url, data){
        heatmapURLs.push(url);
        $heatmapSelector.append($("<option>", { value: url, html: url.substring(0,120)}));
        heatpoints.push(data);
      });

      if(heatmapURLs.length > 0){
        loadHeatmap(0);
      }else{
        $heatmapSelector.append($("<option>", { value: '', html: 'No heatmaps yet! View a page and mouse around for at least ten seconds.', disabled: 'disabled'}));
      }
    });

    $heatmapSelector.on('change', function() {
      loadHeatmap(this.selectedIndex);
    });

  });
};

function loadHeatmap(index){
  var data = heatpoints[index];
  simpleheat('heatCanvas').data(data).radius(1.5, 3).draw();
}

function clearEvents(){
  chrome.storage.local.set({events: []}, function(){
    refreshEvents();
  });
};

function clearHeatmaps(){
  chrome.storage.local.set({heatmaps: []});
}

$(function(){
  refreshEvents();

  $(".clearConsole").on('click', function(){
    clearEvents();
  });

  $(".clearHeatmaps").on('click', function(){
    clearHeatmaps();
  });
});
