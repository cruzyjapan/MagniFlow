# MagniFlow - マガジンスタイル情報収集プラットフォーム仕様書

## 📚 プロジェクト概要

**システム名**: MagniFlow  
**コンセプト**: 複数の検索トピックをタブで管理し、収集した情報を雑誌のような美しいレイアウトで表示する、パーソナル情報キュレーションツール  
**開発手法**: AI CLIツール駆動開発（Claude Code CLI をメインに使用）  
**バージョン**: 1.0.0  
**作成日**: 2025年8月

---

## 🎯 システムの目的

- ウェブ上の情報を効率的に収集・整理
- 複数のトピックを同時に追跡
- 視覚的に魅力的な雑誌風インターフェースで情報を閲覧
- 個人の情報収集ワークフローを最適化

---

## 📋 機能要件

### 1. タブベース検索システム

#### 1.1 基本機能
- 複数タブの同時管理（最大10タブ）
- タブごとに異なる検索キーワード設定
- タブのカスタマイズ機能
  - 名前設定
  - カラーテーマ（8色から選択）
  - アイコン設定（50種類のプリセット）
- ドラッグ&ドロップによるタブ順序変更
- タブの複製機能
- タブのインポート/エクスポート（JSON形式）

#### 1.2 タブ管理
```
各タブの保持情報：
- タブID（UUID）
- タブ名
- キーワードリスト
- 検索ソース設定
- 更新スケジュール
- フィルター設定
- 最終更新日時
```

### 2. ディープリサーチ機能

#### 2.1 検索設定
- **キーワード入力**
  - 複数キーワード対応（最大10個）
  - AND/OR/NOT検索オペレータ
  - 完全一致/部分一致オプション
  - 除外キーワード設定

- **検索ソース**
  - ニュースサイト
  - ブログ
  - 学術記事（Google Scholar）
  - YouTube
  - カスタムRSSフィード

- **フィルター機能**
  - 言語設定（日本語、英語、その他）
  - 期間指定（24時間、3日、1週間、1ヶ月、カスタム）
  - ドメイン指定/除外
  - メディアタイプ（テキスト、画像、動画）

### 3. 雑誌風ページ生成

#### 3.1 レイアウトパターン
```
1. ヒーローレイアウト
   - 1つの大きな記事 + 4-6の小記事
   
2. グリッドレイアウト
   - 均等なカードサイズ（2x2、3x3、4x4）
   
3. マガジンレイアウト
   - 不規則なカードサイズ（Pinterest風）
   
4. リストレイアウト
   - 縦並びのカード表示
   
5. コンパクトレイアウト
   - タイトルと要約のみの高密度表示
```

#### 3.2 カード表示要素
- サムネイル画像（16:9）
- 記事タイトル（最大60文字）
- AI生成要約（100-200文字）
- ソース名とファビコン
- 公開日時（相対時間表示）
- 読了予想時間
- エンゲージメント指標（シェア数、いいね数など）
- カテゴリータグ

### 4. コンテンツ管理

#### 4.1 定期取得設定
```yaml
スケジュールオプション:
  間隔設定:
    - 15分ごと
    - 30分ごと
    - 1時間ごと
    - 3時間ごと
    - 6時間ごと
    - 12時間ごと
    - 24時間ごと
  
  カスタムスケジュール:
    - 曜日指定
    - 時間指定
    - タイムゾーン設定
  
  取得制限:
    - 1回あたりの最大記事数: 50
    - 重複チェック機能
```

#### 4.2 アーカイブシステム
- **自動アーカイブルール**
  - 30日経過後
  - 既読かつ7日経過
  - カスタムルール設定

- **手動アーカイブ**
  - 個別記事アーカイブ
  - 一括アーカイブ
  - アーカイブ理由の記録

- **アーカイブ管理**
  - アーカイブ検索
  - アーカイブ復元
  - 完全削除（90日後自動削除）

#### 4.3 データ保存
```
保存形式:
- ローカルストレージ（IndexedDB）
- クラウド同期（オプション）
- エクスポート形式:
  - JSON
  - CSV
  - Markdown
  - PDF
```

### 5. 検索・フィルター機能

#### 5.1 検索機能
- 全文検索（タイトル、要約、本文）
- ファジー検索対応
- 検索履歴保存（最大50件）
- 検索結果のハイライト表示

#### 5.2 フィルター
- **ステータス**: 未読/既読/お気に入り/アーカイブ
- **日付範囲**: カレンダーピッカー
- **ソース**: チェックボックス選択
- **タグ**: 複数選択可能
- **評価**: ★1-5
- **メディアタイプ**: テキスト/画像/動画

### 6. マークアップ機能

#### 6.1 ハイライト
- 5色のハイライトカラー
- ハイライト部分の一覧表示
- ハイライトのエクスポート

#### 6.2 アノテーション
- テキストメモ（最大500文字）
- 音声メモ（最大1分）
- 画像添付
- メモの検索機能

#### 6.3 タグシステム
- カスタムタグ作成（無制限）
- タグの色分け
- タグクラウド表示
- オートコンプリート

#### 6.4 評価システム
- 5段階評価（★）
- カスタム評価軸の追加
- 評価に基づくソート

---

## 🎨 デザイン仕様

### UI構成

```
┌─────────────────────────────────────────┐
│  Header                                 │
│  [Logo] [Search] [Tabs] [Settings]     │
├────────┬────────────────────────────────┤
│        │                                │
│  Side  │      Main Content Area         │
│  Bar   │                                │
│        │   [Article Cards Grid]         │
│        │                                │
│        │                                │
├────────┴────────────────────────────────┤
│  Footer [Pagination] [View Options]    │
└─────────────────────────────────────────┘
```

### レスポンシブブレークポイント

| デバイス | 幅 | カラム数 | サイドバー |
|---------|-----|---------|-----------|
| Desktop | 1440px+ | 4 | 表示 |
| Laptop | 1024px-1439px | 3 | 表示 |
| Tablet | 768px-1023px | 2 | 折りたたみ |
| Mobile | <768px | 1 | 非表示 |

### カラーパレット

```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
  
  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-500: #6b7280;
  --gray-900: #111827;
  
  /* Accent Colors */
  --accent-pink: #ec4899;
  --accent-purple: #8b5cf6;
  --accent-green: #10b981;
  --accent-yellow: #f59e0b;
  --accent-red: #ef4444;
}
```

### タイポグラフィ

```css
/* Heading Styles */
h1: 2.5rem (40px) - Bold
h2: 2rem (32px) - Semibold  
h3: 1.5rem (24px) - Medium
h4: 1.25rem (20px) - Medium

/* Body Text */
body: 1rem (16px) - Regular
small: 0.875rem (14px) - Regular
caption: 0.75rem (12px) - Regular

/* Font Family */
font-family: 'Inter', 'Noto Sans JP', system-ui, sans-serif;
```

---

## 🏗️ 技術スタック

### 開発ツール（AI CLI）

```yaml
primary_tool:
  name: "Claude Code CLI"
  version: "latest"
  用途:
    - メインの開発・コード生成
    - アーキテクチャ設計
    - コードレビュー
    - デバッグ支援
    - ドキュメント生成

secondary_tools:
  - name: "Gemini CLI"
    用途:
      - 代替コード生成
      - マルチモーダル処理（画像解析）
      - 大規模データ処理
      
  - name: "Cursor CLI"
    用途:
      - IDE統合開発
      - インラインコード補完
      - リファクタリング支援
```

### フロントエンド

```javascript
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript 5.x",
  "styling": "Tailwind CSS 3.x",
  "animation": "Framer Motion",
  "state": "Zustand",
  "data-fetching": "TanStack Query",
  "forms": "React Hook Form + Zod",
  "ui-components": "Radix UI",
  "icons": "Lucide Icons"
}
```

### バックエンド

```javascript
{
  "runtime": "Node.js 20.x",
  "framework": "Express.js",
  "database": "PostgreSQL 15",
  "cache": "Redis",
  "queue": "Bull",
  "orm": "Prisma",
  "auth": "NextAuth.js"
}
```

### 外部サービス

| サービス | 用途 |
|---------|------|
| Puppeteer | スクリーンショット生成 |
| OpenAI API | コンテンツ要約 |
| Algolia | 全文検索 |
| Cloudinary | 画像最適化・CDN |
| Sentry | エラートラッキング |
| Vercel | ホスティング |

---

## 📊 データベース設計

### ERD

```mermaid
erDiagram
    users ||--o{ tabs : owns
    tabs ||--o{ articles : contains
    articles ||--o{ user_actions : has
    articles ||--o{ archives : archived
    tabs ||--o{ schedules : has
    
    users {
        uuid id PK
        string email
        string name
        jsonb preferences
        timestamp created_at
    }
    
    tabs {
        uuid id PK
        uuid user_id FK
        string name
        string color
        string icon
        jsonb keywords
        jsonb sources
        jsonb filters
        timestamp created_at
        timestamp updated_at
    }
    
    articles {
        uuid id PK
        uuid tab_id FK
        string url
        string title
        text summary
        text content
        string thumbnail_url
        string source
        jsonb metadata
        timestamp published_at
        timestamp fetched_at
    }
    
    user_actions {
        uuid id PK
        uuid user_id FK
        uuid article_id FK
        enum action_type
        jsonb highlights
        text notes
        jsonb tags
        integer rating
        timestamp created_at
    }
    
    archives {
        uuid id PK
        uuid user_id FK
        uuid article_id FK
        string reason
        jsonb tags
        timestamp archived_at
    }
    
    schedules {
        uuid id PK
        uuid tab_id FK
        string cron_expression
        boolean is_active
        timestamp last_run
        timestamp next_run
    }
```

---

## 🔒 セキュリティ要件

### 認証・認可
- JWT トークンベース認証
- リフレッシュトークン実装
- 2要素認証（オプション）
- OAuth 2.0 (Google, GitHub)

### データ保護
- HTTPS通信の強制
- データベース暗号化
- XSS対策（Content Security Policy）
- CSRF対策
- Rate Limiting実装

### プライバシー
- GDPR準拠
- データエクスポート機能
- アカウント削除機能
- Cookie同意管理

---

## 🛠️ CLI ツール使い分けガイドライン

### Claude Code CLI（メイン開発ツール）

**使用場面：**
- プロジェクト構造の生成
- コンポーネント・モジュールの作成
- APIエンドポイントの実装
- ビジネスロジックの記述
- テストコードの生成
- ドキュメント作成
- コードレビュー・リファクタリング

**コマンド例：**
```bash
# 新機能の実装
claude-code implement feature --spec "タブごとの自動更新機能"

# バグ修正
claude-code fix --issue "記事重複問題"

# 最適化
claude-code optimize --target performance --file "src/lib/fetcher.ts"
```

### Gemini CLI（補助ツール）

**使用場面：**
- 画像・メディア処理
- 大規模データの分析・最適化
- 機械学習モデルの統合
- パフォーマンスボトルネックの特定

**コマンド例：**
```bash
# サムネイル生成の最適化
gemini-cli optimize images --batch --quality 85

# 記事分類モデルの実装
gemini-cli ml classify --train articles.json
```

### Cursor CLI（IDE統合開発）

**使用場面：**
- リアルタイムコーディング支援
- インラインドキュメント生成
- コード補完・提案
- デバッグ支援

**統合方法：**
```bash
# VSCode/Cursor での開発
cursor . --ai-mode enhanced

# ペアプログラミングモード
cursor pair --ai-assistant active
```

### 効率的な使い分けワークフロー

1. **設計フェーズ**: Claude Code CLI で全体設計
2. **実装フェーズ**: Cursor CLI でコーディング + Claude Code CLI で複雑なロジック
3. **最適化フェーズ**: Gemini CLI でパフォーマンス改善
4. **テストフェーズ**: Claude Code CLI でテスト生成・実行
5. **ドキュメントフェーズ**: Claude Code CLI でドキュメント自動生成

---

## 📈 成功指標（KPI）

| 指標 | 目標値 | 測定方法 |
|------|--------|---------|
| ページロード時間 | < 2秒 | Lighthouse |
| 記事取得成功率 | > 95% | ログ分析 |
| UI応答時間 | < 100ms | Performance API |
| モバイル利用率 | > 40% | Analytics |
| データ同期成功率 | > 99% | エラーログ |

---

## 🔧 開発環境セットアップ

### Claude Code CLI を使用した開発フロー

```bash
# プロジェクトの初期化
claude-code init magniflow

# 基本構造の生成
claude-code generate project --template next-magazine --name magniflow

# 機能モジュールの生成
claude-code generate module --name tab-manager
claude-code generate module --name article-fetcher
claude-code generate module --name content-parser

# コンポーネント生成
claude-code generate component --name ArticleCard --type ui
claude-code generate component --name TabNavigation --type layout
claude-code generate component --name SearchBar --type feature

# API エンドポイント生成
claude-code generate api --name articles --methods GET,POST
claude-code generate api --name tabs --methods CRUD
claude-code generate api --name schedules --methods GET,POST,DELETE

# データベーススキーマ生成
claude-code generate schema --from specification.md

# テストコード生成
claude-code generate tests --coverage 80

# ドキュメント生成
claude-code generate docs --format markdown
```

### Gemini CLI での補助開発

```bash
# 画像処理機能の実装
gemini-cli analyze images --optimize thumbnails

# 大規模データの処理最適化
gemini-cli optimize batch-processing --input articles.json
```

### Cursor CLI でのIDE統合開発

```bash
# Cursor でプロジェクトを開く
cursor .

# AIアシスト付きコーディング
cursor ai-mode --enable

# リファクタリング実行
cursor refactor --pattern mvc-to-clean-architecture
```

### 通常のセットアップ手順

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/magniflow.git
cd magniflow

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local

# データベースのセットアップ
npm run db:migrate
npm run db:seed

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test
```

### 環境変数設定（.env.local）

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/magniflow"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# CLI Tools
CLAUDE_CODE_API_KEY="your-claude-key"
GEMINI_API_KEY="your-gemini-key"

# Feature Flags
ENABLE_AI_SUMMARY="true"
ENABLE_AUTO_FETCH="true"
MAX_TABS_PER_USER="10"
```

---

## 📚 参考資料

### CLI ツールドキュメント
- [Claude Code CLI Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Gemini CLI Reference](https://ai.google.dev/gemini-api/docs/cli)
- [Cursor Documentation](https://docs.cursor.sh/)

### フレームワーク・ライブラリ
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## 📄 ライセンス

MIT License

---

## 👥 コントリビューター

- プロジェクトリード: [Your Name]
- 開発チーム: [Team Members]

---

*最終更新: 2025年8月*