/* eslint-disable no-irregular-whitespace */
'use strict';

// value
const URL_TOP_literal = /^http:\/\/.*\/~jinrou\/(|index.html)$/g;
var log_document;
var log_window;
var command;
var target;
var submit;
var text;
var form;
try {
  if (document.URL.match(URL_TOP_literal)) {
    log_document = top[1].document;
  } else {
    log_document = top.document;
  }
  if (window.location.href.match(URL_TOP_literal)) {
    log_window = top[1].window;
  } else {
    log_window = top.window;
  }
  command = log_document.getElementsByName('COMMAND')[0];
  target = log_document.getElementsByName('CMBPLAYER')[0];
  submit = null;
  target.parentNode.childNodes.forEach((x) => {
    if (x.value == '行動/更新') {
      submit = x;
    }
  });
  if (log_document.getElementsByName('TXTMSG').length == 1) {
    text = log_document.getElementsByName('TXTMSG')[0];
  } else {
    text = null;
  }
  form = log_document.querySelector('form');
} catch (e) {
  console.log(e.name + ':' + e.message);
  console.log(e.stack);
}

// setTextAreaAlertColor
function setTextAreaAlertColor(text) {
  let is_logBroken = false;
  text.value.split(/\n/).forEach(function (l) {
    if (l.length > 40) {
      is_logBroken = true;
    }
  });
  if (is_logBroken == true) {
    text.setAttribute('style', 'background-color:pink');
  } else {
    text.removeAttribute('style');
  }
}
if (text != null) {
  text.oninput = function () {
    setTextAreaAlertColor(text);
  };
}

// target.onChanged
function onTargetChanged() {
  if (command.value == 'MSG' && target.value != '') {
    submit.setAttribute('disabled', 'disabled');
    submit.setAttribute('style', 'color:#ff0000');
    console.log('onTargetChanged. disable submit.');
  } else {
    submit.removeAttribute('disabled');
    submit.removeAttribute('style');
    console.log('onTargetChanged. enable submit.');
  }
}
if (command != null) {
  command.onchange = onTargetChanged;
}
if (target != null) {
  target.onchange = onTargetChanged;
}

// onLogLoad
function handleResponse() {
  // nop.
}
function handleError() {
  // nop.
}
function onLogLoad() {
  let target = log_document.getElementsByTagName('form').item(0);

  let village_log_html = JSON.parse(JSON.stringify(target.innerHTML));
  let village_msg = { html_log: village_log_html };
  let send_object = browser.runtime.sendMessage(village_msg);
  send_object.then(handleResponse, handleError);
}

// onRefreshView
function onRefreshView() {
  try {
    if (text.value.length >= 1) {
      console.log('Ignore refresh. TXTMSG has any messsage.');
    } else if (
      command.value != 'MSG' && // 発　言（昼）
      command.value != 'MSG0' && // 霊　話（昼＆夜）
      command.value != 'MSGFRE' && // 会　話（夜）
      command.value != 'MSGWLF' && // 遠吠え（夜）
      command.value != 'MSGFOX' && // 念　話（夜）
      command.value != 'MUMBLE'
    ) {
      // 独り言（夜）
      console.log('Ignore refresh. Any COMMAND is selected.');
    } else if (target.value != '') {
      console.log('Ignore refresh. Any CMBPLAYER is selected.');
    } else {
      // console.log ('Try Refresh.');
      // form.action="cgi_jinro.cgi";
      // form.method="POST";
      text.setAttribute('disabled', 'disabled');
      form.submit();
    }
  } catch (e) {
    console.log('Ignore refresh. No COMMAND,CMBPLAYER,TXTMSG is defined.');
    // ignore e.
  }
}
log_document.onscroll = function () {
  try {
    if (text.getBoundingClientRect()['y'] < 0) {
      log_window.localStorage.setItem(
        'page_ypos',
        JSON.stringify({
          from: 'end',
          pos: String(log_window.innerHeight + log_window.scrollMaxY - log_window.pageYOffset),
        }),
      );
    } else {
      log_window.localStorage.setItem('page_ypos', JSON.stringify({ from: 'start', pos: String(log_window.pageYOffset) }));
    }
  } catch (e) {
    localStorage.removeItem('page_ypos');
    console.log('Ignore scroll_pos saving. No TXTMSG is defined.');
    // ignore e.
  }
};
try {
  let y = JSON.parse(log_window.localStorage.getItem('page_ypos'));
  let f = y != null ? y.from : '';
  let s = y != null ? y.pos : '';
  if (f == 'end') {
    log_window.scrollTo(0, log_window.innerHeight + log_window.scrollMaxY - s);
  } else if (f == 'start') {
    log_window.scrollTo(0, s);
  } else {
    log_window.scrollTo(0, 0);
  }
} catch (e) {
  console.log(e.name + ':' + e.message);
  console.log(e.stack);
}

setTimeout(onRefreshView, 10000);

setInterval(onLogLoad, 300);
