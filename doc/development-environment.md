# 開発環境について

## エディタ：Visual Studio Code

要件は以下。

* Powershell にて create_xpi.ps1 を実行できること。

推奨する拡張機能は以下。

* エディタ補助
  * markdownlint
  * Render Line Endings
  * zenkaku
* 実行補助
  * Powershell
* GitHub管理補助
  * Git Graph
  * GitHub Pull Request and Issues

## 単体検査ツール jest

[Node.js](https://nodejs.org/ja/)  

URLよりダウンロード・インストール。 拡張機能一式（Chocolatey）のインストールも行う。

インストール：

```bash
npm init -y
npm install --save-dev jest
```

初期設定はコミット済み（packages.json）。

テストの実行：

```bash
npm run test
```

カバレッジの出力

```bash
npm test -- --coverage
```
