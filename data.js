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

// 出題リスト（シチュ × 感情 = 全56問）。答えは「シチュエーション」。
export const QUESTIONS = [];
for (const sit of SITUATIONS)
  for (const emo of EMO_ORDER)
    QUESTIONS.push({ sitKey: sit.key, label: sit.label, img: sit.img, emo, mood: sit.moods[emo],
                     focus: FOCUS[sit.key] || "50% 32%", imgKey: `${sit.key}_${EMO[emo].key}` });
