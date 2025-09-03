'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTabStore } from '@/stores/tab-store'
import { Tab } from '@/types'

export function useTabs() {
  const queryClient = useQueryClient()
  const { setTabs, setActiveTab } = useTabStore()

  const { data: tabs, isLoading, error } = useQuery({
    queryKey: ['tabs'],
    queryFn: async () => {
      const response = await fetch('/api/tabs')
      if (!response.ok) {
        throw new Error('Failed to fetch tabs')
      }
      const data = await response.json()
      setTabs(data)
      if (data.length > 0 && !useTabStore.getState().activeTabId) {
        setActiveTab(data[0].id)
      }
      return data as Tab[]
    },
  })

  const createTab = useMutation({
    mutationFn: async (tabData: Partial<Tab>) => {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tabData),
      })
      if (!response.ok) {
        throw new Error('Failed to create tab')
      }
      return response.json()
    },
    onSuccess: (newTab) => {
      // Zustandストアに直接追加
      useTabStore.getState().addTab(newTab)
      queryClient.invalidateQueries({ queryKey: ['tabs'] })
    },
  })

  const fetchArticles = useMutation({
    mutationFn: async (tabId: string) => {
      console.log('[useTabs] Fetching articles for tab:', tabId)
      const response = await fetch(`/api/tabs/${tabId}/fetch`, {
        method: 'POST',
      })
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[useTabs] Fetch failed:', response.status, errorText)
        throw new Error('Failed to fetch articles')
      }
      const data = await response.json()
      console.log('[useTabs] Fetch success:', data)
      return data
    },
    onSuccess: (data, tabId) => {
      console.log('[useTabs] Articles fetched successfully:', data)
      queryClient.invalidateQueries({ queryKey: ['articles', tabId] })
    },
    onError: (error) => {
      console.error('[useTabs] Fetch error:', error)
    },
  })

  return {
    tabs: tabs || [],
    isLoading,
    error,
    createTab,
    fetchArticles,
  }
}