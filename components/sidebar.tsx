'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useArticleStore } from '@/stores/article-store'
import { useTabStore } from '@/stores/tab-store'
import { Badge } from '@/components/ui/badge'
import { SettingsModal } from './settings-modal'
import {
  Home,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  X,
  Info,
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { 
    articles, 
    userActions, 
    filter, 
    setFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy
  } = useArticleStore()
  const { tabs, activeTabId } = useTabStore()
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  
  // アクティブなタブを取得
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // 統計を計算
  const stats = {
    total: articles.length,
    unread: articles.filter(a => !userActions[a.id]?.actionType).length,
    read: articles.filter(a => userActions[a.id]?.actionType === 'READ').length,
    favorites: articles.filter(a => userActions[a.id]?.actionType === 'FAVORITE').length,
  }

  const menuItems = [
    {
      id: 'home',
      label: 'ホーム',
      icon: Home,
      count: stats.total,
      filter: 'all' as const,
    },
    {
      id: 'unread',
      label: '未読',
      icon: EyeOff,
      count: stats.unread,
      highlight: stats.unread > 0,
      filter: 'unread' as const,
    },
    {
      id: 'read',
      label: '既読',
      icon: Eye,
      count: stats.read,
      filter: 'read' as const,
    },
    {
      id: 'favorites',
      label: 'お気に入り',
      icon: Star,
      count: stats.favorites,
      highlight: stats.favorites > 0,
      filter: 'favorites' as const,
    },
  ]

  const filterItems = [
    {
      id: 'search',
      label: '詳細検索',
      icon: Search,
      action: () => {
        setShowSearch(!showSearch)
      }
    },
  ]

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Toggle button */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Bar */}
        {!collapsed && showSearch && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-0 h-9 w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-2 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-2",
                  item.filter && filter === item.filter && "bg-accent"
                )}
                onClick={() => {
                  if (item.filter) {
                    setFilter(item.filter)
                  }
                }}
              >
                <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && (
                      <Badge
                        variant={item.highlight ? "default" : "secondary"}
                        className="ml-auto"
                      >
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>

          {!collapsed && (
            <>
              <div className="pt-4">
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                  フィルター
                </h3>
                <div className="space-y-1">
                  {filterItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        item.id === 'search' && showSearch && "bg-accent"
                      )}
                      onClick={item.action}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* タブ設定情報 */}
              {activeTab && (
                <div className="pt-4 border-t">
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                    アクティブタブ設定
                  </h3>
                  <div className="space-y-2 px-2 text-xs">
                    {/* タブ名とアイコン */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{activeTab.icon}</span>
                      <span className="font-medium" style={{ color: activeTab.color }}>
                        {activeTab.name}
                      </span>
                    </div>
                    
                    {/* キーワード */}
                    <div>
                      <span className="text-muted-foreground">キーワード: </span>
                      <div className="mt-1">
                        {activeTab.keywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="mr-1 mb-1 text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* 除外キーワード */}
                    {activeTab.excludeKeywords && activeTab.excludeKeywords.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">除外: </span>
                        <div className="mt-1">
                          {activeTab.excludeKeywords.map((keyword, i) => (
                            <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">
                              -{keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 検索設定 */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">検索: </span>
                      <Badge variant="outline" className="text-xs">
                        {activeTab.searchOperator || 'OR'}
                      </Badge>
                      {activeTab.usePremiumAPIs && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    {/* 検索ソース */}
                    {activeTab.searchSources && activeTab.searchSources.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">ソース: </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {activeTab.searchSources.map((source, i) => (
                            <Badge key={i} variant="secondary" className="text-xs capitalize">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 取得件数設定 */}
                    {activeTab.sourceLimits && (
                      <div>
                        <span className="text-muted-foreground">取得件数: </span>
                        <div className="mt-1 space-y-1 text-xs">
                          {activeTab.sourceLimits.google !== undefined && (
                            <div className="flex justify-between">
                              <span>Google検索:</span>
                              <Badge variant="secondary" className="text-xs">{activeTab.sourceLimits.google}</Badge>
                            </div>
                          )}
                          {activeTab.sourceLimits.youtube !== undefined && (
                            <div className="flex justify-between">
                              <span>YouTube:</span>
                              <Badge variant="secondary" className="text-xs">{activeTab.sourceLimits.youtube}</Badge>
                            </div>
                          )}
                          {Object.entries(activeTab.sourceLimits)
                            .filter(([source]) => source !== 'google' && source !== 'youtube')
                            .map(([source, limit]) => (
                              <div key={source} className="flex justify-between">
                                <span className="capitalize">{source}:</span>
                                <Badge variant="secondary" className="text-xs">{limit}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* フィルター設定 */}
                    {activeTab.filters && (
                      <>
                        {/* 言語フィルター */}
                        {activeTab.filters.language && activeTab.filters.language.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">言語: </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {activeTab.filters.language.map((lang, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 期間フィルター */}
                        {activeTab.filters.dateRange && activeTab.filters.dateRange !== 'all' && (
                          <div>
                            <span className="text-muted-foreground">期間: </span>
                            <Badge variant="outline" className="text-xs">
                              {activeTab.filters.dateRange === '24h' && '24時間'}
                              {activeTab.filters.dateRange === '3d' && '3日間'}
                              {activeTab.filters.dateRange === '1w' && '1週間'}
                              {activeTab.filters.dateRange === '1m' && '1ヶ月'}
                            </Badge>
                          </div>
                        )}
                        
                        {/* ドメインフィルター */}
                        {activeTab.filters.domains && (
                          <>
                            {activeTab.filters.domains.include && activeTab.filters.domains.include.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">許可ドメイン: </span>
                                <div className="mt-1">
                                  {activeTab.filters.domains.include.map((domain, i) => (
                                    <div key={i} className="text-xs truncate">✓ {domain}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {activeTab.filters.domains.exclude && activeTab.filters.domains.exclude.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">除外ドメイン: </span>
                                <div className="mt-1">
                                  {activeTab.filters.domains.exclude.map((domain, i) => (
                                    <div key={i} className="text-xs truncate">✗ {domain}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                    
                    {/* RSS フィード */}
                    {activeTab.customRssFeeds && activeTab.customRssFeeds.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">RSSフィード: </span>
                        <div className="mt-1">
                          {activeTab.customRssFeeds.map((feed, i) => (
                            <div key={i} className="text-xs truncate" title={feed}>
                              📡 {feed}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 更新スケジュール */}
                    {activeTab.updateSchedule && (
                      <div>
                        <span className="text-muted-foreground">更新: </span>
                        <Badge variant="outline" className="text-xs">
                          {activeTab.updateSchedule.interval === 'manual' && '手動'}
                          {activeTab.updateSchedule.interval === '15min' && '15分ごと'}
                          {activeTab.updateSchedule.interval === '30min' && '30分ごと'}
                          {activeTab.updateSchedule.interval === '1h' && '1時間ごと'}
                          {activeTab.updateSchedule.interval === '3h' && '3時間ごと'}
                          {activeTab.updateSchedule.interval === '6h' && '6時間ごと'}
                          {activeTab.updateSchedule.interval === '12h' && '12時間ごと'}
                          {activeTab.updateSchedule.interval === '24h' && '24時間ごと'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Settings */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              collapsed && "justify-center px-2"
            )}
            onClick={() => setShowSettings(true)}
          >
            <Settings className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && <span>設定</span>}
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      {showSettings && (
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </aside>
  )
}