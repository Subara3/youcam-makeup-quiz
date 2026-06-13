# メイク・パラメータ メモ（makeup-vto API・フルメイク）

> 各シチュ写真に、感情ごとのフルメイク（ファンデ＋チーク＋アイシャドウ＋アイライナー＋眉＋ハイライト＋リップ）を
> YouCam makeup-vto API で適用。透かしなし・濃さ（colorIntensity 0–100）も指定どおり反映。
> 生成も種明かし表示も `data.js` の **`makeupFor(sitKey, emo)`** が単一ソース。画像キー: `<situation>_<emotion>.jpg`。

## 気分は顔のどこに出すか

| 気分 | 主にどこへ | 具体 |
| --- | --- | --- |
| 喜 | ツヤと輝き | ファンデのツヤ↑・ラメのアイシャドウ・グロスのリップ・ハイライト強め |
| 怒 | 目元と口元の輪郭 | 眉とアイラインを締める・深い赤のマットリップ |
| 哀 | 肌の血色 | ファンデで血色を抜く（ツヤ最小）・くすんだ薄リップ・他は最小限 |
| 楽 | やわらかさ | 自然な血色・シアーのコーラルリップ・尖り無し |

考え方：色相＝温度／質感＝強度／血色（ファンデ・チーク・ハイライト）＝エネルギー／主役はリップ。
シチュごとに、上記ジャンルを保ったままリップ色・アイシャドウ・濃さを散らす（`makeupFor` 内の VAR プールを index で選択）。

## API のキモ（カテゴリ別スキーマ）

認証は V2＝`Authorization: Bearer <api_key>` のみ。host `https://yce-api-01.makeupar.com`。
流れ：file（メタ→署名URLにPUT）→ task（effects）→ poll → 結果URL。

- `foundation`：`palettes:[{color, colorIntensity, coverageIntensity, glowIntensity, texture, smoothness, thickness}]`（pattern不要）
- `lip_color`：`shape:{name:"original"}` ＋ `style:{type:"full"|"ombre"|"twoTone"}` ＋ palettes `{color,texture,colorIntensity}`。
  gloss は `gloss`＋`transparencyIntensity`、sheer は `transparencyIntensity` が必須。
- `blush`/`eye_shadow`：`pattern:{type:"color", name:"1color1"}` ＋ palettes `{color,texture,colorIntensity}`。
  eye_shadow の texture は matte/shimmer/metallic。shimmer は `shimmerColor`＋`shimmerDensity/Intensity/Size` が必須。
- `eye_liner`：`pattern:{type:"shape", name:"Arabic1"}` ＋ palettes `{color,texture:"matte",colorIntensity}`。
- `eyebrows`：`pattern:{type:"shape", name:"Curved1", curvature, definition, thickness}` ＋ palettes `{color,texture,colorIntensity,coverageIntensity,glowIntensity,smoothness,thickness}`。
- `highlighter`：`pattern:{type:"shape", name:"OvalFace2"}` ＋ palettes `{color,texture:"shimmer",colorIntensity,glowIntensity,shimmerColor,shimmerDensity/Intensity/Size}`。

`pattern.name` は実在ラベルが必須（公開カタログ `https://plugins-media.makeupar.com/wcm-saas/patterns/<category>.json` の `label`）。
`1 color`/`2 colors` の別＝渡す palette の数。

## 全56問

14シチュ（会議中／Web会議中／プレゼン中／通勤中／残業中／面接中／名刺交換／手帳タイム／書類を読む／時計を見る／電話中／食事中／飲み会中／休日）× 4気分。
各問の実数値は種明かし画面（`makeupFor` の出力）に表示。
