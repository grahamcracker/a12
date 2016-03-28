heatmapURLs = [];
heatpoints = [];

function refreshWidgets(){

  // Load events

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

  // Load heatmaps

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

  // Load timing

  var $timing = $('#timing');
  var nowDate = new Date();
  $timing.find('.current > em').html(nowDate);

  chrome.storage.local.get('triggerReportTime', function(items){
    var triggerReportTime = items.triggerReportTime;
    var $reportTimeField = $timing.find('.triggers > em');

    if(typeof(triggerReportTime) == 'undefined'){
      $reportTimeField.html("Not set yet.");
    } else {
      var triggerDate = new Date(triggerReportTime);
      var comments = (triggerDate < nowDate) ? "<strong>(Will trigger on next pageload</strong>)" : "";
      $reportTimeField.html(triggerDate + " " + comments);
    }
  });

  $("#timing > .setToNow").on('click', function(){
    setTimingToNow();
  });
};

function loadHeatmap(index){
  var data = heatpoints[index];
  $("#heatmapNumber").html(data.length + ' mousepoints');
  simpleheat('heatCanvas').data(data).radius(1.5, 3).draw();
}

function clearEvents(){
  chrome.storage.local.set({events: []}, function(){
    refreshWidgets();
  });
};

function clearHeatmaps(){
  chrome.storage.local.set({heatmaps: []});
}

function setTimingToNow(){
  chrome.storage.local.set({'triggerReportTime': (new Date()).getTime()}, function(){
    refreshWidgets();
  });
}

$(function(){
  refreshWidgets();

  $('#refresh').on('click', function(){
    refreshWidgets();
  });

  $('.clearConsole').on('click', function(){
    clearEvents();
  });

  $('.clearHeatmaps').on('click', function(){
    clearHeatmaps();
  });
});
