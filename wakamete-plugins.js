function handleResponse(message){
  // nop.
}
function handleError(error){
  // nop.
}

function onLogLoad(event) {
  var target = document.getElementsByTagName("form").item(0);

  var village_log_txtC = JSON.parse(JSON.stringify(target.textContent));
  var village_log_text = JSON.parse(JSON.stringify(target.innerText));
  var village_log_html = JSON.parse(JSON.stringify(target.innerHTML));
  var village_msg = { html_log: village_log_html, text_log: village_log_text, txtc_log: village_log_txtC};
  var send_object = browser.runtime.sendMessage(village_msg);
  send_object.then(handleResponse, handleError);
}

setInterval(onLogLoad, 1000);
