function updateCommentLog(arg, param) {
// functional input  : JSON from Web Storage API
// functional output : -
// Another output    : innerHtml of <div id="comment-summary" />
  var ret = document.createElement('tbody');

  function createLogTableSepalator(title) {
    var tr_daytitle = document.createElement('tr');

    var td_daytitle = document.createElement('td');
    td_daytitle.setAttribute('colspan', '2');

    var td_daytitlespan1 = document.createElement('span');
    var td_daytitleb     = document.createElement('b');
    var td_daytitlespan2 = document.createElement('span');

    td_daytitlespan1.innerText = '◆◆◆◆◆'
    td_daytitleb.innerText     = title
    td_daytitlespan2.innerText = '◆◆◆◆◆'

    td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan1);
    td_daytitle.insertAdjacentElement('beforeend', td_daytitleb);
    td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan2);

    tr_daytitle.insertAdjacentElement('beforeend', td_daytitle);

    return tr_daytitle;
  }

  function createLogTableRow(l) {
    // 以下のログの形式（コピペ後）を再現できるように。
    // <tr><td valign="top" width="160"><font color="#ff9999">◆</font><b>五十嵐響子</b>さん</td><td>「えへへっ　PCS！いぇーい♪」</td></tr>
    var tr = document.createElement('tr');

    var td1 = document.createElement('td');
    td1.innerText     = '◆' + l.speaker + 'さん'
    tr.insertAdjacentElement('beforeend', td1);

    var td2 = document.createElement('td');
    td2.innerText = '「' + l.comment.join('\n') + '」'
    if (l.type == 'Strong'){
      td2.setAttribute('style', 'font-size: large;');
    } else if (l.type == 'WithColor'){
      td2.setAttribute('style', 'color: #6666ee;');
    }
    tr.insertAdjacentElement('beforeend', td2);

    return tr;
  }

  // 本日（最新日）の日付
  var datearray;
  var base_date; // unused
  [datearray, base_date] = createDateArray(arg);
  var date_count = datearray.length;

  if (param.indexOf('date-log-') == 0) {
    // create day log by date
    var datestr = datearray[Number(param.replace('date-log-','')) - 1];
    if (arg.log[datestr] != null) {
      ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr));
      arg.log[datestr].comments.forEach(function(l){
        ret.insertAdjacentElement('beforeend', createLogTableRow(l));
      });
    }
    // create previous night log by date (if day2..N)
    var datestr_night = logTag_d2n(datestr);
    if ((datestr_night != datestr) && (arg.log[datestr_night] != null)) {
      ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr_night));
      arg.log[datestr_night].comments.forEach(function(l){
        ret.insertAdjacentElement('beforeend', createLogTableRow(l));
      });
    }
  } else {
    var villager_str = param.replace('all-day-log-','');
    // create log by villager
    for (var i = date_count ; i >= 1 ; i-- ) {
      var datestr = datearray[i-1];
      // create day log by date
      if (arg.log[datestr] != null) {
        ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr));
        arg.log[datestr].comments.forEach(function(l){
          if (l.speaker.trim() == villager_str) {
            ret.insertAdjacentElement('beforeend', createLogTableRow(l));
          }
        });
      }
      // create previous night log by date (if day2..N)
      var datestr_night = logTag_d2n(datestr);
      if ((datestr_night != datestr) && (arg.log[datestr_night] != null)) {
        ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr_night));
        arg.log[datestr_night].comments.forEach(function(l){
          if (l.speaker.trim() == villager_str) {
            ret.insertAdjacentElement('beforeend', createLogTableRow(l));
          }
        });
      }
    }
  }

  var table = document.createElement('table');
  table.insertAdjacentElement('beforeend', ret);
  document.getElementById('comment-summary').textContent = '';
  document.getElementById('comment-summary').insertAdjacentElement('afterbegin', table);

  var table_row_max_size = parseInt(document.getElementById("link").offsetWidth);
  var td_textlen_limit = table_row_max_size;
  var name_length_max = 0;
  ret.childNodes.forEach(tr => {
    if (tr.childNodes.length == 2) {
      var name = tr.childNodes[0].textContent;
      if (name.length == 0){
        return; // continue;
      } else if (name_length_max > name.length) {
        return; // continue;
      } else {
        name_length_max = name.length;
      }
      var name_hankaku_count = name.split(/[\x20-\x7e]/).length - 1;
      var name_width = tr.childNodes[0].offsetWidth;
      var char_width = parseInt(name_width / (name.length - (name_hankaku_count / 2))) + 1;
      td_textlen_limit = parseInt((table_row_max_size - name_width) / char_width);
    }
  });
  var text_splitter = new RegExp('.{1,' + td_textlen_limit + '}', 'g');
  ret.childNodes.forEach(tr => {
    if (tr.childNodes.length == 2) {
      var text = tr.childNodes[1].innerHTML.split("<br>");
      var fixed_text = [];
      text.forEach(t => {
        if (t.length == 0) {
          fixed_text.push("");
          return; // continue;
        }
        var splitted_t = t.match(text_splitter);
        fixed_text.push(splitted_t.join("<br>"));
      });
      tr.childNodes[1].innerHTML = fixed_text.join("<br>");
    }
  });
  
  return;
};
