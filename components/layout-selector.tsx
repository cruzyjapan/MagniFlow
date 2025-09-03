'use client'

import { List, Newspaper, Square, Grid3X3 } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type LayoutType = 'hero' | 'grid' | 'list' | 'compact'

interface LayoutSelectorProps {
  value: LayoutType
  onChange: (value: LayoutType) => void
}

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(val) => val && onChange(val as LayoutType)}>
      <ToggleGroupItem value="hero" aria-label="Hero layout">
        <Newspaper className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Grid layout">
        <Grid3X3 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List layout">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="compact" aria-label="Compact layout">
        <Square className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}