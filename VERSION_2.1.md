# 点滴計算機 Ver.2.1 リリースノート

## 🎉 Ver.2.1 の主要アップデート

**リリース日**: 2026年2月16日
**アップデート概要**: UI/UX改善、不具合修正、タブ形式ナビゲーション実装

---

## ✨ 新機能

### 1. タブ形式ナビゲーション
- **画面下部の固定タブナビゲーション**
  - 「計算・リズム」タブ: 点滴計算、プリセット、メトロノーム機能
  - 「タイマー一覧」タブ: 登録済みタイマーの管理と履歴表示
- **スムーズな遷移アニメーション**
  - タブ切り替え時のフェード＆スライドエフェクト
  - 直感的で快適なユーザー体験

### 2. メトロノームからタイマー自動作成
- **「このリズムでタイマーを開始」ボタン**
  - メトロノーム停止時に表示
  - 現在の計算結果（輸液量・時間）から自動的にタイマーを作成
  - 終了予定時刻を即座に通知
- **ワンタップでタイマー登録**
  - 計算結果を基に素早くタイマーをセット
  - 看護業務の効率化を実現

---

## 🐛 不具合修正

### メトロノーム音声の問題
**問題**: ブラウザの自動再生制限により音が出ない
**修正内容**:
- `AudioContext.resume()` を開始ボタン押下時に確実に実行
- ユーザーアクション後にオーディオコンテキストを確実に再開
- 音声再生の信頼性が大幅に向上

### 振動機能の問題と対応
**問題**: 振動が作動しない、iOS Safari非対応
**修正内容**:
- `navigator.vibrate` の適切な実装
- 開始時に初回振動（50ms）を追加
- リズムに合わせた振動パターンの改善
- **iOS Safari非対応時の対応**:
  - デバイス互換性を自動検出
  - 非対応時は「お使いのブラウザは振動機能に非対応です」メッセージを表示
  - 振動ボタンを無効化し、視覚ガイドの利用を促進

### タイマー登録の問題
**問題**: ボタンを押してもタイマーが登録されない
**修正内容**:
- タイマー登録ロジックの改善
- `forwardRef` と `useImperativeHandle` を使用した外部参照の実装
- LocalStorage保存の確実性向上
- 詳細なエラーハンドリングとコンソールログの追加
- 通知許可が拒否されてもタイマー自体は作成されるように変更

---

## 🎨 UI/UXの改善

### タブナビゲーション
- **固定ボトムナビゲーション**
  - 常に画面下部に表示
  - アクティブタブはグラデーション背景と上部ボーダーで強調
  - サクラピンクとミントグリーンのテーマカラーで視覚的に区別
- **タブ切り替えアニメーション**
  - `opacity` と `translate` を使用したスムーズな遷移
  - 300msの自然なアニメーション時間
  - 非アクティブタブは `pointer-events-none` で操作を防止

### メトロノーム
- iOS Safari非対応時の明確なフィードバック
- 振動ボタンの状態表示改善（無効時はグレーアウト）
- 「このリズムでタイマーを開始」ボタンのミントグリーンデザイン

### タイマー一覧タブ
- 専用ヘッダーとアイコン
- 登録中のタイマーを見やすく一覧表示
- タイマー管理に特化したレイアウト

---

## 📦 技術的な変更

### コンポーネント構造の改善
1. **page.tsx**: タブ状態管理とナビゲーション実装
2. **Calculator.tsx**:
   - `multiTimerRef` をpropsとして受け取る
   - MultiTimer表示を削除（タブに分離）
   - タイマー作成コールバックを実装
3. **Metronome.tsx**:
   - `onStartTimer` コールバックpropsを追加
   - `resumeAudioContext` 関数でAudioContext再開を保証
   - `handleToggle` で初回振動とAudioContext再開を実行
   - iOS Safari非対応時のUI分岐処理
4. **MultiTimer.tsx**:
   - `forwardRef` でラップし、外部参照を可能に
   - `useImperativeHandle` で `addTimerFromCalculation` を公開
   - 通知許可の柔軟な処理（拒否時もタイマー作成可能）

### 型定義の強化
```typescript
// MultiTimer.tsx
export interface MultiTimerRef {
  addTimerFromCalculation: (volume: string, totalMinutes: number, name?: string) => Promise<void>
}

// Calculator.tsx
interface CalculatorProps {
  multiTimerRef?: React.RefObject<MultiTimerRef>
}

// Metronome.tsx
interface MetronomeProps {
  intervalMs: number
  isRunning: boolean
  onToggle: () => void
  onStartTimer?: () => void
  volume?: string
  totalMinutes?: number
}
```

### アニメーションとトランジション
- Tailwind CSS の `transition-all duration-300` を使用
- `opacity-100/0` と `translate-x-0/full` でスライド効果
- `tap-highlight-transparent` でモバイル体験の向上

---

## 📱 ブラウザ互換性

### 音声機能
- ✅ Chrome/Edge（デスクトップ・モバイル）
- ✅ Firefox（デスクトップ・モバイル）
- ✅ Safari（デスクトップ・モバイル）- AudioContext.resume() で対応

### 振動機能
- ✅ Chrome/Edge（Android）
- ✅ Firefox（Android）
- ❌ Safari（iOS）- Web Vibration API 非対応
  - 非対応時は視覚ガイドでカバー

### 通知機能
- ✅ Chrome/Edge（デスクトップ・モバイル）
- ✅ Firefox（デスクトップ・モバイル）
- ⚠️ Safari（iOS）- 制限あり、PWAインストール推奨

---

## 🎯 ユースケース

### 従来のワークフロー（Ver.2.0）
1. 点滴計算を実行
2. メトロノームでリズムガイド
3. 別途タイマーを手動で登録（輸液量・時間を再入力）

### 改善されたワークフロー（Ver.2.1）
1. 点滴計算を実行
2. メトロノームでリズムガイド
3. 「このリズムでタイマーを開始」をタップ → **自動でタイマー登録！**
4. 「タイマー一覧」タブで管理

**時間短縮**: 約15秒/回 → 複数の患者管理で大幅な効率化

---

## 🔧 開発者向け情報

### ビルドとデプロイ
```bash
# 型チェック
npm run type-check

# ESLint チェック
npm run lint

# プロダクションビルド
npm run build

# Vercel デプロイ
git add .
git commit -m "chore: upgrade to Ver.2.1"
git push origin main
```

### 環境要件
- Node.js 20.x 以上
- Next.js 14.2+
- React 18.3+
- TypeScript 5.3+

---

## 📝 今後の予定（Ver.2.2以降）

### 検討中の機能
- [ ] タイマー履歴の永続化と統計表示
- [ ] 複数プリセットのクイック切り替え
- [ ] ダークモード対応
- [ ] 英語・中国語などの多言語対応
- [ ] Apple Watch / Wear OS連携

### フィードバック募集
ご意見・ご要望は R.Y. Group までお寄せください。
医療現場の声を反映し、より良いツールを目指します。

---

## 📄 ライセンス

© 2026 R.Y. Group
本アプリケーションは医療専門職向けの補助ツールです。
実際の医療行為では必ず医師の指示に従い、ダブルチェックを行ってください。

---

**Ver.2.1 - より速く、より使いやすく、より確実に**
