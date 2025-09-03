import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fileStore } from '@/lib/file-store'

export async function GET(request: NextRequest) {
  console.log('[Tabs Route] GET called')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('[Tabs Route] Session:', session)
    
    if (!session?.user?.id) {
      console.error('[Tabs Route] No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use file store for persistence across reloads
    const tabs = fileStore.getTabs(session.user.id)
    console.log('[Tabs Route] Retrieved tabs:', tabs)
    return NextResponse.json(tabs)
  } catch (error) {
    console.error('Error fetching tabs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('[Tabs Route] POST called')
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[Tabs Route] Creating tab with data:', body)
    const { name, color, icon, keywords, excludeKeywords = [], searchOperator = 'OR', sources = [], filters = {}, customRssFeeds = [], updateSchedule = {}, usePremiumAPIs = false, sourceLimits = {} } = body

    // Use file store for persistence
    const tab = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      name,
      color,
      icon,
      keywords,
      excludeKeywords,
      searchOperator,
      sources,
      filters,
      customRssFeeds,
      updateSchedule,
      usePremiumAPIs,
      sourceLimits,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const savedTab = fileStore.addTab(session.user.id, tab)
    console.log('[Tabs Route] Tab saved:', savedTab)
    console.log('[Tabs Route] User ID:', session.user.id)
    console.log('[Tabs Route] All tabs after save:', fileStore.getTabs(session.user.id))
    
    return NextResponse.json(savedTab)
  } catch (error) {
    console.error('Error creating tab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}