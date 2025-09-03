import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Article, UserAction } from '@/types'

interface ArticleStore {
  articles: Article[]
  selectedArticleId: string | null
  userActions: Record<string, UserAction>
  filter: 'all' | 'unread' | 'read' | 'favorites' | 'archive'
  searchQuery: string
  sortBy: 'recent' | 'trending' | null
  setArticles: (articles: Article[]) => void
  addArticles: (articles: Article[]) => void
  updateArticle: (id: string, article: Partial<Article>) => void
  deleteArticle: (id: string) => void
  setSelectedArticle: (id: string | null) => void
  toggleRead: (articleId: string) => void
  toggleFavorite: (articleId: string) => void
  setUserAction: (articleId: string, action: UserAction) => void
  setFilter: (filter: 'all' | 'unread' | 'read' | 'favorites' | 'archive') => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: 'recent' | 'trending' | null) => void
  getFilteredArticles: () => Article[]
  clearArticlesForTab: (tabId: string) => void
}

export const useArticleStore = create<ArticleStore>()(
  persist(
    (set, get) => ({
  articles: [],
  selectedArticleId: null,
  userActions: {},
  filter: 'all',
  searchQuery: '',
  sortBy: null,
  setArticles: (articles) => set({ articles }),
  addArticles: (articles) =>
    set((state) => ({ articles: [...state.articles, ...articles] })),
  updateArticle: (id, updates) =>
    set((state) => ({
      articles: state.articles.map((article) =>
        article.id === id ? { ...article, ...updates } : article
      ),
    })),
  deleteArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter((article) => article.id !== id),
      selectedArticleId: state.selectedArticleId === id ? null : state.selectedArticleId,
    })),
  setSelectedArticle: (id) => set({ selectedArticleId: id }),
  toggleRead: (articleId) =>
    set((state) => {
      const existingAction = state.userActions[articleId]
      const isCurrentlyRead = existingAction?.actionType === 'READ' || existingAction?.actionType === 'FAVORITE'
      
      if (isCurrentlyRead) {
        // 既読から未読に戻す
        const { [articleId]: _, ...rest } = state.userActions
        return {
          userActions: rest
        }
      } else {
        // 未読から既読にする
        return {
          userActions: {
            ...state.userActions,
            [articleId]: {
              id: crypto.randomUUID(),
              userId: 'current-user',
              articleId,
              actionType: 'READ' as const,
              createdAt: new Date(),
            }
          }
        }
      }
    }),
  toggleFavorite: (articleId) =>
    set((state) => {
      const existing = state.userActions[articleId]
      const isFavorite = existing?.actionType === 'FAVORITE'
      return {
        userActions: {
          ...state.userActions,
          [articleId]: isFavorite
            ? { ...existing, actionType: 'READ' as const }
            : {
                id: crypto.randomUUID(),
                userId: 'current-user',
                articleId,
                actionType: 'FAVORITE' as const,
                createdAt: new Date(),
              },
        },
      }
    }),
  setUserAction: (articleId, action) =>
    set((state) => ({
      userActions: {
        ...state.userActions,
        [articleId]: action,
      },
    })),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearArticlesForTab: (tabId) =>
    set((state) => ({
      articles: state.articles.filter((article) => article.tabId !== tabId),
      userActions: Object.fromEntries(
        Object.entries(state.userActions).filter(([articleId]) => {
          const article = state.articles.find(a => a.id === articleId)
          return article?.tabId !== tabId
        })
      )
    })),
  getFilteredArticles: () => {
    const { articles, userActions, filter, searchQuery, sortBy } = get()
    
    let filtered = articles
    
    // フィルターの適用
    switch (filter) {
      case 'unread':
        filtered = articles.filter(a => !userActions[a.id]?.actionType)
        break
      case 'read':
        filtered = articles.filter(a => userActions[a.id]?.actionType === 'READ')
        break
      case 'favorites':
        filtered = articles.filter(a => userActions[a.id]?.actionType === 'FAVORITE')
        break
      case 'archive':
        filtered = [] // TODO: アーカイブ機能実装後に修正
        break
    }
    
    // 検索クエリの適用
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
      )
    }
    
    // ソートの適用
    if (sortBy === 'recent') {
      // 最新順（fetchedAtで降順）
      filtered = [...filtered].sort((a, b) => 
        new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime()
      )
    } else if (sortBy === 'trending') {
      // トレンド順（お気に入りの記事を上位に）
      filtered = [...filtered].sort((a, b) => {
        const aFavorite = userActions[a.id]?.actionType === 'FAVORITE' ? 1 : 0
        const bFavorite = userActions[b.id]?.actionType === 'FAVORITE' ? 1 : 0
        return bFavorite - aFavorite
      })
    }
    
    return filtered
  },
}),
    {
      name: 'magniflow-article-actions',
      partialState: (state) => ({ userActions: state.userActions }),
    }
  )
)