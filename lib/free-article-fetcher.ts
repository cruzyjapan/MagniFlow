import { Tab } from '@/types'
import { FetchResult } from './article-fetcher'

// Free RSS feeds for various topics
const RSS_FEEDS = {
  technology: [
    'https://feeds.feedburner.com/TechCrunch',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.arstechnica.com/arstechnica/index',
    'https://www.wired.com/feed/rss',
  ],
  programming: [
    'https://dev.to/feed',
    'https://css-tricks.com/feed/',
    'https://www.smashingmagazine.com/feed/',
  ],
  news: [
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.reuters.com/rssFeed/topNews',
  ],
  business: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.ft.com/?format=rss',
  ],
  science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://phys.org/rss-feed/',
  ],
}

export class FreeArticleFetcher {
  async fetchArticlesForTab(tab: Tab): Promise<FetchResult[]> {
    const results: FetchResult[] = []
    
    // Determine which RSS feeds to use based on keywords
    const feedUrls = this.selectFeedsBasedOnKeywords(tab.keywords)
    
    // Fetch from RSS feeds
    const promises = feedUrls.map(url => this.fetchRSSFeed(url))
    const feedResults = await Promise.allSettled(promises)
    
    feedResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(...result.value)
      }
    })
    
    // Filter by keywords
    const filtered = this.filterByKeywords(results, tab.keywords)
    
    // Remove duplicates
    const unique = this.deduplicateArticles(filtered)
    
    // Limit results
    return unique.slice(0, 20)
  }

  private selectFeedsBasedOnKeywords(keywords: string[]): string[] {
    const lowerKeywords = keywords.map(k => k.toLowerCase())
    const selectedFeeds: string[] = []
    
    // Check each category
    Object.entries(RSS_FEEDS).forEach(([category, feeds]) => {
      const categoryMatches = 
        lowerKeywords.some(k => category.includes(k)) ||
        lowerKeywords.some(k => 
          k.includes('tech') && category === 'technology' ||
          k.includes('dev') && category === 'programming' ||
          k.includes('code') && category === 'programming' ||
          k.includes('business') && category === 'business' ||
          k.includes('science') && category === 'science'
        )
      
      if (categoryMatches) {
        selectedFeeds.push(...feeds)
      }
    })
    
    // If no specific matches, use technology feeds as default
    if (selectedFeeds.length === 0) {
      selectedFeeds.push(...RSS_FEEDS.technology)
    }
    
    return selectedFeeds
  }

  private async fetchRSSFeed(url: string): Promise<FetchResult[]> {
    try {
      // Use proxy to avoid CORS issues
      const proxyUrl = url.replace('https://', '/api/proxy/')
      
      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
      }
      
      const text = await response.text()
      return this.parseRSS(text, url)
    } catch (error) {
      console.error(`Error fetching RSS feed ${url}:`, error)
      return []
    }
  }

  private parseRSS(xmlText: string, sourceUrl: string): FetchResult[] {
    const results: FetchResult[] = []
    
    try {
      // Simple XML parsing without external dependencies
      const items = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
      
      items.forEach((item) => {
        const title = this.extractTag(item, 'title')
        const link = this.extractTag(item, 'link')
        const description = this.extractTag(item, 'description')
        const pubDate = this.extractTag(item, 'pubDate')
        
        // Extract image from content or media
        const content = this.extractTag(item, 'content:encoded') || description
        const imageUrl = this.extractImageUrl(content) || 
                        this.extractTag(item, 'media:thumbnail', 'url')
        
        if (title && link) {
          results.push({
            url: link,
            title: this.cleanText(title),
            summary: this.cleanText(description || ''),
            thumbnailUrl: imageUrl,
            source: this.extractSourceName(sourceUrl),
            publishedAt: pubDate ? new Date(pubDate) : undefined,
          })
        }
      })
    } catch (error) {
      console.error('Error parsing RSS:', error)
    }
    
    return results
  }

  private extractTag(xml: string, tagName: string, attribute?: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
    const match = xml.match(regex)
    
    if (match && match[1]) {
      if (attribute) {
        const attrRegex = new RegExp(`${attribute}="([^"]*)"`, 'i')
        const attrMatch = match[0].match(attrRegex)
        return attrMatch ? attrMatch[1] : ''
      }
      return match[1]
    }
    
    // Try self-closing tag
    if (attribute) {
      const selfClosingRegex = new RegExp(`<${tagName}[^>]*${attribute}="([^"]*)"[^>]*\\/?>`, 'i')
      const selfMatch = xml.match(selfClosingRegex)
      return selfMatch ? selfMatch[1] : ''
    }
    
    return ''
  }

  private extractImageUrl(content: string): string | undefined {
    // Try to find image URL in content
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
    
    // Try to find image URL in CDATA
    const cdataMatch = content.match(/https?:\/\/[^"\s]+\.(?:jpg|jpeg|png|gif|webp)/i)
    if (cdataMatch) {
      return cdataMatch[0]
    }
    
    return undefined
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  private extractSourceName(url: string): string {
    try {
      const domain = new URL(url).hostname
      const name = domain
        .replace('www.', '')
        .replace('feeds.', '')
        .replace('rss.', '')
        .split('.')[0]
      
      // Special cases
      const nameMap: Record<string, string> = {
        'feedburner': 'TechCrunch',
        'arstechnica': 'Ars Technica',
        'nytimes': 'New York Times',
        'bbci': 'BBC News',
        'dev': 'Dev.to',
        'css-tricks': 'CSS-Tricks',
        'smashingmagazine': 'Smashing Magazine',
        'sciencedaily': 'Science Daily',
        'phys': 'Phys.org',
        'ft': 'Financial Times',
      }
      
      if (nameMap[name]) {
        return nameMap[name]
      }
      
      return name.charAt(0).toUpperCase() + name.slice(1)
    } catch {
      return 'Unknown Source'
    }
  }

  private filterByKeywords(articles: FetchResult[], keywords: string[]): FetchResult[] {
    if (keywords.length === 0) return articles
    
    const lowerKeywords = keywords.map(k => k.toLowerCase())
    
    return articles.filter(article => {
      const searchText = `${article.title} ${article.summary}`.toLowerCase()
      return lowerKeywords.some(keyword => searchText.includes(keyword))
    })
  }

  private deduplicateArticles(articles: FetchResult[]): FetchResult[] {
    const seen = new Set<string>()
    return articles.filter((article) => {
      const key = article.url || article.title
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
}