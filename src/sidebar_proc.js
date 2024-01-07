'use strict';

import { html2json_village_log } from './logparser.js';
import { refreshInputField, updateInput, updateInputField } from './deducer.js';
import { updateCommentLog } from './logprovider.js';
import { updateSummary } from './summary.js';
import { updateVotes } from './votes.js';

export var village_number = null;

// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
export function recvLog_proc(request) {
  // input  : JSON
  //          style : { html_log: village_log_html, text_log: village_log_text, txtc_log: village_log_txtC }
  //          see onLogLoad() in wakamete-plugins.js
  // output : JSON (fixed value)
  //          {response: "OK"}
  if (recvLog_proc.lock == undefined || recvLog_proc.lock == false) {
    recvLog_proc.lock = true;
  } else {
    return;
  }

  // Load from memory area or Web Storaget API
  if (
    recvLog_proc.stored_value == undefined ||
    recvLog_proc.stored_value === {}
  ) {
    recvLog_proc.stored_value =
      JSON.parse(
        decodeURIComponent(window.localStorage.getItem('wakamete_village_info'))
      ) || {};
  }
  var value = JSON.parse(JSON.stringify(recvLog_proc.stored_value)); // deep copy
  var stored_value_prev = JSON.parse(JSON.stringify(recvLog_proc.stored_value)); // deep copy

  if (
    recvLog_proc.stored_raw_log == undefined ||
    recvLog_proc.stored_raw_log === {}
  ) {
    recvLog_proc.stored_raw_log =
      JSON.parse(
        decodeURIComponent(
          window.localStorage.getItem('wakamete_village_raw_log')
        )
      ) || {};
  }
  var raw_log = JSON.parse(JSON.stringify(recvLog_proc.stored_raw_log)); // deep copy
  var stored_raw_log_prev = JSON.parse(
    JSON.stringify(recvLog_proc.stored_raw_log)
  ); // deep copy

  // Parse and Update wakamete village log
  var is_same_village = true;
  try {
    var parser = new DOMParser();
    var receivedLog = parser.parseFromString(request.html_log, 'text/html');
    var parsedLog = html2json_village_log(receivedLog);
    if (parsedLog != null) {
      if (village_number != parsedLog.village_number) {
        is_same_village = false;
      }
      if (value[parsedLog.village_number] == null) {
        Object.assign(value, { [parsedLog.village_number]: parsedLog });
      } else {
        Object.assign(value[parsedLog.village_number].log, parsedLog.log);
      }
      village_number = parsedLog.village_number;
      if (Object.keys(parsedLog.log).length == 1) {
        if (raw_log[parsedLog.village_number] == null) {
          raw_log[parsedLog.village_number] = { log: {} };
        }
        raw_log[parsedLog.village_number].log[Object.keys(parsedLog.log)[0]] =
          request.html_log;
      }
    }
  } catch (e) {
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
  } catch (e) {
    // exception case
    //   (1) no log
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }
  try {
    updateInputField(value[village_number]);
  } catch (e) {
    // exception case
    //   (1) 事件前日
    // refresh input field for recovery.
    try {
      refreshInputField(value[village_number]);
    } catch (e) {
      // exception case
      //   (1) no log
      console.log(e.name + ':' + e.message);
      console.log(e.stack);
    }
  }
  try {
    value[village_number].input = updateInput(value[village_number]);
  } catch (e) {
    // exception case
    //   (1) 事件前日
    //   (2) illegal case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }

  // update
  try {
    var update_summary_flag_data_now = JSON.stringify(value[village_number]);
    if (recvLog_proc.update_summary_flag_data != update_summary_flag_data_now) {
      updateSummary(value[village_number]); // deduce-summary
      recvLog_proc.update_summary_flag_data = update_summary_flag_data_now;
    }
  } catch (e) {
    // exception case
    console.log(e.name + ':' + e.message);
    console.log(e.stack);
  }

  // save to memory area
  recvLog_proc.stored_value = JSON.parse(JSON.stringify(value)); // deep copy
  recvLog_proc.stored_raw_log = JSON.parse(JSON.stringify(raw_log)); // deep copy

  // save raw_log to Web Storaget API
  if (
    Object.keys(recvLog_proc.stored_raw_log).length > 8 ||
    Object.keys(recvLog_proc.stored_value).length > 8
  ) {
    // preserve log : newest 8 villages by Village ID
    var minimum_key = null;
    Object.keys(recvLog_proc.stored_raw_log).forEach(function (v) {
      if (minimum_key == null || parseInt(v) < parseInt(minimum_key)) {
        minimum_key = v;
      }
    });
    Object.keys(recvLog_proc.stored_value).forEach(function (v) {
      if (minimum_key == null || parseInt(v) < parseInt(minimum_key)) {
        minimum_key = v;
      }
    });
    if (minimum_key != village_number) {
      delete recvLog_proc.stored_raw_log[minimum_key];
      delete recvLog_proc.stored_value[minimum_key];
      delete stored_raw_log_prev[minimum_key];
      delete stored_value_prev[minimum_key];
    }
  }
  // save raw_log to Web Storaget API
  try {
    if (
      JSON.stringify(recvLog_proc.stored_raw_log).length >
      JSON.stringify(stored_raw_log_prev).length
    ) {
      window.localStorage.setItem(
        'wakamete_village_raw_log',
        encodeURIComponent(JSON.stringify(recvLog_proc.stored_raw_log))
      );
    }
  } catch (e) {
    console.log(
      'raw_log save error : ' + e.name + ' : ' + e.message + ' : ' + e.stack
    );
    // nop : ignore disk write error
  }
  // save value to Web Storaget API
  try {
    if (
      JSON.stringify(recvLog_proc.stored_value) !==
      JSON.stringify(stored_value_prev)
    ) {
      window.localStorage.setItem(
        'wakamete_village_info',
        encodeURIComponent(JSON.stringify(recvLog_proc.stored_value))
      );
    }
  } catch (e) {
    console.log(
      'value save error : ' + e.name + ' : ' + e.message + ' : ' + e.stack
    );
    // nop : ignore disk write error
  }

  recvLog_proc.lock = false;
  return;
}

// ref. https://developer.mozilla.org/ja/docs/Web/API/EventTarget/addEventListener
export function event_click_deduce(arg) {
  var value = JSON.parse(
    decodeURIComponent(window.localStorage.getItem('wakamete_village_info'))
  )[village_number];
  if (arg != null) {
    var o = arg.srcElement;
    if (o.tagName.toLowerCase() == 'a') {
      var id = o.getAttribute('id');

      if (id.indexOf('log') != -1) {
        //// create comment-summary
        updateCommentLog(value, id);

        //// show comment-summary
        // <a id="date-log-2" href="#">2日目</a>
        // <a id="all-day-log-依田芳乃 " href="#">依田芳乃 </a>
        document
          .getElementById('vote-summary')
          .setAttribute('class', 'popup-standby');
        document
          .getElementById('comment-summary')
          .setAttribute('class', 'popup-active');
        document
          .getElementById('deduce-summary')
          .setAttribute('class', 'popup-standby');
        document.getElementById('summary-field').scrollTop = 0;
        document.getElementById('summary-field').scrollLeft = 0;
      } else if (id.indexOf('vote') != -1) {
        //// create vote-summary
        updateVotes(value);

        //// show vote-summary
        // <a id="vote" href="#">投票結果</a>
        document
          .getElementById('vote-summary')
          .setAttribute('class', 'popup-active');
        document
          .getElementById('comment-summary')
          .setAttribute('class', 'popup-standby');
        document
          .getElementById('deduce-summary')
          .setAttribute('class', 'popup-standby');
        document.getElementById('summary-field').scrollTop = 0;
        document.getElementById('summary-field').scrollLeft = 0;
      } else if (id.indexOf('summary') != -1) {
        //// show deduce-summary
        document
          .getElementById('vote-summary')
          .setAttribute('class', 'popup-standby');
        document
          .getElementById('comment-summary')
          .setAttribute('class', 'popup-standby');
        document
          .getElementById('deduce-summary')
          .setAttribute('class', 'popup-active');
        document.getElementById('summary-field').scrollTop = 0;
        document.getElementById('summary-field').scrollLeft = 0;
      } // else nop
    } // else nop
  }
  return;
}
export function event_click_td_alt(arg) {
  if (arg != null) {
    var o = arg.srcElement;
    while (
      o.tagName.toLowerCase() != 'td' &&
      o.tagName.toLowerCase() != 'div'
    ) {
      o = o.parentElement;
    }
    if (o.tagName.toLowerCase() == 'td') {
      // <tr><td alt="Copy-message-to-freememo">....</td></tr>
      if (o.getAttribute('alt') != null) {
        var v = document.getElementById('freememo').value;
        v = v + '\n' + o.getAttribute('alt');
        document.getElementById('freememo').value = v;
      }
    }
  }
  return;
}
export function event_click_comments(arg) {
  if (arg != null) {
    var o = arg.srcElement;
    while (
      o.tagName.toLowerCase() != 'tr' &&
      o.tagName.toLowerCase() != 'div'
    ) {
      o = o.parentElement;
    }
    if (o.tagName.toLowerCase() == 'tr' && o.childElementCount == 3) {
      // copy original_character_and_comment if outerHTML is <tr><td>layouted_charecter</td><td>layouted_comment</td><td style="display:none">original_character_and_comment</td></tr>
      var v = document.getElementById('freememo').value;
      v = v + '\n' + o.childNodes[2].textContent;
      document.getElementById('freememo').value = v;
    }
  }
  return;
}
export function checkbox_change() {
  document.getElementById('deduce').scrollTop = 0;
  document.getElementById('deduce').scrollLeft = 0;
}

import {
  template_seer,
  template_medium,
  template_bodyguard,
  template_freemason,
} from './template.js';
export function output_memo_template(arg) {
  var value = JSON.parse(
    decodeURIComponent(window.localStorage.getItem('wakamete_village_info'))
  )[village_number];
  var id = arg.srcElement.getAttribute('id');
  var v = document.getElementById('freememo').value;
  if (id.indexOf('template-seer') != -1) {
    document.getElementById('freememo').value = v + '\n' + template_seer(value);
  } else if (id.indexOf('template-medium') != -1) {
    document.getElementById('freememo').value =
      v + '\n' + template_medium(value);
  } else if (id.indexOf('template-bodyguard') != -1) {
    document.getElementById('freememo').value =
      v + '\n' + template_bodyguard(value);
  } else if (id.indexOf('template-freemason') != -1) {
    document.getElementById('freememo').value =
      v + '\n' + template_freemason(value);
  }
}
