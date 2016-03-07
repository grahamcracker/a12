var insert = (function(){

  // private

  var $body = $("body");
  var $modal;
  var $modalBeginButton;

  var init = function(){
    prepareModal();
  };

  var prepareModal = function(){
    $body.prepend("<div id='a12_modal_container'></div>");

    var $modalContainer = $("#a12_modal_container");
    $modalContainer.load(chrome.extension.getURL('insert/modal.html'), function(){
      $modal = $modalContainer.find(".modal");
      $modalBeginButton = $modalContainer.find(".begin");
      $modalBeginButton.click(function(){
        hideModal();
      });
      showModal();
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
