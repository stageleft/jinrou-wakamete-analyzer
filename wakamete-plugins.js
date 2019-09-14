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

function onRefreshView(event) {
  console.log ('Ignore refresh.');
  var command = document.getElementsByName('COMMAND')[0];
  var target  = document.getElementsByName('CMBPLAYER')[0];
  var text    = document.getElementsByName('TXTMSG')[0];
  var form    = document.querySelector('form');

  if (text.value.length >= 1) {
    // console.log ('Ignore refresh. TXTMSG has any messsage.');
  } else if ((command.value != 'MSG') &&     // 発　言（昼）
             (command.value != 'MSGFRE') &&  // 会　話（夜）
             (command.value != 'MSGWLF') &&  // 遠吠え（夜）
             (command.value != 'MSGFOX') &&  // 念　話（夜）
             (command.value != 'MUMBLE')) {  // 独り言（夜）
    // console.log ('Ignore refresh. Any COMMAND is selected.');
  } else if (target.value != ''){
    // console.log ('Ignore refresh. Any CMBPLAYER is selected.');
  } else {
    // console.log ('Try Refresh.');
    // form.action="cgi_jinro.cgi";
    // form.method="POST";
    form.submit();
  }
}
setTimeout(onRefreshView, 10000);

setInterval(onLogLoad, 1000);
