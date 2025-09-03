'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, X, MoreVertical, GripVertical, Edit, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useTabStore } from '@/stores/tab-store'
import { cn } from '@/lib/utils'
import { EditTabDialog } from './edit-tab-dialog'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableTabProps {
  tab: any
  isActive: boolean
  onClose: (e: React.MouseEvent, tabId: string) => void
  onSelect: (tabId: string) => void
  onEdit: (tabId: string) => void
}

function SortableTab({ tab, isActive, onClose, onSelect, onEdit }: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-background shadow-sm",
        isDragging && "opacity-50"
      )}
      onClick={() => onSelect(tab.id)}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: tab.color }}
      />
      <span>{tab.name}</span>
      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(tab.id)}>
              <Edit className="mr-2 h-4 w-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onClose(e, tab.id)
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function SortableTabNavigation() {
  const { tabs, activeTabId, setActiveTab, deleteTab, reorderTabs } = useTabStore()
  const queryClient = useQueryClient()
  const [draggedTab, setDraggedTab] = useState<string | null>(null)
  const [editingTabId, setEditingTabId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddTab = () => {
    const event = new CustomEvent('openCreateTab')
    window.dispatchEvent(event)
  }

  const handleCloseTab = async (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    
    // サーバー側でも削除
    try {
      const response = await fetch(`/api/tabs/${tabId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // ローカルストアからも削除
        deleteTab(tabId)
        // React Queryのキャッシュを無効化してリフレッシュ
        await queryClient.invalidateQueries({ queryKey: ['tabs'] })
      } else {
        console.error('Failed to delete tab on server')
      }
    } catch (error) {
      console.error('Error deleting tab:', error)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id)
      const newIndex = tabs.findIndex((tab) => tab.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTabs = arrayMove(tabs, oldIndex, newIndex)
        reorderTabs(newTabs)
      }
    }
    setDraggedTab(null)
  }

  const handleEditTab = (tabId: string) => {
    setEditingTabId(tabId)
  }

  return (
    <div className="border-b">
      <div className="flex items-center px-4 py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setDraggedTab(event.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabs.map(t => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              {tabs.map((tab) => (
                <SortableTab
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onClose={handleCloseTab}
                  onSelect={setActiveTab}
                  onEdit={handleEditTab}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddTab}
          className="ml-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {editingTabId && (
        <EditTabDialog
          tab={tabs.find(t => t.id === editingTabId)!}
          open={!!editingTabId}
          onOpenChange={(open) => !open && setEditingTabId(null)}
        />
      )}
    </div>
  )
}