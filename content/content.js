var content = (function(){

  // private

  var $body = $("body");
  var $modal;
  var $modalContainer;
  var $insert;

  var MODAL_WELCOME = '.a12_modal_welcome';
  var MODAL_HELP = '.a12_modal_help';
  var MODAL_REPORT = '.a12_modal_report';

  var init = function(){
    prepareModals();
    prepareInsert();
  };

  var prepareModals = function(){
    $body.prepend("<div id='a12_modal_container'></div>");

    $modalContainer = $("#a12_modal_container");

    $.get(chrome.extension.getURL('content/welcome_modal.html'), function(html){
      $modalContainer.append(html);

      var $modalBeginButton = $modalContainer.find(".begin");
      $modalBeginButton.click(function(){
        hideModal();
        resetReportTimer();
      });
    });

    $.get(chrome.extension.getURL('content/help_modal.html'), function(html){
      $modalContainer.append(html);

      var $modalRestartButton = $modalContainer.find(".restart");
      $modalRestartButton.click(function(){
        hideModal();
        console.log('Restarting from help modal, do something here');
        showModal(MODAL_WELCOME);
      });

      var $modalContinueButton = $modalContainer.find(".continue");
      $modalContinueButton.click(function(){
        hideModal();

        console.log('Never mind...');
      });
    });

    $.get(chrome.extension.getURL('content/report_modal.html'), function(html){
      $modalContainer.append(html);

      $modalContainer.find("#threeletteragencies").attr("src", chrome.extension.getURL("images/threeletteragencies.png"));

      var $modalDoneButton = $modalContainer.find(".done");
      $modalDoneButton.click(function(){
        hideModal();
        console.log('Restarting from report modal, should clear all existing data here');
        showModal(MODAL_WELCOME);
      });

      // Last modal is loaded, so we'll start the timing logic
      checkForReportTime();
    });
  };

  var showModal = function(modal){
    $body.addClass("a12_modal_open");
    $modal = $modalContainer.find(modal);
    console.log(modal);
    $modal.fadeIn();
  };

  var hideModal = function(){
    $body.removeClass("a12_modal_open");
    $modal.fadeOut();
  };

  var prepareInsert = function(){

    var $insertContainer = $(".quick-navigation.button-group");

    $.get(chrome.extension.getURL('content/insert.html'), function(insertContent) {
      $insertContainer.append(insertContent);
      $insert = $insertContainer.find(".a12_insert");
      $insert.click(function(){
        showModal(MODAL_HELP);
      });
    });
  };

  var checkForReportTime = function(){

    chrome.storage.local.get('triggerReportTime', function(items){
      var triggerReportTime = items.triggerReportTime;
      var nowDate = new Date();
      var triggerReportDate;

      if(typeof(triggerReportTime) == 'undefined'){
        showModal(MODAL_WELCOME);
      } else {
        triggerReportDate = new Date(triggerReportTime);

        if(nowDate > triggerReportDate) {
          showModal(MODAL_REPORT);
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
    hideModal: hideModal
  }

})();

$(function(){
  content.init();
});
