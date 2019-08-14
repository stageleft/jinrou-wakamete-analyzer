var debug_get_counter = 0;
var debug_get_counter_incr = 1;

// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog(request, sender, sendResponse) {

  var tmp = window.localStorage.getItem("wakamete_village_debug_log-"+String(debug_get_counter));
  if (tmp == null) {
    debug_get_counter = debug_get_counter - debug_get_counter_incr;
    sendResponse({response: "OK"});
    return;
  }
  request = JSON.parse(decodeURIComponent(tmp));
  debug_get_counter = debug_get_counter + debug_get_counter_incr;

  return recvLog_proc(request, sender, sendResponse);
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
