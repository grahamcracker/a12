var heatpoints = [];
var scalingRatio = 0.2

$('body').mousemove(function(event){
  var x = Math.round(scalingRatio * event.pageX), y = Math.round(scalingRatio * event.pageY);
  heatpoints.push([x, y, 1]);
});

function sendHeatmap(){
  chrome.storage.local.get('heatmaps', function(items) {
    var heatmaps = objectForItem(items.heatmaps);

    var thisPageKey = window.location.href.split('?')[0];

    if(thisPageKey in heatmaps){
      heatmaps[thisPageKey] = heatmaps[thisPageKey].concat(heatpoints);
    }else {
      heatmaps[thisPageKey] = heatpoints;
    }

    chrome.storage.local.set({heatmaps: heatmaps});
    heatpoints = [];
  });
}

$(function(){
  setInterval(sendHeatmap, 5000);
});
