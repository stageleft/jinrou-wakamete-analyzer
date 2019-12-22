＜使い方＞

(1) ログ取得する。

Firefox の about:debugging → 左メニュー「このFirefox」 → 拡張機能・Jinrou wakamete analyzer の「調査」

ストレージ → ローカルストレージ → wakamete_village_raw_log → パース済みの値 → 村番号 → 日付のログ

を各々コピー、テキストファイルに保存する。

サンプル： sample/*_org/*.txt

(2) ログを整形する。

取得したログは、 "日付文字列":"<村の状況のtableタグ>" の形式である。これを、以下形式のHTMLファイルに手動で変換する。

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

サンプル： sample/*/*.html

注意点としては、form タグのファイル名を直すことと、最後の " を取り忘れないこと。

(3) ログを使用する

  (2)で作成したログを各々ブラウザで見る。
  Githubのrawデータとしては見れないっぽい。

