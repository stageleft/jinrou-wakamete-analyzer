'use strict';

import { createDateArray } from './libs.js';

export function template_initial(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  let ret = [];

  // 役職＆人外推理記入欄出力
  if (arg.input.seer_count > 0) {
    ret.push('【占い師 (' + arg.input.seer_count + ')】');
  }
  if (arg.input.medium_count > 0) {
    ret.push('【霊能者 (' + arg.input.medium_count + ')】');
  }
  if (arg.input.freemason_count > 0) {
    ret.push('【共有者 (' + arg.input.freemason_count + ')】');
  }
  if (arg.input.werecat_count > 0) {
    ret.push('【猫　又 (' + arg.input.werecat_count + ')】');
  }
  if (arg.input.bodyguard_count > 0) {
    ret.push('【狩　人 (' + arg.input.bodyguard_count + ')】');
  }
  if (arg.input.werewolf_count > 0) {
    ret.push('【人　狼 (' + arg.input.werewolf_count + ')】');
  }
  if (arg.input.posessed_count > 0) {
    ret.push('【狂　人 (' + arg.input.posessed_count + ')】');
  }
  if (arg.input.werefox_count > 0) {
    ret.push('【妖　狐 (' + arg.input.werefox_count + ')】');
  }
  if (arg.input.minifox_count > 0) {
    ret.push('【子　狐 (' + arg.input.minifox_count + ')】');
  }

  // 本日（最新日）の日付取得
  let datearray = createDateArray(arg)[0];
  let today = datearray[datearray.length - 1];

  // 参加者一覧出力
  let player_list = Object.keys(arg.log[today].players);
  player_list.forEach(function (k) {
    if (k !== '初日犠牲者') {
      ret.push(k);
    }
  });
  return ret.join('\n');
}
export function template_seer(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  let ret = [];

  // 本日（最新日）の日付
  let datearray = createDateArray(arg)[0];
  let today = datearray[datearray.length - 1];

  let player_list = Object.keys(arg.log[today].players);
  player_list.forEach(function (k) {
    if (arg.log[today].players[k].stat == '（生存中）') {
      ret.push('占いCO ' + k + ' ○●');
    }
  });
  return ret.join('\n');
}
export function template_medium(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  let ret = [];

  // 日付情報
  let datearray = createDateArray(arg)[0];

  datearray.forEach(function (d) {
    arg.log[d].list_voted.forEach(function (k) {
      ret.push(d.replace(/^(.*日目).*となりました。/, '$1') + '：' + k + ' ○●△■');
    });
  });
  ret.push('霊能CO');
  return ret.reverse().join('\n');
}
export function template_bodyguard(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  let ret = [];

  // 日付情報
  let datearray = createDateArray(arg)[0];

  datearray.forEach(function (d) {
    arg.log[d].list_bitten.forEach(function (k) {
      ret.push(d.replace(/^(.*日目).*となりました。/, '$1') + ' 護衛： 噛み：' + k);
    });
  });
  ret.push('狩人CO');
  return ret.reverse().join('\n');
}
export function template_freemason(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  let ret = [];

  // 本日（最新日）の日付
  let datearray = createDateArray(arg)[0];
  let today = datearray[datearray.length - 1];
  let player_list = Object.keys(arg.log[today].players);

  player_list.forEach(function (k) {
    if (arg.log[today].players[k].stat == '（生存中）') {
      if (arg.input.each_player[k].comingout == '村人') {
        ret.push('指定：' + k + ' COありますか？');
      } else if (arg.input.each_player[k].comingout == '占い') {
        ret.push('指定：' + k + ' LWCO|妖狐COありますか？');
        ret.push('占い指示：' + k + 'は  占いでお願いします。予告は不要|投票|口頭でお願いします。');
      } else if (arg.input.each_player[k].comingout == '霊能') {
        ret.push('指定：' + k + ' LWCO|妖狐COありますか？');
      } else if (arg.input.each_player[k].comingout == '狩人') {
        ret.push('指定：' + k + ' LWCO|妖狐COありますか？');
        ret.push('護衛指示：' + k + 'は  護衛でお願いします。');
      } else if (arg.input.each_player[k].comingout == '猫又') {
        ret.push('指定：' + k + ' LWCO|妖狐COありますか？');
      }
    }
  });
  ret.push('占い指示：潜伏占いは  占いでお願いします。予告は不要|投票|口頭でお願いします。');
  ret.push('護衛指示：潜伏狩人は  護衛でお願いします。');
  return ret.join('\n');
}
