// input  : String "n日目の朝となりました。"(n>=2) or other
// output : String "(n-1)日目の夜となりました。" or input
function logTag_d2n(key_day) {
  var d = parseInt(key_day);

  // day 2..N -> night 1..(N-1)
  if (d >= 2) {
    if (key_day == "2日目の朝となりました。") {
      return ("１日目の夜となりました。");
    } else if (key_day.match("朝となりました。$")) {
      return (String(d-1) + "日目の夜となりました。");
    }
  }

  // other than day 2..N
  return key_day;
}

module.exports = logTag_d2n;