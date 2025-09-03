/**
 * アプリケーション設定
 * 
 * MagniFlowの主要な設定項目
 */

export const appConfig = {
  // アプリケーション基本情報
  app: {
    name: 'MagniFlow',
    description: 'AIキュレーション情報収集ツール',
    version: '1.0.0',
  },

  // 検索設定
  search: {
    // 使用する検索ソース（すべて無料）
    sources: {
      rss: {
        enabled: true,
        feeds: {
          qiita: {
            trending: 'https://qiita.com/popular-items/feed',
            tagSearch: (tag: string) => `https://qiita.com/tags/${encodeURIComponent(tag)}/feed`,
          },
          zenn: {
            trending: 'https://zenn.dev/feed',
            topicSearch: (topic: string) => `https://zenn.dev/topics/${encodeURIComponent(topic)}/feed`,
          },
          hatena: {
            it: 'https://b.hatena.ne.jp/hotentry/it.rss',
            general: 'https://b.hatena.ne.jp/hotentry.rss',
          },
          itmedia: {
            news: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml',
            aiplus: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml',
          },
          techcrunch: {
            japan: 'https://jp.techcrunch.com/feed/',
          },
          publickey: {
            feed: 'https://www.publickey1.jp/atom.xml',
          },
        },
      },
      github: {
        enabled: true,
        apiUrl: 'https://api.github.com',
        rateLimit: 60, // 認証なしで60リクエスト/時
      },
      duckduckgo: {
        enabled: true,
        apiUrl: 'https://api.duckduckgo.com/',
      },
    },

    // デフォルトの検索設定
    defaults: {
      maxResults: 50,
      updateInterval: 'manual', // manual, 30min, 1h, 3h, 6h, 12h, 24h
      excludeOlderThan: 30, // 日数
    },
  },

  // タブ設定
  tabs: {
    maxPerUser: parseInt(process.env.MAX_TABS_PER_USER || '10'),
    defaultColor: '#3b82f6',
    defaultIcon: '📰',
    colors: [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // yellow
      '#ef4444', // red
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ],
    icons: [
      '📰', '📊', '💼', '🎮', '🎬', '🎵', '📚', '🏠',
      '⚽', '🍔', '✈️', '💻', '🔬', '🎨', '📷', '🌍',
    ],
  },

  // フィルター設定
  filters: {
    dateRanges: [
      { value: '24h', label: '24時間以内' },
      { value: '3d', label: '3日以内' },
      { value: '1w', label: '1週間以内' },
      { value: '1m', label: '1ヶ月以内' },
      { value: 'all', label: 'すべて' },
    ],
    mediaTypes: [
      { value: 'article', label: 'テキスト' },
      { value: 'news', label: 'ニュース' },
      { value: 'video', label: '動画' },
      { value: 'blog', label: 'ブログ' },
    ],
    languages: [
      { value: 'ja', label: '日本語' },
      { value: 'en', label: '英語' },
    ],
  },

  // ストレージ設定
  storage: {
    type: 'file', // 'file' or 'memory'
    dataDir: '.data',
    maxArticlesPerTab: 500,
    cleanupOlderThan: 90, // 日数
  },

  // 認証設定
  auth: {
    providers: {
      credentials: true, // デモアカウント
      google: !!process.env.GOOGLE_CLIENT_ID,
      github: !!process.env.GITHUB_CLIENT_ID,
    },
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30日
    },
  },

  // UI設定
  ui: {
    articlesPerPage: 20,
    enableDarkMode: true,
    enableNotifications: false,
    language: 'ja',
  },

  // 機能フラグ
  features: {
    aiSummary: process.env.ENABLE_AI_SUMMARY === 'true',
    autoFetch: process.env.ENABLE_AUTO_FETCH === 'true',
    export: true,
    import: true,
    sharing: false,
    collaboration: false,
  },
}

export type AppConfig = typeof appConfig