@echo off
REM ESLint修正検証スクリプト (Windows版)
REM このスクリプトはローカルでビルドとLintチェックを実行します

echo.
echo 🔍 ESLint修正検証スクリプト
echo ================================
echo.

REM 1. 依存関係のチェック
echo 📦 Step 1: 依存関係のチェック...
if not exist "node_modules\" (
    echo node_modules が見つかりません。npm install を実行します...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install が失敗しました
        exit /b 1
    )
) else (
    echo ✓ node_modules が存在します
)
echo.

REM 2. TypeScript型チェック
echo 🔍 Step 2: TypeScript型チェック...
call npm run type-check
if errorlevel 1 (
    echo ❌ TypeScript型チェック: 失敗
    exit /b 1
)
echo ✓ TypeScript型チェック: 成功
echo.

REM 3. ESLintチェック
echo 🔍 Step 3: ESLintチェック...
call npm run lint
if errorlevel 1 (
    echo ❌ ESLint: エラーが検出されました
    exit /b 1
)
echo ✓ ESLint: エラーなし
echo.

REM 4. ビルドテスト
echo 🏗️  Step 4: プロダクションビルド...
call npm run build
if errorlevel 1 (
    echo ❌ ビルド: 失敗
    exit /b 1
)
echo ✓ ビルド: 成功
echo.

REM 成功メッセージ
echo ================================
echo 🎉 すべてのチェックが成功しました！
echo.
echo 次のステップ:
echo 1. git add src/components/Metronome.tsx
echo 2. git commit -m "fix: resolve ESLint errors in Metronome component"
echo 3. git push origin main
echo.
echo Vercelが自動的にデプロイを開始します。
echo ================================
pause
