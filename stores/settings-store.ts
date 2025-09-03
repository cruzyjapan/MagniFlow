import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  // 表示設定
  theme: 'light' | 'dark' | 'system'
  showThumbnails: boolean
  articlesPerPage: number
  
  // 自動更新設定
  autoRefresh: boolean
  refreshInterval: number // 分単位
  
  // 通知設定
  enableNotifications: boolean
  
  // アクション
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setShowThumbnails: (show: boolean) => void
  setArticlesPerPage: (count: number) => void
  setAutoRefresh: (enabled: boolean) => void
  setRefreshInterval: (minutes: number) => void
  setEnableNotifications: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // デフォルト値
      theme: 'system',
      showThumbnails: true,
      articlesPerPage: 20,
      autoRefresh: false,
      refreshInterval: 15,
      enableNotifications: false,
      
      // アクション
      setTheme: (theme) => {
        set({ theme })
        // テーマを実際に適用
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark')
        } else {
          // システム設定に従う
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      setShowThumbnails: (showThumbnails) => set({ showThumbnails }),
      setArticlesPerPage: (articlesPerPage) => set({ articlesPerPage }),
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      setEnableNotifications: (enableNotifications) => set({ enableNotifications }),
    }),
    {
      name: 'magniflow-settings',
      version: 1,
    }
  )
)