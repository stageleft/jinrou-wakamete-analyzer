var base_date = "１日目の夜となりました。";
//var base_date = "１日目の朝となりました。"; //debug
//var base_date = "「人　狼」の勝利です！"; //debug
//var base_date = "「村　人」の勝利です！"; //debug

var job_list = ["村人","占い","霊能","狩人","共有","猫又"];
var mob_list = ["村人","人外","人狼","狂人","妖狐","子狐"];
var seer_result = ["","○","●"];
var medium_result = ["","○","●","△"];


function updateInput(arg) {
// functional input  : JSON from Web Storage API
// Another input     : inner table of <div id="deduce" />
// functional output : JSON
//     'input' key of Web Storage API style
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

  var date_count = 0;
  Object.keys(arg.log).forEach(function(d){
    if (d.match("朝となりました。$")) {
      date_count = date_count + 1;
    }
  });

  ret.each_player = new Object();
  Object.keys(arg.log[base_date].players).forEach(function(k){
    // 参加者別の情報
    var job = document.getElementById('job-' + k); // deduced Job
    var mrk = document.getElementById('mrk-' + k); // Monster Mark
    if ((job == null) || (mrk == null)) {
      return null;
    }
    ret.each_player[k] = new Object();
    ret.each_player[k].comingout = job.value;
    ret.each_player[k].enemymark = mrk.value;
    // 参加者別×日別の情報
    for (var i = 1; i < date_count; i++) {
      var datestr = String(i+1) + "日目の朝となりました。"
      ret.each_player[k][datestr] = new Object();
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
  var player_list = Object.keys(arg.log[base_date].players);

  if (document.getElementById("deduce").textContent == '') {
    createInputField(arg);
    return;
  };

  document.getElementById('all_villager').value = arg.input.player_count;
  document.getElementById('job_villager').value = arg.input.villager_count;

  var date_count = 0;
  Object.keys(arg.log).forEach(function(d){
    if (d.match("朝となりました。$")) {
      date_count = date_count + 1;
    }
  });

  // preprocess: calcurate seer-info and gray-info
  var seer_co       = new Object();
  var villager_gray  = new Object();
  var villager_white = new Object(); // white, coming-out
  var villager_black = new Object(); // black, panda, non-villager
  Object.keys(arg.input.each_player).forEach(function(k){
    var input_mrk = arg.input.each_player[k].enemymark;
    var input_job = arg.input.each_player[k].comingout;

    if (input_mrk == "村人") {
      if (input_job == "占い") {
        seer_co[k]        = arg.input.each_player[k];
        villager_white[k] = arg.input.each_player[k];
      } else if (input_job == "村人") {
        villager_gray[k]  = arg.input.each_player[k];
      } else {
        villager_white[k] = arg.input.each_player[k];
      }
    } else {
      villager_black[k] = arg.input.each_player[k];
    }
  });
  Object.keys(seer_co).forEach(function(k){
    Object.keys(arg.log).forEach(function(d){
      if (d.match("^\\d+日目の朝となりました。$")) {
        var target = arg.input.each_player[k][d].target;
        var result = arg.input.each_player[k][d].result;

        if (result == "○") {
          if (Object.keys(villager_gray).indexOf(target) != -1) {
            delete villager_gray[target];
            villager_white[target] = arg.input.each_player[k];
          }
        } else if (result == "●") {
          if (Object.keys(villager_gray).indexOf(target) != -1) {
            delete villager_gray[target];
            villager_black[target] = arg.input.each_player[k];
          } else if (Object.keys(villager_white).indexOf(target) != -1) {
            delete villager_white[target];
            villager_black[target] = arg.input.each_player[k];
          }
        } else { // if (result == "")
          // nop
        }
      }
    });
  });

  // add <td> cell to title if not exist
  var tds_title   = document.getElementById('deducer-title').querySelectorAll('td');
  for (var i = tds_title.length ; i <= date_count ; i++) {
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

  player_list.forEach(function(k){
    var tr = document.getElementById('villager-list-'+k);
    var job = document.getElementById('job-' + k).value; // deduced Job
    var mrk = document.getElementById('mrk-' + k).value; // Monster Mark


    // process 1 : add <td> cell if not exist
    for (var i = tds_title.length ; i <= date_count ; i++) {
      var td_a = document.createElement('td');
      var count = document.createElement('p');
      var dead_reason = document.createElement('p');
      count.setAttribute('id', 'stat-' + k + '-' + String(i) + '-count');
      dead_reason.setAttribute('id', 'stat-' + k + '-' + String(i) + '-dead_reason');
      td_a.insertAdjacentElement('beforeend', count);
      td_a.insertAdjacentElement('beforeend', dead_reason);
      tr.insertAdjacentElement('beforeend', td_a);

      var td_b = document.createElement('td');
      var target = document.createElement('select');
      target.setAttribute('id', 'stat-' + k + '-' + String(i) + '-target');
      target.setAttribute('disabled', 'disabled');
      td_b.insertAdjacentElement('beforeend', target);
      tr.insertAdjacentElement('beforeend', td_b);

      var td_c = document.createElement('td');
      var result = document.createElement('select');
      result.setAttribute('id', 'stat-' + k + '-' + String(i) + '-result');
      result.setAttribute('disabled', 'disabled');
      td_c.insertAdjacentElement('beforeend', result);
      tr.insertAdjacentElement('beforeend', td_c);
    }

    // process 2 : add day1 comment count into <td> cell
    var datekey = "１日目の朝となりました。";
    var c = 0;
    arg.log[datekey].comments.forEach(function(h){
      if ( k == h.speaker ) {
        c = c + 1;
      }
    });
    document.getElementById('stat-' + k + '-1-count').innerText = "発言 "+String(c);

    // process 3 : add inner value into <td> cell
    for (var i = 2 ; i <= date_count ; i++) {
      var datestring = String(i) + "日目の朝となりました。";
      var alive_status = arg.log[datestring].players[k].stat;
      var target      = document.getElementById('stat-' + k + '-' + String(i) + '-target');
      var result      = document.getElementById('stat-' + k + '-' + String(i) + '-result');
      var count       = document.getElementById('stat-' + k + '-' + String(i) + '-count');
      var dead_reason = document.getElementById('stat-' + k + '-' + String(i) + '-dead_reason');

      // case 1.
      //   Job-target
      //   Job-result
      //   Comments
      if (alive_status == "（生存中）") {
        if (dead_reason != null) { dead_reason.remove(); };

        if ((null == arg.input.each_player[k]) ||
            (job != arg.input.each_player[k].comingout)) {
          target.textContent == '';
          result.textContent == '';
          if (job == "占い") {
            // deducer: target (alive player list)
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
              voted_player = arg.log[datestring].list_voted[0];
              var o = document.createElement('option');
              o.setAttribute("value", voted_player);
              o.innerText = voted_player;
              target.insertAdjacentElement('beforeend', o);
              target.value = voted_player;

              // deducer: result
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
        }

        // deducer: comments
        var datekey = String(i) + "日目の朝となりました。"
        var c = 0;
        arg.log[datekey].comments.forEach(function(h){
          if ( k == h.speaker ) {
            c = c + 1;
          }
        });
        count.innerText = "発言 "+String(c);

        // deducer: set background color
        if (Object.keys(villager_gray).indexOf(k) != -1) {
          document.getElementById('villager-' + k).setAttribute('class', 'gray');
        } else if (Object.keys(villager_white).indexOf(k) != -1) {
          document.getElementById('villager-' + k).setAttribute('class', 'white');
        } else if (Object.keys(villager_black).indexOf(k) != -1) {
          document.getElementById('villager-' + k).setAttribute('class', 'black');
        }

      } else {
        if (target != null) { target.remove(); };
        if (result != null) { result.remove(); };
        if (count  != null) { count.remove(); };

        // case 2.
        //   Dead Reason.
        // case 3.
        //   Empty.
        if ((i <= 2) ||
            (arg.log[String(i-1) + "日目の朝となりました。"].players[k].stat == "（生存中）")) {
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
          if (dead_reason != null) { dead_reason.remove(); };
          // deducer: nop : target and result is disabled with no value
        }
      }
    }
  });

  if (arg.log[String(date_count)+"日目の夜となりました。"] == null) {
    // case if (1) daytime (2) before-play (3) after-play
    
  } else {
    // case if (4) nighttime
    // nop : have suited column.
  }

  Object.keys(arg.log[base_date].players).forEach(function(k){
    if ((document.getElementById('job-' + k) == null) ||
        (document.getElementById('mrk-' + k) == null)) {
      createInputField(arg);
    }
  });
  return;
}

function createInputField(arg) {
// functional input  : JSON from Web Storage API (input key must be refreshed)
// functional output : -
// Another output    : inner table of <div id="deduce" />
//     it must not include any <div /> tag.
  var ret = document.createElement('table');
  var player_list = Object.keys(arg.log[base_date].players);

  // update Table
  if (arg.input != null) {
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
  a_linktovote = document.createElement('a');
  a_linktovote.setAttribute('id', 'vote');
  a_linktovote.setAttribute('href', '#');
  a_linktovote.innerText = "（参考）投票まとめ";
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
  return;
};
