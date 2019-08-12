// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog(request, sender, sendResponse) {
// input  : JSON
//          style : { html_log: village_log_html, text_log: village_log_text, txtc_log: village_log_txtC }
//          see onLogLoad() in wakamete-plugins.js
// output : JSON (fixed value)
//          {response: "OK"}

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

  // save to Web Storaget API
  window.localStorage.setItem("wakamete_village_info", encodeURIComponent(JSON.stringify(value)));

  sendResponse({response: "OK"});
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
