'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Article } from '@/types'
import { LayoutSelector, LayoutType } from '@/components/layout-selector'
import { useArticleStore } from '@/stores/article-store'
import {
  HeroLayout,
  GridLayout,
  MagazineLayout,
  ListLayout,
  CompactLayout,
} from '@/components/magazine-layouts'

interface ArticleGridProps {
  tabId: string
}

export function ArticleGrid({ tabId }: ArticleGridProps) {
  const [layout, setLayout] = useState<LayoutType>('grid')
  const { 
    setArticles, 
    getFilteredArticles, 
    filter,
    searchQuery 
  } = useArticleStore()
  
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', tabId],
    queryFn: async () => {
      const response = await fetch(`/api/tabs/${tabId}/articles`)
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      const data = await response.json() as Article[]
      return data
    },
  })

  // 記事データをストアに同期
  useEffect(() => {
    if (articles) {
      setArticles(articles)
    }
  }, [articles, setArticles])

  // フィルタリングされた記事を取得
  const filteredArticles = getFilteredArticles()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          記事が見つかりません。記事を取得すると、ここに表示されます。
        </p>
      </div>
    )
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          {filter !== 'all' && `「${getFilterLabel(filter)}」に該当する記事はありません。`}
          {searchQuery && `「${searchQuery}」に一致する記事はありません。`}
        </p>
      </div>
    )
  }

  const renderLayout = () => {
    switch (layout) {
      case 'hero':
        return <HeroLayout articles={filteredArticles} />
      case 'list':
        return <ListLayout articles={filteredArticles} />
      case 'compact':
        return <CompactLayout articles={filteredArticles} />
      default:
        return <GridLayout articles={filteredArticles} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredArticles.length} 件の記事
          {filter !== 'all' && ` (${getFilterLabel(filter)})`}
        </div>
        <LayoutSelector value={layout} onChange={setLayout} />
      </div>
      {renderLayout()}
    </div>
  )
}

function getFilterLabel(filter: string): string {
  const labels: Record<string, string> = {
    all: 'すべて',
    unread: '未読',
    read: '既読',
    favorites: 'お気に入り',
    archive: 'アーカイブ',
  }
  return labels[filter] || filter
}