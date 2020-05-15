try {
  document.getElementsByName('TXTMSG')[0].oninput = function(){
    var text = document.getElementsByName('TXTMSG')[0];
    var is_logBroken = false;
    text.value.split(/\n/).forEach(function(l){
      if (l.length > 40) {
        is_logBroken = true;
      }
    });
    if( is_logBroken == true ){
      text.setAttribute("style", "background-color:pink");
    } else {
      text.removeAttribute("style");
    }
  };
} catch(e) {
  console.log(e.name + ':' + e.message);
  console.log(e.stack);
};

function handleResponse(message){
  // nop.
}
function handleError(error){
  // nop.
}
function onLogLoad(event) {
  var target = document.getElementsByTagName("form").item(0);

  var village_log_html = JSON.parse(JSON.stringify(target.innerHTML));
  var village_msg = { html_log: village_log_html};
  var send_object = browser.runtime.sendMessage(village_msg);
  send_object.then(handleResponse, handleError);
}

function onRefreshView(event) {
  try {
    var command = document.getElementsByName('COMMAND')[0];
    var target  = document.getElementsByName('CMBPLAYER')[0];
    var text    = document.getElementsByName('TXTMSG')[0];
    var form    = document.querySelector('form');

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
document.onscroll = function(){
  try {
    var text = document.getElementsByName('TXTMSG')[0];
    if (text.getBoundingClientRect()['y'] < 0) {
      window.localStorage.setItem("page_ypos",
                                  JSON.stringify({from:"end",
                                                  pos:String(window.innerHeight + window.scrollMaxY - window.pageYOffset)}));
    } else {
      window.localStorage.setItem("page_ypos",
                                  JSON.stringify({from:"start",
                                                  pos:String(window.pageYOffset)}));
    }
  } catch (e) {
    localStorage.removeItem("page_ypos");
    console.log ('Ignore scroll_pos saving. No TXTMSG is defined.');
    // ignore e.
  }
};
try {
  var y = JSON.parse(window.localStorage.getItem("page_ypos"));
  var f = y.from;
  var s = y.pos;
  if (f == "end") {
    window.scrollTo(0, window.innerHeight + window.scrollMaxY - s);
  } else if (f == "start") {
    window.scrollTo(0, s);
  } else {
    window.scrollTo(0, 0);
  }
} catch(e) {
  console.log(e.name + ':' + e.message);
  console.log(e.stack);
};
setTimeout(onRefreshView, 10000);

setInterval(onLogLoad, 1000);
