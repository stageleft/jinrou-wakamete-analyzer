// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function recvLog(request, sender, sendResponse) {
  return recvLog_proc(request, sender, sendResponse);
};

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
browser.runtime.onMessage.addListener(recvLog);
