function updateVotes(arg) {
// Another output : HTML for <div id="vote-summary" /> tag
//    <thead>
//     <tr id="vote-day"      ><td>----</td><td>...</td><td                       >dayX(1)</td><td>...</td></tr>
//    </thead>
//    <tbody>
//     <tr                    ><td>....</td><td>...</td><td alt="dayX(1):....->..">.......</td><td>...</td></tr>
//     <tr id="vote-from-from"><td>from</td><td>...</td><td alt="dayX(1):from->to">  to   </td><td>...</td></tr>
//     <tr                    ><td>....</td><td>...</td><td alt="dayX(1):....->..">.......</td><td>...</td></tr>
//    </tbody>
  function setColorClass(player_info){
    // 役職CO者の名前に色をつける
    if (player_info.enemymark == "人外") {
      return 'enemy';
    }
    if (player_info.enemymark == "人狼") {
      return 'werewolf';
    }
    if (player_info.enemymark == "狂人") {
      return 'posessed';
    }
    if (player_info.enemymark == "妖狐") {
      return 'werefox';
    }
    if (player_info.enemymark == "子狐") {
      return 'minifox';
    }
    if (player_info.comingout == "占い") {
      return 'seer';
    }
    if (player_info.comingout == "霊能") {
      return 'medium';
    }
    if (player_info.comingout == "狩人") {
      return 'bodyguard';
    }
    if (player_info.comingout == "共有") {
      return 'freemason';
    }
    if (player_info.comingout == "猫又") {
      return 'werecat';
    }
    return '';
  }
  var voted_title_list = [];
  var head = document.createElement('thead');
  var body = document.createElement('tbody');

  var datearray;
  var base_date; // unused
  [datearray, base_date] = createDateArray(arg);
  for (var i = 0; i < datearray.length; i++) {
    var datestr = datearray[i];
    if ((arg.log[datestr] == null) ||
        (arg.log[datestr].vote_log == null) || 
        (arg.log[datestr].vote_log.length == 0)) {
      continue;
    }

    // set tr and 1st td (vote from-person)
    if (head.querySelector('tr') == null) {
      var tr = document.createElement('tr');
      tr.setAttribute('id', 'vote-day');

      var td = document.createElement('td');
      tr.insertAdjacentElement('beforeend', td);

      head.insertAdjacentElement('beforeend', tr);
    }
    if (body.querySelector('tr') == null) {

      Object.keys(arg.log[base_date].players).forEach(function(f){
        if (f == "初日犠牲者") return;

        var tr = document.createElement('tr');
        tr.setAttribute('id', 'vote-from-' + f);

        var td = document.createElement('td');
        td.innerText = f;
        td.className = setColorClass(arg.input.each_player[f]);
        tr.insertAdjacentElement('beforeend', td);

        body.insertAdjacentElement('beforeend', tr);
      });
    }

    // set 2nd..Nth td (vote to-person)
    function proc_set_vote_date(vote_title){
      var tr = head.querySelector('#vote-day');
      var td = document.createElement('td');
      td.innerText = vote_title;
      tr.insertAdjacentElement('beforeend', td);
      return tr;
    }
    // 票数計算
    function proc_vote_count(list) {
      var ret = {}; // { "to-person":getting-vote-count, "to":count, ..., "to":count, "is_gray_random":true/false, "voted_count_max":count}
      list.vote.forEach(function(f){
        var to_person = f.to_villager.trim();
        if (ret[to_person] == null) {
          ret[to_person] = 1;
        } else {
          ret[to_person] = ret[to_person] + 1;
        }
      });
      // グレラン情報の抽出
      // 手順１（前提）最多得票者の得票数を数える。
      ret['voted_count_max'] = 0;
      Object.keys(ret).forEach(function(f){
        if (ret['voted_count_max'] <= ret[f]) {
          ret['voted_count_max'] = ret[f];
        }
      });
      // 手順２（前提）グレランか否かを擬似的に判断する。
      // 最多得票者が「総得票数の半分未満」であることをもって、機械的にグレランと決めつける。
      if (ret['voted_count_max'] < (list.vote.length / 2)) {
        ret['is_gray_random'] = true;
      } else {
        ret['is_gray_random'] = false;
      }
      return ret;
    }
    // 表示用セル作成
    function proc_set_vote_result(f, vote_count){
      var from_person = f.from_villager.trim();
      var to_person = f.to_villager.trim();
      // TODO: replace元の文字クラスを特定する。 issue #104 クローズ後の残件であり、１文字ごとにissue化する。
      var tr = body.querySelector('#vote-from-' + from_person.replace(/([\.:+])/g, '\\$1'));

      // <td><b>ｽｺﾞｲｶﾀｲｱｲｽ</b>さん</td><td>0 票</td><td>投票先 → <b>結城蜜柑</b>さん</td>
      // ｽｺﾞｲｶﾀｲｱｲｽさん	0 票	投票先 → 結城蜜柑さん
      var td = document.createElement('td');
      if (vote_count[from_person] == null) {
        vote_count[from_person] = 0;
      }

      td.setAttribute('alt', from_person + "さん\t" + vote_count[from_person] +" 票\t投票先 → " + to_person + "さん");
      td.innerText = "(" + vote_count[from_person] + "票)→" + f.to_villager + "(" + vote_count[to_person] + "票)";
      td.className = setColorClass(arg.input.each_player[from_person]);
      if (vote_count.is_gray_random == true) {
        // グレランの場合に、セルに色をつける
        if (td.className === '' && vote_count[to_person] == vote_count['voted_count_max'] && vote_count[from_person] == 0){
          // 役職CO者以外、かつ、吊られ者に投票した人、かつ、得票0票者
          td.className = 'gray_random_voted_killer_with_no_voted';
        } else if (td.className === '' && vote_count[to_person] == vote_count['voted_count_max']){
          // 役職CO者以外、かつ、吊られ者に投票した人
          td.className = 'gray_random_voted_killer';
        } else if (td.className === '' && vote_count[from_person] == 0) {
          // 役職CO者以外、かつ、得票0票者
          td.className = 'gray_random_no_voted';
        } else {
          // その他
          td.className = td.className + ' gray_random';
        }
      }
      tr.insertAdjacentElement('beforeend', td);
      return tr;
    }
    arg.log[datestr].vote_log.forEach(function(l, j){
      var vote_title = arg.log[datestr].vote_log[j].title + '（' + String(j + 1) + '回目）';
      if (voted_title_list.includes(vote_title) == true) {
        return; // contiune arg.log[datestr].vote_log.forEach()
      }
      voted_title_list.push(vote_title);

      head.insertAdjacentElement('beforeend', proc_set_vote_date(vote_title));
      var vote_count = proc_vote_count(l);
      l.vote.forEach(function(f){
        body.insertAdjacentElement('beforeend', proc_set_vote_result(f, vote_count));
      });
    });
  }

  var table = document.createElement('table');
  table.insertAdjacentElement('beforeend', head);
  table.insertAdjacentElement('beforeend', body);
  document.getElementById('vote-summary').textContent = '';
  document.getElementById('vote-summary').insertAdjacentElement('afterbegin', table);
  return;
};
