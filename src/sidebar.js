// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
const recv_cycle = 300
var skip_count = 0

function recvLog(request, sender, sendResponse) {
  var ret;

  var time_start = performance.now();
  if (skip_count <= 0) {
    ret = recvLog_proc(request);
  } else {
    console.log("Log update skipped, current skip_count=" + skip_count + ". ");
    skip_count = skip_count - 1;
    ret = undefined;
  }
  var time_end   = performance.now();

  var time_elapsed = time_end - time_start;
  if (time_elapsed > recv_cycle) {
    skip_count = parseInt((time_elapsed + 1) / recv_cycle);
    console.log("Process delayed, set skip_count=" + skip_count + ". " + time_elapsed + "[ms] is over data receive cycle " + recv_cycle + "[ms].");
  }

  sendResponse({response: "OK"});
  return ret;
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
