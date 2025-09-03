'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { SortableTabNavigation } from '@/components/sortable-tab-navigation'
import { CreateTabDialog } from '@/components/create-tab-dialog'
import { ArticleGrid } from '@/components/article-grid'
import { useTabStore } from '@/stores/tab-store'
import { useTabs } from '@/hooks/use-tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, LogOut } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { ScrollToTop } from '@/components/scroll-to-top'

export default function DashboardPage() {
  const [createTabOpen, setCreateTabOpen] = useState(false)
  const { tabs: storeTabs, activeTabId } = useTabStore()
  const { tabs, isLoading, fetchArticles } = useTabs()

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  useEffect(() => {
    const handleOpenCreateTab = () => setCreateTabOpen(true)
    window.addEventListener('openCreateTab', handleOpenCreateTab)
    return () => window.removeEventListener('openCreateTab', handleOpenCreateTab)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold">MagniFlow</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </Button>
          </div>
        </header>

        <SortableTabNavigation />

        <main className="flex-1 overflow-auto">
        {activeTab ? (
          <div className="container mx-auto py-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{activeTab.name}</h2>
                <p className="text-muted-foreground">
                  追跡キーワード: {activeTab.keywords.join(', ')}
                </p>
              </div>
              <Button
                onClick={() => fetchArticles.mutate(activeTab.id)}
                disabled={fetchArticles.isPending}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${fetchArticles.isPending ? 'animate-spin' : ''}`} />
                記事を取得
              </Button>
            </div>
            <ArticleGrid tabId={activeTab.id} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">タブがありません</h2>
              <p className="text-muted-foreground mb-4">
                最初のタブを作成して、トピックの追跡を開始しましょう
              </p>
              <button
                className="text-primary hover:underline"
                onClick={() => setCreateTabOpen(true)}
              >
                タブを作成
              </button>
            </div>
          </div>
        )}
        </main>

        <ScrollToTop />
        <CreateTabDialog open={createTabOpen} onOpenChange={setCreateTabOpen} />
      </div>
    </div>
  )
}