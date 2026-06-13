// YouCam makeup-vto API：シチュ写真 × 気分のフルメイク。data.js の makeupFor が単一ソース。
// 鍵: youcam_key.txt（Bearer V2）。出力: images/<situation>_<emotion>.jpg（透かしなし）。
import { SITUATIONS, EMO, EMO_ORDER, makeupFor } from "./data.js";
import fs from "node:fs";
const KEY = fs.readFileSync("youcam_key.txt","utf8").trim();
const HOST = "https://yce-api-01.makeupar.com";
const OUT = "images";
const sleep = ms => new Promise(r=>setTimeout(r,ms));

// pattern.name は CDN カタログの label。1色パターンを使用。
function toEffect(it){
  if(it.api==="foundation") return {category:"foundation",palettes:[{color:it.color,colorIntensity:it.ci,coverageIntensity:it.cov,glowIntensity:it.glow,texture:"matte",smoothness:50,thickness:50}]};
  if(it.api==="lip_color"){const pal={color:it.color,texture:it.tex,colorIntensity:it.ci}; if(it.gloss!=null)pal.gloss=it.gloss; if(it.trans!=null)pal.transparencyIntensity=it.trans; return {category:"lip_color",shape:{name:"original"},style:{type:"full"},palettes:[pal]};}
  if(it.api==="highlighter") return {category:"highlighter",pattern:{type:"shape",name:"OvalFace2"},palettes:[{color:it.color,texture:"shimmer",colorIntensity:it.ci,glowIntensity:it.glow,shimmerColor:"#fff3df",shimmerDensity:30,shimmerIntensity:30,shimmerSize:30}]};
  if(it.api==="eyebrows") return {category:"eyebrows",pattern:{type:"shape",name:"Curved1",curvature:50,definition:55,thickness:50},palettes:[{color:it.color,texture:it.tex||"matte",colorIntensity:it.ci,coverageIntensity:55,glowIntensity:8,smoothness:50,thickness:52}]};
  if(it.api==="eye_liner") return {category:"eye_liner",pattern:{type:"shape",name:"Arabic1"},palettes:[{color:it.color,texture:"matte",colorIntensity:it.ci}]};
  if(it.api==="eye_shadow"){const pal={color:it.color,texture:it.tex||"matte",colorIntensity:it.ci}; if((it.tex||"")==="shimmer"){pal.shimmerColor="#f5e3a0";pal.shimmerDensity=40;pal.shimmerIntensity=40;pal.shimmerSize=40;} return {category:"eye_shadow",pattern:{type:"color",name:"1color1"},palettes:[pal]};}
  return {category:it.api,pattern:{type:"color",name:"1color1"},palettes:[{color:it.color,texture:it.tex||"matte",colorIntensity:it.ci}]}; // blush
}
const effects = (sitKey, emo) => makeupFor(sitKey, emo).map(toEffect);

async function J(p,o={}){const r=await fetch(HOST+p,{...o,headers:{Authorization:`Bearer ${KEY}`,...(o.json?{"Content-Type":"application/json"}:{}),...(o.headers||{})},body:o.json?JSON.stringify(o.json):o.body});const t=await r.text();let d;try{d=JSON.parse(t)}catch{d=t}return{s:r.status,d};}
async function gen(imgPath, sitKey, emo){
  const img=fs.readFileSync(imgPath);
  let r=await J("/s2s/v2.0/file/makeup-vto",{method:"POST",json:{files:[{content_type:"image/jpeg",file_name:"s.jpg",file_size:img.length}]}});
  const f=r.d.data?.files?.[0]; if(!f?.requests?.[0]?.url)throw new Error("file: "+JSON.stringify(r.d).slice(0,120));
  const up=f.requests[0]; const pr=await fetch(up.url,{method:"PUT",headers:up.headers,body:img}); if(!pr.ok)throw new Error("PUT "+pr.status);
  r=await J("/s2s/v2.0/task/makeup-vto",{method:"POST",json:{src_file_id:f.file_id,effects:effects(sitKey,emo)}});
  const tid=r.d.data?.task_id; if(!tid)throw new Error("task: "+JSON.stringify(r.d).slice(0,200));
  for(let i=0;i<40;i++){await sleep(2500);const st=await J(`/s2s/v2.0/task/makeup-vto/${tid}`);const dd=st.d.data||{};const s=dd.task_status||dd.status;
    if(s==="success"||s==="succeeded"){const u=dd.results?.url||dd.results?.[0]?.url||dd.result?.url;if(!u)throw new Error("no url");return Buffer.from(await(await fetch(u)).arrayBuffer());}
    if(s==="error"||s==="failed")throw new Error("fail: "+(dd.error_message||JSON.stringify(dd)).slice(0,150));}
  throw new Error("timeout");
}
if(!fs.existsSync(OUT))fs.mkdirSync(OUT);
const only=process.argv.slice(2);
const jobs=[]; for(const sit of SITUATIONS){ if(only.length&&!only.includes(sit.key))continue; for(const emo of EMO_ORDER){const key=`${sit.key}_${EMO[emo].key}`; if(!fs.existsSync(`${OUT}/${key}.jpg`)) jobs.push({sit,key,emo});}}
console.log(`▶ フルメイクAPI生成（シチュ別に変化） ${jobs.length}枚`);
let ok=0,ng=0;
for(const j of jobs){process.stdout.write(`${j.key} … `);
  try{const buf=await gen(j.sit.img,j.sit.key,j.emo); fs.writeFileSync(`${OUT}/${j.key}.jpg`,buf); console.log("✓"); ok++;}
  catch(e){console.log("✗ "+e.message); ng++;}
  await sleep(600);
}
console.log(`\n完了: 成功 ${ok} / 失敗 ${ng}`);
