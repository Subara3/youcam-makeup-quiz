# メイク・パラメータ メモ（シチュ写真 × 気分メイク差分）

> 各シチュ写真に、感情ごとの `look`（= makeup-vto effects）を乗せて差分を作る。
> 画像キー: `<situation>_<emotion>.jpg`。intensity 0–100 / color #RRGGBB / texture はYouCamのテクスチャ名。
> `data.js` の LOOK / SITUATIONS から自動生成。

## 感情ベースのメイク（全シチュ共通の差分パラメータ）

### 🟡 喜 ── ツヤ・血色・ラメが一斉に立ち上がる、隠しきれない高揚メイク。
- skin_smoothing@40 · blush=#ef9aa6@60 · eyeshadow=#caa15a/shimmer@50 · eyeliner=#2a2020@30 · eyebrows=#5a4030@35 · lip_color=#e49aa6/gloss@68 · highlighter=#fff4ea@78

### 🔴 怒 ── 眉とアイラインを締めて深い口紅。静かに圧をかける戦闘モード。
- skin_smoothing@40 · blush=#e09a8e@15 · eyeshadow=#6f5a55/satin@50 · eyeliner=#2a2020@62 · eyebrows=#5a4030@68 · lip_color=#7d2c38/matte@62 · highlighter=#fff4ea@30

### 🔵 哀 ── 血色を抜いてくすませた、だるさの滲むメイク。頬はあえて置かない。
- skin_smoothing@55 · blush=#e09a8e@10 · eyeliner=#2a2020@30 · eyebrows=#5a4030@30 · lip_color=#a87b78/matte@40 · highlighter=#fff4ea@25

### 🟢 楽 ── ナチュラルな血色と軽いツヤ。肩の力が抜けた余裕の顔。
- skin_smoothing@40 · blush=#e09a8e@42 · eyeliner=#2a2020@30 · eyebrows=#5a4030@35 · lip_color=#e2785d/sheer@50 · highlighter=#fff4ea@52

## シチュエーション × 気分（全56問）

### 会議中（assets/scene_meeting.jpg）
- **喜** `meeting_joy.jpg` … この後の予定が全部消えた
- **怒** `meeting_anger.jpg` … さっき自分の案がスルーされた
- **哀** `meeting_sorrow.jpg` … 微熱があるので場合によっては帰りたい
- **楽** `meeting_comfort.jpg` … ノー残業デーだと信じきっている

### Web会議中（assets/scene_webmeeting.jpg）
- **喜** `webmeeting_joy.jpg` … ミュート中の独り言を誰も聞いてなかった
- **怒** `webmeeting_anger.jpg` … 「聞こえてますか？」を5回言わされた
- **哀** `webmeeting_sorrow.jpg` … 画面に映る自分の顔色だけ見ている
- **楽** `webmeeting_comfort.jpg` … 下が部屋着なのを思い出してにやけている

### プレゼン中（assets/scene_presentation.jpg）
- **喜** `presentation_joy.jpg` … 用意したスベらない一言がウケた
- **怒** `presentation_anger.jpg` … 後ろの人がずっと内職している
- **哀** `presentation_sorrow.jpg` … スライドを盛りすぎたと今気づいた
- **楽** `presentation_comfort.jpg` … 質疑応答が無さそうな空気を感じた

### 通勤中（assets/scene_commute.jpg）
- **喜** `commute_joy.jpg` … 座れた上に隣も降りていった
- **怒** `commute_anger.jpg` … 目の前で席を取られた
- **哀** `commute_sorrow.jpg` … 今日が何曜日か思い出せない
- **楽** `commute_comfort.jpg` … 一本早い電車に乗れた優越感

### 残業中（assets/scene_overtime.jpg）
- **喜** `overtime_joy.jpg` … 終わりが見えてラスト1ファイル
- **怒** `overtime_anger.jpg` … 定時で帰った人のミスを引き継いだ
- **哀** `overtime_sorrow.jpg` … 自販機のホットが売り切れていた
- **楽** `overtime_comfort.jpg` … フロアに一人で逆に集中できる

### 面接中（assets/scene_interview.jpg）
- **喜** `interview_joy.jpg` … 志望動機を噛まずに言えた
- **怒** `interview_anger.jpg` … 圧迫気味の質問に内心キレている
- **哀** `interview_sorrow.jpg` … 御社を相手の社名で呼んだ気がする
- **楽** `interview_comfort.jpg` … 逆質問の時間が来て楽しくなってきた

### 名刺交換（assets/scene_namecard.jpg）
- **喜** `namecard_joy.jpg` … 相手も自分の会社を知っていた
- **怒** `namecard_anger.jpg` … 名前を3回続けて間違えられた
- **哀** `namecard_sorrow.jpg` … 名刺を切らしているのに気づいた
- **楽** `namecard_comfort.jpg` … 同郷だと判明して場が和んだ

### 手帳タイム（assets/scene_planner.jpg）
- **喜** `planner_joy.jpg` … 来月の連休に丸をつけた
- **怒** `planner_anger.jpg` … ダブルブッキングを発見した
- **哀** `planner_sorrow.jpg` … 今週ずっと予定が真っ白だった
- **楽** `planner_comfort.jpg` … こなした予定に線を引く瞬間が好き

### 書類を読む（assets/scene_docs.jpg）
- **喜** `docs_joy.jpg` … 探していた一文がやっと見つかった
- **怒** `docs_anger.jpg` … 誤字を見つけたが自作の資料だった
- **哀** `docs_sorrow.jpg` … 3回読んでも頭に入ってこない
- **楽** `docs_comfort.jpg` … 難しい資料を読んでる自分が好き

### 時計を見る（assets/scene_watch.jpg）
- **喜** `watch_joy.jpg` … あと5分で終業だと確認した
- **怒** `watch_anger.jpg` … 待ち合わせ相手がまだ来ない
- **哀** `watch_sorrow.jpg` … まだ午後2時だった
- **楽** `watch_comfort.jpg` … 約束まで余裕で間に合うと分かった

### 電話中（assets/scene_phone.jpg）
- **喜** `phone_joy.jpg` … 保留が解けて第一声がうまく出た
- **怒** `phone_anger.jpg` … たらい回しにされて4人目
- **哀** `phone_sorrow.jpg` … 相手の名前を聞き返せないまま進む
- **楽** `phone_comfort.jpg` … 用件が一発で済んで切れそう

### 食事中（assets/scene_meal.jpg）
- **喜** `meal_joy.jpg` … 頼んだやつが大当たりだった
- **怒** `meal_anger.jpg` … 隣の注文が先に来た
- **哀** `meal_sorrow.jpg` … 取っておいた一番好きな具が消えた
- **楽** `meal_comfort.jpg` … 平日に一人で良い店に入れた満足

### 飲み会中（assets/scene_drinking.jpg）
- **喜** `drinking_joy.jpg` … 気になってた話題で盛り上がった
- **怒** `drinking_anger.jpg` … 自分の頼んだのだけ来ていない
- **哀** `drinking_sorrow.jpg` … そろそろ帰りたいが言い出せない
- **楽** `drinking_comfort.jpg` … 明日が休みで心置きなく飲める

### 休日（assets/scene_dayoff.jpg）
- **喜** `dayoff_joy.jpg` … 朝イチで欲しかった物が買えた
- **怒** `dayoff_anger.jpg` … 休みなのに営業電話が来た
- **哀** `dayoff_sorrow.jpg` … 気づいたら夕方になっていた
- **楽** `dayoff_comfort.jpg` … 二度寝が最高に決まった
