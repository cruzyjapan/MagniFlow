import { Tab } from '@/types'

export interface FetchResult {
  url: string
  title: string
  summary: string
  content?: string
  thumbnailUrl?: string
  source: string
  publishedAt?: Date
}

export class ArticleFetcher {
  private readonly newsApiKey = process.env.NEWS_API_KEY

  async fetchArticlesForTab(tab: Tab): Promise<FetchResult[]> {
    const results: FetchResult[] = []

    // Fetch from multiple sources
    const promises = [
      this.fetchFromNewsAPI(tab.keywords),
      this.fetchFromRSSFeeds(tab.sources),
      // Add more sources here
    ]

    const allResults = await Promise.allSettled(promises)
    
    allResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(...result.value)
      }
    })

    // Remove duplicates based on URL
    const uniqueResults = this.deduplicateArticles(results)
    
    // Apply filters
    return this.applyFilters(uniqueResults, tab.filters)
  }

  private async fetchFromNewsAPI(keywords: string[]): Promise<FetchResult[]> {
    if (!this.newsApiKey) {
      console.warn('NEWS_API_KEY not configured')
      return []
    }

    try {
      const query = keywords.join(' OR ')
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${this.newsApiKey}&pageSize=20`
      )

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`)
      }

      const data = await response.json()
      
      return data.articles.map((article: any) => ({
        url: article.url,
        title: article.title,
        summary: article.description || '',
        content: article.content,
        thumbnailUrl: article.urlToImage,
        source: article.source.name,
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
      }))
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error)
      return []
    }
  }

  private async fetchFromRSSFeeds(feedUrls: string[]): Promise<FetchResult[]> {
    // This would parse RSS feeds
    // For now, returning empty array as a placeholder
    return []
  }

  private deduplicateArticles(articles: FetchResult[]): FetchResult[] {
    const seen = new Set<string>()
    return articles.filter((article) => {
      if (seen.has(article.url)) {
        return false
      }
      seen.add(article.url)
      return true
    })
  }

  private applyFilters(articles: FetchResult[], filters: any): FetchResult[] {
    let filtered = articles

    // Apply date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      filtered = filtered.filter((article) => {
        if (!article.publishedAt) return true
        const date = article.publishedAt.getTime()
        const start = filters.dateRange?.start ? new Date(filters.dateRange.start).getTime() : 0
        const end = filters.dateRange?.end ? new Date(filters.dateRange.end).getTime() : Date.now()
        return date >= start && date <= end
      })
    }

    // Apply domain filters
    if (filters.domains?.exclude?.length > 0) {
      filtered = filtered.filter((article) => {
        const url = new URL(article.url)
        return !filters.domains.exclude.some((domain: string) => 
          url.hostname.includes(domain)
        )
      })
    }

    if (filters.domains?.include?.length > 0) {
      filtered = filtered.filter((article) => {
        const url = new URL(article.url)
        return filters.domains.include.some((domain: string) => 
          url.hostname.includes(domain)
        )
      })
    }

    return filtered
  }
}