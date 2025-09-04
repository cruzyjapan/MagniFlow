'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface AdvancedTabSettingsProps {
  settings: {
    excludeKeywords?: string[]
    searchOperator?: 'AND' | 'OR'
    searchSources?: string[]
    customRssFeeds?: string[]
    usePremiumAPIs?: boolean
    sourceLimits?: Record<string, number>
    updateSchedule?: {
      interval: string
      customCron?: string
      timezone?: string
    }
    filters: {
      language?: string[]
      dateRange?: string
      domains?: {
        include?: string[]
        exclude?: string[]
      }
      mediaType?: string[]
    }
  }
  onChange: (settings: any) => void
}

export function AdvancedTabSettings({ settings, onChange }: AdvancedTabSettingsProps) {
  const [excludeKeyword, setExcludeKeyword] = useState('')
  const [rssFeed, setRssFeed] = useState('')
  const [includeDomain, setIncludeDomain] = useState('')
  const [excludeDomain, setExcludeDomain] = useState('')
  const [apiConfig, setApiConfig] = useState({ hasGoogleAPI: false, hasBingAPI: false })

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setApiConfig(data))
      .catch(console.error)
  }, [])

  const addExcludeKeyword = () => {
    if (excludeKeyword.trim()) {
      onChange({
        ...settings,
        excludeKeywords: [...(settings.excludeKeywords || []), excludeKeyword.trim()]
      })
      setExcludeKeyword('')
    }
  }

  const removeExcludeKeyword = (keyword: string) => {
    onChange({
      ...settings,
      excludeKeywords: (settings.excludeKeywords || []).filter(k => k !== keyword)
    })
  }

  const addRssFeed = () => {
    if (rssFeed.trim()) {
      onChange({
        ...settings,
        customRssFeeds: [...(settings.customRssFeeds || []), rssFeed.trim()]
      })
      setRssFeed('')
    }
  }

  const removeRssFeed = (feed: string) => {
    onChange({
      ...settings,
      customRssFeeds: (settings.customRssFeeds || []).filter(f => f !== feed)
    })
  }

  const addIncludeDomain = () => {
    if (includeDomain.trim()) {
      onChange({
        ...settings,
        filters: {
          ...settings.filters,
          domains: {
            ...settings.filters.domains,
            include: [...(settings.filters.domains?.include || []), includeDomain.trim()]
          }
        }
      })
      setIncludeDomain('')
    }
  }

  const addExcludeDomain = () => {
    if (excludeDomain.trim()) {
      onChange({
        ...settings,
        filters: {
          ...settings.filters,
          domains: {
            ...settings.filters.domains,
            exclude: [...(settings.filters.domains?.exclude || []), excludeDomain.trim()]
          }
        }
      })
      setExcludeDomain('')
    }
  }

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="search">検索設定</TabsTrigger>
        <TabsTrigger value="sources">ソース</TabsTrigger>
        <TabsTrigger value="filters">フィルター</TabsTrigger>
        <TabsTrigger value="schedule">スケジュール</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-4">
        <div>
          <Label htmlFor="operator">検索オペレータ</Label>
          <Select
            value={settings.searchOperator || 'OR'}
            onValueChange={(value: 'AND' | 'OR') => onChange({ ...settings, searchOperator: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OR">OR（いずれかのキーワード）</SelectItem>
              <SelectItem value="AND">AND（すべてのキーワード）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>除外キーワード</Label>
          <div className="flex gap-2">
            <Input
              placeholder="除外するキーワード"
              value={excludeKeyword}
              onChange={(e) => setExcludeKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExcludeKeyword()}
            />
            <Button onClick={addExcludeKeyword} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {settings.excludeKeywords?.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                -{keyword}
                <button
                  onClick={() => removeExcludeKeyword(keyword)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="sources" className="space-y-4">
        <div className="space-y-4">
          {/* Premium APIs */}
          {(apiConfig.hasGoogleAPI || apiConfig.hasBingAPI) && (
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-base font-semibold">Premium検索API</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    より高品質で最新の検索結果を取得できます
                  </p>
                </div>
                <Switch
                  checked={settings.usePremiumAPIs ?? false}
                  onCheckedChange={(checked) => {
                    onChange({
                      ...settings,
                      usePremiumAPIs: checked
                    })
                  }}
                />
              </div>
              {settings.usePremiumAPIs && (
                <div className="mt-3 p-3 bg-background rounded-md space-y-3">
                  {apiConfig.hasGoogleAPI && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Google Custom Search API</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="limit-google" className="text-sm">最大件数:</Label>
                          <Input
                            id="limit-google"
                            type="number"
                            min="0"
                            max="50"
                            className="w-20"
                            value={settings.sourceLimits?.google ?? 30}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0
                              onChange({
                                ...settings,
                                sourceLimits: {
                                  ...settings.sourceLimits,
                                  google: value
                                }
                              })
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>YouTube Data API</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="limit-youtube" className="text-sm">最大件数:</Label>
                          <Input
                            id="limit-youtube"
                            type="number"
                            min="0"
                            max="50"
                            className="w-20"
                            value={settings.sourceLimits?.youtube ?? 20}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0
                              onChange({
                                ...settings,
                                sourceLimits: {
                                  ...settings.sourceLimits,
                                  youtube: value
                                }
                              })
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {apiConfig.hasBingAPI && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Bing Search API (1,000クエリ/月)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div>
            <Label>検索ソース {!settings.usePremiumAPIs && '(無料)'}</Label>
            <div className="space-y-2 mt-2">
              {[
                { id: 'qiita', label: 'Qiita', description: '技術記事・プログラミング' },
                { id: 'zenn', label: 'Zenn', description: 'エンジニア向け情報共有' },
                { id: 'hatena', label: 'はてなブックマーク', description: 'IT・一般ニュース' },
                { id: 'itmedia', label: 'ITmedia', description: 'ITニュース・技術情報' },
                { id: 'techcrunch', label: 'TechCrunch Japan', description: 'スタートアップ・テクノロジー' },
                { id: 'publickey', label: 'Publickey', description: 'エンタープライズ・IT情報' },
                { id: 'github', label: 'GitHub', description: 'オープンソースプロジェクト' },
                { id: 'duckduckgo', label: 'DuckDuckGo', description: '一般検索' },
              ].map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={settings.searchSources ? settings.searchSources.includes(source.id) : false}
                      onCheckedChange={(checked) => {
                        const sources = settings.searchSources || []
                        onChange({
                          ...settings,
                          searchSources: checked
                            ? [...sources.filter(s => s !== source.id), source.id]
                            : sources.filter(s => s !== source.id)
                        })
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{source.label}</div>
                      <div className="text-sm text-muted-foreground">{source.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`limit-${source.id}`} className="text-sm">最大件数:</Label>
                    <Input
                      id={`limit-${source.id}`}
                      type="number"
                      min="1"
                      max="100"
                      className="w-20"
                      value={settings.sourceLimits?.[source.id as keyof typeof settings.sourceLimits] || 
                        (source.id === 'qiita' || source.id === 'zenn' || source.id === 'hatena' ? 50 : 30)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        onChange({
                          ...settings,
                          sourceLimits: {
                            ...settings.sourceLimits,
                            [source.id]: value
                          }
                        })
                      }}
                      disabled={settings.searchSources ? !settings.searchSources.includes(source.id) : true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>カスタムRSSフィード</Label>
            <div className="flex gap-2">
              <Input
                placeholder="RSSフィードのURL"
                value={rssFeed}
                onChange={(e) => setRssFeed(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRssFeed()}
              />
              <Button onClick={addRssFeed} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {settings.customRssFeeds?.map((feed) => (
                <div key={feed} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm truncate">{feed}</span>
                  <button
                    onClick={() => removeRssFeed(feed)}
                    className="hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="filters" className="space-y-4">
        <div>
          <Label>言語</Label>
          <div className="space-y-2">
            {['日本語', '英語', 'その他'].map((lang) => (
              <div key={lang} className="flex items-center space-x-2">
                <Switch
                  checked={settings.filters.language?.includes(lang) || false}
                  onCheckedChange={(checked) => {
                    const languages = settings.filters.language || []
                    onChange({
                      ...settings,
                      filters: {
                        ...settings.filters,
                        language: checked
                          ? [...languages, lang]
                          : languages.filter(l => l !== lang)
                      }
                    })
                  }}
                />
                <Label>{lang}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>期間</Label>
          <Select
            value={settings.filters.dateRange || 'all'}
            onValueChange={(value) => onChange({
              ...settings,
              filters: { ...settings.filters, dateRange: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="24h">24時間以内</SelectItem>
              <SelectItem value="3d">3日以内</SelectItem>
              <SelectItem value="1w">1週間以内</SelectItem>
              <SelectItem value="1m">1ヶ月以内</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>許可ドメイン</Label>
          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={includeDomain}
              onChange={(e) => setIncludeDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addIncludeDomain()}
            />
            <Button onClick={addIncludeDomain} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {settings.filters.domains?.include?.map((domain) => (
              <Badge key={domain} variant="default">
                {domain}
                <button
                  onClick={() => onChange({
                    ...settings,
                    filters: {
                      ...settings.filters,
                      domains: {
                        ...settings.filters.domains,
                        include: settings.filters.domains?.include?.filter(d => d !== domain)
                      }
                    }
                  })}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>除外ドメイン</Label>
          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={excludeDomain}
              onChange={(e) => setExcludeDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExcludeDomain()}
            />
            <Button onClick={addExcludeDomain} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {settings.filters.domains?.exclude?.map((domain) => (
              <Badge key={domain} variant="destructive">
                {domain}
                <button
                  onClick={() => onChange({
                    ...settings,
                    filters: {
                      ...settings.filters,
                      domains: {
                        ...settings.filters.domains,
                        exclude: settings.filters.domains?.exclude?.filter(d => d !== domain)
                      }
                    }
                  })}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

      </TabsContent>

      <TabsContent value="schedule" className="space-y-4">
        <div>
          <Label>更新間隔</Label>
          <Select
            value={settings.updateSchedule?.interval || 'manual'}
            onValueChange={(value) => onChange({
              ...settings,
              updateSchedule: { ...settings.updateSchedule, interval: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">手動</SelectItem>
              <SelectItem value="15min">15分ごと</SelectItem>
              <SelectItem value="30min">30分ごと</SelectItem>
              <SelectItem value="1hour">1時間ごと</SelectItem>
              <SelectItem value="3hours">3時間ごと</SelectItem>
              <SelectItem value="6hours">6時間ごと</SelectItem>
              <SelectItem value="12hours">12時間ごと</SelectItem>
              <SelectItem value="24hours">24時間ごと</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>
    </Tabs>
  )
}