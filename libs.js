// usage : [datearray, base_date] = createDateArray(arg);
//         datearray.length : dates
//         datearray[0]  : date-string of day1
//         datearray[N-1]: date-string of dayN
function createDateArray(arg) {
// input  : JSON from Web Storage API
// output : Array ["date-string(day1)", "date-string(day2)", ..., "date-string(current day)"]
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

  // calc base_date
  if (arg.log["１日目の夜となりました。"] != null) {
    base_date = "１日目の夜となりました。";
  } else {
    base_date = ret[ret.length - 1];
  }

  return [ret, base_date];
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
