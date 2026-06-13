// =============================================================
//  app.js ── ゲーム進行
//  シチュ写真（メイク差分）を見て、その人の「細かい“あるある”状況」を
//  4択から当てる。喜怒哀楽のラベルは出さない（裏で効いているだけ）。
// =============================================================
import { QUESTIONS, SITUATIONS, EMO, EMO_ORDER, LOOK } from "./data.js";

const $ = (s) => document.querySelector(s);
const pct = (x) => Math.round(Math.max(0, Math.min(1, x)) * 100);
const FIN_JP = { matte:"マット", satin:"サテン", sheer:"シアー", gloss:"グロス", shimmer:"シマー" };

// look → 表示用メイクパラメータ（YouCamで実際に乗せた差分）
function lookParams(look) {
  const ps = [];
  if (look.lipI > 0)  ps.push({ cat:"リップ",     hex:look.lip,   tex:FIN_JP[look.lipFin]||"", val:pct(look.lipI) });
  if (look.cheekI > 0) ps.push({ cat:"チーク",     hex:look.cheek, tex:"",                       val:pct(look.cheekI) });
  if (look.shadow && look.shadowI > 0) ps.push({ cat:"アイシャドウ", hex:look.shadow, tex:look.shadow==="#caa15a"?"シマー":"", val:pct(look.shadowI) });
  if (look.liner > 0) ps.push({ cat:"アイライナー", hex:"#2a2020", tex:"", val:pct(look.liner) });
  if (look.brow > 0)  ps.push({ cat:"アイブロウ",   hex:"#5a4030", tex:"", val:pct(look.brow) });
  if (look.glow > 0)  ps.push({ cat:"ハイライト",   hex:"#fff4ea", tex:"", val:pct(look.glow) });
  return ps;
}
function renderParams(emo) {
  const ps = lookParams(LOOK[emo]);
  return `<p class="params-head">この顔に乗せていたメイク（YouCam）</p>` +
    ps.map((p) =>
      `<div class="param"><span class="dot" style="background:${p.hex}"></span>` +
      `<span class="pcat">${p.cat}</span>` +
      `<span class="pval">${p.hex}${p.tex ? " / " + p.tex : ""}</span>` +
      `<span class="pbar"><i style="width:${p.val}%"></i></span></div>`
    ).join("");
}
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1);[a[i], a[j]] = [a[j], a[i]]; } return a; };

const SIT = {}; for (const s of SITUATIONS) SIT[s.key] = s;

const state = { total: 10, order: [], idx: 0, score: 0, answered: false };

function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("is-active"));
  $("#" + id).classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#len-seg").addEventListener("click", (e) => {
  const b = e.target.closest(".seg-btn"); if (!b) return;
  document.querySelectorAll(".seg-btn").forEach((x) => x.classList.remove("is-on"));
  b.classList.add("is-on");
  state.total = parseInt(b.dataset.len, 10);
});
$("#start-btn").addEventListener("click", startGame);
$("#replay-btn").addEventListener("click", () => show("screen-title"));
$("#next-btn").addEventListener("click", () => {
  state.idx++;
  if (state.idx >= state.order.length) finish();
  else renderQuestion();
});

function startGame() {
  state.order = shuffle(QUESTIONS.slice()).slice(0, Math.min(state.total, QUESTIONS.length));
  state.idx = 0; state.score = 0;
  $("#q-total").textContent = state.order.length;
  show("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  state.answered = false;
  const q = state.order[state.idx];

  $("#q-now").textContent = state.idx + 1;
  $("#q-score").textContent = state.score;
  $("#q-bar").style.right = (100 - (state.idx / state.order.length) * 100) + "%";
  $("#face-situation").textContent = q.label;

  const img = $("#face-img");
  img.onerror = () => { img.onerror = null; img.src = q.img; $("#face-badge").textContent = "PREVIEW · YouCam"; };
  $("#face-badge").textContent = "RETOUCH by YouCam";
  img.src = `images/${q.imgKey}.jpg`;

  // 選択肢：このシチュの細かい“あるある”4つ（喜怒哀楽ラベルは出さない）
  const sit = SIT[q.sitKey];
  const choices = shuffle(EMO_ORDER.map((emo) => ({ emo, text: sit.moods[emo] })));
  const box = $("#choices"); box.innerHTML = "";
  for (const c of choices) {
    const btn = document.createElement("button");
    btn.className = "choice choice-sit"; btn.dataset.emo = c.emo;
    btn.innerHTML = `<span class="mark"></span><span class="ctext">${c.text}</span>`;
    btn.addEventListener("click", () => answer(btn, c.emo, q));
    box.appendChild(btn);
  }
  $("#reveal").hidden = true;
}

function answer(btn, chosenEmo, q) {
  if (state.answered) return;
  state.answered = true;
  const correct = chosenEmo === q.emo;
  if (correct) state.score++;

  document.querySelectorAll(".choice").forEach((el) => {
    el.disabled = true;
    if (el.dataset.emo === q.emo) { el.classList.add("is-correct"); el.querySelector(".mark").textContent = "○"; }
    else if (el === btn) { el.classList.add("is-wrong"); el.querySelector(".mark").textContent = "×"; }
    else el.classList.add("dim");
  });

  $("#reveal-verdict").textContent = correct ? "Seikai." : "Zannen…";
  $("#reveal-verdict").className = "reveal-verdict " + (correct ? "ok" : "ng");
  $("#reveal-answer").innerHTML = `正解は<b>「${q.answerLabel || q.mood}」</b>`;
  $("#reveal-note").textContent = `その気分、メイクにじわっと出ていました。── ${EMO[q.emo].note}`;
  $("#reveal-params").innerHTML = renderParams(q.emo);
  $("#q-score").textContent = state.score;
  $("#reveal").hidden = false;
}

function finish() {
  const n = state.score, d = state.order.length, r = n / d;
  let rank, msg;
  if (r === 1) { rank = "メイク読心術師"; msg = "全問正解。顔のじわじわした変化から“今日のあるある”まで言い当てる、ちょっと怖い観察眼。"; }
  else if (r >= 0.8) { rank = "気配の読める人"; msg = "ほぼ正解。リップの色温度と頬の置き方から、その人の今日が読めています。"; }
  else if (r >= 0.5) { rank = "そこそこ察しがいい"; msg = "半分以上正解。大枠はバッチリ。あとは、じわじわした細部を。もう一度どうぞ。"; }
  else if (r >= 0.2) { rank = "雰囲気で生きている"; msg = "雰囲気で当てにいくスタイル。でもメイクの違いは細かすぎて伝わらないので、それで正常です。"; }
  else { rank = "今日も平常運転"; msg = "ほとんど伝わらなかった様子。タイトル回収、おめでとうございます。"; }

  $("#result-rank").textContent = rank;
  $("#result-num").textContent = n;
  $("#result-den").textContent = "/ " + d;
  $("#result-msg").textContent = msg;

  const text = `「細かすぎて伝わらないメイク当てクイズ」で ${d}問中${n}問 正解！あなたは『${rank}』。メイクから“今日のあるある”、見抜ける？`;
  const url = location.href.split("#")[0];
  $("#share-btn").href =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent("メイク当てクイズ,YouCam")}`;
  show("screen-result");
}
