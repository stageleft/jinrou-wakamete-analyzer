function calcSubSummary(index_str, max_count, menber_list, extra_letter) {
  var summary;

  if (index_str.indexOf('(x/y)') != -1) {
    // index_str has "(x/y)" letters : x -> member_list.length, y -> max_count
    if (max_count <= 0) {
      return '';
    }
    summary = [index_str.replace('(x/', '(' + Object.keys(menber_list).length + '/').replace('/y)', '/' + max_count + ')')];
  } else if (index_str.indexOf('(x)') != -1) {
    // index_str has "(x)"   letters : x -> member_list.length
    if (Object.keys(menber_list).length <= 0) {
      return '';
    }
    summary = [index_str.replace('(x)', '(' + Object.keys(menber_list).length + ')')];
  } else {
    summary = [index_str];
  }
  var list    = [];

  // add names
  Object.keys(menber_list).forEach(function(m){
    list.push(m + String(extra_letter(m, menber_list[m])));
  });

  if (String(extra_letter("", {})) == '') {
    return summary + '　' + list.join('、');
  } else {
    return summary + '\n　' + list.join('\n　');
  }
}

function updateSummary(arg) {
// functional input  : JSON from Web Storage API
// functional output : -
// Another output    : innerText of <div id="deduce-summary" />
  var ret = [];

   try {
    // 本日（最新日）の日付
    var datearray  = createDateArray(arg);

    // 参加者の、推理情報による振り分け情報
    var list = makeGrayVillagerList(arg);

    // 吊り・噛み・デスノ算出
    var voted  = [];
    var bitten = [];
    var dnoted = [];
    datearray.forEach(function(d){
      voted.push(arg.log[d].list_voted.join('＆'));
      bitten.push(arg.log[d].list_bitten.join('＆'));
      dnoted.push(arg.log[d].list_dnoted.join('＆'));
    });

    // 占い視点グレー算出、まとめ表示
    function extra_letter(player_name, player_info) {
      var seer_gray_list = {};
      Object.assign(seer_gray_list, list.villager_live);

      delete seer_gray_list[player_name];

      var ret = '：';
      datearray.forEach(function(d){
        var date_info = player_info[d];
        if (date_info != null) {
          var target = date_info.target;
          var result = date_info.result;
          if (target != null) {
            delete seer_gray_list[target];
            if (ret != '：'){
              ret = ret + ' → ';
            }
            ret = ret + String(target) + String(result);
          }
        }
      });
      ret = ret + '\n　（視点グレー：' + Object.keys(seer_gray_list).join('、') + '）';
      return ret;
    }
    function extra_letter_empty(player_name, player_info) {
      return '';
    }
    function extra_letter_enemy(player_name, player_info) {
      if (player_info.comingout == "占い") {
        return extra_letter(player_name, player_info);
      } else {
        return extra_letter_empty(player_name, player_info);
      }
    }
    // 村COまとめ
    ret.push(calcSubSummary("【占い師 (x/y)】", arg.input.seer_count,      list.seer_co,        extra_letter));
    ret.push(calcSubSummary("【霊能者 (x/y)】", arg.input.medium_count,    list.medium_co,      extra_letter));
    ret.push(calcSubSummary("【共有者 (x/y)】", arg.input.freemason_count, list.freemason_co,   extra_letter_empty));
    ret.push(calcSubSummary("【猫　又 (x/y)】", arg.input.werecat_count,   list.werecat_co,     extra_letter_empty));
    ret.push(calcSubSummary("【狩　人 (x/y)】", arg.input.bodyguard_count, list.bodyguard_co,   extra_letter_empty));
    ret.push(calcSubSummary("【生存者 (x)】",   null,                      list.villager_live,  extra_letter_empty));
    ret.push(calcSubSummary("【完グレ (x)】",   null,                      list.villager_gray,  extra_letter_empty));
    ret.push(calcSubSummary("【村人○ (x)】",   null,                      list.villager_white, extra_letter_empty));
    ret.push(calcSubSummary("【村人● (x)】",   null,                      list.villager_black, extra_letter_empty));
    ret.push(calcSubSummary("【村○● (x)】",   null,                      list.villager_panda, extra_letter_empty));
    // 人外情報まとめ
    ret.push(calcSubSummary("【人　狼 (x/y)】", arg.input.werewolf_count, list.werewolf_mark, extra_letter_empty));
    ret.push(calcSubSummary("【狂　人 (x/y)】", arg.input.posessed_count, list.posessed_mark, extra_letter_empty));
    ret.push(calcSubSummary("【妖　狐 (x/y)】", arg.input.werefox_count,  list.werefox_mark,  extra_letter_empty));
    ret.push(calcSubSummary("【子　狐 (x/y)】", arg.input.minifox_count,  list.minifox_mark,  extra_letter_empty));
    var enemy_count = arg.input.werewolf_count - Object.keys(list.werewolf_mark).length +
                      arg.input.posessed_count - Object.keys(list.posessed_mark).length +
                      arg.input.werefox_count  - Object.keys(list.werefox_mark).length +
                      arg.input.minifox_count  - Object.keys(list.minifox_mark).length;
    for (var i = arg.input.seer_count;      i < Object.keys(list.seer_co).length;      i++) {
      list.enemy_mark.push("偽占い師" + String(i));
    }
    for (var i = arg.input.medium_count;    i < Object.keys(list.medium_co).length;    i++) {
      list.enemy_mark.push("偽霊能者" + String(i));
    }
    for (var i = arg.input.freemason_count; i < Object.keys(list.freemason_co).length; i++) {
      list.enemy_mark.push("偽共有者" + String(i));
    }
    for (var i = arg.input.werecat_count;   i < Object.keys(list.werecat_co).length;   i++) {
      list.enemy_mark.push("偽猫又" + String(i));
    }
    for (var i = arg.input.bodyguard_count; i < Object.keys(list.bodyguard_co).length; i++) {
      list.enemy_mark.push("偽狩人" + String(i));
    }
    ret.push(calcSubSummary("【人　外 (x/y)】", enemy_count,               list.enemy_mark,   extra_letter_empty));
    // 死亡情報まとめ
    ret.push(calcSubSummary("【吊　り (x)】",   null,                      voted.filter(s => s != ''),  extra_letter_empty));
    ret.push(calcSubSummary("【噛　み (x)】",   null,                      bitten.filter(s => s != ''), extra_letter_empty));
    ret.push(calcSubSummary("【デスノ (x)】",   null,                      dnoted.filter(s => s != ''), extra_letter_empty));
  } catch (e) {
    // nop
  }

  document.getElementById('deduce-summary').innerText = ret.filter(x => x.length > 0).join('\n');
  return;
};
