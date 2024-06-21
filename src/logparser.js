/* eslint-disable no-irregular-whitespace */
'use strict';

import { createDateArray, logTag_d2n } from './libs.js';

// function.js 関数群
// style:
//   json_data = function(text_data)
//   html_data = function(json_data)
//   json_data = function(json_data)

export function html2json_village_log(arg) {
  // input  : HTMLCollction
  //          <table width="770" cellspacing="5"><tbody> ... </tbody></table>
  // output : Hash
  //          {
  //              village_number:"string", // village number
  //              log: {
  //                  "date-string":{
  //                      players:  {...}
  //                      comments: {...}
  //                      vote_log: {...}
  //                  },
  //                  "date-string":{},
  //                  ...
  //              }
  //          }
  //
  let ret = { village_number: null, log: {} };
  let player_list;

  let base_table = arg.querySelector('table').querySelector('tbody');
  let base_tr_list = base_table.querySelectorAll('tr');
  if (base_tr_list.item(0).innerText != 'ブラウザの更新ボタンは押さないでください' && base_tr_list.item(0).innerText != '過去の記録') {
    return null;
  }
  for (let i = 1; i < base_tr_list.length; i++) {
    if (base_tr_list.item(i).innerText == 'ブラウザの更新ボタンは押さないでください' || base_tr_list.item(i).innerText == '過去の記録') {
      // nop : caution to player
    } else if (base_tr_list.item(i).innerText.match('^◆ 村人たち')) {
      // nop : tag
    } else if (base_tr_list.item(i - 1).innerText.match('^◆ 村人たち')) {
      // parse sub <table> as villager_list
      player_list = html2json_villager_list(base_tr_list.item(i).querySelector('table')).players;
    } else if (base_tr_list.item(i).innerText.match('^◆ 再表示')) {
      // nop : tag
    } else if (base_tr_list.item(i - 1).innerText.match('^◆ 再表示')) {
      // nop : control
    } else if (base_tr_list.item(i).innerText.match('^◆ 出来事')) {
      // nop : tag
    } else if (base_tr_list.item(i - 1).innerText.match('^◆ 出来事')) {
      // style of this section :
      //  <td>
      //    <img>
      //    <font size="+2">～ village title ～</font>
      //    village_id番地
      //    <br>
      //    <img>
      //    <font size="+2">date</font>
      //    system information
      //    <br>
      //    <table>
      //  </td>
      // ignore another than <table>.
      //    village_id is from input tag.
      //    date is from messages.
      // parse sub <table> as village_log
      let village_log = html2log(base_tr_list.item(i).querySelector('table'));
      Object.assign(ret.log, village_log);
      // console.log(JSON.stringify(village_log));
    } else if (base_tr_list.item(i).innerText.match('^◆ 幽霊の間')) {
      // nop : tag
    } else if (base_tr_list.item(i - 1).innerText.match('^◆ 幽霊の間')) {
      // nop : tag
    } else if (base_tr_list.item(i).innerText.match('^戻る')) {
      // nop : information to player
    } else {
      // nop : maybe <tr> tag in sub <table>.
    }
  }

  let base_input_list = base_table.querySelectorAll('input');
  for (let j = 0; j < base_input_list.length; j++) {
    if (base_input_list.item(j).name == 'VILLAGENO') {
      // get village number from below tag.
      //   <input type="hidden" name="VILLAGENO" value="153063">
      ret.village_number = base_input_list.item(j).value;
    } else {
      // nop : information to system.
      //    <input type="hidden" name="TXTPNO" value="60">
      //    <input type="hidden" name="TXTPASS" value="">
      //    <input type="hidden" name="TXTLOGIN" value="2">
      //    <input type="hidden" name="FORMID" value="441975">
    }
  }

  if (Object.keys(ret.log).length < 2) {
    // single day log
    ret.log[Object.keys(ret.log)[0]].players = {};
    Object.assign(ret.log[Object.keys(ret.log)[0]].players, player_list);
  } else {
    // multi days log
    let datearray = createDateArray(ret)[0];
    if (datearray == null || datearray.length == 0) {
      return;
    }
    Object.keys(player_list).forEach(function (k) {
      player_list[k].stat = '（生存中）';
    });
    datearray.forEach(function (d) {
      let p; // datearray[datearray.indexOf(d) - 1] if d > (day1 AM)
      if (d == '１日目の朝となりました。') {
        ret.log[d].players = {};
        Object.assign(ret.log[d].players, player_list);
        return;
      } else if (d != logTag_d2n(d) && ret.log[logTag_d2n(d)] != null) {
        p = datearray[datearray.indexOf(d) - 1];
        // set player_list into current log
        // (n-1)th Nighttime: calc player_list of 1 day ago from ret.log[l].list_*
        let n = logTag_d2n(d);
        ret.log[n].players = {};
        Object.keys(player_list).forEach(function (k) {
          ret.log[n].players[k] = {
            icon: ret.log[p].players[k].icon,
            stat: '',
          };
          if (ret.log[p].players[k].stat == '（生存中）') {
            ret.log[n].players[k].stat = '（生存中）';
            if (
              ret.log[n].list_bitten.includes(k) == true ||
              ret.log[n].list_voted.includes(k) == true ||
              ret.log[n].list_sudden.includes(k) == true ||
              ret.log[n].list_dnoted.includes(k) == true ||
              ret.log[n].list_cursed.includes(k) == true
            ) {
              ret.log[n].players[k].stat = '（死　亡）';
            }
          } else {
            ret.log[n].players[k].stat = '（死　亡）';
            if (ret.log[n].list_revived.includes(k) == true) {
              ret.log[n].players[k].stat = '（生存中）';
            }
          }
        });
        // nth Daytime: calc player_list of 1 day ago from ret.log[l].list_*
        ret.log[d].players = {};
        Object.keys(player_list).forEach(function (k) {
          ret.log[d].players[k] = {
            icon: ret.log[n].players[k].icon,
            stat: '',
          };
          if (ret.log[n].players[k].stat == '（生存中）') {
            ret.log[d].players[k].stat = '（生存中）';
            if (
              ret.log[d].list_bitten.includes(k) == true ||
              ret.log[d].list_voted.includes(k) == true ||
              ret.log[d].list_sudden.includes(k) == true ||
              ret.log[d].list_dnoted.includes(k) == true ||
              ret.log[d].list_cursed.includes(k) == true
            ) {
              ret.log[d].players[k].stat = '（死　亡）';
            }
          } else {
            ret.log[d].players[k].stat = '（死　亡）';
            if (ret.log[d].list_revived.includes(k) == true) {
              ret.log[d].players[k].stat = '（生存中）';
            }
          }
        });
      } else {
        p = datearray[datearray.indexOf(d) - 1];
        ret.log[d].players = {};
        Object.keys(player_list).forEach(function (k) {
          ret.log[d].players[k] = {
            icon: ret.log[p].players[k].icon,
            stat: '',
          };
          if (ret.log[p].players[k].stat == '（生存中）') {
            ret.log[d].players[k].stat = '（生存中）';
            if (
              ret.log[d].list_bitten.includes(k) == true ||
              ret.log[d].list_voted.includes(k) == true ||
              ret.log[d].list_sudden.includes(k) == true ||
              ret.log[d].list_dnoted.includes(k) == true ||
              ret.log[d].list_cursed.includes(k) == true
            ) {
              ret.log[d].players[k].stat = '（死　亡）';
            }
          } else {
            ret.log[d].players[k].stat = '（死　亡）';
            if (ret.log[d].list_revived.includes(k) == true) {
              ret.log[d].players[k].stat = '（生存中）';
            }
          }
        });
      }
    });
  }
  return ret;
}

function html2json_villager_list(arg) {
  // input  : HTMLCollction
  //          <tbody> ... </tbody> of <table class="CLSTABLE"></table>
  // output : Hash
  //            players: {
  //              "character-name": { icon:value, stat:value },
  //              "character-name": { icon:value, stat:value },
  //              ...
  //            }
  //           stat:value : "（生存中）" or "（死　亡）"
  let ret = {};
  let re = new RegExp(/^\.\//, '');

  //  console.log(arg.innerHTML); // debug

  let base_td_list = arg.querySelectorAll('td');
  for (let i = 0; i < base_td_list.length; i = i + 2) {
    // style of base_td_list.item(i)  :
    //   <img src="link of image" title="comment of player"><br>
    let img_src;
    // style of base_td_list.item(i+1):
    //   character name<br>
    //   <b>player name (with TRIP)</b><br> (option)
    //   [character JOB]<br>                (option)
    //   （Alive Status）
    // ignore player name, JOB.
    let character_name;
    let is_alive;

    // get info of base_td_list.item(i)
    let img_selector = base_td_list.item(i).querySelector('img');
    if (img_selector != null) {
      img_src = img_selector.getAttribute('src').replace(re, 'http://jinrou.aa0.netvolante.jp/~jinrou/');

      // get info of base_td_list.item(i+1)
      let character_info = String(base_td_list.item(i + 1).innerHTML).split('<br>');
      character_name = character_info[0].trim();
      is_alive = character_info[character_info.length - 1];

      // create Hash and add to Array
      ret[character_name] = { icon: img_src, stat: is_alive };
    }
  }

  return { players: ret };
}

function html2log(arg) {
  // input  : HTMLCollction
  //          <tbody> ... </tbody> of <table table cellpadding="0"></table>
  // output : Hash
  //          "date-string":{
  //            msg_date:     "date-string",
  //            list_voted:   [ "character-name", ... ],
  //            list_cursed:  [ "character-name", ... ],
  //            list_revived: [ "character-name", ... ],
  //            list_bitten:  [ "character-name", ... ],
  //            list_dnoted:  [ "character-name", ... ],
  //            list_sudden:  [ "character-name", ... ],
  //            comments: [
  //              { speaker:value, type:value, comment:[value_with_each_line] },
  //              ...
  //            ],
  //            vote_log : [<from html2json_vote_result()>]
  //          },
  //          "date-string":{},
  //          ...
  //   type:value : "Normal" or "Strong" or "WithColor"
  let re = new RegExp(/^\.\//, '');

  function init_ret() {
    let o = {
      msg_date: null,
      list_voted: [],
      list_cursed: [], // Cursed  by WereCat (only in voting)
      list_revived: [], // Revived by WereCat
      list_bitten: [],
      list_dnoted: [], // dead by Death Note
      list_sudden: [],
      comments: [],
      vote_log: [],
    };
    return o;
  }
  let datearray = [];
  let ret = {};
  let current_day_log = init_ret();

  let base_tr_list = arg.querySelectorAll('tr');
  for (let i = 0; i < base_tr_list.length; i++) {
    let base_td_list = base_tr_list.item(i).querySelectorAll('td');
    if (base_td_list.length == 1) {
      // system message <td colspan="2">...</td>
      let icon_selector = base_td_list.item(0).querySelector('img');
      if (icon_selector != null) {
        if (base_td_list.item(0).querySelector('font') == null) {
          continue;
        }

        let icon_uri = icon_selector.getAttribute('src').replace(re, 'http://jinrou.aa0.netvolante.jp/~jinrou/');
        let msg_text = base_td_list.item(0).querySelector('font').innerText;
        if (
          icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/ampm.gif' ||
          icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/hum.gif' ||
          icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/wlf.gif' ||
          icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/fox.gif' ||
          icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/sc5.gif'
        ) {
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+1">１日目の夜となりました。</font>(19/07/15 00:39:10)
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+1">3日目の夜となりました。</font>(19/07/14 23:32:09)
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+1">9日目の朝となりました。</font>(19/07/06 01:43:35)
          // <img src="./img/ampm.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「引き分け」です！</font>(19/08/13 00:22:35)
          // <img src="./img/hum.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「村　人」の勝利です！</font>(19/08/12 02:05:13)
          // <img src="./img/wlf.gif" width="32" height="32" border="0"> <font size="+2" color="#dd0000">「<font color="#ff0000">人　狼</font>」の勝利です！</font>(19/08/04 02:57:29)
          // <img src="./img/fox.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「<font color="#ffcc33">妖　狐</font>」の勝利です！</font>(19/08/12 00:30:03)
          // <img src="./img/sc5.gif" width="32" height="32" border="0"> <font size="+2" color="#ff6600">「<font color="#ff9999">猫　又</font>」の勝利です！</font>(19/07/15 00:11:04)
          datearray.push(msg_text);
          current_day_log.msg_date = datearray[datearray.length - 1];
          ret[datearray[datearray.length - 1]] = current_day_log;
          current_day_log = init_ret();
        } else if (icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/dead1.gif') {
          if (msg_text.match('^処刑されました・・・。$')) {
            // <img src="./img/dead1.gif" width="32" height="32" border="0"> <b>安斎都</b>さんは村民協議の結果<font color="#ff0000">処刑されました・・・。</font>
            current_day_log.list_voted.push(base_td_list.item(0).querySelector('b').innerText);
          } else {
            // <img src="./img/dead1.gif" width="32" height="32" border="0"> <b>タマトイズ</b>さんは猫又の呪いで<font color="#ff0000">死亡しました・・・。</font>
            current_day_log.list_cursed.push(base_td_list.item(0).querySelector('b').innerText);
          }
        } else if (icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/dead2.gif') {
          if (msg_text.match('^無残な姿で発見された・・・。$')) {
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>伊吹翼</b>さんは翌日<font color="#ff0000">無残な姿で発見された・・・。</font>
            current_day_log.list_bitten.push(base_td_list.item(0).querySelector('b').innerText);
          } else if (msg_text.match('^に死体で発見された・・・。$')) {
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>久川凪</b>さんは翌日<font color="#ff0000">に死体で発見された・・・。</font>
            current_day_log.list_dnoted.push(base_td_list.item(0).querySelector('b').innerText);
          } else {
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>八神マキノ</b>さんは都合により<font color="#ff0000">突然死しました・・・。【ペナルティ】</font>
            // <img src="./img/dead2.gif" width="32" height="32" border="0"> <b>海星</b>さんは都合により<font color="#ff0000">突然死しました・・・。</font>
            current_day_log.list_sudden.push(base_td_list.item(0).querySelector('b').innerText);
          }
        } else if (icon_uri == 'http://jinrou.aa0.netvolante.jp/~jinrou/img/msg.gif') {
          if (msg_text.match('^奇跡的に生き返った。$')) {
            // <img src="./img/msg.gif" width="32" height="32" border="0"> <b>パチュリー</b>さんは<font color="#ff0000">奇跡的に生き返った。</font>
            current_day_log.list_revived.push(base_td_list.item(0).querySelector('b').innerText);
          } else {
            // <img src="./img/msg.gif" width="32" height="32" border="0">
            //      <font size="+1">再投票となりました。</font>あと
            //      <font size="+2">1</font>回の投票で結論が出なければ引き分けとなります。</td>
            // ignore. it maybe unused message or inner font tag of winner message.
          }
        } else {
          // ignore messages with unknown icon. it is not important.
        }
      } else {
        // ignore messages without icon. it is not important.
      }
    } else if (base_td_list.length == 2) {
      // villager comment
      try {
        let villager = base_td_list.item(0).querySelector('b').innerText;
        if (villager == 'ゲームマスター') {
          villager = '初日犠牲者';
        }
        // ref. https://qiita.com/miiitaka/items/793555b4ccb0259a4cb8
        let v_comment = String(base_td_list.item(1).innerHTML)
          .replace(/<br>/g, '\n')
          .replace(/^「/, '')
          .replace(/」$/, '')
          .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
          .split('\n');
        let v_comtype = 'Normal';
        if (base_td_list.item(1).querySelector('font') != null) {
          if (base_td_list.item(1).querySelector('font').size == '+1') {
            v_comtype = 'Strong';
          } else if (base_td_list.item(1).querySelector('font').size == '-1') {
            v_comtype = 'WithColor';
          } else {
            v_comtype = 'Unknown';
          }
        }
        current_day_log.comments.push({
          speaker: villager,
          comment: v_comment,
          type: v_comtype,
        });
      } catch (e) {
        // nop : skip "◆狼の遠吠え"
      }
    } else {
      // vote
      let vote_title = base_td_list.item(0).querySelector('font');
      let vote_table = base_td_list.item(0).querySelector('table');
      if (vote_table != null) {
        // vote table
        let r = { title: vote_title.innerText };
        Object.assign(r, html2json_vote_result(vote_table));
        current_day_log.vote_log.push(r);
      } else {
        // inner tag in vote table
        // nop:
      }
    }
  }

  if (datearray.length == 1) {
    // daytime log
    Object.keys(current_day_log).forEach(function (k) {
      ret[datearray[0]][k] = ret[datearray[0]][k].concat(current_day_log[k]);
    });
    ret[datearray[0]].vote_log = ret[datearray[0]].vote_log.reverse();
  } else if (datearray.length == 2 && current_day_log.vote_log.length == 0) {
    // nighttime log
    Object.keys(current_day_log).forEach(function (k) {
      ret[datearray[0]][k] = ret[datearray[0]][k].concat(ret[datearray[1]][k]).concat(current_day_log[k]);
    });
    delete ret[datearray[1]];
    ret[datearray[0]].vote_log = ret[datearray[0]].vote_log.reverse();
  } else {
    if (current_day_log.comments.length > 0) {
      datearray.push('１日目の朝となりました。');
      current_day_log.msg_date = '１日目の朝となりました。';
      ret['１日目の朝となりました。'] = current_day_log;
    }
    Object.keys(ret).forEach(function (d) {
      try {
        ret[d].vote_log = ret[d].vote_log.reverse();
      } catch (e) {
        // nop : d is other than msg_date;
      }
    });
    // shift all list 1 day.
    for (let j = 0; j < datearray.length - 2; j++) {
      ret[datearray[j]].list_bitten = ret[datearray[j + 1]].list_bitten; // (n-1) night -> n day
      ret[datearray[j]].list_voted = ret[datearray[j + 2]].list_voted; // (n-1) day   -> n day
      ret[datearray[j]].list_revived = ret[datearray[j + 1]].list_revived; // (n-1) night -> n day
      ret[datearray[j]].list_cursed = ret[datearray[j + 2]].list_cursed; // (n-1) day   -> n day
      ret[datearray[j]].list_dnoted = ret[datearray[j + 1]].list_dnoted; // (n-1) night -> n day
      ret[datearray[j]].list_sudden = ret[datearray[j + 1]].list_sudden;
      ret[datearray[j]].list_sudden.concat(ret[datearray[j + 2]].list_sudden); // (n-1) day + (n-1) night -> n day
    }
    if (datearray >= 2) {
      ret[datearray[datearray.length - 2]].list_bitten = ret[datearray[datearray.length - 1]].list_bitten;
      ret[datearray[datearray.length - 2]].list_voted = [];
      ret[datearray[datearray.length - 2]].list_revived = ret[datearray[datearray.length - 1]].list_revived;
      ret[datearray[datearray.length - 2]].list_cursed = [];
      ret[datearray[datearray.length - 2]].list_dnoted = ret[datearray[datearray.length - 1]].list_dnoted;
      ret[datearray[datearray.length - 2]].list_sudden = ret[datearray[datearray.length - 1]].list_sudden;
    }
    ret[datearray[datearray.length - 1]].list_bitten = [];
    ret[datearray[datearray.length - 1]].list_voted = [];
    ret[datearray[datearray.length - 1]].list_revived = [];
    ret[datearray[datearray.length - 1]].list_cursed = [];
    ret[datearray[datearray.length - 1]].list_dnoted = [];
    ret[datearray[datearray.length - 1]].list_sudden = [];
  }
  return ret;
}

function html2json_vote_result(arg) {
  // input  : HTMLCollction
  //          <tbody> ... </tbody> of <table></table>
  //
  // output : null or Hash
  //            vote: [
  //              { from_villager:value, to_villager:value },
  //              ...
  //            ],
  let ret = [];

  // console.log(arg.innerHTML); // debug

  let base_tr_list = arg.querySelectorAll('tr');
  for (let i = 0; i < base_tr_list.length; i++) {
    // style <tr><td><b>from</b>さん</td><td>x 票</td><td>投票先 → <b>to</b>さん</td>
    let from_person;
    let to_person;
    let base_b_list = base_tr_list.item(i).querySelectorAll('b');
    from_person = base_b_list.item(0).innerText;
    to_person = base_b_list.item(1).innerText;

    ret.push({ from_villager: from_person, to_villager: to_person });
  }

  return { vote: ret };
}
