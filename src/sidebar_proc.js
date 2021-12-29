var recvLog_lock = false;
var comment_id   = null;
var village_number = null;

// memory area to store values
var stored_value   = {};
var stored_raw_log = {};

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

  // Load from memory area or Web Storaget API
  if (stored_value === {}) {
    stored_value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info"))) || {};
  }
  var value             = JSON.parse(JSON.stringify(stored_value)); // deep copy
  var stored_value_prev = JSON.parse(JSON.stringify(stored_value)); // deep copy

  if (stored_raw_log === {}) {
    stored_raw_log = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_raw_log"))) || {};
  }
  var raw_log             = JSON.parse(JSON.stringify(stored_raw_log)); // deep copy
  var stored_raw_log_prev = JSON.parse(JSON.stringify(stored_raw_log)); // deep copy

  // Parse and Update wakamete village log
  var is_same_village = true;
  try {
    var parser = new DOMParser();
    var receivedLog = parser.parseFromString(request.html_log, "text/html");
    var parsedLog = html2json_village_log(receivedLog);
    if (parsedLog != null) {
      if ( village_number != parsedLog.village_number ) {
         is_same_village = false;
      }
      if (value[parsedLog.village_number] == null) {
        Object.assign(value, {[parsedLog.village_number]:parsedLog });
      } else {
        Object.assign(value[parsedLog.village_number].log, parsedLog.log);
      }
      village_number = parsedLog.village_number;
      if (Object.keys(parsedLog.log).length == 1) {
        if (raw_log[parsedLog.village_number] == null) {
          raw_log[parsedLog.village_number] = {log:{}};
        }
        raw_log[parsedLog.village_number].log[Object.keys(parsedLog.log)[0]] = request.html_log;
      }
    }
  } catch(e) {
    // exception case
    //   (1) re-login to village: html2json_village_log() must be aborted.
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
    updateSummary(value[village_number]);    // deduce-summary
  } catch(e) {
    // exception case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }

  // save to memory area
  stored_value   = JSON.parse(JSON.stringify(value));   // deep copy
  stored_raw_log = JSON.parse(JSON.stringify(raw_log)); // deep copy

  // save raw_log to Web Storaget API
  if (Object.keys(stored_raw_log).length > 8) { // preserve log : newest 8 villages by Village ID
    var minimum_key = null;
    Object.keys(stored_raw_log).forEach(function(v){
      if (minimum_key == null || parseInt(v) < parseInt(minimum_key)) {
        minimum_key = v;
      }
    });
    if (minimum_key != village_number) {
      delete stored_raw_log[minimum_key];
      delete stored_raw_log_prev[minimum_key];
    }
  }
  try {
    if (JSON.stringify(stored_raw_log).length > JSON.stringify(stored_raw_log_prev).length) {
      window.localStorage.setItem("wakamete_village_raw_log", encodeURIComponent(JSON.stringify(stored_raw_log)));
    }
  } catch (e) {
    console.log ('raw_log save error : ' + e.name + ' : ' + e.message + ' : ' + e.stack);
    // nop : ignore disk write error
  }
  // save value to Web Storaget API
  if (Object.keys(stored_value).length > 8) { // preserve log : newest 8 villages by Village ID
    var minimum_key = null;
    Object.keys(stored_value).forEach(function(v){
      if (minimum_key == null || parseInt(v) < parseInt(minimum_key)) {
        minimum_key = v;
      }
    });
    if (minimum_key != village_number) {
      delete stored_value[minimum_key];
    }
  }
  try {
    if (JSON.stringify(stored_value) !== JSON.stringify(stored_value_prev)) {
      window.localStorage.setItem("wakamete_village_info", encodeURIComponent(JSON.stringify(stored_value)));
    }
  } catch {
    console.log ('raw_log save error : ' + e.name + ' : ' + e.message + ' : ' + e.stack);
    // nop : ignore disk write error
  }

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
function event_click_td_alt(arg) {
  if (arg != null) {
    var o = arg.srcElement;
    while (( o.tagName.toLowerCase() != "td") && (o.tagName.toLowerCase() != "div")) {
      o = o.parentElement;
    }
    if (o.tagName.toLowerCase() == "td") {
      // <tr><td alt="Copy-message-to-freememo">....</td></tr>
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
    if ((o.tagName.toLowerCase() == "tr") && (o.childElementCount == 3)) {
      // copy original_character_and_comment if outerHTML is <tr><td>layouted_charecter</td><td>layouted_comment</td><td style="display:none">original_character_and_comment</td></tr>
      var v = document.getElementById("freememo").value;
      v = v + "\n" + o.childNodes[2].textContent;
      document.getElementById("freememo").value = v;
    }
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
document.getElementById("vote-summary"   ).addEventListener("click", function(e){ event_click_td_alt(e); }, true);
document.getElementById("comment-summary").addEventListener("click", function(e){ event_click_comments(e); }, true);
document.getElementById("deduce-summary" ).addEventListener("click", function(e){ event_click_td_alt(e); }, true);

document.getElementById("is_dead"        ).addEventListener("change", function(e){ checkbox_change(e); }, true);
document.getElementById("is_talented"    ).addEventListener("change", function(e){ checkbox_change(e); }, true);
document.getElementById("is_villager"    ).addEventListener("change", function(e){ checkbox_change(e); }, true);
document.getElementById("is_enemy"       ).addEventListener("change", function(e){ checkbox_change(e); }, true);

document.getElementById("villagers-template").addEventListener("click", function(e){ output_memo_template(e); }, true);
