// usage : [datearray, base_date] = createDateArray(arg);
//         datearray.length : dates
//         datearray[0]  : date-string of day1
//         datearray[N-1]: date-string of dayN
function createDateArray(arg) {
// input  : JSON from Web Storage API
// output : [Array ["date-string(day1)", "date-string(day2)", ..., "date-string(current day)"], "date-string(night1)"]
  var ret = [];
  var base_date;

  // preprocess : check arg has log.
  if (arg.log == null) { return ret; }

  var date_count = 0;
  Object.keys(arg.log).forEach(function(d){
    if (d.match("朝となりました。$")) {
      date_count = date_count + 1;
    }
  });
  // day 1
  if (arg.log["１日目の朝となりました。"] != null) {
    ret.push("１日目の朝となりました。");
  }
  // day 2
  if (arg.log["2日目の朝となりました。"] != null) {
    ret.push("2日目の朝となりました。");
  } else if (arg.log["１日目の夜となりました。"] != null) {
    ret.push("１日目の夜となりました。");
  }
  // day 3..N
  for (var i = 2 ; i < (date_count + 1) ; i++ ) {
    if (arg.log[String(i+1) + "日目の朝となりました。"] != null) {
      ret.push(String(i+1) + "日目の朝となりました。");
    } else if (arg.log[String(i) + "日目の夜となりました。"] != null) {
      ret.push(String(i) + "日目の夜となりました。");
    } else {
      // nop : String(i+1) + "日目の相当ログはありません。"
    }
  }
  // afterplay
  if (ret.length == 0) {
    if (arg.log["「村　人」の勝利です！"] != null) {
      ret.push("「村　人」の勝利です！");
    } else if (arg.log["「人　狼」の勝利です！"] != null) {
      ret.push("「人　狼」の勝利です！");
    } else if (arg.log["「妖　狐」の勝利です！"] != null) {
      ret.push("「妖　狐」の勝利です！");
    } else if (arg.log["「猫　又」の勝利です！"] != null) {
      ret.push("「猫　又」の勝利です！");
    } else if (arg.log["「引き分け」です！"] != null) {
      ret.push("「引き分け」です！");
    }
  }
  // 過去ログ日数制限
  var date_limit = document.getElementById('datelimit_passed_log').value;
  if ((date_limit != 0) && (date_count > date_limit)) {
    date_count = date_limit;
    while(ret.length > date_count) {
      ret.pop();
    }
  }

  // calc base_date
  if (arg.log["１日目の夜となりました。"] != null) {
    base_date = "１日目の夜となりました。";
  } else {
    base_date = ret[0];
  }

  return [ret, base_date];
}

function logTag_d2n(key_day) {
// input  : String "n日目の朝となりました。"(n>=2) or other
// output : String "(n-1)日目の夜となりました。" or input
  var d = parseInt(key_day);

  // day 2..N -> night 1..(N-1)
  if (d >= 2) {
    if (key_day == "2日目の朝となりました。") {
      return ("１日目の夜となりました。");
    } else if (key_day.match("朝となりました。$")) {
      return (String(d-1) + "日目の夜となりました。");
    }
  }

  // other than day 2..N
  return key_day;
}

function setColorClass(player_info){
// input  : JSON Object : arg.input.each_player['target player']
// output : String : CSS Class name. see sidebar.css
  if (player_info === undefined || player_info === null) {
    return;
  }
  // 人外被推理者の名前に色をつける
  if (player_info.enemymark == "人外") {
    return 'enemy';
  }
  if (player_info.enemymark == "人狼") {
    return 'werewolf';
  }
  if (player_info.enemymark == "狂人") {
    return 'posessed';
  }
  if (player_info.enemymark == "妖狐") {
    return 'werefox';
  }
  if (player_info.enemymark == "子狐") {
    return 'minifox';
  }
  // 役職CO者の名前に色をつける
  if (player_info.comingout == "占い") {
    return 'seer';
  }
  if (player_info.comingout == "霊能") {
    return 'medium';
  }
  if (player_info.comingout == "狩人") {
    return 'bodyguard';
  }
  if (player_info.comingout == "共有") {
    return 'freemason';
  }
  if (player_info.comingout == "猫又") {
    return 'werecat';
  }
  return '';
}

function makeComingOutList(arg) {
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
  var ret = {};
  ret.seer_co       = {};
  ret.medium_co     = {};
  ret.bodyguard_co  = {};
  ret.freemason_co  = {};
  ret.werecat_co    = {};
  ret.werewolf_mark = {};
  ret.posessed_mark = {};
  ret.werefox_mark  = {};
  ret.minifox_mark  = {};
  ret.enemy_mark    = {};
  ret.villager_live = {};
  ret.villager_co   = {};

  // preprocess : check arg has input.
  if (arg.log               == null) { return ret; };
  if (arg.input             == null) { return ret; };
  if (arg.input.each_player == null) { return ret; };

  var datearray;
  var base_date;
  [datearray, base_date] = createDateArray(arg);
  var datestr   = datearray[datearray.length - 1];

  Object.keys(arg.input.each_player).forEach(function(k){
    var stat = arg.log[datestr].players[k].stat;
    var mrk  = arg.input.each_player[k].enemymark;
    var job  = arg.input.each_player[k].comingout;

    if (stat == "（生存中）") {
     ret.villager_live[k] = arg.input.each_player[k];
    }

    if        (mrk == "人狼") {
      ret.werewolf_mark[k] = arg.input.each_player[k];
    } else if (mrk == "狂人") {
      ret.posessed_mark[k] = arg.input.each_player[k];
    } else if (mrk == "妖狐") {
      ret.werefox_mark[k]  = arg.input.each_player[k];
    } else if (mrk == "子狐") {
      ret.minifox_mark[k]  = arg.input.each_player[k];
    } else if (mrk == "人外") {
      ret.enemy_mark[k]    = arg.input.each_player[k];
    } else if (job == "占い") {
      ret.seer_co[k]       = arg.input.each_player[k];
    } else if (job == "霊能") {
      ret.medium_co[k]     = arg.input.each_player[k];
    } else if (job == "狩人") {
      ret.bodyguard_co[k]  = arg.input.each_player[k];
    } else if (job == "共有") {
      ret.freemason_co[k]  = arg.input.each_player[k];
    } else if (job == "猫又") {
      ret.werecat_co[k]    = arg.input.each_player[k];
    } else if (stat == "（生存中）") { // (mrk == "村人") && (job == "村人")
        ret.villager_co[k] = arg.input.each_player[k];
    }
  });

  return ret;
}

function makeGrayVillagerList(arg) {
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
  var ret = makeComingOutList(arg);
  ret.villager_gray  = {};
  ret.villager_white = {};
  ret.villager_panda = {};
  ret.villager_black = {};
  Object.assign(ret.villager_gray, ret.villager_co);

  // preprocess : check arg has input.
  if (arg.log   == null) { return ret; };
  if (arg.input == null) { return ret; };

  var datearray;
  var base_date;
  [datearray, base_date] = createDateArray(arg);
  var datestr   = datearray[datearray.length - 1];

  Object.keys(ret.seer_co).forEach(function(k){
    datearray.forEach(function(d){
      if (arg.input.each_player[k][d] == null) {
        return;
      }

      var target = arg.input.each_player[k][d].target;
      var result = arg.input.each_player[k][d].result;

      if (result == "○") {
        if (Object.keys(ret.villager_gray).indexOf(target) != -1) {
          delete ret.villager_gray[target];
          ret.villager_white[target] = arg.input.each_player[k];
        } else if (Object.keys(ret.villager_black).indexOf(target) != -1) {
          delete ret.villager_black[target];
          ret.villager_panda[target] = arg.input.each_player[k];
        }
      } else if (result == "●") {
        if (Object.keys(ret.villager_gray).indexOf(target) != -1) {
          delete ret.villager_gray[target];
          ret.villager_black[target] = arg.input.each_player[k];
        } else if (Object.keys(ret.villager_white).indexOf(target) != -1) {
          delete ret.villager_white[target];
          ret.villager_panda[target] = arg.input.each_player[k];
        }
      } else { // if (result == "")
        // nop
      }
    });
  });

  return ret;
}

function updateInput(arg) {
// functional input  : JSON from Web Storage API
// Another input     : inner table of <div id="deduce" />
// functional output : JSON
//     'input' key of Web Storage API style
  var ret = {};

  var datearray;
  var base_date;
  [datearray, base_date] = createDateArray(arg);
  if (arg.log[base_date] == null) {
    return;
  }

  // 村全体の情報
  ret.player_count     = Object.keys(arg.log[base_date].players).length;
  ret.seer_count       = Number(document.getElementById('seer').value);
  ret.medium_count     = Number(document.getElementById('medium').value);
  ret.bodyguard_count  = Number(document.getElementById('bodyguard').value);
  ret.freemason_count  = Number(document.getElementById('freemason').value);
  ret.werecat_count    = Number(document.getElementById('werecat').value);
  ret.werewolf_count   = Number(document.getElementById('werewolf').value);
  ret.posessed_count   = Number(document.getElementById('posessed').value);
  ret.werefox_count    = Number(document.getElementById('werefox').value);
  ret.minifox_count    = Number(document.getElementById('minifox').value);
  ret.villager_count   = ret.player_count - ( ret.seer_count + 
                                              ret.medium_count + 
                                              ret.bodyguard_count + 
                                              ret.freemason_count + 
                                              ret.werecat_count + 
                                              ret.werewolf_count + 
                                              ret.posessed_count + 
                                              ret.werefox_count + 
                                              ret.minifox_count);

  ret.each_player = {};
  Object.keys(arg.log[base_date].players).forEach(function(k){
    // 参加者別の情報
    var job = document.getElementById('job-' + k); // deduced Job
    var mrk = document.getElementById('mrk-' + k); // Monster Mark
    if ((job == null) || (mrk == null)) {
      return null;
    }
    ret.each_player[k] = {};
    ret.each_player[k].comingout = job.value;
    ret.each_player[k].enemymark = mrk.value;
    // 参加者別×日別の情報
    for (var i = 2; i <= datearray.length; i++) {
      var datestr = String(i) + "日目の朝となりました。"
      ret.each_player[k][datestr] = {};
      var target_obj = document.getElementById('stat-' + k + '-' + String(i) + '-target')
      ret.each_player[k][datestr].target      = (target_obj == null) ? null : target_obj.value;
      var result_obj = document.getElementById('stat-' + k + '-' + String(i) + '-result')
      ret.each_player[k][datestr].result      = (result_obj == null) ? null : result_obj.value;;
    }
  });

  return ret;
};

function get_visualLength(str, isLarge) {
  var p = new DOMParser();
  var ret;
  if (isLarge == false){
    // case if Normal font
    var normal_talk_cell_ruler = document.getElementById("normal-ruler");
    normal_talk_cell_ruler.textContent = p.parseFromString('<html><body><td>' + str + '</td></body></html>', 'text/html').body.textContent;
    ret = normal_talk_cell_ruler.offsetWidth;
    normal_talk_cell_ruler.textContent = "";
  } else {
    // case if Large font
    var large_talk_cell_ruler = document.getElementById("large-ruler");
    large_talk_cell_ruler.textContent = p.parseFromString('<html><body><td>' + str + '</td></body></html>', 'text/html').body.textContent;
    ret = large_talk_cell_ruler.offsetWidth;
    large_talk_cell_ruler.textContent = "";
  }
  return ret;
}
function slice_string_by_visualLength(str, max_cell_size, isLarge) {
  var ret = [];
  // calcurate offsetWidth of each t
  var t_visualLengthOld = 0;
  var t_visualLength;
  var old_i = 0;
  for (var i = 0; i < str.length; i++) {
    t_visualLength = get_visualLength(str.slice(old_i, i), isLarge);
    if ((t_visualLength > t_visualLengthOld) && (t_visualLength >= max_cell_size)) {
      ret.push(str.slice(old_i, i - 1));
      old_i = i - 1;
      t_visualLengthOld = 0;
    } else {
      t_visualLengthOld = t_visualLength;
    }
  }
  if ((old_i < i) || (i == 0)) {
    ret.push(str.slice(old_i));
  }
  return ret;
}