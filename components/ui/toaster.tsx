'use client'

import * as React from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    // フォールバック実装
    return {
      toast: (toast: Omit<Toast, 'id'>) => {
        console.log('Toast:', toast)
      },
      toasts: [],
      dismiss: () => {},
    }
  }
  return context
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...t, id }
    setToasts((prev) => [...prev, newToast])
    
    // 3秒後に自動削除
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              rounded-lg border p-4 shadow-lg transition-all
              ${toast.variant === 'destructive' 
                ? 'border-destructive bg-destructive text-destructive-foreground' 
                : 'border bg-background text-foreground'
              }
            `}
          >
            {toast.title && (
              <div className="font-semibold">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
            <button
              onClick={() => dismiss(toast.id)}
              className="absolute right-2 top-2 rounded-sm opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}