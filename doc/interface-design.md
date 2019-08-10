わかめてサーバ→スクリプトメイン
  内容：村のログ（innerHTML）
  形式：JSON（key: log_html）
    log_html 形式：テーブル２重構造（外テーブル１枚＠全体、内テーブル２枚＠参加者リスト＆ログ本体）
      外テーブル：仕切り（村人リスト、submitアイテム、ログ、隠し要素、戻るボタン）

スクリプトメイン→Web Storage API
  代入方法 ：window.localStorage.setItem("wakamete_village_info", encodeURIComponent(JSON.stringify(value)));
  取得方法 ：value = Json.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")));
  キー(key)：wakamete_village_info
  値(value)：村全体（特定の村）のログおよび手入力情報。違う村のデータが入ったら全部クリア。形式は以下。
  village: {
    // 村
    village_number: "string",
    // ログ（日付別Hash）
    log: {
      "date-string":
        players: {
          "character-name": {
            icon:"icon_url(absolute URL)", 
            stat:"string, （生存中） or （死　亡）" 
          },
          "character-name": { icon:"", stat:"" },
          ...
        },
        comments: [
          {
            speaker:"string",
            comment:"string",
            type:"string, Normal or Strong or WithColor"
          },
          { speaker:"",  comment:"", type:"string" },
          ...
        ],
        msg_date:"date-string",
        list_voted:  [ "character-name", ... ],
        list_bitten: [ "character-name", ... ],
        list_dnoted: [ "character-name", ... ],
        list_sudden: [ "character-name", ... ],
        vote_log:, {
          "from_villager_name":"to_villager_name",
          "from_villager_name":"to_villager_name",
          "from_villager_name":"to_villager_name",
          ...
        }
      },
      "date-string": { player: , comments: , messages: , vote_log: },
      ...
    },
    input: {			// 手入力情報
        (T.B.D.)
        // 参加者別、役職CO、占い結果、霊能結果
        // 村別、配役情報、
        // （extend）日別、死体数別推定要因
    },
  }

ログ表示画面→（スクリプトメイン）→ログ抽出スクリプト
投票結果表示画面→（スクリプトメイン）→投票結果抽出スクリプト
投票結果表示画面→（スクリプトメイン）→死亡者・死因抽出スクリプト

配役情報入力画面→（スクリプトメイン）→まとめスクリプト
役職推定情報入力画面→（スクリプトメイン）→まとめスクリプト
  まとめはいつものとおり、占い軸のグレー、CO者、完グレ、生き残り、吊り（＆突然死）、噛み（＆死体）。
  追加として、霊能軸のグレーが欲しい。
  （extend）２死体の「猫噛み（猫または狼）」や「呪殺（狐または非人狼）」を取り扱えるか。


