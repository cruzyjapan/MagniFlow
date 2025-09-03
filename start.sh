#!/bin/bash

echo "🚀 MagniFlow - AIキュレーション情報収集ツール"
echo "==========================================="
echo ""

# 環境変数ファイルの確認
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local ファイルが見つかりません"
    echo "📝 .env.local.example からコピーして作成します..."
    cp .env.local.example .env.local
    
    # NEXTAUTH_SECRET を自動生成
    SECRET=$(openssl rand -base64 32)
    if [ $? -eq 0 ]; then
        # macOS と Linux の両方に対応
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/your-secret-key-here-generate-with-openssl-rand-base64-32/$SECRET/g" .env.local
        else
            sed -i "s/your-secret-key-here-generate-with-openssl-rand-base64-32/$SECRET/g" .env.local
        fi
        echo "✅ NEXTAUTH_SECRET を自動生成しました"
    else
        echo "⚠️  NEXTAUTH_SECRET の自動生成に失敗しました"
        echo "   .env.local を手動で編集してください"
    fi
    echo ""
fi

# Node.js バージョンチェック
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18.18以上が必要です"
    echo "   現在のバージョン: $(node -v)"
    exit 1
fi

# 依存関係のインストール
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストール中..."
    npm install
    echo ""
fi

# データディレクトリの作成
if [ ! -d ".data" ]; then
    echo "📁 データディレクトリを作成中..."
    mkdir -p .data
fi

# ポートの確認
PORT=${PORT:-3000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  ポート $PORT は使用中です"
    PORT=$((PORT + 1))
    echo "🔄 ポート $PORT を使用します"
fi

echo ""
echo "✨ 起動準備完了！"
echo ""
echo "📌 アクセス URL: http://localhost:$PORT"
echo "📌 ログイン: デモアカウント（任意のメールアドレス）"
echo ""
echo "🎯 使い方:"
echo "  1. タブを作成（＋ボタン）"
echo "  2. キーワードを入力（例: React, Next.js, TypeScript）"
echo "  3. 「記事を取得」ボタンをクリック"
echo ""
echo "📝 停止するには Ctrl+C を押してください"
echo ""
echo "==========================================="
echo ""

# 開発サーバーの起動
PORT=$PORT npm run dev