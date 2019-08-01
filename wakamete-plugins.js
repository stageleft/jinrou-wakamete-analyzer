// ref. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage
function handleResponse(message){
  // nop.
}
function handleError(error){
  // nop.
}

function onLogLoad(event) {
  var village_log_txtC = JSON.parse(JSON.stringify(event.originalTarget.textContent));
  var village_log_text = JSON.parse(JSON.stringify(event.originalTarget.innerText));
  var village_log_html = JSON.parse(JSON.stringify(event.originalTarget.innerHTML));
  var village_msg = { html_log: village_log_html, text_log: village_log_text, txtc_log: village_log_txtC};
  var send_object = browser.runtime.sendMessage(village_msg);
  send_object.then(handleResponse, handleError);
}

// 性能チューニング：コールバック関数を追加はコードの最後の方で。
// 余計な addEventListener() コールを最小化したい。
// window.addEventListener("load", onLogLoad, false);
window.addEventListener("submit", onLogLoad, false);
