'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { useTabs } from '@/hooks/use-tabs'
import { AdvancedTabSettings } from './advanced-tab-settings'
import { ChevronDown, ChevronRight } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, 'タブ名は必須です'),
  keywords: z.string().min(1, '少なくとも1つのキーワードが必要です'),
})

type FormData = z.infer<typeof formSchema>

const TAB_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
]

const TAB_ICONS = [
  '📰', '📊', '💼', '🎮', '🎬', '🎵', '📚', '🏠',
  '⚽', '🍔', '✈️', '💻', '🔬', '🎨', '📷', '🌍'
]

interface CreateTabDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTabDialog({ open, onOpenChange }: CreateTabDialogProps) {
  const [selectedColor, setSelectedColor] = useState(TAB_COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState(TAB_ICONS[0])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advancedSettings, setAdvancedSettings] = useState({
    excludeKeywords: [],
    searchOperator: 'OR' as 'OR' | 'AND',
    searchSources: [],
    customRssFeeds: [],
    usePremiumAPIs: false,
    sourceLimits: {},
    updateSchedule: { interval: 'manual' },
    filters: {
      language: [],
      dateRange: 'all',
      domains: { include: [], exclude: [] },
      mediaType: []
    }
  })
  const { setActiveTab } = useTabStore()
  const { createTab } = useTabs()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    const keywords = data.keywords.split(',').map(k => k.trim()).filter(Boolean)
    
    try {
      const result = await createTab.mutateAsync({
        name: data.name,
        color: selectedColor,
        icon: selectedIcon,
        keywords,
        excludeKeywords: advancedSettings.excludeKeywords,
        searchOperator: advancedSettings.searchOperator,
        sources: [],
        filters: advancedSettings.filters,
        customRssFeeds: advancedSettings.customRssFeeds,
        usePremiumAPIs: advancedSettings.usePremiumAPIs,
        sourceLimits: advancedSettings.sourceLimits,
        updateSchedule: advancedSettings.updateSchedule,
      })

      setActiveTab(result.id)
      reset()
      setShowAdvanced(false)
      setAdvancedSettings({
        excludeKeywords: [],
        searchOperator: 'OR',
        customRssFeeds: [],
        usePremiumAPIs: false,
        sourceLimits: {},
        updateSchedule: { interval: 'manual' },
        filters: {
          language: [],
          dateRange: 'all',
          domains: { include: [], exclude: [] },
          mediaType: []
        }
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create tab:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>新しいタブを作成</DialogTitle>
            <DialogDescription>
              特定のトピックやキーワードを追跡する新しいタブを設定します
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
            <Button type="submit">タブを作成</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}