# about Jinrou-Wakamete-Analyzer

Support tool for online "Are You a Werewolf?" game in Wakamete Server ( http://jinrou.dip.jp/~jinrou/ ).
You get easier to correct and analyze Chat Log.
It is Sidebar Plugins for Mozilla Firefox.

Firefoxのサイドバーを用いた、人狼ゲーム・わかめて鯖 http://jinrou.dip.jp/~jinrou/ 向けログリアルタイム分析ツール。

# Support Language

Japanese only, because Wakamete Server can support only Japanese.

わかめて鯖が日本語なので、日本語以外対応しません。あしからず。

# How to Install （どうやってインストールするの？）

## Install （普通にインストールする場合）

https://addons.mozilla.org/ja/firefox/addon/jinrou-wakamete-analyzer/ からインストールしてください。

## Install for your Development（自分でカスタマイズしたい場合）

1. 本ページ右上（右中？）の、「Clone or download」から、Download ZIP にてファイルをダウンロードする。
1. https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Packaging_and_installation の、
「ディスクから読み込む」セクションに従ってインストールする。  
   インストール完了後は、 about:debugging のページを閉じてよい。  
   なお、起動のたびにインストールする必要があるため、 about:debugging をブックマークするとよい。
1. 満足の行くカスタマイズができた場合、ご自身でカスタマイズしたパッケージをインストールできる。
    1. https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/Distribution を熟読する。
    1. manifest.json はご自身の情報に合わせて書き換える。 version と、 applications.gecko.id の書き換えは必須である。
    1. ファイル一式を zip 圧縮し、`*.xpi` ファイルとして保存する。
    1. https://addons.mozilla.org/ja/firefox/ にアクセスし、右上の「開発者センター」にアクセスする。あとは適宜。

# How to Use （どうやって使うの？）

1. サイドバーを表示し、「Go To 「汝は人狼なりや？」続わかめてエディション」をクリックし、同サイトのフレームなし版にアクセスする。

![インストール直後の状態](https://github.com/stageleft/jinrou-wakamete-analyzer/blob/master/doc/usage-1.png "インストール直後の状態")

1. 村民登録を行い、ゲームの開始を待つ。
  このとき、ツールの仕様の都合上、以下の注意点がある。

    1. 複数のウィンドウを開いてはいけない。
    1. 複数の画面で村を見てはいけない。

「観戦」、「ログイン → 旅人」あるいは、「過去ログ → 最近の記録」からログインした場合は、正しい表示とならない。
１日目昼から観戦している場合には、ツールの雰囲気がおおよそわかる状態にはなるので、村が立てば練習することは可能。

1. 村が始まったところで、サイドバーの上部に配役を入力する。  
   配役が入力されると、CO状況のまとめテキストがサイドバー下部に表示される。  
![サイドバーの状態「状況」](https://github.com/stageleft/jinrou-wakamete-analyzer/blob/master/doc/usage-2.png "サイドバーの状態「状況」")  
サイドバー下部をクリックすると、この表がサイドバー中央上部のメモエリアに追記される。    
サイドバー中央の推理表の左上、「状況」をクリックするとこの画面に戻る。

1. サイドバー中央の推理表の左上、「投票」をクリックすると、サイドバー下部にてこれまでの投票履歴を確認できる。  
![サイドバーの状態「投票」](https://github.com/stageleft/jinrou-wakamete-analyzer/blob/master/doc/usage-3.png "サイドバーの状態「投票」")  
サイドバー下部の投票結果表をクリックすると、クリックした投票のみがサイドバー中央上部のメモエリアに追記される。    

1. サイドバー中央の推理表の左側「村人名」または、上部「日付名」をクリックすると、サイドバー下部にてこれまでの発言履歴を確認できる。  
![サイドバーの状態「発言」](https://github.com/stageleft/jinrou-wakamete-analyzer/blob/master/doc/usage-4.png "サイドバーの状態「発言」")  
サイドバー下部の投票結果表をクリックすると、クリックした発言のみがサイドバー中央上部のメモエリアに追記される。    

1. サイドバー中央の推理表には、進行に応じてCO状況、人外の推理状況、占い・霊能・狩人護衛状況、を選択入力できる。  
※実際に村を走らせないと入力フィールドが出てこないので、画像なし。  
※1日目昼においては、CO状況の入力で不正となる仕様がある。

1. 村の進行に合わせてログは自動で取り込まれるが、サイドバー下部の各種情報の自動更新は周期が遅いので、必要に応じて手動で更新することが望ましい。  
    1. 自動更新中に文字を入力すると、入力した内容が壊れることがある。  
       自動更新を止めるためには、自動更新タイミングの前に、自ら更新する、発言を入力する、といった操作を行う。

# Modification （改造してよい？）

Mozilla Public License Version 2.0 に従った範囲で、自由に改造して、どうぞ。

具体的な使い方は、インストール方法の「Install for your Development（自分でカスタマイズしたい場合）」を参照願います。

# Special Thanks

* ｢汝は人狼なりや？｣続わかめてエディション サーバー管理者およびWiki管理者各位  
  http://jinrou.dip.jp/~jinrou/
* 「わかめてモバマス人狼」GMおよび参加者各位  
  https://twitter.com/mobamasjinrou  
  https://wikiwiki.jp/cinderejinro/

