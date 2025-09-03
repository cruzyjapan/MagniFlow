import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Tab } from '@/types'

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  setTabs: (tabs: Tab[]) => void
  addTab: (tab: Tab) => void
  updateTab: (id: string, tab: Partial<Tab>) => Promise<void>
  deleteTab: (id: string) => void
  setActiveTab: (id: string) => void
  reorderTabs: (tabs: Tab[]) => void
}

export const useTabStore = create<TabStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      setTabs: (tabs) => set({ tabs }),
      addTab: (tab) => set((state) => ({ 
        tabs: [...state.tabs, tab],
        activeTabId: tab.id 
      })),
      updateTab: async (id, updates) => {
        try {
          // APIを呼び出してバックエンドに保存
          const response = await fetch(`/api/tabs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          })
          
          if (!response.ok) {
            throw new Error('Failed to update tab')
          }
          
          const updatedTab = await response.json()
          
          // ローカルストアも更新
          set((state) => ({
            tabs: state.tabs.map((tab) =>
              tab.id === id ? updatedTab : tab
            ),
          }))
        } catch (error) {
          console.error('Error updating tab:', error)
          // エラーが発生してもローカルストアは更新
          set((state) => ({
            tabs: state.tabs.map((tab) =>
              tab.id === id ? { ...tab, ...updates } : tab
            ),
          }))
        }
      },
      deleteTab: (id) =>
        set((state) => ({
          tabs: state.tabs.filter((tab) => tab.id !== id),
          activeTabId: state.activeTabId === id 
            ? (state.tabs.length > 1 ? state.tabs[0].id : null)
            : state.activeTabId,
        })),
      setActiveTab: (id) => set({ activeTabId: id }),
      reorderTabs: (tabs) => set({ tabs }),
    }),
    {
      name: 'magniflow-tabs-storage',
      version: 1,
    }
  )
)