var job_list = ["村人","占い","霊能","狩人","共有","猫又"];
var mob_list = ["村人","人外","人狼","狂人","妖狐","子狐"];
var seer_result = ["","○","●"];
var medium_result = ["","○","●","△"];

function updateInput(arg) {
// functional input  : JSON from Web Storage API
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
// Another input     : inner table of <div id="deduce" />
// functional output : -
// Another output    : inner <td> element of table in <div id="deduce" />
  var is_initialize = false;
  if ((arg.input == null) ||
      (arg.input.each_player == null)) {
    is_initialize = true;
  }

  var datearray;
  var base_date;
  [datearray, base_date] = createDateArray(arg);
  if ((datearray == null) || (datearray.length == 0)){
    return;
  }
  if ( base_date == "１日目の朝になりました。" ){
    is_initialize = true;
  }

  if ((is_initialize == false) &&
      (Object.keys(arg.log[base_date].players).length != Object.keys(arg.input.each_player).length)) {
    arg.input = null;
    is_initialize = true;
  }

  if ((is_initialize == true) ||
      (document.getElementById("deduce").textContent == '')) {
    document.getElementById("deduce").textContent = '';
    createInputField(arg, base_date);
  };

  // preprocess: calcurate seer-info and gray-info
  var villager_cell_info = makeGrayVillagerList(arg);

  // update cast field
  if (is_initialize == false) {
    document.getElementById('all_villager').value = arg.input.player_count;
    document.getElementById('job_villager').value = arg.input.villager_count;
  }

  // add <td> cell to title if not exist
  var tds_title   = document.getElementById('deducer-title').querySelectorAll('td');
  for (var i = tds_title.length ; i <= datearray.length; i++) {
    var td = document.createElement('td');
    td.setAttribute('id', 'deducer-title-' + String(i));
    td.setAttribute('colspan', '3');

    var a  = document.createElement('a');
    a.setAttribute('id', 'date-log-' + String(i));
    a.setAttribute('href', '#');
    a.innerText = String(i) + "日目";
    td.insertAdjacentElement('afterbegin', a);

    document.getElementById('deducer-title').insertAdjacentElement('beforeend', td);
  }

  var player_list = Object.keys(arg.log[base_date].players);
  player_list.forEach(function(k){
    var tr = document.getElementById('villager-list-'+k);
    var job = document.getElementById('job-' + k).value; // deduced Job
    var mrk = document.getElementById('mrk-' + k).value; // Monster Mark

    // process 1 : add <td> cell if not exist
    var td_cell_added = false;
    for (var i = tds_title.length ; i <= datearray.length ; i++) {
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
      td_b.insertAdjacentElement('beforeend', target);
      tr.insertAdjacentElement('beforeend', td_b);

      var td_c = document.createElement('td');
      var result_label = document.createElement('p');
      result_label.setAttribute('id', 'stat-' + k + '-' + String(i) + '-result-label');
      td_c.insertAdjacentElement('beforeend', result_label);
      var result = document.createElement('select');
      result.setAttribute('id', 'stat-' + k + '-' + String(i) + '-result');
      result.setAttribute('disabled', 'disabled');
      td_c.insertAdjacentElement('beforeend', result);
      tr.insertAdjacentElement('beforeend', td_c);

      td_cell_added = true;
    }

    // process 2 : add day1 comment count into <td> cell
    var c = 0;
    arg.log[datearray[0]].comments.forEach(function(h){
      if ( k == h.speaker ) {
        c = c + 1;
      }
    });
    document.getElementById('stat-' + k + '-1-count').innerText = "発言 "+String(c);


    // process 3 : add inner value into <td> cell
    for (var i = 2 ; i <= datearray.length ; i++) {
      var datestring   = datearray[i-1];
      var alive_status = arg.log[datestring].players[k].stat;
      var target_label = document.getElementById('stat-' + k + '-' + String(i) + '-target-label');
      var target       = document.getElementById('stat-' + k + '-' + String(i) + '-target');
      var result_label = document.getElementById('stat-' + k + '-' + String(i) + '-result-label');
      var result       = document.getElementById('stat-' + k + '-' + String(i) + '-result');
      var count        = document.getElementById('stat-' + k + '-' + String(i) + '-count');
      var dead_reason  = document.getElementById('stat-' + k + '-' + String(i) + '-dead_reason');

      // case 1.
      //   Job-target
      //   Job-result
      //   Comments
      if (alive_status == "（生存中）") {
        if (dead_reason != null) { dead_reason.remove(); };

        if ((is_initialize == true) || // just after createInputField() called.
            (td_cell_added == true) || // just after new <td> cell added.
            (job != arg.input.each_player[k].comingout)) {
          target_label.textContent == '';
          target.textContent == '';
          result_label.textContent == '';
          result.textContent == '';
          if (job == "占い") {
            // deducer: target (alive player list)
            target_label.innerText = '占い先';
            target.removeAttribute('disabled');
            player_list.forEach(function(v){
              if ((i <= 2) ||
                  (arg.log[String(i-1) + "日目の朝となりました。"].players[v].stat == "（生存中）")) {
                var o = document.createElement('option');
                o.setAttribute("value", v);
                o.innerText = v;
                target.insertAdjacentElement('beforeend', o);
              }
            });

            // deducer: result
            result_label.innerText = '結果';
            result.removeAttribute('disabled');
            seer_result.forEach(function(v){
              var o = document.createElement('option');
              o.setAttribute("value", v);
              o.innerText = v;
              result.insertAdjacentElement('beforeend', o);
            });
          } else if (job == "霊能") {
            // deducer: target (fixed string from voted player list)
            target.setAttribute('disabled', 'disabled');
            result.setAttribute('disabled', 'disabled');
            if (i >= 3) {
              target_label.innerText = '吊り先';
              voted_player = arg.log[datestring].list_voted[0];
              var o = document.createElement('option');
              o.setAttribute("value", voted_player);
              o.innerText = voted_player;
              target.insertAdjacentElement('beforeend', o);
              target.value = voted_player;

              // deducer: result
              result_label.innerText = '結果';
              result.removeAttribute('disabled');
              medium_result.forEach(function(v){
                var o = document.createElement('option');
                o.setAttribute("value", v);
                o.innerText = v;
                result.insertAdjacentElement('beforeend', o);
              });
            }
          } else if (job == "狩人") {
            // deducer: target (all player list)
            if (i >= 3) {
              target_label.innerText = '護衛先';
              target.removeAttribute('disabled');
              player_list.forEach(function(v){
                var o = document.createElement('option');
                o.setAttribute("value", v);
                o.innerText = v;
                target.insertAdjacentElement('beforeend', o);
              });
            }

            // deducer: result (fixed string from bitten player list)
            if (i >= 3) {
              result_label.innerText = '噛み先';
              result.setAttribute('disabled', 'disabled');
              var bitten_players;
              if (arg.log[datestring].list_bitten.length == 0) {
                bitten_players = "（なし）";
              } else {
                bitten_players = arg.log[datestring].list_bitten.join("\n");
              }
              var o = document.createElement('option');
              o.setAttribute("value", bitten_players);
              o.innerText = bitten_players;
              result.insertAdjacentElement('beforeend', o);
              result.value = bitten_players;
            }
          } else { // if (job == "村人" || job == "共有" || job == "猫又")
            // deducer: target (alive player list)
            target.setAttribute('disabled', 'disabled');

            // deducer: result (fixed string from all player list)
            result.setAttribute('disabled', 'disabled');
          }
          if (((is_initialize == true) ||
               (td_cell_added == true)) &&
              ((arg.input != null) &&
               (arg.input.each_player[k][datestring] != null))) {
            target.value = arg.input.each_player[k][datestring].target;
            result.value = arg.input.each_player[k][datestring].result;
          }
        }

        // deducer: comments
        var datekey = datearray[i-1];
        var c = 0;
        arg.log[datekey].comments.forEach(function(h){
          if ( k == h.speaker ) {
            c = c + 1;
          }
        });
        count.innerText = "発言 "+String(c);

        // deducer: set background color
        if (Object.keys(villager_cell_info.villager_gray).indexOf(k) != -1) {
          document.getElementById('villager-' + k).setAttribute('class', 'gray');
        } else if ((Object.keys(villager_cell_info.villager_black).indexOf(k) != -1) ||
                   (Object.keys(villager_cell_info.villager_panda).indexOf(k) != -1)) {
          document.getElementById('villager-' + k).setAttribute('class', 'black');
        } else // white or job ComingOut
          document.getElementById('villager-' + k).setAttribute('class', 'white');

      } else {
        if (target != null) { target.remove(); };
        if (result != null) { result.remove(); };
        if (count  != null) { count.remove(); };

        // case 2.
        //   Dead Reason.
        // case 3.
        //   Empty.
        if ((i <= 2) ||
            (arg.log[datearray[i-2]].players[k].stat == "（生存中）")) {
          // deducer: nop with target : disabled with no value

          // deducer: result (dead reason)
          if (arg.log[datestring].list_voted.indexOf(k) >= 0) {
            dead_reason.innerText = "吊り";
          } else if (arg.log[datestring].list_bitten.indexOf(k) >= 0) {
            dead_reason.innerText = "噛み";
          } else if (arg.log[datestring].list_dnoted.indexOf(k) >= 0) {
            dead_reason.innerText = "死体";
          } else {
            dead_reason.innerText = "突然死";
          }

          // deducer: set background color if Dead
          document.getElementById('villager-' + k).setAttribute('class', 'dead');
        } else {
          // deducer: nop : target and result is disabled with no value
          dead_reason.innerText = "";
        }
      }
    }
  });

  return;
}

function createInputField(arg, base_date) {
// functional input  : JSON from Web Storage API (input key must be refreshed)
// functional output : -
// Another output    : inner table of <div id="deduce" />
//     it must not include any <div /> tag.
  var ret = document.createElement('table');
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
  //    <tr>
  //      <td>villagers</td><td>day x (link to log)</td>
  //    </tr>
  //  </thead>
  var ret_head     = document.createElement('thead');
  var tr_title     = document.createElement('tr');
  tr_title.setAttribute('id', 'deducer-title');
  td_day0title = document.createElement('td');
  td_day0title.innerText = '　';
  a_linktosummary = document.createElement('a');
  a_linktosummary.setAttribute('id', 'summary');
  a_linktosummary.setAttribute('href', '#');
  a_linktosummary.innerText = "状況";
  td_day0title.insertAdjacentElement('afterbegin', a_linktosummary);
  a_linktovote = document.createElement('a');
  a_linktovote.setAttribute('id', 'vote');
  a_linktovote.setAttribute('href', '#');
  a_linktovote.innerText = "投票";
  td_day0title.insertAdjacentElement('beforeend', a_linktovote);
  tr_title.insertAdjacentElement('beforeend', td_day0title);

  var td_day1title = document.createElement('td');
  td_day1title.setAttribute('id', 'deducer-title-1');
  td_day1title.setAttribute('colspan', '3');

  var a_day1title  = document.createElement('a');
  a_day1title.setAttribute('id', 'date-log-1');
  a_day1title.setAttribute('href', '#');
  a_day1title.innerText = "１日目";
  td_day1title.insertAdjacentElement('afterbegin', a_day1title);

  tr_title.insertAdjacentElement('beforeend', td_day1title);

  ret_head.insertAdjacentElement('beforeend', tr_title);
  //  <tbody>
  //    <tr>
  //      <td>[icon]villager_name</td><td>[input][input]comment_count</td>
  //    </tr>
  //  </tbody>
  var ret_body  = document.createElement('thead');
  player_list.forEach(function(k){
    var tr          = document.createElement('tr');
    tr.setAttribute('id', 'villager-list-' + k);

    //// process 1: add villager_list into 1st col
    var td_villager = document.createElement('td');
    td_villager.setAttribute('id', 'villager-' + k);

    // villager_list: add character-name in mid.
    var a_villager  = document.createElement('a');
    a_villager.setAttribute('id', 'all-day-log-' + k.trim());
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

    // deducer: Comments
    var td_a = document.createElement('td');
    var comment_count_day1 = document.createElement('p');
    comment_count_day1.setAttribute('id', 'stat-' + k + '-1-count');
    comment_count_day1.innerText = '0';
    td_a.insertAdjacentElement('beforeend', comment_count_day1);
    tr.insertAdjacentElement('beforeend', td_a);

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

    ret_body.insertAdjacentElement('beforeend', tr);
  });

  ret.insertAdjacentElement('beforeend', ret_head);
  ret.insertAdjacentElement('beforeend', ret_body);
  document.getElementById("deduce").textContent = '';
  document.getElementById("deduce").insertAdjacentElement('afterbegin', ret);

  // restore update setting
  if ((arg.input != null) &&
      (arg.input.each_player != null)) {
    Object.keys(arg.input.each_player).forEach(function(k){
      // 参加者別の情報
      document.getElementById('job-' + k).value = arg.input.each_player[k].comingout; // deduced Job
      document.getElementById('mrk-' + k).value = arg.input.each_player[k].enemymark; // Monster Mark
    });
  }

  return;
};
