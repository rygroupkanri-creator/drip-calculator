#!/bin/bash

# ESLint修正検証スクリプト
# このスクリプトはローカルでビルドとLintチェックを実行します

echo "🔍 ESLint修正検証スクリプト"
echo "================================"
echo ""

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 依存関係のチェック
echo "📦 Step 1: 依存関係のチェック..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules が見つかりません。npm install を実行します...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ npm install が失敗しました${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ node_modules が存在します${NC}"
fi
echo ""

# 2. TypeScript型チェック
echo "🔍 Step 2: TypeScript型チェック..."
npm run type-check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript型チェック: 成功${NC}"
else
    echo -e "${RED}❌ TypeScript型チェック: 失敗${NC}"
    exit 1
fi
echo ""

# 3. ESLintチェック
echo "🔍 Step 3: ESLintチェック..."
npm run lint
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ESLint: エラーなし${NC}"
else
    echo -e "${RED}❌ ESLint: エラーが検出されました${NC}"
    exit 1
fi
echo ""

# 4. ビルドテスト
echo "🏗️  Step 4: プロダクションビルド..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ビルド: 成功${NC}"
else
    echo -e "${RED}❌ ビルド: 失敗${NC}"
    exit 1
fi
echo ""

# 成功メッセージ
echo "================================"
echo -e "${GREEN}🎉 すべてのチェックが成功しました！${NC}"
echo ""
echo "次のステップ:"
echo "1. git add src/components/Metronome.tsx"
echo "2. git commit -m 'fix: resolve ESLint errors in Metronome component'"
echo "3. git push origin main"
echo ""
echo "Vercelが自動的にデプロイを開始します。"
echo "================================"
