// Debug : save-count raw log to Web Storage API
var debugSetItemCount = 0;

// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog(request, sender, sendResponse) {
  // request style : { html_log: village_log_html, text_log: village_log_text, txtc_log: village_log_txtC }
  //  see onLogLoad() in wakamete-plugins.js

  // Load from Web Storaget API
  var value = JSON.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")));

  // debug
  document.getElementById("logs").textContent        = request.html_log;
  document.getElementById("information").textContent = request.text_log;
  document.getElementById("analysis").textContent    = request.txtc_log;

  // ToDo: emurate Wakamete-memo

  // save to Web Storaget API
  window.localStorage.setItem("wakamete_village_info", encodeURIComponent(JSON.stringify(value)));

  // Debug : save raw log to Web Storaget API
  window.localStorage.setItem("wakamete_village_debug_log"+String(debugSetItemCount), encodeURIComponent(request.html_log));
  debugSetItemCount = debugSetItemCount + 1;

  sendResponse({response: "OK"});
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
