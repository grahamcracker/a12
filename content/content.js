var content = (function(){

  // private

  var $body = $('body');
  var $modalContainer;

  var modalContainerTemplate = "<div id='a12_modal_container'></div>";
  var modalOpenClass = 'a12_modal_open';
  var welcomeModal = {
    selector: '.a12_modal_welcome',
    path: 'content/welcome_modal.html'
  };
  var helpModal = {
    selector: '.a12_modal_help',
    path: 'content/help_modal.html'
  };
  var reportModal = {
    selector: '.a12_modal_report',
    path: 'content/report_modal.html'
  };

  var insertContainerSelector = '.quick-navigation.button-group';
  var insertPath = 'content/insert.html';

  var init = function(){
    prepareModals();
    prepareInsert();
  };

  var prepareModals = function(){
    $modalContainer = $(modalContainerTemplate).prependTo($body);

    $.get(chrome.extension.getURL(welcomeModal.path), function(html){
      var $modal = $(html).appendTo($modalContainer);

      $modal.find(".begin").on('click', function(){
        hideModals();
        resetReportTimer();
      });
    });

    $.get(chrome.extension.getURL(helpModal.path), function(html){
      var $modal = $(html).appendTo($modalContainer);

      $modal.find(".restart").on('click', function(){
        hideModals();
        console.log('Restarting from help modal, do something here');
        showModal(welcomeModal);
      });

      $modal.find(".continue").on('click', function(){
        hideModals();

        console.log('Never mind...');
      });
    });

    $.get(chrome.extension.getURL(reportModal.path), function(html){
      var $modal = $(html).appendTo($modalContainer);

      $modal.find('.threeletteragencies').attr('src', chrome.extension.getURL('images/threeletteragencies.png'));
      $modal.find('.a12-logo').attr('src', chrome.extension.getURL('images/a12.png'));

      $modal.find('.done').on('click', function(){
        hideModals();
        console.log("Restarting from report modal, should clear all existing data here");
        showModal(welcomeModal);
      });

      chrome.storage.local.get({heatmaps: {}}, function(s) {
        var heatmaps = s.heatmaps;
        var $heatmapContainer = $('#heatmaps')

        var largestHeatmaps = [];
        $.each(heatmaps, function(url, data){
          largestHeatmaps.push([url, data])
        });

        // Sort heatmaps by largest, use the first three
        largestHeatmaps.sort(function(a, b) {return a[1] - b[1]})
        largestHeatmaps = largestHeatmaps.slice(0, 3);

        for(var i = 0; i < largestHeatmaps.length; i++) {
          var url = largestHeatmaps[i][0];
          var data = largestHeatmaps[i][1];

          var $map = $("<div class='heatmap'></div>").appendTo($heatmapContainer);
            $('<h5></h5>').html("URL: " + url).appendTo($map);
            $('<label></label>').html("Resolution: " + data.length).appendTo($map);
            $('<label>Risk Profile: <span class="random-int"></span></label>').appendTo($map);
          var $canvas = $('<canvas></canvas>').appendTo($map);
          simpleheat($canvas[0]).data(data).radius(1.5, 3).draw();
        }

        var canvas = document.getElementById('fingerprint'),
            ctx = canvas.getContext('2d'),
            w = ctx.canvas.width,
            h = ctx.canvas.height,
            idata = ctx.createImageData(w, h),
            buffer32 = new Uint32Array(idata.data.buffer),
            len = buffer32.length,
            i = 0;

         for(; i < len;i++)
             if (Math.random() < 0.5) buffer32[i] = 0xff000000;

         ctx.putImageData(idata, 0, 0);

         $('.random-int').each(function(){
           $(this).html(Math.floor(Math.random()*(99-80+1)+80));
         });

         $('.random-float').each(function(){
           $(this).html(((Math.random() * 9) + 5).toFixed(2));
         });

         chrome.storage.local.get({selections: []}, function(s){
           var selections = s.selections;
           $.each(selections, function(i, v){
             $('<p class="yellow">"' + v + '"</p>').appendTo($('#selections'));
           });
         });

         chrome.storage.local.get({keywords: {}}, function(s){
           var keywords = s.keywords;

           var largestKeywords = [];
           $.each(keywords, function(kw, count){
             largestKeywords.push([kw, count])
           });

           // Sort keywords by largest, use the first 10
           largestKeywords.sort(function(a, b) {return b[1] - a[1]})
           largestKeywords = largestKeywords.slice(0, 10);

           for(var i = 0; i < largestKeywords.length; i++) {
             var kw = largestKeywords[i][0];
             var count = largestKeywords[i][1];

             $('<li><strong>' + kw + '</strong> (' + count + ')</li>').appendTo($('#keywords'));
           }
         });

      });

      // Last modal is loaded, so we'll start the timing logic
      checkForReportTime();
    });
  };

  var showModal = function(modal){
    $body.addClass(modalOpenClass);

    console.log(modal.selector);

    $modalContainer.find(modal.selector).fadeIn();
  };

  var hideModals = function(){
    $body.removeClass(modalOpenClass);
    $modalContainer.children().fadeOut();
  };

  var prepareInsert = function(){

    var $insertContainer = $(insertContainerSelector);

    $.get(chrome.extension.getURL(insertPath), function(insertContent) {
      var $insert = $(insertContent).appendTo($insertContainer);

      $insert.on('click', function(){
        showModal(helpModal);
      });
    });
  };

  var checkForReportTime = function(){

    chrome.storage.local.get('triggerReportTime', function(items){
      var triggerReportTime = items.triggerReportTime;
      var nowDate = new Date();
      var triggerReportDate;

      if(typeof(triggerReportTime) == 'undefined'){
        showModal(welcomeModal);
      } else {
        triggerReportDate = new Date(triggerReportTime);

        if(nowDate > triggerReportDate) {
          showModal(reportModal);
        } else {
          console.log('Still in session at ' + nowDate + ', triggering report at ' + triggerReportDate);
        }
      }

    });

  };

  var resetReportTimer = function(){
    var triggerReportDate = new Date();
    triggerReportDate.setMinutes(triggerReportDate.getMinutes() + 5);
    chrome.storage.local.set({'triggerReportTime': triggerReportDate.getTime()});
  };

  // public

  return {
    init: init,
    showModal: showModal,
    hideModals: hideModals
  }

})();

$(function(){
  content.init();
});
