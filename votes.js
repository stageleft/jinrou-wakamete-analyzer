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
        tr.insertAdjacentElement('beforeend', td);

        body.insertAdjacentElement('beforeend', tr);
      });
    }

    // set 2nd..Nth td (vote to-person)
    arg.log[datestr].vote_log.forEach(function(l, j){
      var vote_title = arg.log[datestr].vote_log[j].title + '（' + String(j + 1) + '回目）';
      var tr = head.querySelector('#vote-day');
      var td = document.createElement('td');
      td.innerText = vote_title;
      tr.insertAdjacentElement('beforeend', td);
      head.insertAdjacentElement('beforeend', tr);

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
        var tr = body.querySelector('#vote-from-' + from_person);

        // <td><b>ｽｺﾞｲｶﾀｲｱｲｽ</b>さん</td><td>0 票</td><td>投票先 → <b>結城蜜柑</b>さん</td>
        // ｽｺﾞｲｶﾀｲｱｲｽさん	0 票	投票先 → 結城蜜柑さん
        var td = document.createElement('td');
        if (vote_count[from_person] == null) {
          vote_count[from_person] = 0;
        }
        td.setAttribute('alt', from_person + "さん\t" + vote_count[from_person] +" 票\t投票先 → " + to_person + "さん");
        td.innerText = "(" + vote_count[from_person] + "票)→" + f.to_villager + "(" + vote_count[to_person] + "票)";
        tr.insertAdjacentElement('beforeend', td);

        body.insertAdjacentElement('beforeend', tr);
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
