# 日本語ローカライゼーション完了

## 📋 変更されたファイル

### 1. `src/app/layout.tsx`
- **title**: "Drip Rate Calculator | R.Y. Group" → **"点滴計算機 | R.Y. Group"**
- **description**: "High-precision IV drip rate calculator with metronome for healthcare professionals" → **"看護師のための高精度点滴滴下計算・リズムガイドツール"**
- **appleWebApp.title**: "Drip Calculator" → **"点滴計算機"**
- **lang属性**: "en" → **"ja"**

---

### 2. `src/components/Calculator.tsx`

#### ヘッダー
- **タイトル**: "IV Drip Rate Calculator" → **"点滴滴下計算機"**
- **サブタイトル**: "Calculate precise drop rates with metronome assistance" → **"高精度な滴下数計算とリズムガイド"**

#### 入力フィールド
- **総輸液量ラベル**: "Total Volume (mL)" → **"総輸液量 (mL)"**
- **プレースホルダー**: "Enter volume" → **"輸液量を入力"**

- **予定時間ラベル**: "Duration" → **"予定時間"**
- **時間プレースホルダー**: "Hours" → **"時間"**
- **分プレースホルダー**: "Minutes" → **"分"**
- **時間ラベル**: "Hours" → **"時間"**
- **分ラベル**: "Minutes" → **"分"**

- **滴下セットラベル**: "Drop Factor (drops/mL)" → **"滴下セット (滴/mL)"**
- **ボタン表示**: "20" → **"20滴"**, "60" → **"60滴"**

#### 計算結果
- **セクションタイトル**: "Calculation Results" → **"計算結果"**
- **滴下数ラベル**: "Drops per Minute" → **"滴下数"**
- **単位**: "gtt/min" → **"滴/分"**
- **間隔ラベル**: "Seconds per Drop" → **"1滴の間隔"**
- **単位**: "seconds" → **"秒"**
- **設定表示**: "Rate: {volume} mL over {hours}h {minutes}min with {dropFactor} drops/mL factor" → **"設定: {volume} mLを{hours}時間{minutes}分で投与（{dropFactor}滴/mL）"**

#### フッター
- "Produced by R.Y. Group" → **変更なし**
- "We're hiring healthcare technology professionals" → **"医療技術専門職を募集しています"**

---

### 3. `src/components/Metronome.tsx`

- **タイトル**: "Drip Metronome" → **"滴下メトロノーム"**
- **音声ボタンaria-label**:
  - "Mute sound" → **"音声ガイドをオフ"**
  - "Enable sound" → **"音声ガイドをオン"**
- **開始ボタン**: "Start Metronome" → **"リズムを開始"**
- **停止ボタン**: "Stop Metronome" → **"リズムを停止"**
- **実行中メッセージ**: "Metronome is running at {X} beats per minute" → **"メトロノーム作動中 ({X} 回/分)"**

---

### 4. `src/components/DisclaimerModal.tsx`

- **タイトル**: "Important Disclaimer" → **"ご利用前の確認"**
- **説明**: "This drip rate calculator is a support tool designed to assist healthcare professionals." → **"本アプリは滴下計算を補助するためのツールです。"**
- **警告文**: "Final verification must always be done visually by a qualified professional. This tool does not replace clinical judgment or proper medical procedures." → **"最終的な設定は、必ず医療従事者による目視と確認で行ってください。計算結果によって生じた事象について、本アプリは責任を負いかねます。"**
- **承諾ボタン**: "I Understand & Agree" → **"承諾して利用を開始する"**
- **注釈**: "By clicking "I Understand & Agree", you acknowledge that you have read and understood this disclaimer." → **"ボタンをクリックすることで、上記の内容を理解し承諾したものとみなします。"**

---

### 5. `public/manifest.json`

- **name**: "IV Drip Rate Calculator" → **"点滴計算機"**
- **short_name**: "Drip Calc" → **"点滴計算"**
- **description**: "High-precision IV drip rate calculator with metronome for healthcare professionals" → **"看護師のための高精度点滴滴下計算・リズムガイドツール"**
- **lang**: 追加 → **"ja"**

---

### 6. `src/app/offline/page.tsx`

- **タイトル**: "You're Offline" → **"オフラインです"**
- **メッセージ**: "Please check your internet connection and try again." → **"インターネット接続を確認してから、もう一度お試しください。"**

---

## 🎯 日本語化の特徴

### 医療用語の適切な使用
- **点滴**: IV drip → 医療現場で一般的な用語
- **滴下**: drop rate → 正確な医療用語
- **滴/分**: gtt/min → 日本の医療現場で使用される単位表記
- **輸液量**: infusion volume → 医療現場での標準用語
- **滴下セット**: drop factor set → 実際の医療機器の呼称

### 自然な日本語表現
- **リズムガイド**: metronome assistance → 看護師にとってわかりやすい表現
- **承諾して利用を開始する**: 医療アプリとして適切な丁寧な表現
- **医療従事者による目視と確認**: 責任の所在を明確にする適切な表現

---

## ✅ テスト推奨項目

ローカライズ後、以下の項目を確認してください：

1. ✅ すべてのテキストが日本語で正しく表示される
2. ✅ 入力フィールドのプレースホルダーが日本語で表示される
3. ✅ 計算結果の単位表記が正しい（滴/分、秒）
4. ✅ 免責事項モーダルのテキストが完全に日本語化されている
5. ✅ PWAインストール時のアプリ名が「点滴計算機」と表示される
6. ✅ iOSホーム画面での表示名が「点滴計算機」になっている
7. ✅ オフライン時のメッセージが日本語で表示される
8. ✅ メトロノームの動作メッセージが日本語で表示される

---

## 🚀 デプロイ手順

```bash
# 1. ローカルでビルドテスト
npm run build

# 2. 変更をコミット
git add .
git commit -m "feat: Add Japanese localization for medical professionals

- Translate all UI text to Japanese
- Use appropriate medical terminology
- Update manifest.json with Japanese metadata
- Change lang attribute to 'ja'"

# 3. プッシュ
git push origin main
```

---

## 📱 PWAインストール時の表示

### iOS (Safari)
- ホーム画面のアイコン名: **点滴計算機**
- スプラッシュ画面のタイトル: **点滴計算機**

### Android (Chrome)
- アプリ一覧での表示名: **点滴計算機**
- インストールプロンプト: **「点滴計算機」をインストールしますか？**

---

## 🎨 将来的な拡張

今後、多言語対応を検討する場合は、以下のアプローチを推奨します：

1. **i18n ライブラリの導入** (next-i18next または next-intl)
2. **言語切り替え機能の追加**
3. **英語版の保持** (en.json, ja.json 形式)

現在は日本市場向けに完全に日本語化されています。

---

**ローカライゼーション完了日**: 2026-02-16
**対象市場**: 日本の医療機関・看護師
**言語**: 日本語 (ja)
