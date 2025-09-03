import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 統合検索API
 * 
 * 利用可能な検索ソースを自動的に選択して検索を実行
 * 
 * 優先順位:
 * 1. Google Custom Search (設定されている場合)
 * 2. 無料検索 (RSS、GitHub、DuckDuckGo)
 * 
 * このエンドポイントが全ての検索リクエストを処理
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // bodyを一度だけ読み取る
    const bodyText = await request.text()
    const body = JSON.parse(bodyText)
    
    // Google APIが設定されているかチェック
    const hasGoogleAPI = !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID)
    const hasBingAPI = !!process.env.BING_SEARCH_API_KEY
    
    let searchEndpoint = '/api/search/free' // デフォルトは無料検索
    
    if (hasGoogleAPI || hasBingAPI) {
      // Google/Bing APIが利用可能
      searchEndpoint = '/api/search/google'
      console.log('[Unified Search] Using Google/Bing API')
    } else {
      console.log('[Unified Search] Using free search (RSS/GitHub/DuckDuckGo)')
    }

    // 選択したエンドポイントに転送
    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 7000}`
    const searchResponse = await fetch(`${baseUrl}${searchEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: bodyText // 既に文字列化されているものを使用
    })

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('[Unified Search] Search failed:', searchResponse.status, errorText)
      
      // フォールバック: Google APIが失敗したら無料検索を試す
      if (searchEndpoint === '/api/search/google') {
        console.log('[Unified Search] Falling back to free search')
        const fallbackResponse = await fetch(`${baseUrl}/api/search/free`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: bodyText // 既に文字列化されているものを使用
        })
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          return NextResponse.json(data)
        }
      }
      
      throw new Error(`Search failed: ${searchResponse.status}`)
    }

    const data = await searchResponse.json()
    
    // メタデータを追加
    data.metadata = {
      ...data.metadata,
      searchMethod: searchEndpoint === '/api/search/google' ? 'premium' : 'free',
      availableAPIs: {
        google: hasGoogleAPI,
        bing: hasBingAPI,
        free: true
      }
    }

    return NextResponse.json(data)
    
  } catch (error) {
    console.error('[Unified Search] Error:', error)
    return NextResponse.json({ 
      error: 'Search failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}