// function.js 関数群
// style:
//   json_data = function(text_data)
//   html_data = function(json_data)
//   json_data = function(json_data)


function html2json_villager_log_1day(arg) {
// input  : HTMLCollction
//          <table width="770" cellspacing="5"><tbody> ... </tbody></table>
// output : Hash
//          {
//            number:
//            title:
//            date: 
//            messages:
//            player:
//            comments:
//            vote:
//          }
  var ret = {};

  var base_table   = arg.querySelector("table").querySelector("tbody");
  var base_tr_list = base_table.querySelectorAll("tr");
  for (var i = 0 ; i < base_tr_list.length ; i++) {
    if (base_tr_list.item(i).innerText == "ブラウザの更新ボタンは押さないでください") {
      // nop : caution to player
    } else if (base_tr_list.item(i).innerText.match("^◆ 村人たち")) {
      // nop : tag
    } else if (base_tr_list.item(i-1).innerText.match("^◆ 村人たち")) {
      // parse sub <table> as villager_list
      ret.player = html2json_villager_list(base_tr_list.item(i).querySelector("table")).player;
    } else if (base_tr_list.item(i).innerText.match("^◆ 再表示")) {
      // nop : tag
    } else if (base_tr_list.item(i-1).innerText.match("^◆ 再表示")) {
      // nop : control
    } else if (base_tr_list.item(i).innerText.match("^◆ 出来事")) {
      // nop : tag
    } else if (base_tr_list.item(i-1).innerText.match("^◆ 出来事")) {
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
      // ignore another than <font> and <table> (village titie and other informations).
      // extract 
      var base_font_list = base_tr_list.item(i).querySelectorAll("font");
      ret.title    = base_font_list.item(0).innerText;
      ret.date     = base_font_list.item(1).innerText;
      // parse sub <table> as village_log
      var village_log = html2json_village_log(base_tr_list.item(i).querySelector("table"));
      ret.comments = village_log.comments;
      ret.messages = village_log.messages;
      ret.vote_log = village_log.vote;
      // console.log(JSON.stringify(village_log));
    } else if (base_tr_list.item(i).innerText.match("^◆ 幽霊の間")) {
      // nop : tag
    } else if (base_tr_list.item(i-1).innerText.match("^◆ 幽霊の間")) {
      // nop : tag
    } else if (base_tr_list.item(i).innerText.match("^戻る")) {
      // nop : information to player
    } else {
      // nop : maybe <tr> tag in sub <table>.
    }
  }

  var base_input_list = base_table.querySelectorAll("input");
  for (i = 0 ; i < base_input_list.length ; i++) {
    if (base_input_list.item(i).name == "VILLAGENO") {
      // get village number from below tag.
      //   <input type="hidden" name="VILLAGENO" value="153063">
      ret.number = base_input_list.item(i).value;
    } else {
      // nop : information to system.
      //    <input type="hidden" name="TXTPNO" value="60">
      //    <input type="hidden" name="TXTPASS" value="">
      //    <input type="hidden" name="TXTLOGIN" value="2">
      //    <input type="hidden" name="FORMID" value="441975">
    }
  }

  return ret;
};

function html2json_villager_list(arg) {
// input  : HTMLCollction
//          <tbody> ... </tbody> of <table class="CLSTABLE"></table>
// output : Hash
//            player: [
//              { cn:value, icon:value, stat:value },
//              { cn:value, icon:value, stat:value },
//              ...
//            ]
//           stat:value : "（生存中）" or "（死　亡）"
  var ret = [];

//  console.log(arg.innerHTML); // debug

  var base_td_list = arg.querySelectorAll("td");
  for (var i = 0 ; i < base_td_list.length ; i = i + 2) {
    // style of base_td_list.item(i)  :
    //   <img src="link of image" title="comment of player"><br>
    var img_src;
    // style of base_td_list.item(i+1):
    //   character name<br>
    //   <b>player name (with TRIP)</b><br> (option)
    //   [character JOB]<br>                (option)
    //   （Alive Status）
    // ignore player name, JOB.
    var character_name;
    var is_alive;

    // get info of base_td_list.item(i)
    img_selector = base_td_list.item(i).querySelector("img");
    if (img_selector != null) {
      img_src        = img_selector.getAttribute("src");

      // get info of base_td_list.item(i+1)
      var character_info = String(base_td_list.item(i+1).innerHTML).split('<br>');
      character_name = character_info[0];
      is_alive       = character_info[character_info.length - 1];

      // create Hash and add to Array
      var r = { cn:character_name , icon:img_src , stat: is_alive };
      ret.push(r);
    }
  }

  return { player: ret };
}

function html2json_village_log(arg) {
// input  : HTMLCollction
//          <tbody> ... </tbody> of <table table cellpadding="0"></table>
// output : Hash
//            comments: [
//              { speaker:value, type:value, comment:[value_with_each_line] },
//              ...
//            ],
//            messages: [
//              { comment:value },
//              ...
//            ],
//            vote : <from html2json_vote_result()>
//           type:value : "Normal" or "Strong" or "WithColor"
  var cmts = [];
  var msgs = [];
  var vote_result = null;

  // console.log(arg.innerHTML); // debug

  var base_tr_list = arg.querySelectorAll("tr");
  for (var i = 0 ; i < base_tr_list.length ; i++) {
    var base_td_list = base_tr_list.item(i).querySelectorAll("td");
    if (base_td_list.length == 1) {        // system message
      msgs.push(base_td_list.item(0).innerText);
    } else if (base_td_list.length == 2) { // villager comment
      var villager  = base_td_list.item(0).querySelector("b").innerText;
      var v_comment = String(base_td_list.item(1).innerHTML).replace(/^「/,"").replace(/」$/,"").split('<br>');
      var v_comtype = "Normal";
      if (base_td_list.item(1).querySelector("font") != null) {
        if (base_td_list.item(1).querySelector("font").size == "+1") {
          v_comtype = "Strong";
        } else if (base_td_list.item(1).querySelector("font").size == "-1") {
          v_comtype = "WithColor";
        } else {
          v_comtype = "Unknown";
        }
      }
    } else {                               // vote
      vote_table = base_td_list.item(0).querySelector("table");
      if (vote_table != null) {            // vote table
        vote_result = html2json_vote_result(vote_table);
      } else {                             // inner tag in vote table
        // nop:
      }
    }

    cmts.push({ speaker: villager , comment : v_comment , type : v_comtype});
  }

  return { comments: cmts, messages: msgs, vote: vote_result };
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
  var ret = [];

  // console.log(arg.innerHTML); // debug

  var base_tr_list = arg.querySelectorAll("tr");
  for (var i = 0 ; i < base_tr_list.length ; i++) {
    // style <tr><td><b>from</b>さん</td><td>x 票</td><td>投票先 → <b>to</b>さん</td>
    var from_person;
    var to_person
    var base_b_list = base_tr_list.item(i).querySelectorAll("b");
    from_person = base_b_list.item(0).innerText;
    to_person   = base_b_list.item(1).innerText;

    ret.push({ from_villager: from_person , to_villager : to_person });
  }

  return ret;
}
