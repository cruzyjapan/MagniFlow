import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fileStore } from '@/lib/file-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { tabId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get articles from file store
    const articles = fileStore.getArticles(params.tabId)
    console.log(`[Articles API] Tab ID: ${params.tabId}, Found ${articles.length} articles`)
    
    // Sort by fetchedAt date (newest first)
    const sortedArticles = articles.sort((a, b) => 
      new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime()
    )

    return NextResponse.json(sortedArticles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}