// usage : String = calcSubSummary(String, Number, Array of [key, value], function(String, Object))
//            Object form: { comingout:"xxxx", enemymark:"xxxx" }
function calcSubSummary(index_str, max_count, menber_list, extra_letter) {
  var summary;

  if (index_str.indexOf('(x/y)') != -1) {
    // index_str has "(x/y)" letters : x -> member_list.length, y -> max_count
    if (max_count <= 0) {
      return '';
    }
    summary = [index_str.replace('(x/', '(' + menber_list.length + '/').replace('/y)', '/' + max_count + ')')];
  } else if (index_str.indexOf('(x)') != -1) {
    // index_str has "(x)"   letters : x -> member_list.length
    if (menber_list.length <= 0) {
      return '';
    }
    summary = [index_str.replace('(x)', '(' + menber_list.length + ')')];
  } else {
    summary = [index_str];
  }
  var seer_list   = [];
  var medium_list = [];
  var other_list  = [];

  // add names
  menber_list.forEach(function(m){
    if (player_info.comingout == "占い") {
      seer_list.push(  m[0] + String(extra_letter(m[0], m[1])));
    } else if (player_info.comingout == "霊能"){
      medium_list.push(m[0] + String(extra_letter(m[0], m[1])));
    } else {
      other_list.push( m[0] + String(extra_letter(m[0], m[1])));
    }
  });

  var summary = other_list.join('、');
  if (seer_list.length >= 1) {
    summary = summary + '\n　' + seer_list.join('\n　');
  }
  if (medium_list.length >= 1) {
    summary = summary + '\n　' + medium_list.join('\n　');
  }
  return summary;
}

function updateSummary(arg) {
// functional input  : JSON from Web Storage API
// functional output : -
// Another output    : innerText of <div id="deduce-summary" />
  var ret = [];

  // 本日（最新日）の日付
  var datearray;
  var base_date; // unused
  [datearray, base_date] = createDateArray(arg);

  // 参加者の、推理情報による振り分け情報
  var list = makeGrayVillagerList(arg);

  // 吊り・噛み・デスノ算出
  var voted  = [];
  var bitten = [];
  var dnoted = [];
  datearray.forEach(function(d){
    if (d == "１日目の朝となりました。") return;

    if (arg.log[d].list_bitten.length == 0) {
      bitten.push(["×", { comingout:"村人", enemymark:"村人" }]);
    } else {
      bitten.push([arg.log[d].list_bitten.join('＆'), { comingout:"村人", enemymark:"村人" }]);
    }

    if (d == "2日目の朝となりました。") return;

    if (arg.log[d].list_voted.length == 0) {
      voted.push(["×", { comingout:"村人", enemymark:"村人" }]);
    } else {
      if (arg.log[d].list_cursed.length != 0) {
        var v = arg.log[d].list_voted;
        v.concat(arg.log[d].list_cursed);
        voted.push([v.join('＆'), { comingout:"村人", enemymark:"村人" }]);
      } else {
        voted.push([arg.log[d].list_voted.join('＆'), { comingout:"村人", enemymark:"村人" }]);
      }
    }

    if (arg.log[d].list_dnoted.length != 0) {
      dnoted.push([arg.log[d].list_dnoted.join('＆'), { comingout:"村人", enemymark:"村人" }]);
    }
  });

  // 占い視点グレー算出、まとめ表示
  function extra_letter_base(player_name, player_info, separator) {
    var seer_gray_list = {};
    Object.assign(seer_gray_list, list.villager_live);

    delete seer_gray_list[player_name];

    var ret = separator;
    datearray.forEach(function(d){
      var date_info = player_info[d];
      if (date_info != null) {
        var target = date_info.target;
        var result = date_info.result;
        if (target != null) {
          delete seer_gray_list[target];
          if (ret != separator){
            ret = ret + ' → ';
          }
          ret = ret + String(target) + String(result);
        }
      }
    });
    ret = ret + '\n　（視点グレー：' + Object.keys(seer_gray_list).join('、') + '）';
    return ret;
  }
  function extra_letter_seer(player_name, player_info) {
    return extra_letter_base(player_name, player_info, '[占]');
  }
  function extra_letter_medium(player_name, player_info) {
    return extra_letter_base(player_name, player_info, '[霊]');
  }
  function extra_letter_empty(player_name, player_info) {
    return '';
  }
  function extra_letter_enemy(player_name, player_info) {
    if (player_info.comingout == "占い") {
      var s = extra_letter_seer(player_name, player_info);
      return s.substr(0, s.indexOf('\n'));
    } else if (player_info.comingout == "霊能"){
      var s = extra_letter_medium(player_name, player_info);
      return s.substr(0, s.indexOf('\n'));
    } else {
      return extra_letter_empty(player_name, player_info);
    }
  }
  // 村COまとめ
  ret.push(calcSubSummary("【占い師 (x/y)】", arg.input.seer_count,      Object.entries(list.seer_co),        extra_letter_seer));
  ret.push(calcSubSummary("【霊能者 (x/y)】", arg.input.medium_count,    Object.entries(list.medium_co),      extra_letter_medium));
  ret.push(calcSubSummary("【共有者 (x/y)】", arg.input.freemason_count, Object.entries(list.freemason_co),   extra_letter_empty));
  ret.push(calcSubSummary("【猫　又 (x/y)】", arg.input.werecat_count,   Object.entries(list.werecat_co),     extra_letter_empty));
  ret.push(calcSubSummary("【狩　人 (x/y)】", arg.input.bodyguard_count, Object.entries(list.bodyguard_co),   extra_letter_empty));
  // 村状況まとめ
  ret.push(calcSubSummary("【生存者 (x)】", null, Object.entries(list.villager_live),  extra_letter_empty));
  ret.push(calcSubSummary("【完グレ (x)】", null, Object.entries(list.villager_gray),  extra_letter_empty));
  ret.push(calcSubSummary("【村人○ (x)】", null, Object.entries(list.villager_white), extra_letter_empty));
  ret.push(calcSubSummary("【村人● (x)】", null, Object.entries(list.villager_black), extra_letter_empty));
  ret.push(calcSubSummary("【村○● (x)】", null, Object.entries(list.villager_panda), extra_letter_empty));
  // 人外情報まとめ
  ret.push(calcSubSummary("【人　狼 (x/y)】", arg.input.werewolf_count, Object.entries(list.werewolf_mark), extra_letter_enemy));
  ret.push(calcSubSummary("【狂　人 (x/y)】", arg.input.posessed_count, Object.entries(list.posessed_mark), extra_letter_enemy));
  ret.push(calcSubSummary("【妖　狐 (x/y)】", arg.input.werefox_count,  Object.entries(list.werefox_mark),  extra_letter_enemy));
  ret.push(calcSubSummary("【子　狐 (x/y)】", arg.input.minifox_count,  Object.entries(list.minifox_mark),  extra_letter_enemy));
  var enemy_count = arg.input.werewolf_count - Object.keys(list.werewolf_mark).length +
                    arg.input.posessed_count - Object.keys(list.posessed_mark).length +
                    arg.input.werefox_count  - Object.keys(list.werefox_mark).length +
                    arg.input.minifox_count  - Object.keys(list.minifox_mark).length;
  for (var i = arg.input.seer_count;      i < Object.keys(list.seer_co).length;      i++) {
    list.enemy_mark[String("偽占い師" + String(i))] = { comingout:"村人", enemymark:"人外" };
  }
  for (var i = arg.input.medium_count;    i < Object.keys(list.medium_co).length;    i++) {
    list.enemy_mark[String("偽霊能者" + String(i))] = { comingout:"村人", enemymark:"人外" };
  }
  for (var i = arg.input.freemason_count; i < Object.keys(list.freemason_co).length; i++) {
    list.enemy_mark[String("偽共有者" + String(i))] = { comingout:"村人", enemymark:"人外" };
  }
  for (var i = arg.input.werecat_count;   i < Object.keys(list.werecat_co).length;   i++) {
    list.enemy_mark[String("偽猫又" + String(i))]   = { comingout:"村人", enemymark:"人外" };
  }
  for (var i = arg.input.bodyguard_count; i < Object.keys(list.bodyguard_co).length; i++) {
    list.enemy_mark[String("偽狩人" + String(i))]   = { comingout:"村人", enemymark:"人外" };
  }
  ret.push(calcSubSummary("【人　外 (x/y)】", enemy_count,               Object.entries(list.enemy_mark),   extra_letter_enemy));
  // 死亡情報まとめ
  ret.push(calcSubSummary("【吊　り (x)】", null, voted,  extra_letter_empty));
  ret.push(calcSubSummary("【噛　み (x)】", null, bitten, extra_letter_empty));
  ret.push(calcSubSummary("【デスノ (x)】", null, dnoted, extra_letter_empty));

  document.getElementById('deduce-summary').innerText = ret.filter(x => x.length > 0).join('\n');
  return;
};
