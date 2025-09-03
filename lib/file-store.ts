import fs from 'fs'
import path from 'path'
import { Tab, Article } from '@/types'

const DATA_DIR = path.join(process.cwd(), '.data')
const TABS_FILE = path.join(DATA_DIR, 'tabs.json')
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json')

// データディレクトリを作成
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

class FileStore {
  private tabs: Map<string, Tab[]> = new Map()
  private articles: Map<string, Article[]> = new Map()

  constructor() {
    this.loadFromFile()
  }

  private loadFromFile() {
    // タブデータを読み込み
    if (fs.existsSync(TABS_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(TABS_FILE, 'utf-8'))
        this.tabs = new Map(data)
        console.log('[FileStore] Loaded tabs from file:', data)
      } catch (error) {
        console.error('[FileStore] Error loading tabs:', error)
      }
    }

    // 記事データを読み込み
    if (fs.existsSync(ARTICLES_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'))
        this.articles = new Map(data)
        console.log('[FileStore] Loaded articles from file, total tabs with articles:', this.articles.size)
        // デバッグ情報を出力
        this.articles.forEach((articles, tabId) => {
          console.log(`[FileStore] Tab ${tabId}: ${articles.length} articles`)
        })
      } catch (error) {
        console.error('[FileStore] Error loading articles:', error)
      }
    }
  }

  private saveToFile() {
    // タブデータを保存
    try {
      const tabsData = Array.from(this.tabs.entries())
      fs.writeFileSync(TABS_FILE, JSON.stringify(tabsData, null, 2))
      console.log('[FileStore] Saved tabs to file')
    } catch (error) {
      console.error('[FileStore] Error saving tabs:', error)
    }

    // 記事データを保存
    try {
      const articlesData = Array.from(this.articles.entries())
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articlesData, null, 2))
      console.log('[FileStore] Saved articles to file')
    } catch (error) {
      console.error('[FileStore] Error saving articles:', error)
    }
  }

  // Tab methods
  getTabs(userId: string): Tab[] {
    return this.tabs.get(userId) || []
  }

  addTab(userId: string, tab: Tab): Tab {
    const userTabs = this.getTabs(userId)
    userTabs.push(tab)
    this.tabs.set(userId, userTabs)
    this.saveToFile()
    return tab
  }

  deleteTab(userId: string, tabId: string): void {
    const userTabs = this.getTabs(userId)
    const filtered = userTabs.filter(tab => tab.id !== tabId)
    this.tabs.set(userId, filtered)
    // Also delete articles for this tab
    this.articles.delete(tabId)
    this.saveToFile()
  }

  updateTab(userId: string, tabId: string, updates: Partial<Tab>): Tab | null {
    const userTabs = this.getTabs(userId)
    const index = userTabs.findIndex(tab => tab.id === tabId)
    if (index === -1) return null
    
    userTabs[index] = { ...userTabs[index], ...updates }
    this.tabs.set(userId, userTabs)
    this.saveToFile()
    return userTabs[index]
  }

  // Article methods
  getArticles(tabId: string): Article[] {
    const articles = this.articles.get(tabId) || []
    console.log(`[FileStore] getArticles for tab ${tabId}: ${articles.length} articles found`)
    return articles
  }

  setArticles(tabId: string, articles: Article[]): void {
    this.articles.set(tabId, articles)
    this.saveToFile()
  }

  addArticles(tabId: string, newArticles: Article[]): Article[] {
    const existing = this.getArticles(tabId)
    const existingUrls = new Set(existing.map(a => a.url))
    
    // Only add articles that don't already exist
    const uniqueNewArticles = newArticles.filter(a => !existingUrls.has(a.url))
    const updated = [...existing, ...uniqueNewArticles]
    
    this.articles.set(tabId, updated)
    this.saveToFile()
    return uniqueNewArticles
  }

  // Debug method
  debugGetAllUsers(): { userId: string; tabCount: number }[] {
    const result: { userId: string; tabCount: number }[] = []
    this.tabs.forEach((tabs, userId) => {
      result.push({ userId, tabCount: tabs.length })
    })
    return result
  }
}

export const fileStore = new FileStore()