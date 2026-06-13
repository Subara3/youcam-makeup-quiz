// =============================================================
//  generate.mjs ── YouCam makeup-vto API で「シチュ写真×気分メイク差分」を生成
//
//  ブラウザ自動操作版（yc_run.mjs）と同じ差分を、APIで作る代替ルート。
//  ※ makeup-vto API は有料ユニットが必要（無料枠は少量）。
//
//  使い方:
//    キー設定:  $env:YOUCAM_API_KEY="..."  または  echo KEY > youcam_key.txt
//    生成:      node generate.mjs                 … 全シチュ×4気分
//    パラメータ確認(キー不要):  node generate.mjs --params   → PARAMS.md
//                              node generate.mjs --dry meeting 喜
//
//  エンドポイント/ボディは2026-06時点の公式ドキュメント準拠。
//  フィールド名が変わっていたら CONFIG / buildTaskBody を調整。
// =============================================================
import { SITUATIONS, LOOK, EMO } from "./data.js";
import fs from "node:fs";
import path from "node:path";

const CONFIG = {
  host: "https://yce-api-01.makeupar.com",
  fileEndpoint: "/s2s/v2.0/file/makeup-vto",
  taskEndpoint: "/s2s/v2.0/task/makeup-vto",
  outDir: "images",
  pollMs: 2500, pollMax: 40, gapMs: 1500,
};

const pct = (x) => Math.round(Math.max(0, Math.min(1, x)) * 100);
const isGlitter = (hex) => hex && hex.toLowerCase() === "#caa15a";

// look → makeup-vto effects（肌トーンはシチュ写真側に依存するので foundation は薄め固定）
export function lookToEffects(look) {
  const fx = [];
  if (look.smooth > 0) fx.push({ category: "skin_smoothing", intensity: pct(look.smooth) });
  if (look.cheekI > 0) fx.push({ category: "blush", palettes: [{ color: look.cheek, colorIntensity: pct(look.cheekI) }] });
  if (look.shadow && look.shadowI > 0)
    fx.push({ category: "eyeshadow", palettes: [{ color: look.shadow, texture: isGlitter(look.shadow) ? "shimmer" : "satin", colorIntensity: pct(look.shadowI) }] });
  if (look.liner > 0) fx.push({ category: "eyeliner", palettes: [{ color: "#2a2020", colorIntensity: pct(look.liner) }] });
  if (look.brow > 0) fx.push({ category: "eyebrows", palettes: [{ color: "#5a4030", colorIntensity: pct(look.brow) }] });
  if (look.lipI > 0)
    fx.push({ category: "lip_color", shape: { name: "original" }, palettes: [{ color: look.lip, texture: look.lipFin || "satin", colorIntensity: pct(look.lipI), gloss: look.lipFin === "gloss" ? 60 : 0 }] });
  if (look.glow > 0) fx.push({ category: "highlighter", palettes: [{ color: "#fff4ea", colorIntensity: pct(look.glow) }] });
  return fx;
}
function buildTaskBody(fileId, effects) { return { src_file_id: fileId, effects }; } // ←要検証ポイント

// 全 (situation × emotion) のジョブ
function allJobs() {
  const jobs = [];
  for (const s of SITUATIONS) for (const emo of Object.keys(LOOK))
    jobs.push({ s, emo, key: `${s.key}_${EMO[emo].key}`, effects: lookToEffects(LOOK[emo]) });
  return jobs;
}

// ---- PARAMS.md（キー不要）----
function writeParams() {
  const EJ = { 喜:"🟡 喜", 怒:"🔴 怒", 哀:"🔵 哀", 楽:"🟢 楽" };
  let md = `# メイク・パラメータ メモ（シチュ写真 × 気分メイク差分）

> 各シチュ写真に、感情ごとの \`look\`（= makeup-vto effects）を乗せて差分を作る。
> 画像キー: \`<situation>_<emotion>.jpg\`。intensity 0–100 / color #RRGGBB / texture はYouCamのテクスチャ名。
> \`data.js\` の LOOK / SITUATIONS から自動生成。

## 感情ベースのメイク（全シチュ共通の差分パラメータ）
`;
  for (const emo of ["喜", "怒", "哀", "楽"]) {
    const fx = lookToEffects(LOOK[emo]);
    const line = fx.map((e) => e.palettes?.[0]
      ? `${e.category}=${e.palettes[0].color}${e.palettes[0].texture ? `/${e.palettes[0].texture}` : ""}@${e.palettes[0].colorIntensity}`
      : `${e.category}@${e.intensity}`).join(" · ");
    md += `\n### ${EJ[emo]} ── ${EMO[emo].note}\n- ${line}\n`;
  }
  md += `\n## シチュエーション × 気分（全${SITUATIONS.length * 4}問）\n`;
  for (const s of SITUATIONS) {
    md += `\n### ${s.label}（${s.img}）\n`;
    for (const emo of ["喜", "怒", "哀", "楽"])
      md += `- **${EMO[emo].label}** \`${s.key}_${EMO[emo].key}.jpg\` … ${s.moods[emo]}\n`;
  }
  fs.writeFileSync("PARAMS.md", md);
  console.log(`✓ PARAMS.md を書き出しました（${SITUATIONS.length}シチュ × 4気分）`);
}

// ---- 実行（API）----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function getKey() {
  if (process.env.YOUCAM_API_KEY) return process.env.YOUCAM_API_KEY.trim();
  try { return fs.readFileSync("youcam_key.txt", "utf8").trim(); } catch {}
  console.error("✗ APIキーが見つかりません。YOUCAM_API_KEY か youcam_key.txt を設定してください。");
  process.exit(1);
}
async function api(pathname, { method = "GET", key, json, raw, headers = {} } = {}) {
  const res = await fetch(CONFIG.host + pathname, {
    method, headers: { Authorization: `Bearer ${key}`, ...(json ? { "Content-Type": "application/json" } : {}), ...headers },
    body: json ? JSON.stringify(json) : raw,
  });
  const text = await res.text(); let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`${method} ${pathname} → ${res.status}: ${text.slice(0, 300)}`);
  return data;
}
async function generateOne(job, key) {
  const imgBuf = fs.readFileSync(job.s.img);
  const fileRes = await api(CONFIG.fileEndpoint, { method: "POST", key,
    json: { files: [{ content_type: "image/jpeg", file_name: "scene.jpg", file_size: imgBuf.length }] } });
  const fileId = fileRes.file_id || fileRes.result?.file_id;
  const up = (fileRes.requests || fileRes.result?.requests || [])[0];
  if (!fileId || !up?.url) throw new Error("file API 応答が想定外: " + JSON.stringify(fileRes).slice(0, 200));
  const putRes = await fetch(up.url, { method: "PUT", headers: up.headers || { "Content-Type": "image/jpeg" }, body: imgBuf });
  if (!putRes.ok) throw new Error("upload PUT 失敗: " + putRes.status);
  const taskRes = await api(CONFIG.taskEndpoint, { method: "POST", key, json: buildTaskBody(fileId, job.effects) });
  const taskId = taskRes.task_id || taskRes.result?.task_id;
  if (!taskId) throw new Error("task API 応答が想定外: " + JSON.stringify(taskRes).slice(0, 200));
  let url;
  for (let i = 0; i < CONFIG.pollMax; i++) {
    await sleep(CONFIG.pollMs);
    const st = await api(`${CONFIG.taskEndpoint}/${taskId}`, { key });
    const status = st.task_status || st.status || st.result?.status;
    if (status === "success" || status === "succeeded") { url = st.result?.url || st.results?.[0]?.url || st.url; break; }
    if (status === "error" || status === "failed") throw new Error("task 失敗: " + JSON.stringify(st).slice(0, 200));
  }
  if (!url) throw new Error("結果URL取得できず（タイムアウト）");
  const out = path.join(CONFIG.outDir, `${job.key}.jpg`);
  fs.writeFileSync(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
  return out;
}

const argv = process.argv.slice(2);
if (argv.includes("--params")) { writeParams(); }
else if (argv.includes("--dry")) {
  const sk = argv[argv.indexOf("--dry") + 1], emo = argv[argv.indexOf("--dry") + 2] || "喜";
  console.log(`${sk} / ${emo}`, JSON.stringify(lookToEffects(LOOK[emo]), null, 2));
} else {
  const key = getKey();
  if (!fs.existsSync(CONFIG.outDir)) fs.mkdirSync(CONFIG.outDir);
  const jobs = allJobs().filter((j) => !fs.existsSync(path.join(CONFIG.outDir, `${j.key}.jpg`)));
  console.log(`▶ ${jobs.length}枚 生成（既存スキップ・host=${CONFIG.host}）`);
  let ok = 0, ng = 0;
  for (const j of jobs) {
    process.stdout.write(`  ${j.key} … `);
    try { console.log("✓ " + await generateOne(j, key)); ok++; }
    catch (e) { console.log("✗ " + e.message); ng++; }
    await sleep(CONFIG.gapMs);
  }
  console.log(`\n完了: 成功 ${ok} / 失敗 ${ng}`);
}
