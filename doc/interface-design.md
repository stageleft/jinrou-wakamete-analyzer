# わかめてサーバ→スクリプトメイン

* 内容：村のログ（innerHTML）
* 形式：JSON（key: log_html）
    * log_html 形式：テーブル２重構造（外テーブル１枚＠全体、内テーブル２枚＠参加者リスト＆ログ本体）  
      外テーブル：仕切り（村人リスト、submitアイテム、ログ、隠し要素、戻るボタン）

# スクリプトメイン←→Web Storage API

* 代入方法 ：window.localStorage.setItem("wakamete_village_info", encodeURIComponent(JSON.stringify(value)));
* 取得方法 ：value = Json.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_info")));
* キー(key)：wakamete_village_info
* 値(value)：村全体（特定の村）のログおよび手入力情報。誤入村対策に複数の村のデータを保持するが、多くなったら村番号の古いものからクリアしていく。形式は以下。
```
  village: {
    "village_number_string" : {  
      // 村
      village_number: "string", // "village_number_string" と同じ値を入れる。
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
          list_cursed: [ "character-name", ... ],
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
        // 村別、配役情報、
        villager_count: integer,
        player_count: integer,
        seer_count: integer,
        medium_count: integer,
        bodyguard_count: integer,
        freemason_count: integer,
        werecat_count: integer,
        werewolf_count: integer,
        posessed_count: integer,
        werefox_count: integer,
        minifox_count: integer,
        // 参加者別、役職CO、占い結果、霊能結果
        each_player:{
          "character-name": { comingout:"string",
                             enemymark:"string",
                             "date-string": { target: null or "string",
                                              result: null or "string",
                                              dead_reason: null or "string" },
                             "date-string": { target: , result: , dead_reason: },
                             ...
                           },
          "character-name": { comingout:, enemymark:, "date-string":, ... },
          ...
        },
      },    
    },
    "village_number_string":{ village_number:"", log:"", input:"" },
    ...
  }
```

* 代入方法 ：window.localStorage.setItem("wakamete_village_raw_log", encodeURIComponent(JSON.stringify(value)));
* 取得方法 ：value = Json.parse(decodeURIComponent(window.localStorage.getItem("wakamete_village_raw_log")));
* キー(key)：wakamete_village_raw_log
* 値(value)：取得した html_log。誤入村対策に複数の村のデータを保持するが、多くなったら村番号の古いものからクリアしていく。形式は以下。
```
  village: {
    "village_number_string" : {  
      // 村
      village_number: "string", // "village_number_string" と同じ値を入れる。
      // ログ（日付別Hash）
      log: {
        "date-string": JSON.stringify(html_log),
        ...
      },    
    },
    "village_number_string":{ village_number:"", log:"", input:"" },
    ...
  }
```

# スクリプトメイン→各種機能→各種画面

* 入力データ： JSON形式。 内容は上記 スクリプトメイン←→Web Storage API参照。
* 出力データ： HTML形式。画面を意味する `<div />` タグの中身として差し込む。
