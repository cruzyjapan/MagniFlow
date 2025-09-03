import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fileStore } from '@/lib/file-store'

// 記事のアクション（既読、お気に入り）を更新
export async function POST(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { actionType } = body // 'READ', 'FAVORITE', or null

    // ユーザーアクションを保存（簡易実装）
    // 実際にはfileStoreにユーザーアクション保存機能を追加する必要があります
    
    return NextResponse.json({ 
      success: true,
      articleId: params.articleId,
      actionType,
      userId: session.user.id
    })
  } catch (error) {
    console.error('Error updating article action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}