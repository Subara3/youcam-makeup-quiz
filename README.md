# 細かすぎて伝わらないメイク当てクイズ

会議中・通勤中・飲み会中…**同じシチュエーション写真**に「今日の気分」をメイクで乗せ、
**喜・怒・哀・楽**の4択で当てる Web ゲーム。日常の“あるある”をメイクのさじ加減に。
（ZennFes Spring 2026 参加作品 / メイク加工は [YouCam](https://yce.perfectcorp.com/ja?affiliate=zennfes_spring_2026) の makeup-vto API）

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` / `styles.css` | 画面・YouCam調デザイン |
| `app.js` | ゲーム進行（タイトル→出題→結果、4択=同シチュの喜怒哀楽、種明かしで全パラメータ表示） |
| `data.js` | 14シチュ × 4気分（=56問）＋ **`makeupFor(sitKey,emo)`**（生成と種明かしの単一ソース） |
| `yc_api.mjs` | **採用ルート**：makeup-vto API でフルメイク生成（ファンデ〜リップ7カテゴリ・濃さ指定・透かしなし） |
| `yc_run.mjs` / `yc_login.mjs` | 旧・代替：YouCamエディタを Playwright で自動操作（透かし入り・色＋質感のみ） |
| `generate.mjs` | 旧：makeup-vto API の別実装（参考） |
| `PARAMS.md` | メイク・パラメータ メモ |
| `article.md` | Zenn 投稿用の記事 |
| `assets/scene_*.jpg` | 同一人物のシチュ写真14枚（Gemini製・3:4正規化・メイクの元画像） |
| `images/<situation>_<emotion>.jpg` | ★メイク画像（生成後に置く。あればゲームが自動使用） |

## 動かす

ESモジュールを使うので **HTTP配信**が必要（file:// では動きません）。

```bash
python -m http.server 8123   # → http://localhost:8123/
```

公開は上記ファイル一式（＋ `images/`）を置くだけ。ビルド不要。GitHub Pages で公開中：
https://subara3.github.io/youcam-makeup-quiz/

## メイク画像を作る（採用＝makeup-vto API）

```bash
echo "あなたのAPIキー(sk-…)" > youcam_key.txt   # https://yce.perfectcorp.com/api-console/
node yc_api.mjs                  # 全56枚（既存はスキップ＝再実行で続きから）
node yc_api.mjs meeting commute  # シチュ指定
```

- 認証は V2＝Bearer のみ。出力は**透かしなし・高解像度**。
- メイクの中身は `data.js` の `makeupFor()` が単一ソース（生成も種明かし表示も同じ値）。
- カテゴリ別スキーマ・pattern ラベル等の要点は `PARAMS.md` 参照。
- 鍵 `youcam_key.txt`（と未使用の `youcam_secret.txt`）は **`.gitignore` 済**。GitHubに上げない。

> 代替（無料・要ログイン）：`node yc_login.mjs` → `node yc_run.mjs`（YouCamエディタを自動操作。色＋質感のみ・透かし入り）。

## ライセンス / 権利

- 顔写真（`assets/scene_*` 等）は Gemini 生成。配布条件は要確認（未定）。
- メイク画像は YouCam makeup-vto API 出力。公開条件は YouCam makeup-vto API（利用規約）を確認のこと。
