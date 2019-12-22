# 使い方

1. ログ取得する。   
   Firefox の about:debugging → 左メニュー「このFirefox」 → 拡張機能・Jinrou wakamete analyzer の「調査」   
   ストレージ → ローカルストレージ → wakamete_village_raw_log → パース済みの値 → 村番号 → 日付のログ   
   を各々コピー、テキストファイルに保存する。
   サンプル： sample/\*_org/\*.txt
1.  ログを整形する。   
   取得したログは、 "日付文字列":"<村の状況のtableタグ>" の形式である。これを、以下形式のHTMLファイルに手動で変換する。
```
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=shift_jis">
</head>
<body link="#ffcc00" vlink="#ffcc00" alink="#ffcc00">
<form action="変換後のファイル名.html" method="POST" name="form">
<村の状況のtableタグ>
</form>
</body>
</html>
```   
   サンプル： sample/\*/\*.html   
   注意点としては、form タグのファイル名を直すことと、最後の " を取り忘れないこと。   
   整形・リネームしたファイルは、 sample/ 以下に置くこと。理由は manifest.json を参照。
1.  ログを使用する
   作成したログを各々ブラウザで見る。
   Githubのrawデータとしては見れないっぽい。

# サンプル説明

## sample/153535/\*.html

http://jinrou.dip.jp/~jinrou/kako/153535.html 【モバマス】年の瀬村 より、共有者のログ。

2日目のグレランで再投票のあるもの。 #56, #86, #98 あたりの問題に引っかかる。

## sample/153538/\*.html

http://jinrou.dip.jp/~jinrou/kako/153538.html 【モバマス】今のはメラゾーマではない・・村 より、狂人のログ。

CN「CV:若本規夫」「e+」の2名が、 #104 の問題に引っかかる。

# （参考）サンプル以外に確認しておきたいログ

* http://jinrou.dip.jp/~jinrou/kako/49118.html それでも猫又大狼子狐村   
  猫又復活がある。
* http://jinrou.dip.jp/~jinrou/kako/125849.html 【黒バスRP必須】春の大狼収穫村   
  大狼入り。
* http://jinrou.dip.jp/~jinrou/kako/133828.html 大狼子狐猫又ダンガンロンパRP村   
  子狐入り。
* http://jinrou.dip.jp/~jinrou/kako/153281.html 【モバマス】異世界なろう系さいつよ主人公村
  CN「炎上夢見.net」が、 #104 の問題に引っかかる。
