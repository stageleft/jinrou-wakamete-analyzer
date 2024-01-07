'use strict';

import { createDateArray, setColorClass } from './libs.js';

function proc_set_vote_date(vote_title, table_head) {
  // set 2nd..Nth td (vote to-person)
  var tr = table_head.querySelector('#vote-day');
  var td = document.createElement('td');
  td.innerText = vote_title;
  tr.insertAdjacentElement('beforeend', td);
  return tr;
}

// 票数計算
function proc_vote_count(list) {
  var ret = {}; // { "to-person":getting-vote-count, "to":count, ..., "to":count, "is_gray_random":true/false, "voted_count_max":count}
  list.vote.forEach(function (f) {
    var to_person = f.to_villager.trim();
    if (ret[to_person] == null) {
      ret[to_person] = 1;
    } else {
      ret[to_person] = ret[to_person] + 1;
    }
  });
  // グレラン情報の抽出
  // 手順１（前提）最多得票者の得票数を数える。
  ret['voted_count_max'] = 0;
  Object.keys(ret).forEach(function (f) {
    if (ret['voted_count_max'] <= ret[f]) {
      ret['voted_count_max'] = ret[f];
    }
  });
  // 手順２（前提）グレランか否かを擬似的に判断する。
  // 最多得票者が「総得票数の半分未満」であることをもって、機械的にグレランと決めつける。
  if (ret['voted_count_max'] < list.vote.length / 2) {
    ret['is_gray_random'] = true;
  } else {
    ret['is_gray_random'] = false;
  }
  return ret;
}

// 表示用セル作成
function proc_set_vote_result(playerlist, f, vote_count, p, table_body) {
  var from_person = f.from_villager.trim();
  var to_person = f.to_villager.trim();
  var tr = table_body.querySelector(
    '#vote-from-' + from_person.replace(/([ -/:-@[-`{-~])/g, '\\$1')
  );

  // <td><b>ｽｺﾞｲｶﾀｲｱｲｽ</b>さん</td><td>0 票</td><td>投票先 → <b>結城蜜柑</b>さん</td>
  // ｽｺﾞｲｶﾀｲｱｲｽさん	0 票	投票先 → 結城蜜柑さん
  var td = document.createElement('td');
  if (vote_count[from_person] == null) {
    vote_count[from_person] = 0;
  }

  td.setAttribute(
    'alt',
    from_person +
      'さん\t' +
      vote_count[from_person] +
      ' 票\t投票先 → ' +
      to_person +
      'さん'
  );
  td.innerText =
    '(' +
    vote_count[from_person] +
    '票)→' +
    f.to_villager +
    '(' +
    vote_count[to_person] +
    '票)';
  td.className = setColorClass(playerlist[from_person]);
  if (vote_count.is_gray_random == true) {
    var is_gray_person = false;
    // グレランの場合に、セルに色をつける
    if (
      td.className === '' &&
      vote_count[to_person] == vote_count['voted_count_max'] &&
      vote_count[from_person] == 0
    ) {
      // 役職CO者以外、かつ、吊られ者に投票した人、かつ、得票0票者
      td.className = 'gray_random_voted_killer_with_no_voted';
      is_gray_person = true;
    } else if (
      td.className === '' &&
      vote_count[to_person] == vote_count['voted_count_max']
    ) {
      // 役職CO者以外、かつ、吊られ者に投票した人
      td.className = 'gray_random_voted_killer';
      is_gray_person = true;
    } else if (td.className === '' && vote_count[from_person] == 0) {
      // 役職CO者以外、かつ、得票0票者
      td.className = 'gray_random_no_voted';
      is_gray_person = true;
    } else {
      // その他
      if (td.className == '') {
        is_gray_person = true;
      }
      td.className = td.className + ' gray_random';
    }
    // ２回連続グレラン、かつ、非役職の場合、票変えを検出する。（※本アプリの条件では、投票が決まらないケースは必ずグレラン扱い）
    if (p != null && is_gray_person == true) {
      if (
        from_person == p.from_villager.trim() &&
        to_person != p.to_villager.trim()
      ) {
        td.className = td.className + ' gray_random_change_vote_target';
      }
    }
  }
  tr.insertAdjacentElement('beforeend', td);
  return tr;
}

export function updateVotes(arg) {
  // Another output : HTML for <div id="vote-summary" /> tag
  //    <thead>
  //     <tr id="vote-day"      ><td>----</td><td>...</td><td                       >dayX(1)</td><td>...</td></tr>
  //    </thead>
  //    <tbody>
  //     <tr                    ><td>....</td><td>...</td><td alt="dayX(1):....->..">.......</td><td>...</td></tr>
  //     <tr id="vote-from-from"><td>from</td><td>...</td><td alt="dayX(1):from->to">  to   </td><td>...</td></tr>
  //     <tr                    ><td>....</td><td>...</td><td alt="dayX(1):....->..">.......</td><td>...</td></tr>
  //    </tbody>
  var voted_title_list = [];
  var head = document.createElement('thead');
  var body = document.createElement('tbody');

  var datearray;
  var base_date; // unused
  [datearray, base_date] = createDateArray(arg);
  for (var i = 0; i < datearray.length; i++) {
    var datestr = datearray[i];
    if (
      arg.log[datestr] == null ||
      arg.log[datestr].vote_log == null ||
      arg.log[datestr].vote_log.length == 0
    ) {
      continue;
    }

    // set tr and 1st td (vote from-person)
    if (head.querySelector('tr') == null) {
      var tr = document.createElement('tr');
      tr.setAttribute('id', 'vote-day');

      var td = document.createElement('td');
      tr.insertAdjacentElement('beforeend', td);

      head.insertAdjacentElement('beforeend', tr);
    }
    if (body.querySelector('tr') == null) {
      Object.keys(arg.log[base_date].players).forEach(function (f) {
        if (f == '初日犠牲者') return;

        var tr = document.createElement('tr');
        tr.setAttribute('id', 'vote-from-' + f);

        var td = document.createElement('td');
        td.innerText = f;
        td.className = setColorClass(arg.input.each_player[f]);
        tr.insertAdjacentElement('beforeend', td);

        body.insertAdjacentElement('beforeend', tr);
      });
    }

    arg.log[datestr].vote_log.forEach(function (l, j) {
      var vote_title =
        arg.log[datestr].vote_log[j].title + '（' + String(j + 1) + '回目）';
      if (voted_title_list.includes(vote_title) == true) {
        return; // contiune arg.log[datestr].vote_log.forEach()
      }
      voted_title_list.push(vote_title);

      head.insertAdjacentElement(
        'beforeend',
        proc_set_vote_date(vote_title, head)
      );
      var vote_count = proc_vote_count(l);
      l.vote.forEach(function (f, k) {
        if (j == 0) {
          body.insertAdjacentElement(
            'beforeend',
            proc_set_vote_result(
              arg.input.each_player,
              f,
              vote_count,
              null,
              body
            )
          );
        } else {
          var p = arg.log[datestr].vote_log[j - 1].vote[k]; // f of previous vote
          body.insertAdjacentElement(
            'beforeend',
            proc_set_vote_result(arg.input.each_player, f, vote_count, p, body)
          );
        }
      });
    });
  }

  var table = document.createElement('table');
  table.insertAdjacentElement('beforeend', head);
  table.insertAdjacentElement('beforeend', body);
  document.getElementById('vote-summary').textContent = '';
  document
    .getElementById('vote-summary')
    .insertAdjacentElement('afterbegin', table);
  return;
}
