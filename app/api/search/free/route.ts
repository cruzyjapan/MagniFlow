import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Parser from 'rss-parser'
import axios from 'axios'

interface SearchResult {
  url: string
  title: string
  summary: string
  thumbnailUrl: string | null
  source: string
  publishedAt: string
  type: 'article' | 'video' | 'news' | 'blog'
}

const parser = new Parser({
  customFields: {
    item: ['thumbnail', 'media:thumbnail', 'media:content', 'enclosure']
  }
})

// 日本の技術系RSSフィード
const RSS_FEEDS = {
  qiita: {
    trending: 'https://qiita.com/popular-items/feed',
    search: (keyword: string) => `https://qiita.com/tags/${encodeURIComponent(keyword)}/feed`
  },
  zenn: {
    trending: 'https://zenn.dev/feed',
    search: (keyword: string) => `https://zenn.dev/topics/${encodeURIComponent(keyword)}/feed`
  },
  hatena: {
    it: 'https://b.hatena.ne.jp/hotentry/it.rss',
    general: 'https://b.hatena.ne.jp/hotentry.rss'
  },
  itmedia: {
    news: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml',
    aiplus: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml'
  },
  // TechCrunch Japanは証明書エラーのため無効化
  // techcrunch: {
  //   japan: 'https://jp.techcrunch.com/feed/'
  // },
  publickey: {
    feed: 'https://www.publickey1.jp/atom.xml'
  }
}

// DuckDuckGo Instant Answer API (制限付き)
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      }
    })

    const results: SearchResult[] = []
    
    // Abstract (概要)
    if (response.data.Abstract && response.data.AbstractURL) {
      results.push({
        url: response.data.AbstractURL,
        title: response.data.Heading || query,
        summary: response.data.Abstract,
        thumbnailUrl: response.data.Image || null,
        source: response.data.AbstractSource || 'DuckDuckGo',
        publishedAt: new Date().toISOString(),
        type: 'article'
      })
    }

    // Related Topics（最大10件）
    if (response.data.RelatedTopics) {
      for (const topic of response.data.RelatedTopics.slice(0, 10)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            url: topic.FirstURL,
            title: topic.Text.split(' - ')[0] || query,
            summary: topic.Text,
            thumbnailUrl: topic.Icon?.URL || null,
            source: 'DuckDuckGo',
            publishedAt: new Date().toISOString(),
            type: 'article'
          })
        }
      }
    }

    return results
  } catch (error) {
    console.error('DuckDuckGo search error:', error)
    return []
  }
}

// GitHub API検索 (認証なしで60リクエスト/時)
async function searchGitHub(keyword: string, limit: number = 30): Promise<SearchResult[]> {
  try {
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `${keyword} language:javascript language:typescript`,
        sort: 'stars',
        order: 'desc',
        per_page: Math.min(limit, 100)  // GitHub APIの上限は100
      },
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    return response.data.items.map((repo: any) => ({
      url: repo.html_url,
      title: `${repo.name} - ${repo.owner.login}`,
      summary: repo.description || `${keyword}に関連するGitHubリポジトリ`,
      thumbnailUrl: repo.owner.avatar_url,
      source: 'GitHub',
      publishedAt: repo.updated_at,
      type: 'article' as const
    }))
  } catch (error) {
    console.error('GitHub search error:', error)
    return []
  }
}

// RSSフィードから記事を取得
async function fetchFromRSS(
  feedUrl: string, 
  keywords: string[] = [], 
  maxItems: number = 20,
  excludeKeywords: string[] = [],
  searchOperator: 'AND' | 'OR' = 'OR'
): Promise<SearchResult[]> {
  try {
    const feed = await parser.parseURL(feedUrl)
    const results: SearchResult[] = []
    let itemCount = 0

    for (const item of feed.items || []) {
      if (itemCount >= maxItems) break
      
      const content = `${item.title} ${item.contentSnippet || ''}`.toLowerCase()
      
      // 除外キーワードチェック
      if (excludeKeywords.length > 0) {
        const hasExcludedWord = excludeKeywords.some(excludeWord => 
          content.includes(excludeWord.toLowerCase())
        )
        if (hasExcludedWord) continue
      }
      
      // キーワードフィルタリング
      if (keywords.length > 0) {
        // 各キーワードを単語に分割してフラット化
        const allWords = keywords.flatMap(keyword => 
          keyword.toLowerCase().split(/\s+/)
        ).filter(word => word.length > 0)
        
        if (searchOperator === 'AND') {
          // AND検索: すべての単語を含む
          const hasAllWords = allWords.every(word => 
            content.includes(word)
          )
          if (!hasAllWords) continue
        } else {
          // OR検索: いずれかの単語を含む
          const hasAnyWord = allWords.some(word => 
            content.includes(word)
          )
          if (!hasAnyWord) continue
        }
      }
      
      itemCount++

      // サムネイル取得
      let thumbnailUrl = null
      if (item['media:thumbnail']) {
        thumbnailUrl = item['media:thumbnail'].$.url
      } else if (item.enclosure && item.enclosure.type?.startsWith('image')) {
        thumbnailUrl = item.enclosure.url
      }

      // ソース判定
      let source = 'RSS'
      let type: SearchResult['type'] = 'article'
      
      if (feedUrl.includes('qiita.com')) {
        source = 'Qiita'
        type = 'article'
      } else if (feedUrl.includes('zenn.dev')) {
        source = 'Zenn'
        type = 'article'
      } else if (feedUrl.includes('hatena')) {
        source = 'はてな'
        type = 'blog'
      } else if (feedUrl.includes('itmedia')) {
        source = 'ITmedia'
        type = 'news'
      } else if (feedUrl.includes('techcrunch')) {
        source = 'TechCrunch'
        type = 'news'
      } else if (feedUrl.includes('publickey')) {
        source = 'Publickey'
        type = 'news'
      }

      results.push({
        url: item.link || '',
        title: item.title || '',
        summary: item.contentSnippet || item.content || '',
        thumbnailUrl,
        source,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        type
      })
    }

    return results
  } catch (error: any) {
    // 404エラーは警告レベルでログ出力（タグが存在しない場合によく発生）
    if (error.message && error.message.includes('404')) {
      console.warn(`[RSS] Tag not found or feed unavailable: ${feedUrl}`)
    } else {
      console.error(`[RSS] Fetch error for ${feedUrl}:`, error.message || error)
    }
    return []
  }
}

// メイン検索関数
async function performFreeSearch(
  keywords: string[], 
  excludeKeywords: string[] = [],
  searchOperator: 'AND' | 'OR' = 'OR',
  customRssFeeds: string[] = [],
  searchSources: string[] = ['qiita', 'zenn', 'hatena', 'itmedia', 'techcrunch', 'publickey', 'github', 'duckduckgo'],
  sourceLimits: Record<string, number> = {}
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = []

  console.log(`[FreeSearch] Processing keywords: ${keywords.join(', ')}`)
  console.log(`[FreeSearch] Exclude keywords: ${excludeKeywords.join(', ')}`)
  console.log(`[FreeSearch] Search operator: ${searchOperator}`)

  // 並列で複数のソースから検索
  const searchPromises = []

  // DuckDuckGo検索（各キーワードで）
  if (searchSources.includes('duckduckgo')) {
    // キーワードがない場合はトレンディングトピックを検索
    if (keywords.length === 0) {
      searchPromises.push(searchDuckDuckGo('technology news'))
    } else {
      // 各キーワードで検索（最大3つまで）
      for (const keyword of keywords.slice(0, 3)) {
        searchPromises.push(searchDuckDuckGo(keyword))
      }
    }
  }

  // GitHub検索（最初のキーワードで）
  if (searchSources.includes('github') && keywords.length > 0) {
    searchPromises.push(searchGitHub(keywords[0], sourceLimits.github || 30))
  }

  // 3. Qiitaフィード
  if (searchSources.includes('qiita')) {
    const qiitaLimit = sourceLimits.qiita || 50
    // トレンディングを常に取得（キーワードフィルタリング付き）
    searchPromises.push(fetchFromRSS(RSS_FEEDS.qiita.trending, keywords, qiitaLimit, excludeKeywords, searchOperator))
    // タグ検索は404エラーが多いため、トレンディングのみを使用
    // 特定のタグが必要な場合は、カスタムRSSフィードで追加可能
  }

  // 4. Zennフィード
  if (searchSources.includes('zenn')) {
    const zennLimit = sourceLimits.zenn || 50
    searchPromises.push(fetchFromRSS(RSS_FEEDS.zenn.trending, keywords, zennLimit, excludeKeywords, searchOperator))
  }

  // 5. はてなブックマーク
  if (searchSources.includes('hatena')) {
    const hatenaLimit = sourceLimits.hatena || 50
    searchPromises.push(fetchFromRSS(RSS_FEEDS.hatena.it, keywords, Math.ceil(hatenaLimit / 2), excludeKeywords, searchOperator))
    searchPromises.push(fetchFromRSS(RSS_FEEDS.hatena.general, keywords, Math.floor(hatenaLimit / 2), excludeKeywords, searchOperator))
  }

  // 6. ITmedia
  if (searchSources.includes('itmedia')) {
    const itmediaLimit = sourceLimits.itmedia || 30
    searchPromises.push(fetchFromRSS(RSS_FEEDS.itmedia.news, keywords, Math.ceil(itmediaLimit / 2), excludeKeywords, searchOperator))
    searchPromises.push(fetchFromRSS(RSS_FEEDS.itmedia.aiplus, keywords, Math.floor(itmediaLimit / 2), excludeKeywords, searchOperator))
  }

  // 7. TechCrunch Japan - 証明書エラーのため無効化
  // if (searchSources.includes('techcrunch')) {
  //   searchPromises.push(fetchFromRSS(RSS_FEEDS.techcrunch.japan, [], 30, excludeKeywords, searchOperator))
  // }

  // 8. Publickey
  if (searchSources.includes('publickey')) {
    const publickeyLimit = sourceLimits.publickey || 30
    searchPromises.push(fetchFromRSS(RSS_FEEDS.publickey.feed, keywords, publickeyLimit, excludeKeywords, searchOperator))
  }
  
  // カスタムRSSフィードを追加
  if (customRssFeeds && customRssFeeds.length > 0) {
    for (const feedUrl of customRssFeeds) {
      console.log(`[FreeSearch] Adding custom RSS feed: ${feedUrl}`)
      searchPromises.push(fetchFromRSS(feedUrl, keywords, 20, excludeKeywords, searchOperator))
    }
  }

    // すべての検索を並列実行
    const results = await Promise.allSettled(searchPromises)
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allResults.push(...result.value)
      }
    }

  // 重複除去と並び替え
  const uniqueResults = new Map<string, SearchResult>()
  for (const result of allResults) {
    const key = result.url
    if (!uniqueResults.has(key) && result.url) {
      uniqueResults.set(key, result)
    }
  }

  // 日付でソート（新しい順）
  const sortedResults = Array.from(uniqueResults.values()).sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime()
    const dateB = new Date(b.publishedAt).getTime()
    return dateB - dateA
  })

  return sortedResults.slice(0, 200) // 最大200件
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      keywords = [], 
      excludeKeywords = [],
      searchOperator = 'OR',
      searchSources = ['qiita', 'zenn', 'hatena', 'itmedia', 'techcrunch', 'publickey', 'github', 'duckduckgo'],
      filters = {},
      customRssFeeds = [],
      sourceLimits = {}
    } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }

    console.log('[FreeSearch] Request:', {
      keywords,
      excludeKeywords,
      searchOperator,
      searchSources,
      filters,
      customRssFeeds
    })

    // 無料APIとRSSから検索（除外キーワードとカスタムRSSフィードも考慮）
    let searchResults = await performFreeSearch(
      keywords, 
      excludeKeywords, 
      searchOperator as 'AND' | 'OR', 
      customRssFeeds, 
      searchSources,
      sourceLimits
    )

    // フィルター適用
    if (filters) {
      // 日付範囲フィルター
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = Date.now()
        const ranges = {
          '24h': 24 * 60 * 60 * 1000,
          '3d': 3 * 24 * 60 * 60 * 1000,
          '1w': 7 * 24 * 60 * 60 * 1000,
          '1m': 30 * 24 * 60 * 60 * 1000
        }
        const maxAge = ranges[filters.dateRange as keyof typeof ranges]
        if (maxAge) {
          searchResults = searchResults.filter(result => {
            if (!result.publishedAt) return true
            const age = now - new Date(result.publishedAt).getTime()
            return age <= maxAge
          })
        }
      }

    }

    console.log(`[FreeSearch] Returning ${searchResults.length} results`)

    return NextResponse.json({
      success: true,
      results: searchResults,
      timestamp: new Date().toISOString(),
      count: searchResults.length,
      source: 'free-search',
      metadata: {
        keywordsProcessed: keywords,
        sources: ['DuckDuckGo', 'GitHub', 'RSS Feeds'],
        filtersApplied: Object.keys(filters || {})
      }
    })
    
  } catch (error) {
    console.error('[FreeSearch] Error:', error)
    return NextResponse.json({ 
      error: 'Search failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}