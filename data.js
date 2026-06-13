// =============================================================
//  細かすぎて伝わらないメイク当てクイズ ── 出題データ
//
//  「同じシチュエーション写真 × 違う気分メイク差分」。
//  プレイヤーは シチュ写真（メイク差分つき）を見て、
//  そのシチュで起こりがちな4つの気分（喜・怒・哀・楽）から
//  “この人の今日の気分”を当てる。
//
//  画像は YouCam で各シチュ写真に気分メイクを乗せた差分：
//    images/<situationKey>_<emoKey>.jpg
//  無ければ素のシチュ写真にフォールバック。
//  メイクのパラメータは LOOK（感情ベース）→ PARAMS.md / generate.mjs / yc_run.mjs。
// =============================================================

export const EMO = {
  喜: { key: "joy",     label: "喜", name: "よろこび", color: "#E0A53B",
        note: "ツヤ・血色・ラメが一斉に立ち上がる、隠しきれない高揚メイク。" },
  怒: { key: "anger",   label: "怒", name: "いかり",   color: "#C0463A",
        note: "眉とアイラインを締めて深い口紅。静かに圧をかける戦闘モード。" },
  哀: { key: "sorrow",  label: "哀", name: "かなしみ", color: "#6E84A6",
        note: "血色を抜いてくすませた、だるさの滲むメイク。頬はあえて置かない。" },
  楽: { key: "comfort", label: "楽", name: "ごきげん", color: "#5E9E7E",
        note: "ナチュラルな血色と軽いツヤ。肩の力が抜けた余裕の顔。" },
};
export const EMO_ORDER = ["喜", "怒", "哀", "楽"];

// ---- パレット ----
const LIP = { dusty:"#a87b78", nude:"#c98a78", coral:"#e2785d", pink:"#e49aa6", deepred:"#7d2c38" };
const SHD = { none:null, smoky:"#6f5a55", glitter:"#caa15a" };
const CHK = { natural:"#e09a8e", pink:"#ef9aa6" };

const base = { lip:LIP.nude, lipI:0.5, lipFin:"satin", cheek:CHK.natural, cheekI:0.4,
               shadow:SHD.none, shadowI:0, liner:0.3, brow:0.35, glow:0.4, smooth:0.4 };
const L = (o) => ({ ...base, ...o });

// 感情ごとのメイク差分（同シチュ内の4択を見分けられる強さに）
export const LOOK = {
  喜: L({ lip:LIP.pink,    lipI:0.68, lipFin:"gloss", cheek:CHK.pink,    cheekI:0.6,  shadow:SHD.glitter, shadowI:0.5,  glow:0.78, brow:0.35, liner:0.3 }),
  怒: L({ lip:LIP.deepred, lipI:0.62, lipFin:"matte", cheek:CHK.natural, cheekI:0.15, shadow:SHD.smoky,   shadowI:0.5,  glow:0.3,  brow:0.68, liner:0.62 }),
  哀: L({ lip:LIP.dusty,   lipI:0.4,  lipFin:"matte", cheek:CHK.natural, cheekI:0.1,  shadow:SHD.none,    shadowI:0,    glow:0.25, brow:0.3,  liner:0.3, smooth:0.55 }),
  楽: L({ lip:LIP.coral,   lipI:0.5,  lipFin:"sheer", cheek:CHK.natural, cheekI:0.42, shadow:SHD.none,    shadowI:0,    glow:0.52, brow:0.35, liner:0.3 }),
};

// 気分（喜怒哀楽）のジャンルは保ちつつ、シチュエーションごとに色・濃さをあえて散らす。
// VAR=気分ごとの選択肢プール。makeupFor(sitKey,emo) が生成(yc_api)と種明かし(app.js)の単一ソース。
const VAR = {
  喜: { found:["#f3d3bb","#f0cdb4","#f6d4bd"], fg:[65,60,70],
        blush:["#ef9aa6","#f0a98e","#e88a72"],
        sh:[["#caa15a","shimmer"],["#e0a96a","shimmer"],["#d8a070","shimmer"]],
        lip:[["#e49aa6","gloss"],["#ed9a8c","gloss"],["#ef9aa6","gloss"],["#e2785d","gloss"]], lipI:[80,84,76,82] },
  怒: { found:["#ecd0c6","#e8ccc0"], fg:[18,15],
        blush:["#e09a8e","#d99589"],
        sh:[["#6f5a55","matte"],["#5a4a52","matte"],["#7a5550","matte"]],
        lip:[["#7d2c38","matte"],["#8e4a5a","matte"],["#bb3540","matte"],["#9c3340","matte"]], lipI:[92,88,90,86] },
  哀: { found:["#ece0da","#eaddd6"], fg:[4,6], blush:null, sh:null,
        lip:[["#a87b78","matte"],["#b08a85","matte"],["#9c8478","sheer"],["#a87b78","sheer"]], lipI:[45,42,46,44] },
  楽: { found:["#eec3a4","#ecc1a2"], fg:[45,42], blush:["#e09a8e","#e6a08e"], sh:null,
        lip:[["#e2785d","sheer"],["#cd9b86","sheer"],["#e49aa6","sheer"],["#e2785d","satin"]], lipI:[62,58,64,60] },
};
const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];

// シチュ×気分のメイク（項目配列）。cat=表示名, api=APIカテゴリ, ci/cov/glow=各intensity。
export function makeupFor(sitKey, emo) {
  const i = Math.max(0, SITUATIONS.findIndex((s) => s.key === sitKey));
  const v = VAR[emo], out = [];
  out.push({ cat:"ファンデ", api:"foundation", color:pick(v.found,i), ci:43, cov: emo==="哀"?75 : emo==="怒"?55 : 45, glow:pick(v.fg,i+1) });
  if (v.blush) out.push({ cat:"チーク", api:"blush", color:pick(v.blush,i+2), tex:"matte", ci: emo==="怒"?14 : emo==="喜"?58 : 40 });
  if (v.sh) { const s=pick(v.sh,i+1); out.push({ cat:"アイシャドウ", api:"eye_shadow", color:s[0], tex:s[1], ci: emo==="怒"?54 : 52 }); }
  out.push({ cat:"アイライナー", api:"eye_liner", color:"#2a2020", ci: emo==="怒" ? 60+(i%8) : 24+(i%6) });
  out.push({ cat:"眉", api:"eyebrows", color: emo==="怒"?"#4a3328":"#5a4030", ci: emo==="怒" ? 68+(i%6) : 34+(i%8) });
  out.push({ cat:"ハイライト", api:"highlighter", color:"#fff4ea", ci: emo==="哀"?18 : emo==="喜"?52 : 40, glow:pick(v.fg,i) });
  const lp=pick(v.lip,i), lip={ cat:"リップ", api:"lip_color", color:lp[0], tex:lp[1], ci:pick(v.lipI,i) };
  if (lp[1]==="gloss") { lip.gloss=65; lip.trans=15; } if (lp[1]==="sheer") { lip.trans=55; }
  out.push(lip);
  return out;
}

// ---- シチュエーション × 4気分 ----
//  moods: 各感情の「あるある気分」テキスト
export const SITUATIONS = [
  { key:"meeting", label:"会議中", img:"assets/scene_meeting.jpg", moods:{
    喜:"この後の予定が全部消えた", 怒:"さっき自分の案がスルーされた",
    哀:"微熱があるので場合によっては帰りたい", 楽:"ノー残業デーだと信じきっている" } },

  { key:"webmeeting", label:"Web会議中", img:"assets/scene_webmeeting.jpg", moods:{
    喜:"ミュート中の独り言を誰も聞いてなかった", 怒:"「聞こえてますか？」を5回言わされた",
    哀:"画面に映る自分の顔色だけ見ている", 楽:"下が部屋着なのを思い出してにやけている" } },

  { key:"presentation", label:"プレゼン中", img:"assets/scene_presentation.jpg", moods:{
    喜:"用意したスベらない一言がウケた", 怒:"後ろの人がずっと内職している",
    哀:"スライドを盛りすぎたと今気づいた", 楽:"質疑応答が無さそうな空気を感じた" } },

  { key:"commute", label:"通勤中", img:"assets/scene_commute.jpg", moods:{
    喜:"座れた上に隣も降りていった", 怒:"目の前で席を取られた",
    哀:"今日が何曜日か思い出せない", 楽:"一本早い電車に乗れた優越感" } },

  { key:"overtime", label:"残業中", img:"assets/scene_overtime.jpg", moods:{
    喜:"終わりが見えてラスト1ファイル", 怒:"定時で帰った人のミスを引き継いだ",
    哀:"自販機のホットが売り切れていた", 楽:"フロアに一人で逆に集中できる" } },

  { key:"interview", label:"面接中", img:"assets/scene_interview.jpg", moods:{
    喜:"志望動機を噛まずに言えた", 怒:"圧迫気味の質問に内心キレている",
    哀:"御社を相手の社名で呼んだ気がする", 楽:"逆質問の時間が来て楽しくなってきた" } },

  { key:"namecard", label:"名刺交換", img:"assets/scene_namecard.jpg", moods:{
    喜:"相手も自分の会社を知っていた", 怒:"名前を3回続けて間違えられた",
    哀:"渡した名刺、肩書きが異動前のままだった", 楽:"同郷だと判明して場が和んだ" } },

  { key:"planner", label:"手帳タイム", img:"assets/scene_planner.jpg", moods:{
    喜:"来月の連休に丸をつけた", 怒:"ダブルブッキングを発見した",
    哀:"今週ずっと予定が真っ白だった", 楽:"こなした予定に線を引く瞬間が好き" } },

  { key:"docs", label:"書類を読む", img:"assets/scene_docs.jpg", moods:{
    喜:"探していた一文がやっと見つかった", 怒:"誤字を見つけたが自作の資料だった",
    哀:"3回読んでも頭に入ってこない", 楽:"難しい資料を読んでる自分が好き" } },

  { key:"watch", label:"時計を見る", img:"assets/scene_watch.jpg", moods:{
    喜:"あと5分で終業だと確認した", 怒:"待ち合わせ相手がまだ来ない",
    哀:"まだ午後2時だった", 楽:"約束まで余裕で間に合うと分かった" } },

  { key:"phone", label:"電話中", img:"assets/scene_phone.jpg", moods:{
    喜:"保留が解けて第一声がうまく出た", 怒:"たらい回しにされて4人目",
    哀:"相手の名前を聞き返せないまま進む", 楽:"用件が一発で済んで切れそう" } },

  { key:"meal", label:"食事中", img:"assets/scene_meal.jpg", moods:{
    喜:"頼んだやつが大当たりだった", 怒:"隣の注文が先に来た",
    哀:"取っておいた一番好きな具が消えた", 楽:"平日に一人で良い店に入れた満足" } },

  { key:"drinking", label:"飲み会中", img:"assets/scene_drinking.jpg", moods:{
    喜:"気になってた話題で盛り上がった", 怒:"自分の頼んだのだけ来ていない",
    哀:"そろそろ帰りたいが言い出せない", 楽:"明日が休みで心置きなく飲める" } },

  { key:"dayoff", label:"休日", img:"assets/scene_dayoff.jpg", moods:{
    喜:"朝イチで欲しかった物が買えた", 怒:"休みなのに営業電話が来た",
    哀:"気づいたら夕方になっていた", 楽:"二度寝が最高に決まった" } },
];

// 出題で顔に寄る位置（背景＝シチュを隠すクロップの中心 "x% y%"）
export const FOCUS = {
  meeting:"47% 33%", webmeeting:"50% 34%", presentation:"50% 32%", commute:"40% 31%",
  overtime:"50% 30%", interview:"50% 33%", namecard:"50% 34%", planner:"50% 32%",
  docs:"50% 32%", watch:"50% 32%", phone:"50% 32%", meal:"50% 34%",
  drinking:"50% 34%", dayoff:"50% 33%",
};

// 種明かしの一言（問題ごとに固有。なぜこの状況＝このメイクか）
export const NOTES = {
  meeting: {
    喜:"グロスとハイライトが内緒で浮き立つ。議事録を取るふりして、もう帰る算段。",
    怒:"眉とアイラインだけ静かに本気。口は挟まないが、目が言っている。",
    哀:"血色を一段だけ抜いて、頬は置かない。“まだ帰るとは言ってない”ギリギリの顔。",
    楽:"コーラルのシアーで肩の力が抜けた血色。定時の鐘を信じきった目元。" },
  webmeeting: {
    喜:"セーフの安堵がツヤに出る。カメラに映る範囲だけ完璧。",
    怒:"深い口紅で無の表情。マイクは、まだ生きている。",
    哀:"くすませたリップ。話の内容より、画面の自分の顔色が気になる。",
    楽:"ゆるい血色。上半身だけ社会人、下は部屋着。" },
  presentation: {
    喜:"勝ち確のハイライト。スベらない一言がウケて、まだ余韻の中。",
    怒:"眉に圧。声は明るいまま、視線だけ後ろの内職に刺さる。",
    哀:"血色を失うマット。盛りすぎたスライドの残り枚数を、今数えている。",
    楽:"余裕のコーラル。質疑応答が無さそうな空気に、頬がゆるむ。" },
  commute: {
    喜:"朝から運を使うツヤ。座れて、しかも両隣が空く幸福。",
    怒:"深紅マットで無言の抗議。つり革を握る手に、少し力。",
    哀:"血色のない口元。今日が何曜日か、自分が誰かも少し曖昧な朝。",
    楽:"軽い血色。一本早いだけで、同じ景色がいつもより穏やか。" },
  overtime: {
    喜:"復活のハイライト。終わりが見えて、保存ボタンが近い。",
    怒:"眉とライナーに静かな殺気。定時で帰った人のミスを、一人で。",
    哀:"くすみリップ。最後の楽しみだったホットが、売り切れていた夜。",
    楽:"ナチュラルな血色。誰も見ていないフロアの、思わぬ自由。" },
  interview: {
    喜:"“通ったかも”のツヤ。志望動機を噛まずに言えた、第一関門。",
    怒:"締めた眉とアイライン。笑顔の下で、圧迫質問に静かに沸騰。",
    哀:"血の気が引くマット。御社を、相手の社名で呼んだ気がする。",
    楽:"ほどけた血色。逆質問の時間、むしろこっちが面接する番。" },
  namecard: {
    喜:"会話が弾むツヤ。名刺を差し出す手が、いつもより軽い。",
    怒:"眉だけ静かに本気。名前を3回間違えられて、でも口角は保つ。",
    哀:"くすむ口元。渡した名刺、肩書きが異動前のままだった。",
    楽:"ゆるむ頬。商談より、同郷だと分かった地元トーク。" },
  planner: {
    喜:"浮き立つハイライト。来月の連休に丸をつけるペン先がうれしそう。",
    怒:"眉に影。どちらも断れないダブルブッキングを、たった今発見。",
    哀:"血色のない口元。今週ずっと真っ白なページが、少し痛い。",
    楽:"満ちた血色。こなした予定に線を引く、一本ぶんの達成感。" },
  docs: {
    喜:"解放のツヤ。探していた一文に、ようやく指が止まった。",
    怒:"眉が動く。見つけた誤字が、自分の作った資料だった瞬間。",
    哀:"くすみリップ。目は文字を追うが、頭は別の場所にいる。",
    楽:"知的を気取る血色。難しい資料を読む自分が、ちょっと好き。" },
  watch: {
    喜:"そわつくハイライト。あと5分で終業、心はもう改札の外。",
    怒:"深紅マット。待ち合わせ相手が来ない、“連絡する”の一分前。",
    哀:"血色が抜ける。まだ午後2時。時間は思ったより進まない。",
    楽:"ゆるむ頬。約束まで余裕で間に合うと分かって、歩幅まで穏やか。" },
  phone: {
    喜:"一発で決まったツヤ。保留が解けて、出だしの第一声が命。",
    怒:"眉に静かな限界。声は丁寧、たらい回しでもう4人目。",
    哀:"くすむ口元。今さら聞き返せない相手の名前のまま、会話が進む。",
    楽:"ほどけた血色。用件が一発で済んで、あと一言で解放。" },
  meal: {
    喜:"高揚のツヤ。頼んだやつが大当たり、一口目で勝ちを確信。",
    怒:"深紅マット。後から頼んだはずの、隣の注文が先に来た。",
    哀:"血色のない口元。最後に取っておいた一番好きな具が、無い。",
    楽:"ゆるむ頬。平日に一人、誰にも気兼ねしない良い店の昼。" },
  drinking: {
    喜:"弾けるツヤ。ジョッキより、気になってた話題のほうが進む。",
    怒:"眉に影。自分の頼んだのだけ来なくて、乾杯の輪に乗り遅れる。",
    哀:"くすむ口元。帰りたいのに、二軒目の相談が始まってしまう。",
    楽:"ほどけた血色。明日が休みで、時間を気にしない夜。" },
  dayoff: {
    喜:"戦利品のツヤ。開店ダッシュで、欲しかった物が朝イチで手に。",
    怒:"深紅マット。休みなのに営業電話、登録してなかった自分にも怒。",
    哀:"血色が抜ける。何もしていないのに、気づけば日が傾いていた。",
    楽:"ゆるみきった血色。“何もしない”を全力でやる、二度寝の朝。" },
};

// 出題リスト（シチュ × 感情 = 全56問）
export const QUESTIONS = [];
for (const sit of SITUATIONS)
  for (const emo of EMO_ORDER)
    QUESTIONS.push({ sitKey: sit.key, label: sit.label, img: sit.img, emo, mood: sit.moods[emo],
                     note: (NOTES[sit.key] || {})[emo] || "", focus: FOCUS[sit.key] || "50% 32%",
                     imgKey: `${sit.key}_${EMO[emo].key}` });
