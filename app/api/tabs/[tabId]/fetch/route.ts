import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fileStore } from '@/lib/file-store'

export async function POST(
  request: NextRequest,
  { params }: { params: { tabId: string } }
) {
  console.log('[Fetch Route] Called with tabId:', params.tabId)
  
  try {
    const session = await getServerSession(authOptions)
    console.log('[Fetch Route] Session:', session)
    
    if (!session?.user?.id) {
      console.error('[Fetch Route] No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tabs = fileStore.getTabs(session.user.id)
    console.log('[Fetch Route] User ID:', session.user.id)
    console.log('[Fetch Route] All tabs for user:', tabs)
    console.log('[Fetch Route] File store debug - all users:', fileStore.debugGetAllUsers())
    
    const tab = tabs.find(t => t.id === params.tabId)
    console.log('[Fetch Route] Looking for tab ID:', params.tabId)
    console.log('[Fetch Route] Found tab:', tab)

    if (!tab) {
      console.error('[Fetch Route] Tab not found in file store')
      return NextResponse.json({ error: 'Tab not found' }, { status: 404 })
    }

    // 統合検索APIを使用してディープサーチを実行
    const port = process.env.PORT || '7000'
    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${port}`
    console.log('[Fetch Route] Calling search API')
    console.log('[Fetch Route] Search params:', {
      keywords: tab.keywords,
      excludeKeywords: tab.excludeKeywords,
      searchOperator: tab.searchOperator,
      usePremiumAPIs: tab.usePremiumAPIs,
    })
    
    // Premium APIが有効な場合はunified検索を使用
    const searchEndpoint = tab.usePremiumAPIs 
      ? '/api/search/unified' 
      : '/api/search/free'
    
    console.log('[Fetch Route] Selected endpoint:', searchEndpoint)
    console.log('[Fetch Route] Tab usePremiumAPIs:', tab.usePremiumAPIs)
    
    const searchResponse = await fetch(`${baseUrl}${searchEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        keywords: tab.keywords,
        excludeKeywords: tab.excludeKeywords || [],
        searchOperator: tab.searchOperator || 'OR',
        searchSources: tab.searchSources || ['qiita', 'zenn', 'hatena', 'itmedia', 'techcrunch', 'publickey', 'github', 'duckduckgo'],
        filters: tab.filters || {},
        customRssFeeds: tab.customRssFeeds || [],
        sourceLimits: tab.sourceLimits || {}
      })
    })

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('[Fetch Route] Search API error:', searchResponse.status, errorText)
      throw new Error(`Search failed: ${searchResponse.status}`)
    }

    const { results: searchResults } = await searchResponse.json()

    // 検索結果を記事形式に変換
    const articlesToSave = searchResults.map((result: any) => ({
      id: crypto.randomUUID(),
      tabId: params.tabId,
      url: result.url,
      title: result.title,
      summary: result.summary,
      content: result.content,
      thumbnailUrl: result.thumbnailUrl,
      source: result.source,
      publishedAt: result.publishedAt ? new Date(result.publishedAt) : undefined,
      fetchedAt: new Date(),
    }))

    // Save to file store
    const savedArticles = fileStore.addArticles(params.tabId, articlesToSave)

    return NextResponse.json({
      message: `${articlesToSave.length}件の記事を取得し、${savedArticles.length}件の新しい記事を保存しました`,
      articles: savedArticles,
    })
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}