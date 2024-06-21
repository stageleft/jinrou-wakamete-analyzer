/* eslint-disable no-irregular-whitespace */
'use strict';

import { createDateArray, logTag_d2n, setColorClass, slice_string_by_visualLength } from './libs.js';

export function updateCommentLog(arg, param) {
  // functional input  : JSON from Web Storage API
  // functional output : -
  // Another output    : innerHtml of <div id="comment-summary" />
  let ret = document.createElement('tbody');

  function createLogTableSepalator(title) {
    let tr_daytitle = document.createElement('tr');

    let td_daytitle = document.createElement('td');
    td_daytitle.setAttribute('colspan', '3');

    let td_daytitlespan1 = document.createElement('span');
    let td_daytitleb = document.createElement('b');
    let td_daytitlespan2 = document.createElement('span');

    td_daytitlespan1.innerText = '◆◆◆◆◆';
    td_daytitleb.innerText = title;
    td_daytitlespan2.innerText = '◆◆◆◆◆';

    td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan1);
    td_daytitle.insertAdjacentElement('beforeend', td_daytitleb);
    td_daytitle.insertAdjacentElement('beforeend', td_daytitlespan2);

    tr_daytitle.insertAdjacentElement('beforeend', td_daytitle);

    return tr_daytitle;
  }

  function createLogTableRow(l) {
    // 以下のログの形式（コピペ後）を再現できるように。
    // <tr><td valign="top" width="160"><font color="#ff9999">◆</font><b>五十嵐響子</b>さん</td><td>「えへへっ　PCS！いぇーい♪」</td></tr>
    let p = new DOMParser();
    let tr = document.createElement('tr');

    let td1 = document.createElement('td');
    td1.innerText = l.speaker.trim();
    td1.className = setColorClass(arg.input.each_player[l.speaker.trim()]);
    tr.insertAdjacentElement('beforeend', td1);

    let td2 = document.createElement('td');
    td2.textContent = p.parseFromString('<html><body><span>' + l.comment.join('\n') + '</span></body></html>', 'text/html').body.textContent;
    if (l.type == 'Strong') {
      td2.setAttribute('style', 'font-size: large;');
    } else if (l.type == 'WithColor') {
      td2.setAttribute('style', 'color: #6666ee;');
    }
    tr.insertAdjacentElement('beforeend', td2);

    let td3 = document.createElement('td');
    td3.setAttribute('style', 'display:none;visibility:hidden;width:0px;');
    td3.textContent = p.parseFromString('◆' + l.speaker.trim() + 'さん' + '\t' + '「' + l.comment.join('\n') + '」</td></body></html>', 'text/html').body.textContent;
    tr.insertAdjacentElement('beforeend', td3);

    return tr;
  }

  // 本日（最新日）の日付
  let datearray = createDateArray(arg)[0];
  let date_count = datearray.length;
  let datestr;
  let datestr_night;

  if (param.indexOf('date-log-') == 0) {
    // create day log by date
    datestr = datearray[Number(param.replace('date-log-', '')) - 1];
    if (arg.log[datestr] != null) {
      ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr));
      arg.log[datestr].comments.forEach(function (l) {
        ret.insertAdjacentElement('beforeend', createLogTableRow(l));
      });
    }
    // create previous night log by date (if day2..N)
    datestr_night = logTag_d2n(datestr);
    if (datestr_night != datestr && arg.log[datestr_night] != null) {
      ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr_night));
      arg.log[datestr_night].comments.forEach(function (l) {
        ret.insertAdjacentElement('beforeend', createLogTableRow(l));
      });
    }
  } else {
    let villager_str = param.replace('all-day-log-', '');
    // create log by villager
    for (let i = date_count; i >= 1; i--) {
      datestr = datearray[i - 1];
      // create day log by date
      if (arg.log[datestr] != null) {
        ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr));
        arg.log[datestr].comments.forEach(function (l) {
          if (l.speaker.trim() == villager_str) {
            ret.insertAdjacentElement('beforeend', createLogTableRow(l));
          }
        });
      }
      // create previous night log by date (if day2..N)
      datestr_night = logTag_d2n(datestr);
      if (datestr_night != datestr && arg.log[datestr_night] != null) {
        ret.insertAdjacentElement('beforeend', createLogTableSepalator(datestr_night));
        arg.log[datestr_night].comments.forEach(function (l) {
          if (l.speaker.trim() == villager_str) {
            ret.insertAdjacentElement('beforeend', createLogTableRow(l));
          }
        });
      }
    }
  }

  let table = document.createElement('table');
  table.insertAdjacentElement('beforeend', ret);
  document.getElementById('comment-summary').textContent = '';
  document.getElementById('comment-summary').insertAdjacentElement('afterbegin', table);

  let table_row_max_size = parseInt(document.getElementById('link').offsetWidth);
  let table_name_cell_size = 0;
  try {
    ret.childNodes.forEach((tr) => {
      if (tr.childNodes.length != 1) {
        table_name_cell_size = tr.childNodes[0].offsetWidth;
        throw 'got table_name_cell_size.';
      }
    });
  } catch (e) {
    if (e != 'got table_name_cell_size.') {
      throw e;
    }
  }
  let table_talk_cell_size = table_row_max_size - table_name_cell_size - 25; // size of scroll bar = 17
  ret.childNodes.forEach((tr) => {
    if (tr.childNodes.length != 1) {
      let talk_cell = tr.childNodes[1];
      let text = talk_cell.innerHTML.split('\n');
      talk_cell.innerHTML = '';
      let fixed_text = [];
      text.forEach((t) => {
        fixed_text = fixed_text.concat(slice_string_by_visualLength(t, table_talk_cell_size, talk_cell.style.fontSize != ''));
      });
      let p = new DOMParser();
      fixed_text.forEach((t) => {
        if (talk_cell.innerHTML.length > 0) {
          let br = document.createElement('br');
          talk_cell.appendChild(br);
        }
        let span = document.createElement('span');
        span.textContent = p.parseFromString('<html><body><span>' + t + '</span></body></html>', 'text/html').body.textContent;
        talk_cell.appendChild(span);
      });
    }
  });

  return;
}
