// YouCam AIメイク を1セッション開きっぱなしで自動操作し、
// 「シチュ写真 × 気分メイク差分」を全56枚生成する（要ログイン: .yc-profile）。
//   ・ブラウザは閉じない。写真はエディタ内アップロードで差し替え（再起動なし）
//   ・撮影は必ず previewPanel（=メイク適用済み・YouCam透かし入り）のみ。
//     メイクが乗らなかった場合は素写真を保存せず、リトライ。
//   ・タブクラッシュ時はページを作り直して継続。
//   ・既に images/<key>.jpg があればスキップ（再実行で続きから）
//   使い方: node yc_run.mjs               … 未生成ぶん全部
//           node yc_run.mjs meeting commute … シチュkey指定
import { chromium } from "playwright";
import { SITUATIONS, LOOK, EMO } from "./data.js";
import fs from "node:fs";
const DIR = "D:/すばら３プログラミング活動/YouCan";
const OUT = DIR + "/images";
const EDITOR = "https://yce.perfectcorp.com/ja/ai-makeup";
const DSF = 1.3;

const FIN = { matte:"マット", satin:"サテン", sheer:"シアー", gloss:"グロス", shimmer:"シマー" };
const pct = x => Math.round(Math.max(0,Math.min(1,x))*100);
const hex2rgb = h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const sleep = ms => new Promise(r=>setTimeout(r,ms));

function targets(look){ // 肌トーンはエディタで再現不可のため省略
  const t=[];
  if(look.cheekI>0) t.push({cat:"チーク", hex:look.cheek, intensity:pct(look.cheekI)});
  if(look.shadow&&look.shadowI>0) t.push({cat:"アイシャドウ", hex:look.shadow, intensity:pct(look.shadowI)});
  if(look.liner>0) t.push({cat:"アイライナー", hex:"#2a2020", intensity:pct(look.liner)});
  if(look.brow>0) t.push({cat:"アイブロウ", hex:"#5a4030", intensity:pct(look.brow)});
  if(look.glow>0) t.push({cat:"ハイライト", hex:"#fff4ea", intensity:pct(look.glow)});
  if(look.lipI>0) t.push({cat:"リップ", texture:FIN[look.lipFin]||"サテン", hex:look.lip, intensity:pct(look.lipI)});
  return t;
}

async function loadPhoto(page, path){
  for(const inp of await page.$$('input[type=file]')){ try{ await inp.setInputFiles(path); break; }catch{} }
  await sleep(2500);
  for(const t of ["続行","アップロード","写真をアップロード","変更を破棄","OK","はい"]){
    const b=page.getByText(t,{exact:true}).last();
    if(await b.count().catch(()=>0)){ await b.click({timeout:2000}).catch(()=>{}); await sleep(1000); }
  }
  await sleep(6500);
}

// カテゴリを開いて最寄りスウォッチを選択。選択が反映されたら true
async function applyCategory(page, t){
  await page.getByText(t.cat,{exact:true}).first().click({timeout:6000}); await sleep(700);
  if(t.texture){ await page.getByText(t.texture,{exact:true}).first().click({timeout:3000}).catch(()=>{}); await sleep(400); }
  // スウォッチが出るまで待つ
  for(let i=0;i<8;i++){ const n=await page.evaluate(()=>document.querySelectorAll('[class*="color-ball_singleColor"]').length); if(n>3)break; await sleep(500); }
  const [tr,tg,tb]=hex2rgb(t.hex);
  const clicked=await page.evaluate(({tr,tg,tb})=>{
    const balls=[...document.querySelectorAll('[class*="color-ball_singleColor"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>6&&r.x<400&&r.y>40;});
    let best=null,bd=1e9; for(const e of balls){const m=getComputedStyle(e).backgroundColor.match(/\d+/g);if(!m)continue;const d=(m[0]-tr)**2+(m[1]-tg)**2+(m[2]-tb)**2;if(d<bd){bd=d;best=e;}}
    if(best){best.click();return true;} return false;
  },{tr,tg,tb});
  await sleep(600);
  // 濃さ
  await page.evaluate((val)=>{const r=[...document.querySelectorAll('input[type=range]')].find(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.x<420;});
    if(!r)return;const max=+(r.max||100),min=+(r.min||0);const v=Math.round(min+(max-min)*(val/100));
    const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(r,String(v));
    r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));},t.intensity).catch(()=>{});
  await sleep(350);
  return clicked;
}

async function applyLook(page, look){
  for(const t of targets(look)){
    try{ await applyCategory(page,t); }
    catch(e){ console.log(`     [${t.cat}] skip: ${e.message.split("\n")[0]}`); }
  }
}

// previewPanel（メイク結果）の矩形。無ければ null（=メイク未適用）
async function previewRect(page){
  return page.evaluate(()=>{
    const c=[...document.querySelectorAll('img,canvas')].map(e=>({e,r:e.getBoundingClientRect(),cls:(e.className||'')+''}))
      .filter(o=>/previewPanel_js_image/.test(o.cls) && o.r.width>300 && o.r.height>200);
    if(!c.length)return null; const r=c[0].r; return {x:r.x,y:r.y,width:r.width,height:r.height};
  }).catch(()=>null);
}

const isCrash = e => /crash|Target closed|Target page|detached|Execution context/i.test(e?.message||"");

// ---- main ----
const filter = process.argv.slice(2);
const sits = filter.length ? SITUATIONS.filter(s=>filter.includes(s.key)) : SITUATIONS;
if(!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const jobs=[];
for(const s of sits) for(const emo of Object.keys(LOOK)){
  const key=`${s.key}_${EMO[emo].key}`;
  if(fs.existsSync(`${OUT}/${key}.jpg`)) continue;
  jobs.push({s,emo,key});
}
console.log(`▶ 生成対象 ${jobs.length}枚（既存はスキップ）`);
if(!jobs.length){ console.log("全て生成済み。"); process.exit(0); }

const ctx = await chromium.launchPersistentContext(DIR+"/.yc-profile",{ headless:false, viewport:{width:1500,height:1100}, deviceScaleFactor:DSF, locale:"ja-JP" });
let page = ctx.pages()[0] || await ctx.newPage();
async function freshPage(){ try{ if(page && !page.isClosed()) await page.close(); }catch{} page=await ctx.newPage(); await page.goto(EDITOR,{waitUntil:"domcontentloaded",timeout:60000}); await sleep(3500); }
await page.goto(EDITOR,{ waitUntil:"domcontentloaded", timeout:60000 }); await sleep(3500);

async function doJob(j){
  await loadPhoto(page, DIR+"/"+j.s.img);
  await applyLook(page, LOOK[j.emo]);
  // previewPanel が出る（メイクがレンダリングされた）まで待つ。出なければリップ再適用。
  let rect=null;
  for(let i=0;i<10;i++){
    rect=await previewRect(page); if(rect) break;
    await sleep(1500);
    if(i===3||i===6){ const lip=targets(LOOK[j.emo]).find(t=>t.cat==="リップ"); if(lip) await applyCategory(page,lip).catch(()=>{}); }
  }
  if(!rect) return false;
  await sleep(900);
  await page.screenshot({path:`${OUT}/${j.key}.jpg`, type:"jpeg", quality:90, clip:{x:rect.x+1,y:rect.y+1,width:rect.width-2,height:rect.height-2}});
  return true;
}

let ok=0,ng=0;
for(const j of jobs){
  process.stdout.write(`[${j.s.label}/${j.emo}] ${j.key} … `);
  let done=false;
  for(let attempt=0; attempt<2 && !done; attempt++){
    try{ done=await doJob(j); if(!done && attempt===0){ console.log("retry…"); await freshPage(); } }
    catch(e){ if(isCrash(e)){ console.log("crash→復帰"); await freshPage(); } else { console.log("err:"+e.message.split("\n")[0]); await freshPage(); } }
  }
  if(done){console.log("✓");ok++;} else {console.log("✗");ng++;}
}
console.log(`\n完了: 成功 ${ok} / 失敗 ${ng} → images/`);
await ctx.close();
