// value
const URL_TOP_literal = /^http:\/\/.*\/~jinrou\/(|index.html)$/g;

// setTextAreaAlertColor
function setTextAreaAlertColor(text){
  var is_logBroken = false;
  text.value.split(/\n/).forEach(function(l){
    if (l.length > 40) {
      is_logBroken = true;
    }
  });
  if ( is_logBroken == true ) {
    text.setAttribute("style", "background-color:pink");
  } else {
    text.removeAttribute("style");
  }
}
try {
  var log_document;
  if (document.URL.match(URL_TOP_literal)) {
    log_document = top[1].document;
  } else {
    log_document = top.document;
  }
  if (log_document.getElementsByName('TXTMSG').length == 1) {
    log_document.getElementsByName('TXTMSG')[0].oninput = function() {
      setTextAreaAlertColor(log_document.getElementsByName('TXTMSG')[0]);
    }  
  }
} catch(e) {
  console.log(e.name + ':' + e.message);
  console.log(e.stack);
};

// onLogLoad
function handleResponse(message){
  // nop.
}
function handleError(error){
  // nop.
}
function onLogLoad(event) {
  var log_document;
  if (document.URL.match(URL_TOP_literal)) {
    log_document = top[1].document;
  } else {
    log_document = top.document;
  }
  var target = log_document.getElementsByTagName("form").item(0);

  var village_log_html = JSON.parse(JSON.stringify(target.innerHTML));
  var village_msg = { html_log: village_log_html};
  var send_object = browser.runtime.sendMessage(village_msg);
  send_object.then(handleResponse, handleError);
}

// onRefreshView
function onRefreshView(event) {
  try {
    var log_document;
    if (document.URL.match(URL_TOP_literal)) {
      log_document = top[1].document;
    } else {
      log_document = top.document;
    }
    var command = log_document.getElementsByName('COMMAND')[0];
    var target  = log_document.getElementsByName('CMBPLAYER')[0];
    var text    = log_document.getElementsByName('TXTMSG')[0];
    var form    = log_document.querySelector('form');

    if (text.value.length >= 1) {
      console.log ('Ignore refresh. TXTMSG has any messsage.');
    } else if ((command.value != 'MSG') &&     // 発　言（昼）
               (command.value != 'MSG0') &&    // 霊　話（昼＆夜）
               (command.value != 'MSGFRE') &&  // 会　話（夜）
               (command.value != 'MSGWLF') &&  // 遠吠え（夜）
               (command.value != 'MSGFOX') &&  // 念　話（夜）
               (command.value != 'MUMBLE')) {  // 独り言（夜）
      console.log ('Ignore refresh. Any COMMAND is selected.');
    } else if (target.value != ''){
      console.log ('Ignore refresh. Any CMBPLAYER is selected.');
    } else {
      // console.log ('Try Refresh.');
      // form.action="cgi_jinro.cgi";
      // form.method="POST";
      text.setAttribute("disabled", "disabled");
      form.submit();
    }
  } catch (e) {
    console.log ('Ignore refresh. No COMMAND,CMBPLAYER,TXTMSG is defined.');
    // ignore e.
  }
}
var log_document;
if (document.URL.match(URL_TOP_literal)) {
  log_document = top[1].document;
} else {
  log_document = top.document;
}
log_document.onscroll = function(){
  var log_window;
  if (window.location.href.match(URL_TOP_literal)) {
    log.console(top.window)
    log_window = top[1].window;
  } else {
    log_window = top.window;
  }
  try {
    var text = log_document.getElementsByName('TXTMSG')[0];
    if (text.getBoundingClientRect()['y'] < 0) {
      log_window.localStorage.setItem("page_ypos",
                                  JSON.stringify({from:"end",
                                                  pos:String(log_window.innerHeight + log_window.scrollMaxY - log_window.pageYOffset)}));
    } else {
      log_window.localStorage.setItem("page_ypos",
                                  JSON.stringify({from:"start",
                                                  pos:String(log_window.pageYOffset)}));
    }
  } catch (e) {
    localStorage.removeItem("page_ypos");
    console.log ('Ignore scroll_pos saving. No TXTMSG is defined.');
    // ignore e.
  }
};
try {
  var log_window;
  if (window.location.href.match(URL_TOP_literal)) {
    log_window = top[1].window;
  } else {
    log_window = top.window;
  }
  var y = JSON.parse(log_window.localStorage.getItem("page_ypos"));
  var f = (y != null) ? y.from : "";
  var s = (y != null) ? y.pos  : "";
  if (f == "end") {
    log_window.scrollTo(0, log_window.innerHeight + log_window.scrollMaxY - s);
  } else if (f == "start") {
    log_window.scrollTo(0, s);
  } else {
    log_window.scrollTo(0, 0);
  }
} catch(e) {
  console.log(e.name + ':' + e.message);
  console.log(e.stack);
};
setTimeout(onRefreshView, 10000);

setInterval(onLogLoad, 300);
