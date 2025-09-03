'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettingsStore } from '@/stores/settings-store'
import { useToast } from '@/components/ui/use-toast'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast()
  const {
    theme,
    autoRefresh,
    refreshInterval,
    showThumbnails,
    articlesPerPage,
    enableNotifications,
    setTheme,
    setAutoRefresh,
    setRefreshInterval,
    setShowThumbnails,
    setArticlesPerPage,
    setEnableNotifications,
  } = useSettingsStore()

  // 初回マウント時にテーマを適用
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const handleSave = () => {
    toast({
      title: "設定を保存しました",
      description: "変更内容が正常に保存されました。",
    })
    onClose()
  }

  const handleClearCache = () => {
    // LocalStorageのキャッシュをクリア（記事の既読状態など）
    localStorage.removeItem('magniflow-article-actions')
    toast({
      title: "キャッシュをクリアしました",
      description: "ブラウザのキャッシュデータを削除しました。",
    })
  }

  const handleClearReadArticles = () => {
    // 既読記事をクリア
    localStorage.removeItem('magniflow-article-actions')
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>
            MagniFlowの表示や動作をカスタマイズします
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">一般</TabsTrigger>
            <TabsTrigger value="display">表示</TabsTrigger>
            <TabsTrigger value="data">データ</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">テーマ</Label>
              <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">ライト</SelectItem>
                  <SelectItem value="dark">ダーク</SelectItem>
                  <SelectItem value="system">システム設定に従う</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-refresh">自動更新</Label>
                <p className="text-sm text-muted-foreground">
                  定期的に新しい記事を自動取得します
                </p>
              </div>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>

            {autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">更新間隔（分）</Label>
                <Select 
                  value={refreshInterval.toString()} 
                  onValueChange={(value) => setRefreshInterval(parseInt(value))}
                >
                  <SelectTrigger id="refresh-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5分</SelectItem>
                    <SelectItem value="10">10分</SelectItem>
                    <SelectItem value="15">15分</SelectItem>
                    <SelectItem value="30">30分</SelectItem>
                    <SelectItem value="60">1時間</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">通知</Label>
                <p className="text-sm text-muted-foreground">
                  新しい記事が見つかったときに通知します
                </p>
              </div>
              <Switch
                id="notifications"
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-thumbnails">サムネイル表示</Label>
                <p className="text-sm text-muted-foreground">
                  記事一覧でサムネイル画像を表示します
                </p>
              </div>
              <Switch
                id="show-thumbnails"
                checked={showThumbnails}
                onCheckedChange={setShowThumbnails}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="articles-per-page">1ページあたりの記事数</Label>
              <Select 
                value={articlesPerPage.toString()} 
                onValueChange={(value) => setArticlesPerPage(parseInt(value))}
              >
                <SelectTrigger id="articles-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10件</SelectItem>
                  <SelectItem value="20">20件</SelectItem>
                  <SelectItem value="30">30件</SelectItem>
                  <SelectItem value="50">50件</SelectItem>
                  <SelectItem value="100">100件</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">データ管理</h3>
                <p className="text-sm text-muted-foreground">
                  保存されているデータの管理を行います
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive"
                  onClick={handleClearReadArticles}
                >
                  すべての既読記事をクリア
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive"
                  onClick={handleClearCache}
                >
                  キャッシュをクリア
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}