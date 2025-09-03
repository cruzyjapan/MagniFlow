# 検索API設定ガイド

MagniFlowは複数の検索APIをサポートしています。無料で使えるAPIを設定することで、より豊富な検索結果を取得できます。

## 🎯 クイックスタート（API不要）

APIキーなしでも以下の機能が利用可能です：
- RSS フィード（Qiita、Zenn、はてな、ITmedia等）
- GitHub API（認証なしで60回/時）
- DuckDuckGo Instant Answer API

## 📊 利用可能な検索API

### 1. Google Custom Search API（推奨）

**無料枠**: 100クエリ/日  
**用途**: ウェブ全体の検索、YouTube動画検索

#### セットアップ手順

1. **Google Cloud Console**にアクセス
   - https://console.cloud.google.com/

2. **新しいプロジェクトを作成**
   - プロジェクト名: `MagniFlow` など

3. **Custom Search JSON API を有効化**
   - 「APIとサービス」→「ライブラリ」
   - 「Custom Search API」を検索して有効化

4. **APIキーを作成**
   - 「APIとサービス」→「認証情報」
   - 「認証情報を作成」→「APIキー」
   - キーをコピー

5. **Programmable Search Engine を作成**
   - https://programmablesearchengine.google.com/
   - 「新しい検索エンジン」をクリック
   - 検索対象: 「ウェブ全体を検索」を選択
   - 検索エンジンIDをコピー

6. **環境変数に設定**
   ```env
   GOOGLE_API_KEY="your-api-key-here"
   GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"
   ```

### 2. YouTube Data API v3

**無料枠**: 10,000ユニット/日（約100検索）  
**用途**: YouTube動画の詳細検索

Google APIキーと同じキーを使用できます：
```env
# GOOGLE_API_KEYと同じ場合は設定不要
YOUTUBE_API_KEY="same-as-google-api-key"
```

### 3. Bing Web Search API

**無料枠**: Azure無料試用版で1,000クエリ/月  
**用途**: ウェブ、画像、動画、ニュース検索

#### セットアップ手順

1. **Azure Portal**にアクセス
   - https://portal.azure.com/

2. **Cognitive Services を作成**
   - 「リソースの作成」→「AI + Machine Learning」
   - 「Bing Search v7」を選択

3. **無料試用版を選択**
   - 価格レベル: F0（無料）

4. **APIキーを取得**
   - リソース → キーとエンドポイント
   - KEY1をコピー

5. **環境変数に設定**
   ```env
   BING_SEARCH_API_KEY="your-bing-api-key"
   ```

## 🔧 環境変数の設定

`.env.local`ファイルに以下を追加：

```env
# Google Search (100クエリ/日 無料)
GOOGLE_API_KEY="your-google-api-key"
GOOGLE_SEARCH_ENGINE_ID="your-search-engine-id"

# Bing Search (1,000クエリ/月 無料)
BING_SEARCH_API_KEY="your-bing-api-key"
```

## 📈 API使用状況の確認

### Google API
- https://console.cloud.google.com/apis/dashboard
- 「Custom Search API」→「指標」で使用状況を確認

### Bing API
- https://portal.azure.com/
- リソース → メトリックで使用状況を確認

## 🎮 検索の優先順位

MagniFlowは以下の優先順位で検索を実行します：

1. **Google Custom Search**（設定されている場合）
2. **Bing Web Search**（設定されている場合）
3. **無料検索**（RSS、GitHub、DuckDuckGo）

APIクォータを超えた場合は自動的に無料検索にフォールバックします。

## 💡 ヒント

### 検索クエリの最適化

日本語コンテンツを優先する場合：
- キーワードに「日本語」を追加
- 「site:jp」を含める

### APIクォータの節約

- 更新頻度を調整（手動更新推奨）
- 不要なタブを削除
- キーワードを絞り込む

### トラブルシューティング

**401 Unauthorized エラー**
- APIキーが正しいか確認
- APIが有効化されているか確認

**429 Too Many Requests エラー**
- 無料枠の上限に達しています
- 翌日まで待つか、別のAPIを使用

**検索結果が表示されない**
- ブラウザの開発者ツールでコンソールエラーを確認
- サーバーログを確認: `npm run dev`

## 📚 関連リンク

- [Google Custom Search API ドキュメント](https://developers.google.com/custom-search/v1/overview)
- [YouTube Data API ドキュメント](https://developers.google.com/youtube/v3)
- [Bing Search API ドキュメント](https://docs.microsoft.com/ja-jp/bing/search-apis/bing-web-search/)

## 🆓 完全無料で使い続ける方法

APIキーを設定しなくても、以下の機能で十分な検索が可能です：

- **RSS フィード**: 主要な日本の技術サイトをカバー
- **GitHub検索**: オープンソースプロジェクトの検索
- **DuckDuckGo**: 基本的なウェブ検索

これらは完全無料で、制限なく利用できます。