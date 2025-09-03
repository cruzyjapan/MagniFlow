'use client'

import { Plus, X, MoreVertical } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTabStore } from '@/stores/tab-store'
import { cn } from '@/lib/utils'

export function TabNavigation() {
  const { tabs, activeTabId, setActiveTab, deleteTab } = useTabStore()
  const handleAddTab = () => {
    // This will be handled by the parent component
    const event = new CustomEvent('openCreateTab')
    window.dispatchEvent(event)
  }

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    deleteTab(tabId)
  }

  return (
    <div className="border-b">
      <div className="flex items-center px-4">
        <Tabs value={activeTabId || ''} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="h-12 bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "relative flex items-center gap-2 px-4",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm"
                )}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tab.color }}
                />
                <span>{tab.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => handleCloseTab(e, tab.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddTab}
          className="ml-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>タブをインポート</DropdownMenuItem>
            <DropdownMenuItem>タブをエクスポート</DropdownMenuItem>
            <DropdownMenuItem>タブ設定</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}