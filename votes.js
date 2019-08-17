function updateVotes(arg) {
// Another output : HTML for <div id="vote-summary" /> tag
//     <tr id="vote-day"      ><td>----</td><td>...</td><td                       >dayX(1)</td><td>...</td></tr>
//     <tr                    ><td>....</td><td>...</td><td alt="dayX(1):....->..">.......</td><td>...</td></tr>
//     <tr id="vote-from-from"><td>from</td><td>...</td><td alt="dayX(1):from->to">  to   </td><td>...</td></tr>
//     <tr                    ><td>....</td><td>...</td><td alt="dayX(1):....->..">.......</td><td>...</td></tr>
  var ret = document.createElement('tbody');

  datearray = createDateArray(arg);
  for (var i = 0; i < datearray.length; i++) {
    var datestr = datearray[i];
    if ((arg.log[datestr] == null) ||
        (arg.log[datestr].vote_log == null) || 
        (arg.log[datestr].vote_log.length == 0)) {
      continue;
    }

    // set tr and 1st td (vote from-person)
    if (ret.querySelector('tr') == null) {
      var tr = document.createElement('tr');
      tr.setAttribute('id', 'vote-day');

      var td = document.createElement('td');
      tr.insertAdjacentElement('beforeend', td);

      ret.insertAdjacentElement('beforeend', tr);

      var l = arg.log[datestr].vote_log[0];
      l.vote.forEach(function(f){
        var tr = document.createElement('tr');
        tr.setAttribute('id', 'vote-from-' + f.from_villager.trim());

        var td = document.createElement('td');
        td.innerText = f.from_villager;
        tr.insertAdjacentElement('beforeend', td);

        ret.insertAdjacentElement('beforeend', tr);
      });
    }

    // set 2nd..Nth td (vote to-person)
    arg.log[datestr].vote_log.forEach(function(l, j){
      var vote_title = arg.log[datestr].vote_log[j].title + '（' + String(j + 1) + '回目）';
      var tr = ret.querySelector('#vote-day');
      var td = document.createElement('td');
      td.innerText = vote_title;
      tr.insertAdjacentElement('beforeend', td);
      ret.insertAdjacentElement('beforeend', tr);

      // 票数計算
      var vote_count = {}; // { "to-person":getting-vote-count, "to":count, ...}
      l.vote.forEach(function(f){
        var to_person = f.to_villager.trim();
        if (vote_count[to_person] == null) {
          vote_count[to_person] = 1;
        } else {
          vote_count[to_person] = vote_count[to_person] + 1;
        }
      });

      // 表示に反映
      l.vote.forEach(function(f){
        var from_person = f.from_villager.trim();
        var to_person = f.to_villager.trim();
        var tr = ret.querySelector('#vote-from-' + from_person);

        // <td><b>ｽｺﾞｲｶﾀｲｱｲｽ</b>さん</td><td>0 票</td><td>投票先 → <b>結城蜜柑</b>さん</td>
        // ｽｺﾞｲｶﾀｲｱｲｽさん	0 票	投票先 → 結城蜜柑さん
        var td = document.createElement('td');
        if (vote_count[from_person] == null) {
          td.setAttribute('alt', from_person + "さん\t0 票\t投票先 → " + to_person + "さん");
        } else {
          td.setAttribute('alt', from_person + "さん\t" + vote_count[from_person] +" 票\t投票先 → " + to_person + "さん");
        }
        td.innerText = f.to_villager + "（" + vote_count[to_person] + "票）";
        tr.insertAdjacentElement('beforeend', td);

        ret.insertAdjacentElement('beforeend', tr);
      });
    });

  }

  var table = document.createElement('table');
  table.insertAdjacentElement('beforeend', ret);
  document.getElementById('vote-summary').textContent = '';
  document.getElementById('vote-summary').insertAdjacentElement('afterbegin', table);
  return;
};
