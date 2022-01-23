function updateCommentLog(arg, param) {
// functional input  : JSON from Web Storage API
// functional output : -
// Another output    : innerHtml of <div id="comment-summary" />
  var ret = document.createElement('tbody');

  function createLogTableSepalator(title) {
    var tr_daytitle = document.createElement('tr');

    var td_daytitle = document.createElement('td');
    td_daytitle.setAttribute('colspan', '3');

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
    var p = new DOMParser();
    var tr = document.createElement('tr');

    var td1 = document.createElement('td');
    td1.innerText = l.speaker.trim();
    td1.className = setColorClass(arg.input.each_player[l.speaker.trim()]);
    tr.insertAdjacentElement('beforeend', td1);

    var td2 = document.createElement('td');
    td2.textContent = p.parseFromString('<html><body><span>' + l.comment.join('\n') + '</span></body></html>', 'text/html').body.textContent;
    if (l.type == 'Strong'){
      td2.setAttribute('style', 'font-size: large;');
    } else if (l.type == 'WithColor'){
      td2.setAttribute('style', 'color: #6666ee;');
    }
    tr.insertAdjacentElement('beforeend', td2);

    var td3 = document.createElement('td');
    td3.setAttribute('style', 'display:none;visibility:hidden;width:0px;');
    td3.textContent = p.parseFromString('◆' + l.speaker.trim() + 'さん' + "\t" + '「'  + l.comment.join('\n') + '」</td></body></html>', 'text/html').body.textContent;
    tr.insertAdjacentElement('beforeend', td3);

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
  var table_name_cell_size = 0;
  try {
    ret.childNodes.forEach(tr => {
      if (tr.childNodes.length != 1) {
        table_name_cell_size = tr.childNodes[0].offsetWidth;
        throw "got table_name_cell_size.";
      }
    });  
  } catch (e) {
    if (e != "got table_name_cell_size.") {
      throw e;
    }
  }
  var table_talk_cell_size = table_row_max_size - table_name_cell_size - 25; // size of scroll bar = 17
  ret.childNodes.forEach(tr => {
    if (tr.childNodes.length != 1) {
      var talk_cell = tr.childNodes[1];
      var text = talk_cell.innerHTML.split("\n");
      talk_cell.innerHTML = "";
      var fixed_text = [];
      text.forEach(t => {
        fixed_text = fixed_text.concat(slice_string_by_visualLength(t, table_talk_cell_size, talk_cell.style.fontSize != ""));
      });
      var p = new DOMParser();
      fixed_text.forEach(t => {
        if(talk_cell.innerHTML.length > 0) {
          var br = document.createElement('br');
          talk_cell.appendChild(br);  
        }
        var span = document.createElement('span');
        span.textContent = p.parseFromString('<html><body><span>' + t + '</span></body></html>', 'text/html').body.textContent;
        talk_cell.appendChild(span);
      });
    }
  });
  
  return;
};
