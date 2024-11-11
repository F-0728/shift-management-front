# シフト管理ツール on Web

個人的な使いやすさを最優先に開発したシフト管理ツールです．同じような働き方をしている方には使いやすいと思います．

## Pros

- 職場ごとにシフト登録ができます
- 時給情報を登録しておくと自動計算します(時給変動にも対応)
- 8時間超過時の残業代計算にも対応できます
- 月毎/年毎，各職場別に給与，稼働時間集計をします
- 給与(課税対象)と交通費等を別々に集計できます
- シフトごとにリモート(交通費あり)/出社の切り替えができます

## Cons

- 日給，月給等の計算に対応していません(給与を手動入力する必要があります)
- 各種入力画面のデフォルト値は私が使いやすいように最適化されています(12:00〜13:00が固定休憩，など)
- 入力したシフトの更新・削除UIを作成していません(API側で直接編集する必要があります)
- 細かいUIの調整を入れていません
- 細かいクエリの最適化を入れていません
- コードの可読性を考えていません
- APIがlocalhostで立っていることを想定しています
- 環境のコンテナ化をしていません
