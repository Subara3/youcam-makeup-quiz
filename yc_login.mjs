import { chromium } from "playwright";
import fs from "node:fs";
const DIR = "D:/すばら３プログラミング活動/YouCan";
const ctx = await chromium.launchPersistentContext(DIR + "/.yc-profile", {
  headless: false, viewport: { width: 1320, height: 900 }, locale: "ja-JP",
  args: ["--start-maximized"],
});
const p = ctx.pages()[0] || await ctx.newPage();
await p.goto("https://yce.perfectcorp.com/ja/ai-makeup", { waitUntil: "domcontentloaded", timeout: 60000 });
console.log("READY: ブラウザが開きました。右上『ログイン / 登録』からログインしてください。");
console.log("ログインできたら、チャットで『ログインした』と伝えてください。");
// LOGIN_DONE フラグが作られるまで開いたまま待機（最大20分）
for (let i = 0; i < 240; i++) {
  await p.waitForTimeout(5000);
  if (fs.existsSync(DIR + "/LOGIN_DONE")) { console.log("SIGNAL受信: セッションを保存して閉じます。"); break; }
  if (i % 6 === 0) console.log(`待機中... ${i*5}s（ログイン後『ログインした』と言ってください）`);
}
try { await ctx.storageState({ path: DIR + "/.yc-state.json" }); } catch {}
await ctx.close();
console.log("CLOSED");
