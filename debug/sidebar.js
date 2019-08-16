var is_debug_log_gettable = true;
var debug_counter = 0;

var debug_mutex_lock = false;


// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog(request, sender, sendResponse) {

  if (debug_mutex_lock == true) {
    return recvLog_proc(request, sender, sendResponse);
  } else {
    debug_mutex_lock = true;
  };


  if (debug_counter == 0) {
    var tmp = window.localStorage.getItem("wakamete_village_debug_log-0");
    if (tmp == null) {
      is_debug_log_gettable = false;
    }
  }

  if (is_debug_log_gettable == true) {
    // with log : log get mode
    var tmp = window.localStorage.getItem("wakamete_village_debug_log-"+String(debug_counter));
    if (tmp == null) {
      debug_counter = debug_counter - 1;
      sendResponse({response: "OK"});
      return;
    }
    request = JSON.parse(decodeURIComponent(tmp));
  } else {
    // no log : log set mode
    window.localStorage.setItem("wakamete_village_debug_log-"+String(debug_counter),
                                encodeURIComponent(JSON.stringify(request)));
  }
  debug_counter = debug_counter + 1;

  debug_mutex_lock = false;

  return recvLog_proc(request, sender, sendResponse);
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
