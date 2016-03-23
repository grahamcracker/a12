function characterCount(text){
  return text.replace(/ /g,'').length;
}

function consoleEvent(level, title, content){
  var event = {level: level, title: title, content: content};
  newEvents.push(event);
}

function sendConsoleEvents(){
  chrome.storage.local.get('events', function(items) {
    var events = (typeof(items.events) !== 'undefined' && items.events instanceof Array) ? items.events : [];
    Array.prototype.push.apply(events, newEvents)
    chrome.storage.local.set({events: events});
  });
}

function objectForItem(item){
  return (item instanceof Array || item === undefined) ? {} : item;
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

    for(var i = 0; i < keywords.length; i++) {
      var keyword = keywords[i];
      var search = new RegExp(' ' + keyword.toLowerCase() + ' ', 'g');
      var count = (combinedText.match(search) || []).length;
      if(count >= 3) {
        consoleEvent(2, "Keyword found!", "'" + keyword + "', " + count + " occurrences");
      }
    }

    $body.mouseup(function() {
      var selectedText = $cts[0].getSelection().toString();

      if(selectedText != ""){
        newEvents = [];
        consoleEvent(2, "User selected text", "'" + selectedText + "'");
        sendConsoleEvents();
      }
    });
  }

  sendConsoleEvents();
});
