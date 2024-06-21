'use strict';

export function createDateArray(arg) {
  // usage : [datearray, base_date] = createDateArray(arg);
  //         datearray.length : dates
  //         datearray[0]  : date-string of day1
  //         datearray[N-1]: date-string of dayN
  // input  : JSON from Web Storage API
  // output : [Array ["date-string(day1)", "date-string(day2)", ..., "date-string(current day)"], "date-string(night1)"]
  let ret = [];
  let base_date;

  // preprocess : check arg has log.
  if (arg.log == null) {
    return ret;
  }

  let date_count = 0;
  Object.keys(arg.log).forEach(function (d) {
    if (d.match('朝となりました。$')) {
      date_count = date_count + 1;
    }
  });
  // day 1
  if (arg.log['１日目の朝となりました。'] != null) {
    ret.push('１日目の朝となりました。');
  }
  // day 2
  if (arg.log['2日目の朝となりました。'] != null) {
    ret.push('2日目の朝となりました。');
  } else if (arg.log['１日目の夜となりました。'] != null) {
    ret.push('１日目の夜となりました。');
  }
  // day 3..N
  for (let i = 2; i < date_count + 1; i++) {
    if (arg.log[String(i + 1) + '日目の朝となりました。'] != null) {
      ret.push(String(i + 1) + '日目の朝となりました。');
    } else if (arg.log[String(i) + '日目の夜となりました。'] != null) {
      ret.push(String(i) + '日目の夜となりました。');
    } else {
      // nop : String(i+1) + "日目の相当ログはありません。"
    }
  }
  // afterplay
  if (ret.length == 0) {
    if (arg.log['「村　人」の勝利です！'] != null) {
      ret.push('「村　人」の勝利です！');
    } else if (arg.log['「人　狼」の勝利です！'] != null) {
      ret.push('「人　狼」の勝利です！');
    } else if (arg.log['「妖　狐」の勝利です！'] != null) {
      ret.push('「妖　狐」の勝利です！');
    } else if (arg.log['「猫　又」の勝利です！'] != null) {
      ret.push('「猫　又」の勝利です！');
    } else if (arg.log['「引き分け」です！'] != null) {
      ret.push('「引き分け」です！');
    }
  }
  // 過去ログ日数制限
  let date_limit = document.getElementById('datelimit_passed_log').value;
  if (date_limit != 0 && date_count > date_limit) {
    date_count = date_limit;
    while (ret.length > date_count) {
      ret.pop();
    }
  }

  // calc base_date
  if (arg.log['１日目の夜となりました。'] != null) {
    base_date = '１日目の夜となりました。';
  } else {
    base_date = ret[0];
  }

  return [ret, base_date];
}

export function logTag_d2n(key_day) {
  // input  : String "n日目の朝となりました。"(n>=2) or other
  // output : String "(n-1)日目の夜となりました。" or input
  let d = parseInt(key_day);

  // day 2..N -> night 1..(N-1)
  if (d >= 2) {
    if (key_day == '2日目の朝となりました。') {
      return '１日目の夜となりました。';
    } else if (key_day.match('朝となりました。$')) {
      return String(d - 1) + '日目の夜となりました。';
    }
  }

  // other than day 2..N
  return key_day;
}

export function setColorClass(player_info) {
  // input  : JSON Object : arg.input.each_player['target player']
  // output : String : CSS Class name. see sidebar.css
  if (player_info === undefined || player_info === null) {
    return;
  }
  // 人外被推理者の名前に色をつける
  if (player_info.enemymark == '人外') {
    return 'enemy';
  }
  if (player_info.enemymark == '人狼') {
    return 'werewolf';
  }
  if (player_info.enemymark == '狂人') {
    return 'posessed';
  }
  if (player_info.enemymark == '妖狐') {
    return 'werefox';
  }
  if (player_info.enemymark == '子狐') {
    return 'minifox';
  }
  // 役職CO者の名前に色をつける
  if (player_info.comingout == '占い') {
    return 'seer';
  }
  if (player_info.comingout == '霊能') {
    return 'medium';
  }
  if (player_info.comingout == '狩人') {
    return 'bodyguard';
  }
  if (player_info.comingout == '共有') {
    return 'freemason';
  }
  if (player_info.comingout == '猫又') {
    return 'werecat';
  }
  return '';
}

export function makeComingOutList(arg) {
  // input  : JSON from Web Storage API
  // output : Object {
  //             seer_co:{
  //                 "character-name": { ... },
  //                 "character-name": { ... },
  //                 ...
  //               },
  //             medium_co:     { ... },
  //             bodyguard_co:  { ... },
  //             freemason_co:  { ... },
  //             werecat_co:    { ... },
  //             werewolf_mark: { ... },
  //             posessed_mark: { ... },
  //             werefox_mark:  { ... },
  //             minifox_mark:  { ... },
  //             enemy_mark:    { ... },
  //             villager_live: { ... },
  //             villager_co:   { ... },
  //          },
  // 村全体の情報 -> arg.input.<job>_count
  let ret = {};
  ret.seer_co = {};
  ret.medium_co = {};
  ret.bodyguard_co = {};
  ret.freemason_co = {};
  ret.werecat_co = {};
  ret.werewolf_mark = {};
  ret.posessed_mark = {};
  ret.werefox_mark = {};
  ret.minifox_mark = {};
  ret.enemy_mark = {};
  ret.villager_live = {};
  ret.villager_co = {};

  // preprocess : check arg has input.
  if (arg.log == null) {
    return ret;
  }
  if (arg.input == null) {
    return ret;
  }
  if (arg.input.each_player == null) {
    return ret;
  }

  let datearray = createDateArray(arg)[0];
  let datestr = datearray[datearray.length - 1];

  Object.keys(arg.input.each_player).forEach(function (k) {
    let stat = arg.log[datestr].players[k].stat;
    let mrk = arg.input.each_player[k].enemymark;
    let job = arg.input.each_player[k].comingout;

    if (stat == '（生存中）') {
      ret.villager_live[k] = arg.input.each_player[k];
    }

    if (mrk == '人狼') {
      ret.werewolf_mark[k] = arg.input.each_player[k];
    } else if (mrk == '狂人') {
      ret.posessed_mark[k] = arg.input.each_player[k];
    } else if (mrk == '妖狐') {
      ret.werefox_mark[k] = arg.input.each_player[k];
    } else if (mrk == '子狐') {
      ret.minifox_mark[k] = arg.input.each_player[k];
    } else if (mrk == '人外') {
      ret.enemy_mark[k] = arg.input.each_player[k];
    } else if (job == '占い') {
      ret.seer_co[k] = arg.input.each_player[k];
    } else if (job == '霊能') {
      ret.medium_co[k] = arg.input.each_player[k];
    } else if (job == '狩人') {
      ret.bodyguard_co[k] = arg.input.each_player[k];
    } else if (job == '共有') {
      ret.freemason_co[k] = arg.input.each_player[k];
    } else if (job == '猫又') {
      ret.werecat_co[k] = arg.input.each_player[k];
    } else if (stat == '（生存中）') {
      // (mrk == "村人") && (job == "村人")
      ret.villager_co[k] = arg.input.each_player[k];
    }
  });

  return ret;
}

export function makeGrayVillagerList(arg) {
  // input  : JSON from Web Storage API
  // output : Object {
  //             villager_gray:{
  //                 "character-name": { ... },
  //                 "character-name": { ... },
  //                 ...
  //               },
  //             villager_white: { ... },
  //             villager_panda: { ... },
  //             villager_black: { ... },
  //             // merge makeComingOutList() results below.
  //             seer_co:       { ... },
  //             medium_co:     { ... },
  //             bodyguard_co:  { ... },
  //             freemason_co:  { ... },
  //             werecat_co:    { ... },
  //             werewolf_mark: { ... },
  //             posessed_mark: { ... },
  //             werefox_mark:  { ... },
  //             minifox_mark:  { ... },
  //             enemy_mark:    { ... },
  //             villager_live: { ... },
  //             villager_co:   { ... },
  //          },
  let ret = makeComingOutList(arg);
  ret.villager_gray = {};
  ret.villager_white = {};
  ret.villager_panda = {};
  ret.villager_black = {};
  Object.assign(ret.villager_gray, ret.villager_co);

  // preprocess : check arg has input.
  if (arg.log == null) {
    return ret;
  }
  if (arg.input == null) {
    return ret;
  }

  let datearray = createDateArray(arg)[0];

  Object.keys(ret.seer_co).forEach(function (k) {
    datearray.forEach(function (d) {
      if (arg.input.each_player[k][d] == null) {
        return;
      }

      let target = arg.input.each_player[k][d].target;
      let result = arg.input.each_player[k][d].result;

      if (result == '○') {
        if (Object.keys(ret.villager_gray).indexOf(target) != -1) {
          delete ret.villager_gray[target];
          ret.villager_white[target] = arg.input.each_player[k];
        } else if (Object.keys(ret.villager_black).indexOf(target) != -1) {
          delete ret.villager_black[target];
          ret.villager_panda[target] = arg.input.each_player[k];
        }
      } else if (result == '●') {
        if (Object.keys(ret.villager_gray).indexOf(target) != -1) {
          delete ret.villager_gray[target];
          ret.villager_black[target] = arg.input.each_player[k];
        } else if (Object.keys(ret.villager_white).indexOf(target) != -1) {
          delete ret.villager_white[target];
          ret.villager_panda[target] = arg.input.each_player[k];
        }
      } else {
        // if (result == "")
        // nop
      }
    });
  });

  return ret;
}

export function get_visualLength(str, isLarge) {
  let p = new DOMParser();
  let ret;
  if (isLarge == false) {
    // case if Normal font
    let normal_talk_cell_ruler = document.getElementById('normal-ruler');
    normal_talk_cell_ruler.textContent = p.parseFromString('<html><body><td>' + str + '</td></body></html>', 'text/html').body.textContent;
    ret = normal_talk_cell_ruler.offsetWidth;
    normal_talk_cell_ruler.textContent = '';
  } else {
    // case if Large font
    let large_talk_cell_ruler = document.getElementById('large-ruler');
    large_talk_cell_ruler.textContent = p.parseFromString('<html><body><td>' + str + '</td></body></html>', 'text/html').body.textContent;
    ret = large_talk_cell_ruler.offsetWidth;
    large_talk_cell_ruler.textContent = '';
  }
  return ret;
}

export function slice_string_by_visualLength(str, max_cell_size, isLarge) {
  let ret = [];
  // calcurate offsetWidth of each t
  let t_visualLengthOld = 0;
  let t_visualLength;
  let old_i = 0;
  let prev_i = 0;
  for (let i = 0; i < str.length; i++) {
    // skip tag from '<' to '>'
    if (str[i] == '<') {
      i = str.indexOf('>', i);
      if (i == -1) {
        throw new Error('slice_string_by_visualLength : string has tag open < but not have tag close >. string=' + str);
      } else if (i < old_i || str.length < i) {
        throw new Error('slice_string_by_visualLength : str.indexOf() has some error. string=' + str + ' i=' + i.toString() + ' old_i=' + old_i.toString() + ' str.lentgh=' + str.length.toString());
      }
      continue;
    }
    // check length and split line if length is over
    t_visualLength = get_visualLength(str.slice(old_i, i), isLarge);
    if (t_visualLength > t_visualLengthOld && t_visualLength >= max_cell_size) {
      ret.push(str.slice(old_i, prev_i));
      old_i = prev_i;
      t_visualLengthOld = 0;
    } else {
      t_visualLengthOld = t_visualLength;
    }
    prev_i = i;
  }
  if (old_i < i || i == 0) {
    ret.push(str.slice(old_i));
  }
  return ret;
}
