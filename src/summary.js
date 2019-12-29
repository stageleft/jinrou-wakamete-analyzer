function updateSummary(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : -
  // Another output    : innerText of <div id="deduce-summary" />
  var ret = document.createElement('tbody');

  // 本日（最新日）の日付
  var datearray;
  var base_date; // unused
  [datearray, base_date] = createDateArray(arg);

  // 参加者の、推理情報による振り分け情報
  var list = makeGrayVillagerList(arg);

  // 吊り・噛み・死体・復活算出
  var voted   = [];
  var voted_count = 0;
  var bitten  = [];
  var bitten_count = 0;
  var dnoted  = [];
  var dnoted_count = 0;
  var revived = [];
  var revived_count = 0;
  datearray.forEach(function(d){
    if (d == "１日目の朝となりました。") return;

    if (arg.log[d].list_bitten.length == 0) {
      bitten.push(["×", { comingout:"村人", enemymark:"村人" }]);
      // keep bitten_count
    } else {
      bitten.push([arg.log[d].list_bitten.join('＆'), { comingout:"村人", enemymark:"村人" }]);
      bitten_count = bitten_count + arg.log[d].list_bitten.length;
    }

    if (d == "2日目の朝となりました。") return;

    if (arg.log[d].list_voted.length == 0) {
      voted.push(["×", { comingout:"村人", enemymark:"村人" }]);
      // keep voted_count
    } else {
      if (arg.log[d].list_cursed.length != 0) {
        var v = arg.log[d].list_voted;
        v.concat(arg.log[d].list_cursed);
        voted.push([v.join('＆'), { comingout:"村人", enemymark:"村人" }]);
        voted_count = voted_count + v.length;
      } else {
        voted.push([arg.log[d].list_voted.join('＆'), { comingout:"村人", enemymark:"村人" }]);
        voted_count = voted_count + arg.log[d].list_voted.length;
      }
    }

    if (arg.log[d].list_dnoted.length != 0) {
      dnoted.push([arg.log[d].list_dnoted.join('＆'), { comingout:"村人", enemymark:"村人" }]);
      dnoted_count = dnoted_count + arg.log[d].list_dnoted.length;
    } else if (dnoted.length != 0) {
      dnoted.push(["×", { comingout:"村人", enemymark:"村人" }]);
      // keep dnoted_count
    }

    if (arg.log[d].list_revived.length == 0) {
      revived.push(["×", { comingout:"村人", enemymark:"村人" }]);
      // keep revived_count
    } else {
      revived.push([arg.log[d].list_revived.join('＆'), { comingout:"村人", enemymark:"村人" }]);
      revived_count = revived_count + arg.log[d].list_revived.length;
    }
  });

  // 人外情報算出、まとめ表示
  var enemy_all_count = arg.input.werewolf_count +
                        arg.input.posessed_count +
                        arg.input.werefox_count  +
                        arg.input.minifox_count;
  var enemy_found_count = Object.keys(list.werewolf_mark).length +
                          Object.keys(list.posessed_mark).length +
                          Object.keys(list.werefox_mark).length +
                          Object.keys(list.minifox_mark).length;
  var enemy_count       = enemy_found_count + Object.keys(list.enemy_mark).length;
  var enemy_other_count = enemy_all_count - enemy_found_count;
  var enemy_over_count  = 0;
  for (var i = arg.input.seer_count;      i < Object.keys(list.seer_co).length;      i++) {
    list.enemy_mark[String("偽占い師" + String(i))] = { comingout:"村人", enemymark:"人外" };
    enemy_over_count = enemy_over_count + 1;
  }
  for (var i = arg.input.medium_count;    i < Object.keys(list.medium_co).length;    i++) {
    list.enemy_mark[String("偽霊能者" + String(i))] = { comingout:"村人", enemymark:"人外" };
    enemy_over_count = enemy_over_count + 1;
  }
  for (var i = arg.input.freemason_count; i < Object.keys(list.freemason_co).length; i++) {
    list.enemy_mark[String("偽共有者" + String(i))] = { comingout:"村人", enemymark:"人外" };
    enemy_over_count = enemy_over_count + 1;
  }
  for (var i = arg.input.werecat_count;   i < Object.keys(list.werecat_co).length;   i++) {
    list.enemy_mark[String("偽猫又" + String(i))]   = { comingout:"村人", enemymark:"人外" };
    enemy_over_count = enemy_over_count + 1;
  }
  for (var i = arg.input.bodyguard_count; i < Object.keys(list.bodyguard_co).length; i++) {
    list.enemy_mark[String("偽狩人" + String(i))]   = { comingout:"村人", enemymark:"人外" };
    enemy_over_count = enemy_over_count + 1;
  }
    
  // 占い視点グレー算出、まとめ表示
  function extra_letter_base(player_name, player_info, separator, job_count, co_list) {
    var seer_gray_list = {};
    var seer_black_list = [];
    var duplicated_enemy_over_black = 0;
    var duplicated_enemy_found_black = 0;
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
          if (result != "" && result != "○") {
            seer_black_list.push(target);
            // ●兼対抗の重複排除
            if (co_list[target] != null) {
              duplicated_enemy_over_black = duplicated_enemy_over_black + 1;
            }
            // ●兼推理人外の重複排除
            if ((list.werewolf_mark[target] != null) ||
                (list.posessed_mark[target] != null) ||
                (list.werefox_mark[target] != null) ||
                (list.minifox_mark[target] != null) ||
                (list.enemy_mark[target] != null)) {
              duplicated_enemy_found_black = duplicated_enemy_found_black + 1;
            }
          }
          if (ret != separator){
            ret = ret + ' → ';
          }
          ret = ret + String(target) + String(result);
        }
      }
    });
    ret = ret + '<br />　（視点グレー：' + Object.keys(seer_gray_list).join('、') + '）';
    ret = ret + '<br />　（視点人外数：' +
                        ' 潜伏' + String(enemy_all_count - 
                                         (seer_black_list.length + enemy_over_count - duplicated_enemy_over_black) - 
                                         (enemy_count - duplicated_enemy_found_black)) +
                        ' 露呈' + String(seer_black_list.length + enemy_over_count - duplicated_enemy_over_black) +
                        ' 推理' + String(enemy_count - duplicated_enemy_found_black) +
                       '）';
    return ret;
  }
  function extra_letter_seer(player_name, player_info) {
    return extra_letter_base(player_name, player_info, '[占]', arg.input.seer_count,  list.seer_co);
  }
  function extra_letter_medium(player_name, player_info) {
    return extra_letter_base(player_name, player_info, '[霊]', arg.input.medium_count,list.medium_co);
  }
  // usage : calcSubSummary(parent_element, String, Number, Array of [key, value], function(String, Object))
  //            Object form: { comingout:"xxxx", enemymark:"xxxx" }
  function calcSubSummary(parent_element, index_str, max_count, menber_list, force_empty = false) {
    var summary = document.createElement('tr');
    var summary_text = document.createElement('td');
    summary.insertAdjacentElement('beforeend', summary_text);

    if (index_str.indexOf('(x/y)') != -1) {
      // index_str has "(x/y)" letters : x -> member_list.length, y -> max_count
      if (max_count <= 0) {
        return;
      }
      summary_text.insertAdjacentHTML('beforeend', '<span>' + index_str.replace('(x/', '(' + menber_list.length + '/').replace('/y)', '/' + max_count + ')') + '</span>');
    } else if (index_str.indexOf('(x)') != -1) {
      // index_str has "(x)"   letters : x -> max_count
      if (max_count <= 0) {
        return;
      }
      summary_text.insertAdjacentHTML('beforeend', '<span>' + index_str.replace('(x)', '(' + max_count + ')') + '</span>');
    } else {
      summary_text.insertAdjacentHTML('beforeend', '<span>' + index_str + '</span>');
    }
    var seer_list   = [];
    var medium_list = [];
    var other_list  = [];

    // add names
    if (force_empty == true) {
      menber_list.forEach(function(m){
        other_list.push(m[0]);
      });
    } else {
      menber_list.forEach(function(m){
        if (m[1].comingout == "占い") {
          if (m[1].enemymark == "村人") {
            seer_list.push(  m[0] + String(extra_letter_seer(m[0], m[1])));
          } else {
            var s = extra_letter_seer(m[0], m[1]);
            seer_list.push(  m[0] + String(s.substr(0, s.indexOf('<br />'))));
          }
        } else if (m[1].comingout == "霊能"){
          if (m[1].enemymark == "村人") {
            medium_list.push(m[0] + String(extra_letter_medium(m[0], m[1])));
          } else {
            var s = extra_letter_medium(m[0], m[1]);
            seer_list.push(  m[0] + String(s.substr(0, s.indexOf('<br />'))));
          }
        } else {
          other_list.push( m[0]);
        }
      });
    }

    if (other_list.length >= 1) {
      summary_text.insertAdjacentHTML('beforeend', '<span>' + other_list.join('、') + '</span>');
    }
    if (seer_list.length >= 1) {
      summary_text.insertAdjacentHTML('beforeend', '<br />　');
      summary_text.insertAdjacentHTML('beforeend', '<span>' + seer_list.join('<br />　')   + '</span>');
    }
    if (medium_list.length >= 1) {
      summary_text.insertAdjacentHTML('beforeend', '<br />　');
      summary_text.insertAdjacentHTML('beforeend', '<span>' + medium_list.join('<br />　') + '</span>');
    }

    parent_element.insertAdjacentElement('beforeend', summary);
    return;
  }

  // 村COまとめ
  calcSubSummary(ret, "<span class='seer'>【占い師 (x/y)】</span>", arg.input.seer_count,      Object.entries(list.seer_co),      false);
  calcSubSummary(ret, "<span class='medium'>【霊能者 (x/y)】</span>", arg.input.medium_count,    Object.entries(list.medium_co),    false);
  calcSubSummary(ret, "<span class='freemason'>【共有者 (x/y)】</span>", arg.input.freemason_count, Object.entries(list.freemason_co), true);
  calcSubSummary(ret, "<span class='werecat'>【猫　又 (x/y)】</span>", arg.input.werecat_count,   Object.entries(list.werecat_co),   true);
  calcSubSummary(ret, "<span class='bodyguard'>【狩　人 (x/y)】</span>", arg.input.bodyguard_count, Object.entries(list.bodyguard_co), true);
  // 村状況まとめ
  calcSubSummary(ret, "【生存者 (x)】", Object.entries(list.villager_live).length,  Object.entries(list.villager_live),  true);
  calcSubSummary(ret, "【完グレ (x)】", Object.entries(list.villager_gray).length,  Object.entries(list.villager_gray),  true);
  calcSubSummary(ret, "【村人○ (x)】", Object.entries(list.villager_white).length, Object.entries(list.villager_white), true);
  calcSubSummary(ret, "【村人● (x)】", Object.entries(list.villager_black).length, Object.entries(list.villager_black), true);
  calcSubSummary(ret, "【村○● (x)】", Object.entries(list.villager_panda).length, Object.entries(list.villager_panda), true);
  // 人外情報まとめ
  calcSubSummary(ret, "<span class='werewolf'>【人　狼 (x/y)】</span>", arg.input.werewolf_count, Object.entries(list.werewolf_mark), false);
  calcSubSummary(ret, "<span class='posessed'>【狂　人 (x/y)】</span>", arg.input.posessed_count, Object.entries(list.posessed_mark), false);
  calcSubSummary(ret, "<span class='werefox'>【妖　狐 (x/y)】</span>", arg.input.werefox_count,  Object.entries(list.werefox_mark),  false);
  calcSubSummary(ret, "<span class='minifox'>【子　狐 (x/y)】</span>", arg.input.minifox_count,  Object.entries(list.minifox_mark),  false);
  calcSubSummary(ret, "<span class='enemy'>【人　外 (x/y)】</span>", enemy_other_count,        Object.entries(list.enemy_mark),    false);
  // 死亡＆復活情報まとめ
  calcSubSummary(ret, "【吊り (x)】", voted_count,   voted,   true);
  calcSubSummary(ret, "【噛み (x)】", bitten_count,  bitten,  true);
  calcSubSummary(ret, "【死体 (x)】", dnoted_count,  dnoted,  true);
  calcSubSummary(ret, "【復活 (x)】", revived_count, revived, true);

  var summary_table = document.createElement('table');
  summary_table.insertAdjacentElement('beforeend', ret);
  document.getElementById('deduce-summary').innerHTML = '';
  document.getElementById('deduce-summary').insertAdjacentElement('beforeend', summary_table);
  return;
};
