var recvLog_lock = false;
// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog_proc(request, sender, sendResponse) {
// input  : JSON
//          style : { html_log: village_log_html, text_log: village_log_text, txtc_log: village_log_txtC }
//          see onLogLoad() in wakamete-plugins.js
// output : JSON (fixed value)
//          {response: "OK"}
  if (recvLog_lock == false) {
   recvLog_lock = true;
  } else {
    sendResponse({response: "OK"});
    return;
  };


  // Load from Web Storaget API
  var value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")));
  if ( value == null ) {
    value = { village_number:"" };
  }

  // Parse and Update wakamete village log
  try {
     var parser = new DOMParser();
     var receivedLog = parser.parseFromString(request.html_log, "text/html");
     var todayLog    = html2json_villager_log_1day(receivedLog);
     if (todayLog != null) {
       if ( value.village_number != todayLog.number ) {
         value = { village_number: todayLog.number, log:new Object(), input:new Object()};
       }
       value.log[todayLog.msg_date] = todayLog;
     }
  } catch(e) {
    // exception case
    //   (1) re-login to village: html2json_villager_log_1day() must be aborted.
    //   (2) illegal case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }

  // ToDo: update input: field
  try {
    updateInputField(value);
    value.input = updateInput(value);
  } catch(e) {
    // exception case
    //   (1) 事件前日
    //   (2) illegal case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }

  // ToDo: emurate Wakamete-memo
  try {
    updateSummary(value);    // deduce-summary
  } catch(e) {
    // exception case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }

  // save to Web Storaget API
  window.localStorage.setItem("wakamete_village_info", encodeURIComponent(JSON.stringify(value)));

  recvLog_lock = false;
  sendResponse({response: "OK"});
};

// ref. https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener
function event_click_deduce(arg) {
  var v = document.getElementById("freememo").value;

  if (arg != null) {
    var o = arg.srcElement;
    if ( o.tagName.toLowerCase() == "a" ) {
      var id = o.getAttribute('id');

      if (id.indexOf('log') != -1){
        //// create comment-summary
        var value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")));
        updateCommentLog(value, id);

        //// show comment-summary
        // <a id="date-log-2" href="#">2日目</a>
        // <a id="all-day-log-依田芳乃 " href="#">依田芳乃 </a>
        document.getElementById("vote-summary"   ).setAttribute('class', 'popup-standby');
        document.getElementById("comment-summary").setAttribute('class', 'popup-active');
        document.getElementById("deduce-summary" ).setAttribute('class', 'popup-standby');
      } else if(id.indexOf('vote') != -1) {
        //// create vote-summary
        var value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")));
        updateVotes(value);

        //// show vote-summary
        // <a id="vote" href="#">投票結果</a>
        document.getElementById("vote-summary"   ).setAttribute('class', 'popup-active');
        document.getElementById("comment-summary").setAttribute('class', 'popup-standby');
        document.getElementById("deduce-summary" ).setAttribute('class', 'popup-standby');
      } else if(id.indexOf('summary') != -1) {
        //// show deduce-summary
        document.getElementById("vote-summary"   ).setAttribute('class', 'popup-standby');
        document.getElementById("comment-summary").setAttribute('class', 'popup-standby');
        document.getElementById("deduce-summary" ).setAttribute('class', 'popup-active');
      } // else nop
    } // else nop
  }
  return;
}
function event_click_votes(arg) {
  if (arg != null) {
    var o = arg.srcElement;
    while (( o.tagName.toLowerCase() != "td") && (o.tagName.toLowerCase() != "div")) {
      o = o.parentElement;
    }
    if (o.tagName.toLowerCase() == "td") {
      // copy dayX,from,to if "to" clicked.
      // assumed HTML is style is below.
      //     <tr><td>----</td><td>...</td><td                      >dayX</td><td>...</td></tr>
      //     <tr><td>....</td><td>...</td><td alt="dayX:....->....">....</td><td>...</td></tr>
      //     <tr><td>from</td><td>...</td><td alt="dayX:from-> to "> to </td><td>...</td></tr>
      //     <tr><td>....</td><td>...</td><td alt="dayX:....->....">....</td><td>...</td></tr>
      if (o.getAttribute('alt') != null) {
        var v = document.getElementById("freememo").value;
        v = v + "\n" + o.getAttribute('alt');
        document.getElementById("freememo").value = v;
      }
    }
  }
  return;
}
function event_click_comments(arg) {
  if (arg != null) {
    var o = arg.srcElement;
    while (( o.tagName.toLowerCase() != "tr") && (o.tagName.toLowerCase() != "div")) {
      o = o.parentElement;
    }
    if ((o.tagName.toLowerCase() == "tr") && (o.childElementCount == 2)) {
      // copy innerText if outerHTML is <tr><td>charecter</td><td>comment</td></tr>
      var v = document.getElementById("freememo").value;
      v = v + "\n" + o.innerText;
      document.getElementById("freememo").value = v;
    }
  }
  return;
}
function event_click_summary(arg) {
  if (arg != null) {
    var o = arg.srcElement;
    while (o.tagName.toLowerCase() != "div") {
      o = o.parentElement;
    }
    // copy result
    var v = document.getElementById("freememo").value;
    v = v + "\n" + o.innerText;
    document.getElementById("freememo").value = v;
  }
  return;
}

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
document.getElementById("deduce"         ).addEventListener("click", function(e){ event_click_deduce(e); }, true);
document.getElementById("vote-summary"   ).addEventListener("click", function(e){ event_click_votes(e); }, true);
document.getElementById("comment-summary").addEventListener("click", function(e){ event_click_comments(e); }, true);
document.getElementById("deduce-summary" ).addEventListener("click", function(e){ event_click_summary(e); }, true);
