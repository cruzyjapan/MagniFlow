import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import axios from 'axios'

interface SearchResult {
  url: string
  title: string
  summary: string
  thumbnailUrl: string | null
  source: string
  publishedAt: string
  type: 'article' | 'video' | 'news' | 'blog' | 'website'
}

/**
 * Google Custom Search JSON API
 * 
 * 無料枠: 100クエリ/日
 * 
 * セットアップ手順:
 * 1. Google Cloud Consoleでプロジェクトを作成
 * 2. Custom Search JSON APIを有効化
 * 3. APIキーを取得
 * 4. Programmable Search Engineを作成
 * 5. 検索エンジンIDを取得
 * 
 * 環境変数:
 * GOOGLE_API_KEY=your-api-key
 * GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
 */

async function searchGoogle(query: string, options: {
  searchType?: 'web' | 'image' | 'video'
  num?: number
  dateRestrict?: string // d[number], w[number], m[number], y[number]
}): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID

  if (!apiKey || !searchEngineId) {
    console.log('[Google Search] API key or Search Engine ID not configured')
    return []
  }

  try {
    const allResults: SearchResult[] = []
    const totalWanted = options.num || 30
    const perPage = 10 // Google APIの1ページあたりの最大件数
    const pages = Math.ceil(totalWanted / perPage)
    
    // 複数ページを取得（最大3ページ = 30件）
    for (let page = 0; page < Math.min(pages, 3); page++) {
      const params: any = {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        num: perPage,
        start: page * perPage + 1, // 1-based index
        hl: 'ja', // 日本語優先
        lr: 'lang_ja|lang_en', // 日本語と英語の結果を含める
      }

      // 日付制限
      if (options.dateRestrict) {
        params.dateRestrict = options.dateRestrict
      }

      // 動画検索の場合はYouTubeを含める
      if (options.searchType === 'video') {
        params.q = `${query} site:youtube.com OR site:vimeo.com OR site:dailymotion.com`
      }

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', { params })
      
      if (response.data.items) {
        for (const item of response.data.items) {
          // ページタイプの判定
          let type: SearchResult['type'] = 'website'
          const url = item.link.toLowerCase()
          
          if (url.includes('youtube.com') || url.includes('vimeo.com')) {
            type = 'video'
          } else if (url.includes('qiita.com') || url.includes('zenn.dev') || url.includes('medium.com')) {
            type = 'article'
          } else if (url.includes('news') || url.includes('itmedia') || url.includes('techcrunch')) {
            type = 'news'
          } else if (url.includes('blog') || url.includes('note.com')) {
            type = 'blog'
          }

          // サムネイル取得
          let thumbnailUrl = null
          if (item.pagemap?.cse_image?.[0]?.src) {
            thumbnailUrl = item.pagemap.cse_image[0].src
          } else if (item.pagemap?.metatags?.[0]?.['og:image']) {
            thumbnailUrl = item.pagemap.metatags[0]['og:image']
          }

          // YouTube動画のサムネイル
          if (type === 'video' && url.includes('youtube.com')) {
            const videoIdMatch = url.match(/[?&]v=([^&]+)/)
            if (videoIdMatch) {
              thumbnailUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`
            }
          }

          allResults.push({
            url: item.link,
            title: item.title,
            summary: item.snippet || '',
            thumbnailUrl,
            source: new URL(item.link).hostname.replace('www.', ''),
            publishedAt: item.pagemap?.metatags?.[0]?.['article:published_time'] || new Date().toISOString(),
            type
          })
        }
      }
      
      // 必要な件数に達したら終了
      if (allResults.length >= totalWanted) {
        break
      }
    }

    return allResults.slice(0, totalWanted)
  } catch (error) {
    console.error('[Google Search] Error:', error)
    return []
  }
}

/**
 * YouTube Data API v3
 * 
 * 無料枠: 10,000ユニット/日
 * 検索は100ユニット消費 = 100検索/日
 */
async function searchYouTube(query: string, maxResults: number = 10): Promise<SearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY

  if (!apiKey) {
    console.log('[YouTube Search] API key not configured')
    return []
  }

  try {
    const params = {
      key: apiKey,
      q: query,
      part: 'snippet',
      type: 'video',
      maxResults,
      relevanceLanguage: 'ja',
      order: 'relevance'
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', { params })

    const results: SearchResult[] = []
    
    if (response.data.items) {
      for (const item of response.data.items) {
        results.push({
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          title: item.snippet.title,
          summary: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          source: 'YouTube',
          publishedAt: item.snippet.publishedAt,
          type: 'video'
        })
      }
    }

    return results
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('[YouTube Search] 403 Forbidden - YouTube Data API v3が有効化されていない可能性があります')
      console.error('[YouTube Search] Google Cloud Consoleで YouTube Data API v3 を有効化してください:')
      console.error('[YouTube Search] https://console.cloud.google.com/apis/library/youtube.googleapis.com')
    } else {
      console.error('[YouTube Search] Error:', error.message || error)
    }
    return []
  }
}

/**
 * Bing Web Search API (Azure Cognitive Services)
 * 
 * 無料枠: Azureの無料試用版で1,000クエリ/月
 */
async function searchBing(query: string, options: {
  count?: number
  freshness?: string // Day, Week, Month
  market?: string // ja-JP
}): Promise<SearchResult[]> {
  const apiKey = process.env.BING_SEARCH_API_KEY

  if (!apiKey) {
    console.log('[Bing Search] API key not configured')
    return []
  }

  try {
    const params = {
      q: query,
      count: options.count || 10,
      mkt: options.market || 'ja-JP',
      freshness: options.freshness
    }

    const response = await axios.get('https://api.cognitive.microsoft.com/bing/v7.0/search', {
      params,
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      }
    })

    const results: SearchResult[] = []
    
    if (response.data.webPages?.value) {
      for (const item of response.data.webPages.value) {
        results.push({
          url: item.url,
          title: item.name,
          summary: item.snippet || '',
          thumbnailUrl: item.thumbnailUrl || null,
          source: new URL(item.url).hostname.replace('www.', ''),
          publishedAt: item.dateLastCrawled || new Date().toISOString(),
          type: 'website'
        })
      }
    }

    // 動画結果も含める
    if (response.data.videos?.value) {
      for (const item of response.data.videos.value) {
        results.push({
          url: item.contentUrl,
          title: item.name,
          summary: item.description || '',
          thumbnailUrl: item.thumbnailUrl || null,
          source: item.publisher?.[0]?.name || 'Video',
          publishedAt: item.datePublished || new Date().toISOString(),
          type: 'video'
        })
      }
    }

    return results
  } catch (error) {
    console.error('[Bing Search] Error:', error)
    return []
  }
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
      searchType = 'web',
      filters = {},
      sourceLimits = {}
    } = body

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords are required' }, { status: 400 })
    }

    const allResults: SearchResult[] = []

    for (const keyword of keywords) {
      console.log(`[Search] Processing keyword: ${keyword}`)

      // 日付範囲の設定
      let dateRestrict = ''
      let freshness = ''
      if (filters.dateRange) {
        const ranges: Record<string, { google: string; bing: string }> = {
          '24h': { google: 'd1', bing: 'Day' },
          '3d': { google: 'd3', bing: 'Day' },
          '1w': { google: 'w1', bing: 'Week' },
          '1m': { google: 'm1', bing: 'Month' }
        }
        if (ranges[filters.dateRange]) {
          dateRestrict = ranges[filters.dateRange].google
          freshness = ranges[filters.dateRange].bing
        }
      }

      // 並列検索
      const searchPromises = []

      // Google検索
      if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
        const googleLimit = sourceLimits.google || 30  // デフォルトを10から30に増加
        searchPromises.push(searchGoogle(keyword, { 
          searchType: searchType as any,
          dateRestrict,
          num: googleLimit
        }))
      }

      // YouTube検索（Google APIキーがある場合は常に実行）
      if (process.env.GOOGLE_API_KEY) {
        const youtubeLimit = sourceLimits.youtube || 20  // デフォルトを10から20に増加
        searchPromises.push(searchYouTube(keyword, youtubeLimit))
      }

      // Bing検索
      if (process.env.BING_SEARCH_API_KEY) {
        const bingLimit = sourceLimits.bing || 10
        searchPromises.push(searchBing(keyword, { 
          freshness,
          count: bingLimit
        }))
      }

      const results = await Promise.allSettled(searchPromises)
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          allResults.push(...result.value)
        }
      }
    }

    // 除外キーワードフィルタ
    let filteredResults = allResults
    if (excludeKeywords && excludeKeywords.length > 0) {
      filteredResults = filteredResults.filter(result => {
        const content = `${result.title} ${result.summary}`.toLowerCase()
        return !excludeKeywords.some(excludeWord => 
          content.includes(excludeWord.toLowerCase())
        )
      })
    }

    // 重複除去
    const uniqueResults = new Map<string, SearchResult>()
    for (const result of filteredResults) {
      if (!uniqueResults.has(result.url)) {
        uniqueResults.set(result.url, result)
      }
    }

    const finalResults = Array.from(uniqueResults.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 100)  // 50から100に増加

    console.log(`[Search] Returning ${finalResults.length} results`)

    return NextResponse.json({
      success: true,
      results: finalResults,
      timestamp: new Date().toISOString(),
      count: finalResults.length,
      source: 'google-search',
      metadata: {
        keywordsProcessed: keywords,
        apis: {
          google: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
          youtube: !!process.env.GOOGLE_API_KEY,
          bing: !!process.env.BING_SEARCH_API_KEY
        }
      }
    })
    
  } catch (error) {
    console.error('[Search] Error:', error)
    return NextResponse.json({ 
      error: 'Search failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}