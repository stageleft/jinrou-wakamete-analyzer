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
    // 村全体の情報 -> arg.input.<job>_count
    var seer_co       = new Object();
    var medium_co     = new Object();
    var bodyguard_co  = new Object();
    var freemason_co  = new Object();
    var werecat_co    = new Object();
    var werewolf_mark = new Object();
    var posessed_mark = new Object();
    var werefox_mark  = new Object();
    var minifox_mark  = new Object();
    var enemy_mark    = new Object();
    var live_villager = new Object();
    var villager_gray  = new Object();
    var villager_white = new Object();
    var villager_panda = new Object();
    var villager_black = new Object();

    // 本日（最新日）の日付
    var date_count = 0;
    Object.keys(arg.log).forEach(function(d){
      if (d.match("朝となりました。$")) {
        date_count = date_count + 1;
      }
    });
    var datestr = String(date_count)+"日目の夜となりました。";
    if (arg.log[datestr] == null) {
      datestr = String(date_count)+"日目の朝となりました。";
    }

    // 参加者の、推理情報による振り分け情報
    Object.keys(arg.input.each_player).forEach(function(k){
      var mrk = arg.input.each_player[k].enemymark;
      var job = arg.input.each_player[k].comingout;

      if        (mrk == "人狼") {
        werewolf_mark[k] = arg.input.each_player[k];
      } else if (mrk == "狂人") {
        posessed_mark[k] = arg.input.each_player[k];
      } else if (mrk == "妖狐") {
        werefox_mark[k]  = arg.input.each_player[k];
      } else if (mrk == "子狐") {
        minifox_mark[k]  = arg.input.each_player[k];
      } else if (mrk == "人外") {
        enemy_mark[k]    = arg.input.each_player[k];
      } else if (job == "占い") {
        seer_co[k]       = arg.input.each_player[k];
      } else if (job == "霊能") {
        medium_co[k]     = arg.input.each_player[k];
      } else if (job == "狩人") {
        bodyguard_co[k]  = arg.input.each_player[k];
      } else if (job == "共有") {
        freemason_co[k]  = arg.input.each_player[k];
      } else if (job == "猫又") {
        werecat_co[k]    = arg.input.each_player[k];
      } else {
        var alive_status = arg.log[datestr].players[k].stat;
        if (alive_status == "（生存中）") {
          villager_gray[k] = arg.input.each_player[k];
        }
      }

      var alive_status = arg.log[datestr].players[k].stat;
      if (alive_status == "（生存中）") {
        live_villager[k] = arg.input.each_player[k];
      }
    });
    var medium_gray_list = {};
    Object.assign(medium_gray_list, villager_gray);

    // 占い全視点でのグレー情報
    Object.keys(seer_co).forEach(function(k){
      Object.keys(arg.log).forEach(function(d){
        if (d.match("^\\d+日目の朝となりました。$")) {
          var target = arg.input.each_player[k][d].target;
          var result = arg.input.each_player[k][d].result;

          if (result == "○") {
            if (Object.keys(villager_gray).indexOf(target) != -1) {
              delete villager_gray[target];
              villager_white[target] = arg.input.each_player[k];
            } else if (Object.keys(villager_black).indexOf(target) != -1) {
              delete villager_black[target];
              villager_panda[target] = arg.input.each_player[k];
            }
          } else if (result == "●") {
            if (Object.keys(villager_gray).indexOf(target) != -1) {
              delete villager_gray[target];
              villager_black[target] = arg.input.each_player[k];
            } else if (Object.keys(villager_white).indexOf(target) != -1) {
              delete villager_white[target];
              villager_panda[target] = arg.input.each_player[k];
            }
          } else { // if (result == "")
            // nop
          }
        }
      });
    });

    function extra_letter(player_name, player_info) {
      var seer_gray_list = {};
      Object.assign(seer_gray_list, live_villager);

      delete seer_gray_list[player_name];

      var ret = '：';
      Object.keys(arg.log).forEach(function(d){
        if (d.match("^\\d+日目の朝となりました。$")) {
          var date_info = player_info[d];
          if (date_info != null) {
            var target = player_info[d].target;
            var result = player_info[d].result;
            if (target != null) {
              delete seer_gray_list[target];
              if (ret != '：'){
                ret = ret + ' → ';
              }
              ret = ret + String(target) + String(result);
            }
          }
        }
      });
      ret = ret + '\n　（視点グレー：' + Object.keys(seer_gray_list).join('、') + '）';
      return ret;
    }
    function extra_letter_empty(player_name, player_info) {
      return '';
    }
    // 村COまとめ
    ret.push(calcSubSummary("【占い師 (x/y)】", arg.input.seer_count,      seer_co,        extra_letter));
    ret.push(calcSubSummary("【霊能者 (x/y)】", arg.input.medium_count,    medium_co,      extra_letter));
    ret.push('　（占い欠け視点グレー：' + Object.keys(medium_gray_list).join('、') + '）');
    ret.push(calcSubSummary("【共有者 (x/y)】", arg.input.freemason_count, freemason_co,   extra_letter_empty));
    ret.push(calcSubSummary("【猫　又 (x/y)】", arg.input.werecat_count,   werecat_co,     extra_letter_empty));
    ret.push(calcSubSummary("【狩　人 (x/y)】", arg.input.bodyguard_count, bodyguard_co,   extra_letter_empty));
    ret.push(calcSubSummary("【生存者 (x)】",   null,                      live_villager,  extra_letter_empty));
    ret.push(calcSubSummary("【完グレ (x)】",   null,                      villager_gray,  extra_letter_empty));
    ret.push(calcSubSummary("【村人○ (x)】",   null,                      villager_white, extra_letter_empty));
    ret.push(calcSubSummary("【村人● (x)】",   null,                      villager_black, extra_letter_empty));
    ret.push(calcSubSummary("【村○● (x)】",   null,                      villager_panda, extra_letter_empty));
    // 人外情報まとめ
    ret.push(calcSubSummary("【人　狼 (x/y)】", arg.input.werewolf_count, werewolf_mark, extra_letter_empty));
    ret.push(calcSubSummary("【狂　人 (x/y)】", arg.input.posessed_count, posessed_mark, extra_letter_empty));
    ret.push(calcSubSummary("【妖　狐 (x/y)】", arg.input.werefox_count,  werefox_mark,  extra_letter_empty));
    ret.push(calcSubSummary("【子　狐 (x/y)】", arg.input.minifox_count,  minifox_mark,  extra_letter_empty));
    var enemy_count = arg.input.werewolf_count - Object.keys(werewolf_mark).length +
                      arg.input.posessed_count - Object.keys(posessed_mark).length +
                      arg.input.werefox_count  - Object.keys(werefox_mark).length +
                      arg.input.minifox_count  - Object.keys(minifox_mark).length;
    ret.push(calcSubSummary("【人　外 (x/y)】", enemy_count, enemy_mark, extra_letter_empty));
  } catch (e) {
    // nop
  }

  document.getElementById('deduce-summary').innerText = ret.filter(x => x.length > 0).join('\n');
  return;
};
