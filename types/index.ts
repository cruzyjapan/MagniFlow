export interface User {
  id: string
  email: string
  name?: string
  preferences?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Tab {
  id: string
  userId: string
  name: string
  color: string
  icon: string
  keywords: string[]
  excludeKeywords?: string[]
  searchOperator?: 'AND' | 'OR'
  sources: string[]
  filters: TabFilter
  customRssFeeds?: string[]
  sourceLimits?: SourceLimits
  usePremiumAPIs?: boolean
  searchSources?: string[]
  updateSchedule?: UpdateSchedule
  createdAt: Date
  updatedAt: Date
}

export interface SourceLimits {
  qiita?: number
  zenn?: number
  hatena?: number
  itmedia?: number
  publickey?: number
  github?: number
  duckduckgo?: number
  customRss?: number
}

export interface TabFilter {
  language?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  domains?: {
    include?: string[]
    exclude?: string[]
  }
  mediaType?: ('text' | 'image' | 'video')[]
}

export interface Article {
  id: string
  tabId: string
  url: string
  title: string
  summary: string
  content?: string
  thumbnailUrl?: string
  source: string
  metadata?: ArticleMetadata
  publishedAt?: Date
  fetchedAt: Date
}

export interface ArticleMetadata {
  author?: string
  tags?: string[]
  readingTime?: number
  engagement?: {
    likes?: number
    shares?: number
    comments?: number
  }
}

export interface UserAction {
  id: string
  userId: string
  articleId: string
  actionType: 'read' | 'favorite' | 'highlight' | 'note' | 'tag' | 'rate'
  highlights?: Highlight[]
  notes?: string
  tags?: string[]
  rating?: number
  createdAt: Date
}

export interface Highlight {
  id: string
  text: string
  color: string
  startIndex: number
  endIndex: number
}

export interface Archive {
  id: string
  userId: string
  articleId: string
  reason?: string
  tags?: string[]
  archivedAt: Date
}

export interface Schedule {
  id: string
  tabId: string
  cronExpression: string
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
}

export interface UpdateSchedule {
  interval: '15min' | '30min' | '1hour' | '3hours' | '6hours' | '12hours' | '24hours' | 'custom'
  customCron?: string
  timezone?: string
}