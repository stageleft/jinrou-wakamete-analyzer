var job_list = ["村人","占い","霊能","狩人","共有","猫又"];
var mob_list = ["村人","人外","人狼","狂人","妖狐","子狐"];
var seer_result = ["","○","●"];
var medium_result = ["","○","●","△","■"];

function updateInput(arg) {
// functional input  : JSON from Web Storage API
//     'log' key of Web Storage API style
// Another input     : inner table of <div id="deduce" />
// functional output : JSON
//     'input' key of Web Storage API style
  var datearray;
  var base_date;
  [datearray, base_date] = createDateArray(arg);
  if ((datearray == null) || (datearray.length == 0)){
    return;
  }

  var ret = {};

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

function updateInputField(arg) {
// functional input  : JSON from Web Storage API
//     'log' key of Web Storage API style
// functional output : -
// Internal state    : inner table of <div id="deduce" />
// External state    : JSON from Web Storage API : update in previous updateInput()
//     'input' key of Web Storage API style
  var is_initialize = false; // if initialize Input Field
  var no_input_key  = false; // if initialize 'input' key of Web Storage API style

  ////// sanity check (set initialize mode if insane).
  // check 'log' key as input.
  var datearray;
  var base_date;
  [datearray, base_date] = createDateArray(arg);
  if ((datearray == null) || (datearray.length == 0)){
    return;
  }
  if ( base_date == "１日目の朝になりました。" ){
    is_initialize = true;
  }

  // check <div id="deduce" /> as internal state
  if ((document.getElementById("deduce").textContent == '') ||
      (document.getElementById('deducer-title') == null )) {
    is_initialize = true;
  } else {
    var tds_title = document.getElementById('deducer-title').querySelectorAll('td');
    if ((tds_title.length - 1) != datearray.length) {
      // refresh Input Field if change datearray
      is_initialize = true;
    }
  }

  // check 'input' key as external state
  if ((arg.input == null) ||
      (arg.input.each_player == null)) {
    is_initialize = true;
    no_input_key  = true;
  } else if (Object.keys(arg.log[base_date].players).length != Object.keys(arg.input.each_player).length) {
    // refresh Input Field and saved date of Input Field if change player count
    is_initialize = true;
    no_input_key  = true;
  }

  if (is_initialize == true) {
    refreshInputField(arg);
  };

  //// process 1 : add info from 'log'
  var player_list = Object.keys(arg.log[base_date].players);
  player_list.forEach(function(k){
    document.getElementById('villager-list-' + k).style.visibility = 'visible';

    for (var i = 2 ; i <= datearray.length ; i++) {
      if (arg.log[datearray[i-1]].players[k].stat == "（生存中）") {
        // if alive : set comment count
        var datekey = datearray[i-1];
        var c = 0;
        arg.log[datekey].comments.forEach(function(h){
          if ( k == h.speaker ) {
            c = c + 1;
          }
        });
        document.getElementById('stat-' + k + '-' + String(i) + '-count').innerText = "発言 "+String(c);
        if ((i > 2) &&
            (arg.log[datearray[i-2]].players[k].stat == "（死　亡）")) {
          document.getElementById('stat-' + k + '-' + String(i) + '-dead_reason').innerText = "復活";
        } else {
          document.getElementById('stat-' + k + '-' + String(i) + '-dead_reason').innerText = "";
        }
      } else {
        // if dead
        var target = document.getElementById('stat-' + k + '-' + String(i) + '-target');
        if (target != null) { target.remove(); };

        var result = document.getElementById('stat-' + k + '-' + String(i) + '-result');
        if (result != null) { result.remove(); };

        if ((i <= 2) ||
            (arg.log[datearray[i-2]].players[k].stat == "（生存中）")) {
          // if dead in this day
          var datestring   = datearray[i-1];

          // deducer: set background color or set display-none if Dead
          if (document.getElementById('is_dead').checked) {
            document.getElementById('villager-' + k).setAttribute('class', 'dead');
            document.getElementById('villager-list-' + k).style.visibility = 'visible';
          } else {
            document.getElementById('villager-list-' + k).style.visibility = 'collapse';
          }

          var dead_reason;

          // deducer: result (dead reason)
          if (arg.log[datestring].list_voted.indexOf(k) >= 0) {
            dead_reason = "吊り";
          } else if (arg.log[datestring].list_cursed.indexOf(k) >= 0) {
            dead_reason = "呪い";
          } else if (arg.log[datestring].list_bitten.indexOf(k) >= 0) {
            dead_reason = "噛み";
          } else if (arg.log[datestring].list_dnoted.indexOf(k) >= 0) {
            dead_reason = "死体";
          } else {
            dead_reason = "突然死";
          }
          document.getElementById('stat-' + k + '-' + String(i) + '-count').innerText       = "";
          document.getElementById('stat-' + k + '-' + String(i) + '-dead_reason').innerText = dead_reason;
        } else {
          // if dead in previous days
          // deducer: nop : target and result is disabled with no value
          document.getElementById('stat-' + k + '-' + String(i) + '-count').innerText       = "";
          document.getElementById('stat-' + k + '-' + String(i) + '-dead_reason').innerText = "";
        }
      }
    }

    if (document.getElementById('villager-list-' + k).style.visibility != 'collapse') {
      // deducer: set display-none if Checkbox state says it
      var job = document.getElementById('job-' + k).value; // deduced Job
      var mrk = document.getElementById('mrk-' + k).value; // Monster Mark
      if (mrk == "村人") {
        if ((job == "占い") || (job == "霊能")) {
          document.getElementById('villager-list-' + k).style.visibility = 'visible';
        } else if (job == "村人") {
          if (document.getElementById('is_villager').checked) {
            document.getElementById('villager-list-' + k).style.visibility = 'visible';
          } else {
            document.getElementById('villager-list-' + k).style.visibility = 'collapse';
          }
        } else {
          if (document.getElementById('is_talented').checked) {
            document.getElementById('villager-list-' + k).style.visibility = 'visible';
          } else {
            document.getElementById('villager-list-' + k).style.visibility = 'collapse';
          }
        }
      } else {
        if (document.getElementById('is_enemy').checked) {
          document.getElementById('villager-list-' + k).style.visibility = 'visible';
        } else {
          document.getElementById('villager-list-' + k).style.visibility = 'collapse';
        }
      }
    }
  });

  // process 2 : add info from 'input' and <td> cell
  if (no_input_key == false) {
    // preprocess: calcurate seer-info and gray-info
    var villager_cell_info = makeGrayVillagerList(arg);

    // update cast field
    document.getElementById('all_villager').value = arg.input.player_count;
    document.getElementById('job_villager').value = arg.input.villager_count;

    // restore update setting if restore
    if (is_initialize == true) {
      Object.keys(arg.input.each_player).forEach(function(k){
        // 参加者別の情報
        document.getElementById('job-' + k).value = arg.input.each_player[k].comingout; // deduced Job
        document.getElementById('mrk-' + k).value = arg.input.each_player[k].enemymark; // Monster Mark
      });
    }

    player_list.forEach(function(k){
      var tr = document.getElementById('villager-list-'+k);
      var job = document.getElementById('job-' + k).value; // deduced Job
      var mrk = document.getElementById('mrk-' + k).value; // Monster Mark

      for (var i = 2 ; i <= datearray.length ; i++) {
        var datestring   = datearray[i-1];
        var alive_status = arg.log[datestring].players[k].stat;
        var target_label = document.getElementById('stat-' + k + '-' + String(i) + '-target-label');
        var target       = document.getElementById('stat-' + k + '-' + String(i) + '-target');
        var result_label = document.getElementById('stat-' + k + '-' + String(i) + '-result-label');
        var result       = document.getElementById('stat-' + k + '-' + String(i) + '-result');

        // case 1.
        //   Job-target
        //   Job-result
        if (alive_status == "（生存中）") {
          if ((is_initialize == true) || // just after refreshInputField() called.
              (job != arg.input.each_player[k].comingout)) {
            target_label.textContent == '';
            target.textContent == '';
            result_label.textContent == '';
            result.textContent == '';
            if (job == "占い") {
              // deducer: target (alive player list)
              target_label.innerText = '占い先';
              target.removeAttribute('disabled');
              target.style.visibility = 'visible';
              player_list.forEach(function(v){
                if ((i <= 2) ||
                    ((arg.log[datearray[i-2]].players[v].stat == "（生存中）"))) {
                  var o = document.createElement('option');
                  o.setAttribute("value", v);
                  o.innerText = v;
                  target.insertAdjacentElement('beforeend', o);
                }
              });
              // target.value == player_list[1st element with stat=='（生存中）']

              // deducer: result
              result_label.innerText = '結果';
              result.removeAttribute('disabled');
              result.style.visibility = 'visible';
              seer_result.forEach(function(v){
                var o = document.createElement('option');
                o.setAttribute("value", v);
                o.innerText = v;
                result.insertAdjacentElement('beforeend', o);
              });
              result.value = seer_result[0];
            } else if (job == "霊能") {
              if (i >= 3) {
                // deducer: target (fixed string from voted player list)
                target_label.innerText = '吊り先';
                target.setAttribute('disabled', 'disabled');
                target.style.visibility = 'visible';
                voted_player = arg.log[datestring].list_voted[0];
                var o = document.createElement('option');
                o.setAttribute("value", voted_player);
                o.innerText = voted_player;
                target.insertAdjacentElement('beforeend', o);
                target.value = voted_player;

                // deducer: result
                result_label.innerText = '結果';
                result.removeAttribute('disabled');
                result.style.visibility = 'visible';
                medium_result.forEach(function(v){
                  var o = document.createElement('option');
                  o.setAttribute("value", v);
                  o.innerText = v;
                  result.insertAdjacentElement('beforeend', o);
                });
                result.value = medium_result[0];
              } else {
                // deducer: target (fixed string from voted player list)
                target_label.innerText = '';
                target.setAttribute('disabled', 'disabled');
                target.style.visibility = 'collapse';
                target.value = '';
                // deducer: result
                result_label.innerText = '';
                result.setAttribute('disabled', 'disabled');
                result.style.visibility = 'collapse';
                result.value = '';
              }
            } else { // if (job == "村人" || job == "狩人" || job == "共有" || job == "猫又")
              // deducer: target (alive player list)
              target_label.innerText = '';
              target.setAttribute('disabled', 'disabled');
              target.style.visibility = 'collapse';
              target.value = '';

              // deducer: result (fixed string from all player list)
              result_label.innerText = '';
              result.setAttribute('disabled', 'disabled');
              result.style.visibility = 'collapse';
              result.value = '';
            }

            if ((job == arg.input.each_player[k].comingout) &&
                (arg.input.each_player[k][datestring] != null)) {
              target.value = arg.input.each_player[k][datestring].target;
              result.value = arg.input.each_player[k][datestring].result;
            }
          }

          // deducer: set background color
          if (document.getElementById('villager-' + k).getAttribute('class') != 'dead') {
            if (Object.keys(villager_cell_info.villager_gray).indexOf(k) != -1) {
              document.getElementById('villager-' + k).setAttribute('class', 'gray');
            } else if ((Object.keys(villager_cell_info.villager_black).indexOf(k) != -1) ||
                       (Object.keys(villager_cell_info.villager_panda).indexOf(k) != -1)) {
              document.getElementById('villager-' + k).setAttribute('class', 'black');
            } else { // white or job ComingOut
              document.getElementById('villager-' + k).setAttribute('class', 'white');
            }
          }
        }
      }
    });
  }
  return;
}

function refreshInputField(arg) {
// 表そのものを初期化する場合の処理（変更を含む）。
// 保証するものは、タグ、IDまで。中身の保持はコール元で実施する。
// functional input  : JSON from Web Storage API (input key must be refreshed)
// functional output : -
// Another output    : inner table of <div id="deduce" />
//     it must not include any <div /> tag.
  var ret = document.createElement('table');

  var datearray;
  var base_date;
  [datearray, base_date] = createDateArray(arg);
  var player_list = Object.keys(arg.log[base_date].players);

  // update Table
  if ((arg.input != null) &&
      (arg.input.werewolf_count >= 1)) {
    document.getElementById('seer').value      = String(arg.input.seer_count);
    document.getElementById('medium').value    = String(arg.input.medium_count);
    document.getElementById('bodyguard').value = String(arg.input.bodyguard_count);
    document.getElementById('freemason').value = String(arg.input.freemason_count);
    document.getElementById('werecat').value   = String(arg.input.werecat_count);
    document.getElementById('werewolf').value  = String(arg.input.werewolf_count);
    document.getElementById('posessed').value  = String(arg.input.posessed_count);
    document.getElementById('werefox').value   = String(arg.input.werefox_count);
    document.getElementById('minifox').value   = String(arg.input.minifox_count);
  }

  // create Villager List
  // <table>
  //  <thead>
  //    <tr id="deducer-title">
  //      <td></td>
  //      <td id="deducer-title-1" colspan=3><a id="date-log-1">１日目</a></td>
  //      <td id="deducer-title-2" colspan=3><a id="date-log-2">2日目</a></td>
  //      <td>...</td>
  //      <td id="deducer-title-X" colspan=3><a id="date-log-X">X日目</a></td>
  //    </tr>
  //  </thead>
  var ret_head     = document.createElement('thead');
  var tr_title     = document.createElement('tr');
  tr_title.setAttribute('id', 'deducer-title');

  td_day0title = document.createElement('td');
  td_day0title.innerText = '';

  tr_title.insertAdjacentElement('beforeend', td_day0title);

  var td_title = document.createElement('td');
  td_title.setAttribute('id', 'deducer-title-1');
  td_title.setAttribute('colspan', '3');

  var a  = document.createElement('a');
  a.setAttribute('id', 'date-log-1');
  a.setAttribute('href', '#');
  a.innerText = "1日目";
  td_title.insertAdjacentElement('afterbegin', a);

  tr_title.insertAdjacentElement('beforeend', td_title);

  for (var i = datearray.length ; i >= 2 ; i--) {
    var td = document.createElement('td');
    td.setAttribute('id', 'deducer-title-' + String(i));
    td.setAttribute('colspan', '3');

    var a  = document.createElement('a');
    a.setAttribute('id', 'date-log-' + String(i));
    a.setAttribute('href', '#');
    a.innerText = String(i) + "日目";
    td.insertAdjacentElement('afterbegin', a);

    tr_title.insertAdjacentElement('beforeend', td);
  }

  ret_head.insertAdjacentElement('beforeend', tr_title);

  //  <tbody>
  //    <tr id='villager-list-villagerA'>
  //      <td id='villager-villagerA'><img src=[icon] /><a id="all-day-log-villagerA">villagerA</a></td>
  //
  //      <td id='stat-villagerA-1-count'>comment_count_date1</td><td>ＣＯ<br><input id='job-villagerA'/></td><td>推理<br><input id='mrk-villagerA'/></td>
  //
  //      <td>
  //        <p id='stat-villagerA-2-count'>comment_count_date2</p>
  //        <p id='stat-villagerA-2-dead_reason'>dead_reason_date2</p>
  //      </td>
  //      <td>
  //        <p id='stat-villagerA-2-target-label'>job target</p>
  //        <input id='stat-villagerA-2-target'/>
  //      </td>
  //      <td>
  //        <p id='stat-villagerA-2-result-label'>job target</p>
  //        <input id='stat-villagerA-2-result'/>
  //      </td>
  //
  //      ...
  //      <td>...</td><td>...</td><td>...</td>
  //    </tr>
  //    <tr id='villager-list-villagerB'>...</tr>
  //    ...
  //    <tr id='villager-list-villagerX'>...</tr>
  //  </tbody>
  var ret_body  = document.createElement('tbody');
  player_list.forEach(function(k){
    var tr          = document.createElement('tr');
    tr.setAttribute('id', 'villager-list-' + k);

    //// process 1: add villager_list into 1st col
    var td_villager = document.createElement('td');
    td_villager.setAttribute('id', 'villager-' + k);

    // villager_list: add character-name in mid.
    var a_villager  = document.createElement('a');
    a_villager.setAttribute('id', 'all-day-log-' + k);
    a_villager.setAttribute('href', '#');
    a_villager.innerText = k; // key: 
    td_villager.insertAdjacentElement('afterbegin', a_villager);

    // villager_list: add icon image to left side.
    var img = document.createElement('img');
    img.setAttribute("src", arg.log[base_date].players[k].icon);
    td_villager.insertAdjacentElement('afterbegin', img);

    // villager_list: count comments in forEach loop
    var comments = 0;
    var stat = "（生存中）";

    tr.insertAdjacentElement('beforeend', td_villager);

    //// process 2: add job and mob deducer field into 2nd to 4th col

    // deducer: deduced Job
    var td_b = document.createElement('td');
    td_b.innerText="ＣＯ"
    var deduced_job = document.createElement('select');
    deduced_job.setAttribute('id', 'job-' + k);
    job_list.forEach(function(v){
      var o = document.createElement('option');
      o.setAttribute("value", v);
      o.innerText = v;
      deduced_job.insertAdjacentElement('beforeend', o);
    });
    td_b.insertAdjacentElement('beforeend', document.createElement('br'));
    td_b.insertAdjacentElement('beforeend', deduced_job);
    tr.insertAdjacentElement('beforeend', td_b);

    // deducer: Monster Mark
    var td_c = document.createElement('td');
    td_c.innerText="推理"
    var monster_mark = document.createElement('select');
    monster_mark.setAttribute('id', 'mrk-' + k);
    mob_list.forEach(function(v){
      var o = document.createElement('option');
      o.setAttribute("value", v);
      o.innerText = v;
      monster_mark.insertAdjacentElement('beforeend', o);
    });
    td_c.insertAdjacentElement('beforeend', document.createElement('br'));
    td_c.insertAdjacentElement('beforeend', monster_mark);
    tr.insertAdjacentElement('beforeend', td_c);

    //// process 3 : add <td> cell for day 2..N
    for (var i = datearray.length ; i >= 2 ; i--) {
      var td_a = document.createElement('td');
      var count = document.createElement('p');
      var dead_reason = document.createElement('p');
      count.setAttribute('id', 'stat-' + k + '-' + String(i) + '-count');
      dead_reason.setAttribute('id', 'stat-' + k + '-' + String(i) + '-dead_reason');
      td_a.insertAdjacentElement('beforeend', count);
      td_a.insertAdjacentElement('beforeend', dead_reason);
      tr.insertAdjacentElement('beforeend', td_a);

      var td_b = document.createElement('td');
      var target_label = document.createElement('p');
      target_label.setAttribute('id', 'stat-' + k + '-' + String(i) + '-target-label');
      td_b.insertAdjacentElement('beforeend', target_label);
      var target = document.createElement('select');
      target.setAttribute('id', 'stat-' + k + '-' + String(i) + '-target');
      target.setAttribute('disabled', 'disabled');
      target.style.visibility = 'collapse';
      td_b.insertAdjacentElement('beforeend', target);
      tr.insertAdjacentElement('beforeend', td_b);

      var td_c = document.createElement('td');
      var result_label = document.createElement('p');
      result_label.setAttribute('id', 'stat-' + k + '-' + String(i) + '-result-label');
      td_c.insertAdjacentElement('beforeend', result_label);
      var result = document.createElement('select');
      result.setAttribute('id', 'stat-' + k + '-' + String(i) + '-result');
      result.setAttribute('disabled', 'disabled');
      result.style.visibility = 'collapse';
      td_c.insertAdjacentElement('beforeend', result);
      tr.insertAdjacentElement('beforeend', td_c);
    }

    ret_body.insertAdjacentElement('beforeend', tr);
  });

  ret.insertAdjacentElement('beforeend', ret_head);
  ret.insertAdjacentElement('beforeend', ret_body);
  document.getElementById("deduce").textContent = '';
  document.getElementById("deduce").insertAdjacentElement('afterbegin', ret);

  return;
};
