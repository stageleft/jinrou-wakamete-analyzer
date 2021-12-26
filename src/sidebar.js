// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog(request, sender, sendResponse) {
  var time_start = performance.now();
  var ret = recvLog_proc(request, sender, sendResponse);
  var time_end   = performance.now();
  if (time_end - time_start > 300) {
    console.log("Process delayed. " + (time_end - time_start) + "[ms] is over 300[ms] as data send interval.");
  }
  return ret;
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
