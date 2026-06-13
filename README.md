# 細かすぎて伝わらないメイク当てクイズ

会議中・通勤中・飲み会中…**同じシチュエーション写真**に「今日の気分」をメイク差分で乗せ、
**喜・怒・哀・楽**の4択で当てる Web ゲーム。日常の“あるある”をメイクのさじ加減に。
（ZennFes Spring 2026 参加作品 / メイク加工は [YouCam](https://yce.perfectcorp.com/ja?affiliate=zennfes_spring_2026)）

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` / `styles.css` | 画面・美容誌エディトリアル調デザイン |
| `app.js` | ゲーム進行（タイトル→出題→結果、4択=同シチュの喜怒哀楽、スコア、シェア） |
| `data.js` | 14シチュ × 4気分（=56問）。気分テキストと感情ベースのメイク `LOOK` |
| `yc_run.mjs` | **採用ルート**：YouCamエディタをPlaywrightで自動操作し差分を量産（透かし入り撮影） |
| `generate.mjs` | 代替：makeup-vto API で差分生成（要・有料ユニット）／`--params`でPARAMS.md再生成 |
| `PARAMS.md` | 全差分のメイク・パラメータ メモ（自動生成） |
| `article.md` | Zenn 投稿用の記事 |
| `assets/scene_*.jpg` | 同一人物のシチュ写真14枚（Gemini製・差分の元画像） |
| `images/<situation>_<emotion>.jpg` | ★メイク差分画像（生成後に置く。あればゲームが自動で使用） |
| `base.jpg` | ニュートラル正面写真（API版/予備用） |

## 動かす

ESモジュールを使うので **HTTP配信**が必要（file:// では動きません）。

```bash
python -m http.server 8123   # → http://localhost:8123/
```

公開は上記ファイル一式（＋ `images/`）を **FTPで置くだけ**。ビルド不要。

## メイク差分画像を作る

### A. ブラウザ自動操作（採用・無料／透かし入り）

YouCam の AI メイクは透かしなしDLが有料のため、編集結果のプレビューを直接キャプチャする。

```bash
# 1) 初回だけログイン（ブラウザが開くので手動ログイン→チャットで合図）
node yc_login.mjs
# 2) 全56枚を1セッションで生成（既存はスキップ＝再実行で続きから）
node yc_run.mjs
#    シチュ指定:  node yc_run.mjs meeting commute
```

- ログインセッションは `.yc-profile/` に保存（gitやFTPには上げない）。
- 透かし「YouCam Online Editor」入り。YouCam製の証なので記事用途では好都合。

### B. makeup-vto API（代替・要課金）

```powershell
$env:YOUCAM_API_KEY = "あなたのキー"   # https://yce.perfectcorp.com/api-console/
node generate.mjs                      # 全シチュ×4気分
node generate.mjs --params             # PARAMS.md 再生成（キー不要）
node generate.mjs --dry meeting 喜     # effects を表示
```

> エンドポイント/ボディ名は2026-06時点の公式ドキュメント準拠。
> APIが更新されていたら `generate.mjs` の `CONFIG` と `buildTaskBody()` を調整。

## ライセンス / 権利

- 顔写真（base / scene）は Gemini 生成。配布条件は要確認（未定）。
- メイク差分画像には YouCam の透かしが入る。公開条件は利用前に作者に確認のこと。
