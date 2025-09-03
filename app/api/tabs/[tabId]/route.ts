import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fileStore } from '@/lib/file-store'

// タブの更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { tabId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updatedTab = fileStore.updateTab(session.user.id, params.tabId, body)
    
    if (!updatedTab) {
      return NextResponse.json({ error: 'Tab not found' }, { status: 404 })
    }

    return NextResponse.json(updatedTab)
  } catch (error) {
    console.error('Error updating tab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// タブの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { tabId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    fileStore.deleteTab(session.user.id, params.tabId)
    return NextResponse.json({ message: 'Tab deleted successfully' })
  } catch (error) {
    console.error('Error deleting tab:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}