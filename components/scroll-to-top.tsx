'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollElement = document.querySelector('main')
      if (scrollElement) {
        setIsVisible(scrollElement.scrollTop > 300)
      }
    }

    const scrollElement = document.querySelector('main')
    if (scrollElement) {
      scrollElement.addEventListener('scroll', toggleVisibility)
      return () => scrollElement.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    const scrollElement = document.querySelector('main')
    if (scrollElement) {
      scrollElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <Button
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      size="icon"
      onClick={scrollToTop}
      aria-label="トップに戻る"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}