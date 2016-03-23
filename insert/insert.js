var insert = (function(){

  // private

  var $body = $("body");
  var $modal;
  var $modalBeginButton;
  var $insert;

  var MODAL_WELCOME = 0;
  var MODAL_HELP = 1;
  var MODAL_REPORT = 2;

  var init = function(){
    prepareModal();
    prepareInsert();
  };

  var prepareModal = function(){
    $body.prepend("<div id='a12_modal_container'></div>");

    var $modalContainer = $("#a12_modal_container");
    $modalContainer.load(chrome.extension.getURL('insert/welcome_modal.html'), function(){
      $modal = $modalContainer.find(".a12_modal");
      $modalBeginButton = $modalContainer.find(".begin");
      $modalBeginButton.click(function(){
        hideModal();

        // start timer
        var triggerReportDate = new Date();
        triggerReportDate.setMinutes(triggerReportDate.getMinutes() + 5);
        chrome.storage.local.set({'triggerReportTime': triggerReportDate.getTime()});
      });
    });
  };

  var showModal = function(){
    $body.addClass("a12_modal_open");
    $modal.fadeIn();
  };

  var hideModal = function(){
    $body.removeClass("a12_modal_open");
    $modal.fadeOut();
  };

  var prepareInsert = function(){

    var $insertContainer = $(".quick-navigation.button-group");

    $.get(chrome.extension.getURL('insert/insert.html'), function(insertContent) {
      $insertContainer.append(insertContent);
      $insert = $insertContainer.find(".a12_insert");
      $insert.click(function(){
        showModal();
      });

      chrome.storage.local.get('triggerReportTime', function(items){
        var triggerReportTime = items.triggerReportTime;
        var nowDate = new Date();
        var triggerReportDate;

        if(typeof(triggerReportTime) == 'undefined'){
          showModal();
        } else {
          triggerReportDate = new Date(triggerReportTime);

          if(nowDate > triggerReportDate) {
            showModal();
          }
        }

        debugger;

      });
    }, 'html');
  };

  // public

  return {
    init: init,
    showModal: showModal,
    hideModal: hideModal
  }

})();

$(function(){
  insert.init();
});
