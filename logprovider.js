function updateCommentLog(arg, param) {
// functional input  : JSON from Web Storage API
// functional output : -
// Another output    : innerHtml of <div id="comment-summary" />
  var ret = document.createElement('tbody');

  function createLogTableRow(l) {
    // 以下のログの形式（コピペ後）を再現できるように。
    // <tr><td valign="top" width="160"><font color="#ff9999">◆</font><b>五十嵐響子</b>さん</td><td>「えへへっ　PCS！いぇーい♪」</td></tr>
    var tr = document.createElement('tr');

    var td1 = document.createElement('td');
    var td1span1 = document.createElement('span');
    var td1b     = document.createElement('b');
    var td1span2 = document.createElement('span');

    td1span1.innerText = '◆'
    td1b.innerText     = l.speaker
    td1span2.innerText = 'さん'

    td1.insertAdjacentElement('beforeend', td1span1);
    td1.insertAdjacentElement('beforeend', td1b);
    td1.insertAdjacentElement('beforeend', td1span2);
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
    // create log by date
    var datestr = datearray[Number(param.replace('date-log-','')) - 1];

    var tr_daytitle = document.createElement('tr');

    var td_daytitle = document.createElement('td');
    td_daytitle.setAttribute('colspan', '2');

    var td_daytitlespan1 = document.createElement('span');
    var td_daytitleb     = document.createElement('b');
    var td_daytitlespan2 = document.createElement('span');

    td_daytitlespan1.innerText = '◆◆◆◆◆'
    td_daytitleb.innerText     = datestr
    td_daytitlespan2.innerText = '◆◆◆◆◆'

    td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan1);
    td_daytitle.insertAdjacentElement('beforeend', td_daytitleb);
    td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan2);

    tr_daytitle.insertAdjacentElement('beforeend', td_daytitle);

    ret.insertAdjacentElement('beforeend', tr_daytitle);

    arg.log[datestr].comments.forEach(function(l){
      ret.insertAdjacentElement('beforeend', createLogTableRow(l));
    });
  } else {
    var villager_str = param.replace('all-day-log-','');
    // create log by villager
    for (var i = date_count ; i >= 1 ; i-- ) {
      var tr_daytitle = document.createElement('tr');

      var td_daytitle = document.createElement('td');
      td_daytitle.setAttribute('colspan', '2');

      var td_daytitlespan1 = document.createElement('span');
      var td_daytitleb     = document.createElement('b');
      var td_daytitlespan2 = document.createElement('span');

      td_daytitlespan1.innerText = '◆◆◆◆◆'
      td_daytitleb.innerText     = datearray[i-1]
      td_daytitlespan2.innerText = '◆◆◆◆◆'

      td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan1);
      td_daytitle.insertAdjacentElement('beforeend', td_daytitleb);
      td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan2);

      tr_daytitle.insertAdjacentElement('beforeend', td_daytitle);

      ret.insertAdjacentElement('beforeend', tr_daytitle);

      arg.log[datearray[i-1]].comments.forEach(function(l){
        if ( l.speaker.trim() == villager_str) {
          ret.insertAdjacentElement('beforeend', createLogTableRow(l));
        }
      });
    }
  }

  var table = document.createElement('table');
  table.insertAdjacentElement('beforeend', ret)
  document.getElementById('comment-summary').textContent = '';
  document.getElementById('comment-summary').insertAdjacentElement('afterbegin', table);
  return;
};
