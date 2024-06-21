'use strict';

import { createDateArray, setColorClass, makeGrayVillagerList, slice_string_by_visualLength } from './libs.js';

export function updateSummary(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : -
  // Another output    : innerText of <div id="deduce-summary" />
  let summary_table = document.createElement('table');
  document.getElementById('deduce-summary').innerHTML = '';
  document.getElementById('deduce-summary').insertAdjacentElement('beforeend', summary_table);
  let ret = document.createElement('tbody');
  summary_table.insertAdjacentElement('beforeend', ret);

  // 本日（最新日）の日付
  let datearray = createDateArray(arg)[0];

  // 参加者の、推理情報による振り分け情報
  let list = makeGrayVillagerList(arg);

  // 吊り・噛み・死体・復活算出
  let voted = [];
  let voted_count = 0;
  let bitten = [];
  let bitten_count = 0;
  let dnoted = [];
  let dnoted_count = 0;
  let revived = [];
  let revived_count = 0;
  datearray.forEach(function (d) {
    function elem_dead_and_alive(player_name) {
      let tmp = document.createElement('span');
      tmp.className = setColorClass(arg.input.each_player[player_name]);
      tmp.innerText = player_name;
      return tmp;
    }
    function join_dead_and_alive(array_elem, sep) {
      let tmp = document.createElement('span');
      let c = 0;
      array_elem.forEach(function (f) {
        tmp.insertAdjacentElement('beforeend', f);
        c = c + 1;
        if (c < array_elem.length) {
          let s = document.createElement('span');
          s.innerText = sep;
          tmp.insertAdjacentElement('beforeend', s);
        }
      });
      return tmp;
    }
    if (d == '１日目の朝となりました。') return;

    if (arg.log[d].list_bitten.length == 0) {
      bitten.push(['×', { comingout: '村人', enemymark: '村人' }]);
      // keep bitten_count
    } else {
      let list_bitten_today = [];
      arg.log[d].list_bitten.forEach(function (f) {
        list_bitten_today.push(elem_dead_and_alive(f));
      });
      bitten.push([join_dead_and_alive(list_bitten_today, '＆'), { comingout: '村人', enemymark: '村人' }]);
      bitten_count = bitten_count + list_bitten_today.length;
    }

    if (d == '2日目の朝となりました。') return;

    if (arg.log[d].list_voted.length == 0) {
      voted.push(['×', { comingout: '村人', enemymark: '村人' }]);
      // keep voted_count
    } else {
      let list_voted_today = [];
      arg.log[d].list_voted.forEach(function (f) {
        list_voted_today.push(elem_dead_and_alive(f));
      });
      arg.log[d].list_cursed.forEach(function (f) {
        list_voted_today.push(elem_dead_and_alive(f));
      });
      voted.push([join_dead_and_alive(list_voted_today, '＆'), { comingout: '村人', enemymark: '村人' }]);
      voted_count = voted_count + list_voted_today.length;
    }

    if (arg.log[d].list_dnoted.length != 0) {
      let list_dnoted_today = [];
      arg.log[d].list_dnoted.forEach(function (f) {
        list_dnoted_today.push(elem_dead_and_alive(f));
      });
      dnoted.push([join_dead_and_alive(list_dnoted_today, '＆'), { comingout: '村人', enemymark: '村人' }]);
      dnoted_count = dnoted_count + list_dnoted_today.length;
    } else if (dnoted.length != 0) {
      dnoted.push(['×', { comingout: '村人', enemymark: '村人' }]);
      // keep dnoted_count
    }

    if (arg.log[d].list_revived.length == 0) {
      revived.push(['×', { comingout: '村人', enemymark: '村人' }]);
      // keep revived_count
    } else {
      let list_revived_today = [];
      arg.log[d].list_revived.forEach(function (f) {
        list_revived_today.push(elem_dead_and_alive(f));
      });
      revived.push([join_dead_and_alive(list_revived_today, '＆'), { comingout: '村人', enemymark: '村人' }]);
      revived_count = revived_count + list_revived_today.length;
    }
  });

  // 人外情報算出、まとめ表示
  let enemy_all_count = arg.input.werewolf_count + arg.input.posessed_count + arg.input.werefox_count + arg.input.minifox_count;
  let enemy_found_count = Object.keys(list.werewolf_mark).length + Object.keys(list.posessed_mark).length + Object.keys(list.werefox_mark).length + Object.keys(list.minifox_mark).length;
  let enemy_count = enemy_found_count + Object.keys(list.enemy_mark).length;
  let enemy_other_count = enemy_all_count - enemy_found_count;
  let enemy_over_count = 0;
  let i;
  for (i = arg.input.seer_count; i < Object.keys(list.seer_co).length; i++) {
    list.enemy_mark[String('偽占い師' + String(i))] = {
      comingout: '村人',
      enemymark: '人外',
    };
    enemy_over_count = enemy_over_count + 1;
  }
  for (i = arg.input.medium_count; i < Object.keys(list.medium_co).length; i++) {
    list.enemy_mark[String('偽霊能者' + String(i))] = {
      comingout: '村人',
      enemymark: '人外',
    };
    enemy_over_count = enemy_over_count + 1;
  }
  for (i = arg.input.freemason_count; i < Object.keys(list.freemason_co).length; i++) {
    list.enemy_mark[String('偽共有者' + String(i))] = {
      comingout: '村人',
      enemymark: '人外',
    };
    enemy_over_count = enemy_over_count + 1;
  }
  for (i = arg.input.werecat_count; i < Object.keys(list.werecat_co).length; i++) {
    list.enemy_mark[String('偽猫又' + String(i))] = {
      comingout: '村人',
      enemymark: '人外',
    };
    enemy_over_count = enemy_over_count + 1;
  }
  for (i = arg.input.bodyguard_count; i < Object.keys(list.bodyguard_co).length; i++) {
    list.enemy_mark[String('偽狩人' + String(i))] = {
      comingout: '村人',
      enemymark: '人外',
    };
    enemy_over_count = enemy_over_count + 1;
  }

  // 占い視点グレー算出、まとめ表示
  function extra_letter_base(player_name, player_info, separator, co_list, is_calc_gray) {
    let seer_gray_list = {};
    let seer_black_list = [];
    let duplicated_enemy_seer_black = 0;
    let duplicated_enemy_medium_black = 0;
    let duplicated_enemy_freemason_black = 0;
    let duplicated_enemy_werecat_black = 0;
    let duplicated_enemy_bodyguard_black = 0;
    let duplicated_enemy_found_black = 0;
    Object.assign(seer_gray_list, list.villager_live);

    delete seer_gray_list[player_name];

    let ret = document.createElement('span');
    let ret_init = '　' + player_name + separator;
    ret.innerText = ret_init;
    datearray.forEach(function (d) {
      let date_info = player_info[d];
      if (date_info != null) {
        let target = date_info.target;
        let result = date_info.result;
        if (target != null) {
          delete seer_gray_list[target];
          if (result != '' && result != '○') {
            seer_black_list.push(target);
            // ●兼別役職CO者の重複排除（重複排除数は、偽CO数を上限とする）
            if (list.seer_co[target] != null) {
              if (duplicated_enemy_seer_black < Object.keys(list.seer_co).length - arg.input.seer_count) {
                duplicated_enemy_seer_black = duplicated_enemy_seer_black + 1;
              }
            }
            if (list.medium_co[target] != null) {
              if (duplicated_enemy_medium_black < Object.keys(list.medium_co).length - arg.input.medium_count) {
                duplicated_enemy_medium_black = duplicated_enemy_medium_black + 1;
              }
            }
            if (list.freemason_co[target] != null) {
              if (duplicated_enemy_freemason_black < Object.keys(list.freemason_co).length - arg.input.freemason_count) {
                duplicated_enemy_freemason_black = duplicated_enemy_freemason_black + 1;
              }
            }
            if (list.werecat_co[target] != null) {
              if (duplicated_enemy_werecat_black < Object.keys(list.werecat_co).length - arg.input.werecat_count) {
                duplicated_enemy_werecat_black = duplicated_enemy_werecat_black + 1;
              }
            }
            if (list.bodyguard_co[target] != null) {
              if (duplicated_enemy_bodyguard_black < Object.keys(list.bodyguard_co).length - arg.input.bodyguard_count) {
                duplicated_enemy_bodyguard_black = duplicated_enemy_bodyguard_black + 1;
              }
            }

            // ●兼推理人外の重複排除
            if (list.werewolf_mark[target] != null || list.posessed_mark[target] != null || list.werefox_mark[target] != null || list.minifox_mark[target] != null || list.enemy_mark[target] != null) {
              duplicated_enemy_found_black = duplicated_enemy_found_black + 1;
            }
          }
          if (ret.innerText != ret_init) {
            let sep = document.createElement('span');
            sep.innerText = ' → ';
            ret.insertAdjacentElement('beforeend', sep);
          }
          let tmp = document.createElement('span');
          tmp.className = setColorClass(arg.input.each_player[target]);
          tmp.innerText = String(target) + String(result);
          ret.insertAdjacentElement('beforeend', tmp);
        }
      }
    });
    let duplicated_enemy_over_black =
      duplicated_enemy_seer_black + duplicated_enemy_medium_black + duplicated_enemy_freemason_black + duplicated_enemy_werecat_black + duplicated_enemy_bodyguard_black;

    if (is_calc_gray == true) {
      ret.insertAdjacentElement('beforeend', document.createElement('br'));

      let gray_prefix = document.createElement('span');
      gray_prefix.innerText = '　（視点グレー：';
      ret.insertAdjacentElement('beforeend', gray_prefix);
      let c = 0;
      Object.keys(seer_gray_list).forEach(function (f) {
        let tmp = document.createElement('span');
        tmp.className = setColorClass(arg.input.each_player[f]);
        tmp.innerText = f;
        ret.insertAdjacentElement('beforeend', tmp);
        c = c + 1;
        if (c < Object.keys(seer_gray_list).length) {
          let sep = document.createElement('span');
          sep.innerText = '、';
          ret.insertAdjacentElement('beforeend', sep);
        }
      });
      let gray_postfix = document.createElement('span');
      gray_postfix.innerText = '）';
      ret.insertAdjacentElement('beforeend', gray_postfix);

      let enemy = document.createElement('span');
      enemy.innerText =
        '　（視点人外数：' +
        ' 潜伏' +
        String(enemy_all_count - (seer_black_list.length + enemy_over_count - duplicated_enemy_over_black) - (enemy_count - duplicated_enemy_found_black)) +
        ' 露呈' +
        String(seer_black_list.length + enemy_over_count - duplicated_enemy_over_black) +
        ' 推理' +
        String(enemy_count - duplicated_enemy_found_black) +
        '）';
      ret.insertAdjacentElement('beforeend', document.createElement('br'));
      ret.insertAdjacentElement('beforeend', enemy);
    }

    return ret;
  }
  function extra_letter_seer(player_name, player_info, is_calc_gray) {
    return extra_letter_base(player_name, player_info, '[占]', list.seer_co, is_calc_gray);
  }
  function extra_letter_medium(player_name, player_info, is_calc_gray) {
    return extra_letter_base(player_name, player_info, '[霊]', list.medium_co, is_calc_gray);
  }
  // usage : calcSubSummary(Element parent_element,
  //                        String index_str, String index_class,
  //                        Number max_count, Array of [key(villager_name, value(player_info)] member_list,
  //                        Boolean force_empty)
  //            Object form: { comingout:"xxxx", enemymark:"xxxx" }
  function calcSubSummary(parent_element, index_str, index_class, max_count, menber_list, force_empty = false) {
    let summary = document.createElement('tr');
    parent_element.insertAdjacentElement('beforeend', summary);

    let summary_text = document.createElement('td');
    summary.insertAdjacentElement('beforeend', summary_text);

    let tmp;
    if (index_str.indexOf('(x/y)') != -1) {
      // index_str has "(x/y)" letters : x -> member_list.length, y -> max_count
      if (max_count <= 0) {
        return;
      }
      tmp = document.createElement('span');
      tmp.className = index_class;
      tmp.innerText = index_str.replace('(x/', '(' + menber_list.length + '/').replace('/y)', '/' + max_count + ')');
      summary_text.insertAdjacentElement('beforeend', tmp);
    } else if (index_str.indexOf('(x)') != -1) {
      // index_str has "(x)"   letters : x -> max_count
      if (max_count <= 0) {
        return;
      }
      tmp = document.createElement('span');
      tmp.className = index_class;
      tmp.innerText = index_str.replace('(x)', '(' + max_count + ')');
      summary_text.insertAdjacentElement('beforeend', tmp);
    } else if (index_str.indexOf('(x:吊り数y)') != -1) {
      // index_str has "(x:吊り数y)"   letters : x -> max_count, y -> Math.trunc((max_count - 1) / 2)
      if (max_count <= 0) {
        return;
      }
      tmp = document.createElement('span');
      tmp.className = index_class;
      tmp.innerText = index_str.replace('(x:', '(' + max_count + ':').replace('吊り数y)', '吊り数' + Math.trunc((max_count - 1) / 2) + ')');
      summary_text.insertAdjacentElement('beforeend', tmp);
    } else {
      tmp = document.createElement('span');
      tmp.className = index_class;
      tmp.innerText = index_str;
      summary_text.insertAdjacentElement('beforeend', tmp);
    }
    let seer_list = [];
    let medium_list = [];
    let other_list = [];

    // add names
    if (force_empty == true) {
      menber_list.forEach(function (m) {
        other_list.push(m[0]);
      });
    } else {
      menber_list.forEach(function (m) {
        if (m[1].comingout == '占い') {
          if (m[1].enemymark == '村人') {
            seer_list.push(extra_letter_seer(m[0], m[1], true));
          } else {
            seer_list.push(extra_letter_seer(m[0], m[1], false));
          }
        } else if (m[1].comingout == '霊能') {
          if (m[1].enemymark == '村人') {
            medium_list.push(extra_letter_medium(m[0], m[1], true));
          } else {
            medium_list.push(extra_letter_medium(m[0], m[1], false));
          }
        } else {
          other_list.push(m[0]);
        }
      });
    }

    if (other_list.length >= 1) {
      let c = 0;
      other_list.forEach(function (f) {
        if (f.tagName === 'span' || f.tagName === 'SPAN') {
          summary_text.insertAdjacentElement('beforeend', f);
        } else {
          let tmp = document.createElement('span');
          tmp.className = setColorClass(arg.input.each_player[f]);
          tmp.innerText = f;
          summary_text.insertAdjacentElement('beforeend', tmp);
        }
        c = c + 1;
        if (c < other_list.length) {
          let sep = document.createElement('span');
          sep.innerText = '、';
          summary_text.insertAdjacentElement('beforeend', sep);
        }
      });
    }
    if (seer_list.length >= 1) {
      seer_list.forEach(function (f) {
        summary_text.insertAdjacentElement('beforeend', document.createElement('br'));
        summary_text.insertAdjacentElement('beforeend', f);
      });
    }
    if (medium_list.length >= 1) {
      medium_list.forEach(function (f) {
        summary_text.insertAdjacentElement('beforeend', document.createElement('br'));
        summary_text.insertAdjacentElement('beforeend', f);
      });
    }

    let summary_alt_text = summary_text.innerText;
    summary_text.setAttribute('alt', summary_alt_text);
    return;
  }

  // 村COまとめ
  calcSubSummary(ret, '【占い師 (x/y)】', 'seer', arg.input.seer_count, Object.entries(list.seer_co), false);
  calcSubSummary(ret, '【霊能者 (x/y)】', 'medium', arg.input.medium_count, Object.entries(list.medium_co), false);
  calcSubSummary(ret, '【共有者 (x/y)】', 'freemason', arg.input.freemason_count, Object.entries(list.freemason_co), true);
  calcSubSummary(ret, '【猫　又 (x/y)】', 'werecat', arg.input.werecat_count, Object.entries(list.werecat_co), true);
  calcSubSummary(ret, '【狩　人 (x/y)】', 'bodyguard', arg.input.bodyguard_count, Object.entries(list.bodyguard_co), true);
  // 人外情報まとめ
  calcSubSummary(ret, '【人　狼 (x/y)】', 'werewolf', arg.input.werewolf_count, Object.entries(list.werewolf_mark), false);
  calcSubSummary(ret, '【狂　人 (x/y)】', 'posessed', arg.input.posessed_count, Object.entries(list.posessed_mark), false);
  calcSubSummary(ret, '【妖　狐 (x/y)】', 'werefox', arg.input.werefox_count, Object.entries(list.werefox_mark), false);
  calcSubSummary(ret, '【子　狐 (x/y)】', 'minifox', arg.input.minifox_count, Object.entries(list.minifox_mark), false);
  calcSubSummary(ret, '【人　外 (x/y)】', 'enemy', enemy_other_count, Object.entries(list.enemy_mark), false);
  // 村状況まとめ
  calcSubSummary(ret, '【生存者 (x:吊り数y)】', '', Object.entries(list.villager_live).length, Object.entries(list.villager_live), true);
  calcSubSummary(ret, '【完グレ (x)】', '', Object.entries(list.villager_gray).length, Object.entries(list.villager_gray), true);
  calcSubSummary(ret, '【村人○ (x)】', '', Object.entries(list.villager_white).length, Object.entries(list.villager_white), true);
  calcSubSummary(ret, '【村人● (x)】', '', Object.entries(list.villager_black).length, Object.entries(list.villager_black), true);
  calcSubSummary(ret, '【村○● (x)】', '', Object.entries(list.villager_panda).length, Object.entries(list.villager_panda), true);
  // 死亡＆復活情報まとめ
  calcSubSummary(ret, '【吊り (x)】', '', voted_count, voted, true);
  calcSubSummary(ret, '【噛み (x)】', '', bitten_count, bitten, true);
  calcSubSummary(ret, '【死体 (x)】', '', dnoted_count, dnoted, true);
  calcSubSummary(ret, '【復活 (x)】', '', revived_count, revived, true);

  // #139 整形を追加する。
  let summary_area_width = parseInt(document.getElementById('link').offsetWidth) - 25; // size of scroll bar = 17
  ret.childNodes.forEach((tr) => {
    let td = tr.childNodes[0];
    let text = td.innerHTML.split('<br>');
    let fixed_text = [];
    text.forEach((t) => {
      fixed_text = fixed_text.concat(slice_string_by_visualLength(t, summary_area_width, false));
    });

    let p = new DOMParser();
    let span = p.parseFromString('<html><body><span>' + fixed_text.join('<br>') + '</span></body></html>', 'text/html').body.childNodes[0];
    td.innerHTML = '';
    td.appendChild(span);
  });

  return;
}
