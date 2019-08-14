var debug_set_counter = 0;

// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog(request, sender, sendResponse) {

  window.localStorage.setItem("wakamete_village_debug_log-"+String(debug_set_counter),
                              encodeURIComponent(JSON.stringify(value)));
  debug_set_counter = debug_set_counter + 1;

  return recvLog_proc(request, sender, sendResponse);
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
