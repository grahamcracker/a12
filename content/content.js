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
        chrome.storage.local.set({heatmaps: []});
        chrome.storage.local.set({keywords: {}});
        chrome.storage.local.set({visitedKeywordsUrls: []});
        chrome.storage.local.set({selections: []});
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

      $modal.find('.done,#alternate_done').on('click', function(){
        hideModals();
        console.log("Restarting from report modal");
        showModal(welcomeModal);
      });

      chrome.storage.local.get({heatmaps: {}}, function(s) {
        var heatmaps = s.heatmaps;
        var $heatmapContainer = $('#heatmaps')

        var largestHeatmaps = [];
        $.each(heatmaps, function(url, data){
          largestHeatmaps.push([url, data])
        });

        // Sort heatmaps by largest, use the first four
        largestHeatmaps.sort(function(a, b) {return a[1] - b[1]})
        largestHeatmaps = largestHeatmaps.slice(0, 4);

        for(var i = 0; i < largestHeatmaps.length; i++) {
          var url = (largestHeatmaps[i][0].split('/').pop() || 'nytimes.com');
          var data = largestHeatmaps[i][1];

          var $map = $("<div class='heatmap'></div>").appendTo($heatmapContainer);
            $('<h5></h5>').html("URL: " + url).appendTo($map);
            $('<label></label>').html("Resolution: " + data.length).appendTo($map);
            $('<label class="red">Risk Profile: <span class="random-risk"></span></label>').appendTo($map);
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

        // Random numbers

        $('.random-risk').each(function(){
         $(this).html(chance.floating({min: 0, max: 100, fixed: 2}));
        });

        $('.random-legal').each(function(){
          $(this).html(chance.integer({min: 600, max: 9999}));
        });

        $('.random-ip').html(chance.ip());
        $('.random-fisa').html(chance.integer({min: 1111111111, max: 9999999999}));
        $('.random-kta').html(chance.floating({min: 400, max: 800, fixed: 2}));
        $('.random-pra').html(chance.integer({min: 60, max: 99}));

        chrome.storage.local.get({selections: []}, function(s){
         var selections = s.selections;
         $.each(selections, function(i, v){
           $('<p class="yellow">"' + v + '"</p>').appendTo($('#selections'));
         });
        });

        chrome.storage.local.get({keywords: {}}, function(s){
          var keywords = s.keywords;
          var cloudKeywords = [];
          $.each(keywords, function(kw, count){
            if(count > 0){
              cloudKeywords.push({
                text: kw,
                weight: count,
                handlers: {
                  mouseover: function(){
                    $('#keywords-desc').html("Appeared " + count + " times in pages you viewed.");
                  }
                }
              });
            }
          });

          cloudKeywords.sort(function(a, b) {return b.weight - a.weight})
          cloudKeywords = cloudKeywords.slice(0, 30);

          $('#keywords').jQCloud(cloudKeywords, {
            shape: 'rectangular',
            colors: ["#A70000", "#D90000", "#FF0000", "#A76F00", "#D99100", "#FFAA00", "#A74C00", "#D96200", "#FF7400"]
          });

          $('#keywords').on('mouseout', function(){
            $('#keywords-desc').html('');
          });

          var imagesIncluded = 0;
          $.each(cloudKeywords, function(k, o){
            $.getJSON("http://api.duckduckgo.com/?format=json&q=" + o.text, function(response) {
              var firstTopic = response.RelatedTopics[0];
              if(firstTopic != undefined){
                var imageURL = firstTopic.Icon.URL;
                if(imageURL != "" && imagesIncluded < 8){
                  $('<div><span>' + o.text + '</span><img src="' + imageURL + '"/><small>found  ' + o.weight + ' times</small></div>')
                    .appendTo($('#keywords-images'));
                  imagesIncluded++;
                }
              }
            });
          });
        });

      });

      // Last modal is loaded, so we'll start the timing logic
      checkForReportTime();
    });
  };

  var showModal = function(modal){
    $body.addClass(modalOpenClass);
    window.scrollTo(0, 0);
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

    chrome.storage.local.get(['triggerReportTime', 'visitedKeywordsUrls'], function(items){
      var triggerReportTime = items.triggerReportTime;
      var nowDate = new Date();
      var triggerExpiredDate = new Date();
      var triggerReportDate;
      var visitedKeywordsUrls = arrayForItem(items.visitedKeywordsUrls);

      if(typeof(triggerReportTime) == 'undefined'){
        showModal(welcomeModal);
      } else {
        triggerReportDate = new Date(triggerReportTime);
        triggerExpiredDate.setMinutes(triggerReportDate.getMinutes() + 4);

        if(nowDate > triggerExpiredDate) {
          showModal(welcomeModal);
        }
        else if(nowDate > triggerReportDate || visitedKeywordsUrls.length > 5) {
          showModal(reportModal);
        } else {
          console.log('Still in session at ' + nowDate + ', triggering report at ' + triggerReportDate);
        }
      }

    });

  };

  var resetReportTimer = function(){
    var triggerReportDate = new Date();
    triggerReportDate.setMinutes(triggerReportDate.getMinutes() + 4);
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
