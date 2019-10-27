var recvLog_lock = false;
var comment_id   = null;
var village_number = null;

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
    value = {};
  } else if (value.length > 8) { // preserve log : newest 8 villages by Village ID
    var minimum_key = null;
    Object.keys(value).forEach(function(v){
      if (minimum_key == null || parseInt(v) < parseInt(minimum_key)) {
        minimum_key = v;
      }
    });
    delete value[minimum_key];
  }

  // Parse and Update wakamete village log
  var is_same_village = true;
  try {
     var parser = new DOMParser();
     var receivedLog = parser.parseFromString(request.html_log, "text/html");
     var todayLog    = html2json_villager_log_1day(receivedLog);
     if (todayLog != null) {
      if ( village_number != todayLog.number ) {
         is_same_village = false;
      }
      if (value[todayLog.number] == null) {
        Object.assign(value, {[todayLog.number]:{ village_number: todayLog.number, log:new Object(), input:new Object()}});
      }
      Object.assign(value[todayLog.number].log, { [todayLog.msg_date]:todayLog });
      village_number = todayLog.number;
     }
  } catch(e) {
    // exception case
    //   (1) re-login to village: html2json_villager_log_1day() must be aborted.
    //   (2) illegal case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }
  // update input table
  try {
    if (is_same_village == false) {
      refreshInputField(value[village_number]);
    }
  } catch(e) {
    // exception case
    //   (1) no log
    console.log(e.name + ':' + e.message);
    console.log(e.stack);  
  };
  try {
    updateInputField(value[village_number]);
  } catch(e) {
    // exception case
    //   (1) 事件前日
    //   (2) illegal case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
    // refresh input field for recovery.
    try {
      refreshInputField(value[village_number]);
    } catch(e) {
      // exception case
      //   (1) no log
      console.log(e.name + ':' + e.message);
      console.log(e.stack);  
    };
  }
  try {
    value[village_number].input = updateInput(value[village_number]);
  } catch(e) {
    // exception case
    //   (1) 事件前日
    //   (2) illegal case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }

  // update
  try {
    if ('popup-active' == document.getElementById("vote-summary").getAttribute('class')) {
      updateVotes(value[village_number]);
    } else if ('popup-active' == document.getElementById("comment-summary").getAttribute('class')) {
      if (comment_id != null) {
        updateCommentLog(value[village_number], comment_id);
      }
    } else {
      updateSummary(value[village_number]);    // deduce-summary
    };
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
        var value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")))[village_number];
        updateCommentLog(value, id);
        comment_id = id;

        //// show comment-summary
        // <a id="date-log-2" href="#">2日目</a>
        // <a id="all-day-log-依田芳乃 " href="#">依田芳乃 </a>
        document.getElementById("vote-summary"   ).setAttribute('class', 'popup-standby');
        document.getElementById("comment-summary").setAttribute('class', 'popup-active');
        document.getElementById("deduce-summary" ).setAttribute('class', 'popup-standby');
        document.getElementById("summary-field").scrollTop  = 0;
        document.getElementById("summary-field").scrollLeft = 0;
      } else if(id.indexOf('vote') != -1) {
        //// create vote-summary
        var value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")))[village_number];
        updateVotes(value);

        //// show vote-summary
        // <a id="vote" href="#">投票結果</a>
        document.getElementById("vote-summary"   ).setAttribute('class', 'popup-active');
        document.getElementById("comment-summary").setAttribute('class', 'popup-standby');
        document.getElementById("deduce-summary" ).setAttribute('class', 'popup-standby');
        document.getElementById("summary-field").scrollTop  = 0;
        document.getElementById("summary-field").scrollLeft = 0;
      } else if(id.indexOf('summary') != -1) {
        //// show deduce-summary
        document.getElementById("vote-summary"   ).setAttribute('class', 'popup-standby');
        document.getElementById("comment-summary").setAttribute('class', 'popup-standby');
        document.getElementById("deduce-summary" ).setAttribute('class', 'popup-active');
        document.getElementById("summary-field").scrollTop  = 0;
        document.getElementById("summary-field").scrollLeft = 0;
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
function checkbox_change(arg) {
  document.getElementById("deduce").scrollTop  = 0;
  document.getElementById("deduce").scrollLeft = 0;
}
function output_memo_template(arg) {
  var value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")))[village_number];
  var id = arg.srcElement.getAttribute('id');
  var v = document.getElementById("freememo").value;
  if (id.indexOf('template-seer') != -1) {
    document.getElementById("freememo").value = v + "\n" + template_seer(value);
  } else if (id.indexOf('template-medium') != -1) {
    document.getElementById("freememo").value = v + "\n" + template_medium(value);
  } else if (id.indexOf('template-bodyguard') != -1) {
    document.getElementById("freememo").value = v + "\n" + template_bodyguard(value);
  } else if (id.indexOf('template-freemason') != -1) {
    document.getElementById("freememo").value = v + "\n" + template_freemason(value);
  }
}

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
document.getElementById("deduce"         ).addEventListener("click", function(e){ event_click_deduce(e); }, true);
document.getElementById("control"        ).addEventListener("click", function(e){ event_click_deduce(e); }, true);
document.getElementById("vote-summary"   ).addEventListener("click", function(e){ event_click_votes(e); }, true);
document.getElementById("comment-summary").addEventListener("click", function(e){ event_click_comments(e); }, true);
document.getElementById("deduce-summary" ).addEventListener("click", function(e){ event_click_summary(e); }, true);

document.getElementById("is_dead"        ).addEventListener("change", function(e){ checkbox_change(e); }, true);
document.getElementById("is_talented"    ).addEventListener("change", function(e){ checkbox_change(e); }, true);
document.getElementById("is_villager"    ).addEventListener("change", function(e){ checkbox_change(e); }, true);
document.getElementById("is_enemy"       ).addEventListener("change", function(e){ checkbox_change(e); }, true);

document.getElementById("villagers-template").addEventListener("click", function(e){ output_memo_template(e); }, true);
