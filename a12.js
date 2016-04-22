function characterCount(text){
  return text.replace(/ /g,'').length;
}

function consoleEvent(level, title, content){
  var event = {level: level, title: title, content: content};
  newEvents.push(event);
}

function sendConsoleEvents(){
  chrome.storage.local.get('events', function(items) {
    var events = arrayForItem(items.events);
    Array.prototype.push.apply(events, newEvents)
    chrome.storage.local.set({events: events});
  });
}

function addSelection(selectedText){
  chrome.storage.local.get('selections', function(items) {
    var selections = arrayForItem(items.selections);
    selections.push(selectedText);
    chrome.storage.local.set({selections: selections});
  });
}

function addKeywords(newKeywords){
  chrome.storage.local.get('visitedKeywordsUrls', function(items) {
    var visitedKeywordsUrls = arrayForItem(items.visitedKeywordsUrls);

    if(visitedKeywordsUrls.indexOf(window.location.href) == -1){

      chrome.storage.local.get({keywords: {}}, function(items) {
        var keywords = items.keywords;
        for(var kw in newKeywords){
          keywords[kw] = (keywords[kw] || 0) + newKeywords[kw];
        }
        chrome.storage.local.set({keywords: keywords});

        visitedKeywordsUrls.push(window.location.href);
        chrome.storage.local.set({visitedKeywordsUrls: visitedKeywordsUrls});
      });
    }
  });
}

function objectForItem(item){
  return (item instanceof Array || item === undefined) ? {} : item;
}

function arrayForItem(item){
  return (typeof(item) !== 'undefined' && item instanceof Array) ? item : []
}

var keywords = [];
var newEvents = [];

$.getJSON(chrome.extension.getURL("public/terror_keywords.json"), function(data) {
  keywords = data.keywords;

  var $cts = $(document);

  consoleEvent(1, "User changed page", document.title);
  var $title = $cts.find(".story-header");
  var $body = $cts.find(".story-body");

  if($title.length && $body.length) {
    var title = $title.text();
    var body = $body.text();

    var bodyCount = numeral(characterCount(body)).format('0,0');
    consoleEvent(2, "Article detected", "(" + bodyCount + " character story)");

    var combinedText = (title + body).toLowerCase();
    var newKeywords = {};

    for(var i = 0; i < keywords.length; i++) {
      var keyword = keywords[i];
      var search = new RegExp(' ' + keyword.toLowerCase() + ' ', 'g');
      var count = (combinedText.match(search) || []).length;
      newKeywords[keyword] = (newKeywords[keyword] || 0) + count;
      if(count >= 3) {
        consoleEvent(2, "Keyword found!", "'" + keyword + "', " + count + " occurrences");
      }
    }

    addKeywords(newKeywords);

    $body.mouseup(function() {
      var selectedText = $cts[0].getSelection().toString();

      if(selectedText.match(/[a-z]/i)){
        newEvents = [];
        consoleEvent(2, "User selected text", "'" + selectedText + "'");
        sendConsoleEvents();
        addSelection(selectedText);
      }
    });
  }

  sendConsoleEvents();
});
