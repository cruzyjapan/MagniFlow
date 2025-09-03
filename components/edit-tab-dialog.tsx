'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTabStore } from '@/stores/tab-store'
import { useArticleStore } from '@/stores/article-store'
import { AdvancedTabSettings } from './advanced-tab-settings'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  name: z.string().min(1, 'タブ名は必須です'),
  keywords: z.string().min(1, '少なくとも1つのキーワードが必要です'),
})

interface EditTabDialogProps {
  tab: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TAB_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
]

const TAB_ICONS = ['📰', '💡', '🔍', '📊', '🎯', '🚀', '💼', '🌟']

export function EditTabDialog({ tab, open, onOpenChange }: EditTabDialogProps) {
  const { updateTab } = useTabStore()
  const { clearArticlesForTab } = useArticleStore()
  const { toast } = useToast()
  const [selectedColor, setSelectedColor] = useState(tab.color)
  const [selectedIcon, setSelectedIcon] = useState(tab.icon)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedSettings, setAdvancedSettings] = useState({
    excludeKeywords: tab.excludeKeywords || [],
    searchOperator: tab.searchOperator || 'OR',
    searchSources: tab.searchSources || ['qiita', 'zenn', 'hatena', 'itmedia', 'techcrunch', 'publickey', 'github', 'duckduckgo'],
    customRssFeeds: tab.customRssFeeds || [],
    usePremiumAPIs: tab.usePremiumAPIs || false,
    sourceLimits: tab.sourceLimits || {},
    updateSchedule: tab.updateSchedule || { interval: 'manual' },
    filters: tab.filters || {
      language: [],
      dateRange: 'all',
      domains: { include: [], exclude: [] },
      mediaType: []
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tab.name,
      keywords: tab.keywords.join(', '),
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateTab(tab.id, {
        name: values.name,
        keywords: values.keywords.split(',').map(k => k.trim()).filter(k => k),
        color: selectedColor,
        icon: selectedIcon,
        ...advancedSettings
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update tab:', error)
    }
  }
  
  const handleClearData = () => {
    if (confirm('このタブの取得済み記事データをすべて削除します。よろしいですか？')) {
      clearArticlesForTab(tab.id)
      toast({
        title: 'データを削除しました',
        description: `${tab.name}タブの記事データをクリアしました。`,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>タブを編集</DialogTitle>
            <DialogDescription>
              タブの設定を変更します
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">タブ名</Label>
              <Input
                id="name"
                placeholder="例: テクノロジーニュース、スポーツ情報"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="keywords">キーワード（カンマ区切り）</Label>
              <Input
                id="keywords"
                placeholder="例: AI, 機械学習, テクノロジー"
                {...register('keywords')}
              />
              {errors.keywords && (
                <p className="text-sm text-red-500">{errors.keywords.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>カラー</Label>
              <div className="flex gap-2">
                {TAB_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>アイコン</Label>
              <div className="grid grid-cols-8 gap-2">
                {TAB_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`h-10 w-10 rounded border-2 text-xl ${
                      selectedIcon === icon
                        ? 'border-gray-900 bg-gray-100'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                高度な設定
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {showAdvanced && (
                <div className="border rounded-lg p-4">
                  <AdvancedTabSettings
                    settings={advancedSettings}
                    onChange={setAdvancedSettings}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleClearData}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                記事データを削除
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}