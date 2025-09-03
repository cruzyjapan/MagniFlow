'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface YouTubePreviewProps {
  url: string
  title: string
  thumbnailUrl?: string
}

export function YouTubePreview({ url, title, thumbnailUrl }: YouTubePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  // YouTube URLからビデオIDを抽出
  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }
  
  const videoId = extractVideoId(url)
  
  if (!videoId || !thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl || '/api/placeholder/640/360'}
        alt={title}
        className="w-full h-full object-cover"
      />
    )
  }
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPlaying(true)
  }
  
  if (isPlaying) {
    return (
      <div className="relative w-full h-full aspect-video bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0"
        />
      </div>
    )
  }
  
  return (
    <div className="relative group w-full h-full">
      {/* サムネイル */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      
      {/* YouTube ロゴ */}
      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
        YouTube
      </div>
      
      {/* プレイボタンオーバーレイ */}
      <div 
        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
        onClick={handlePlayClick}
      >
        <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 shadow-xl transform transition-transform hover:scale-110">
          <Play className="h-8 w-8 text-white fill-white ml-1" />
        </div>
      </div>
    </div>
  )
}