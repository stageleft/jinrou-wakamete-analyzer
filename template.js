function template_seer(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  var ret = [];

  // 本日（最新日）の日付
  var datearray;
  var base_date; // unused
  var today;
  [datearray, base_date] = createDateArray(arg);
  today = datearray[datearray.length - 1];

  var player_list = Object.keys(arg.log[today].players);
  player_list.forEach(function(k){
    if (arg.log[today].players[k].stat == "（生存中）") {
      ret.push("占いCO " + k + " ○●");
    }
  });
  return(ret.join("\n"));
}
function template_medium(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  var ret = [];

  // 日付情報
  var datearray;
  var base_date; // unused
  [datearray, base_date] = createDateArray(arg);

  datearray.forEach(function(d){
    arg.log[d].list_voted.forEach(function(k){
      ret.push(d.replace(/^(.*日目).*となりました。/, '$1') + "：" + k + " ○●△");
    });
  });
  ret.push("霊能CO");
  return(ret.reverse().join("\n"));
}
function template_bodyguard(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  var ret = [];

  // 日付情報
  var datearray;
  var base_date; // unused
  [datearray, base_date] = createDateArray(arg);
  today = datearray[datearray.length - 1];

  datearray.forEach(function(d){
    arg.log[d].list_bitten.forEach(function(k){
      ret.push(d.replace(/^(.*日目).*となりました。/, '$1') +" 護衛： 噛み：" + k);
    });
  });
  ret.push("狩人CO");
  return(ret.reverse().join("\n"));
}
function template_freemason(arg) {
  // functional input  : JSON from Web Storage API
  // functional output : String (as innerText of <div id="deduce-summary" />)
  var ret = [];

  // 本日（最新日）の日付
  var datearray;
  var base_date; // unused
  var today;
  [datearray, base_date] = createDateArray(arg);
  today = datearray[datearray.length - 1];
  var player_list = Object.keys(arg.log[today].players);

  player_list.forEach(function(k){
    if (arg.log[today].players[k].stat == "（生存中）") {
      if (arg.input.each_player[k].comingout == "村人") {
        ret.push("指定：" + k + " COありますか？");
      } else if (arg.input.each_player[k].comingout == "占い") {
        ret.push("指定：" + k + " LWCO|妖狐COありますか？");
        ret.push("占い指示：" + k + "は  占いでお願いします。予告は不要|投票|口頭でお願いします。");
      } else if (arg.input.each_player[k].comingout == "霊能") {
        ret.push("指定：" + k + " LWCO|妖狐COありますか？");
      } else if (arg.input.each_player[k].comingout == "狩人") {
        ret.push("指定：" + k + " LWCO|妖狐COありますか？");
        ret.push("護衛指示：" + k + "は  護衛でお願いします。");
      } else if (arg.input.each_player[k].comingout == "猫又") {
        ret.push("指定：" + k + " LWCO|妖狐COありますか？");
      }
    }
  });
  ret.push("占い指示：潜伏占いは  占いでお願いします。予告は不要|投票|口頭でお願いします。");
  ret.push("護衛指示：潜伏狩人は  護衛でお願いします。");
  return(ret.join("\n"));
}