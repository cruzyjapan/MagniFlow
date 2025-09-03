'use client'

import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Article } from '@/types'
import { Clock, ExternalLink, Star, Eye, EyeOff } from 'lucide-react'
import { useArticleStore } from '@/stores/article-store'
import { useSettingsStore } from '@/stores/settings-store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { YouTubePreview } from './youtube-preview'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { userActions, toggleRead, toggleFavorite, setSelectedArticle } = useArticleStore()
  const { showThumbnails } = useSettingsStore()
  const userAction = userActions[article.id]
  const isRead = userAction?.actionType === 'READ' || userAction?.actionType === 'FAVORITE'
  const isFavorite = userAction?.actionType === 'FAVORITE'
  
  // YouTube動画かどうかを判定
  const isYouTube = article.url.includes('youtube.com') || article.url.includes('youtu.be')

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleRead(article.id)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(article.id)
  }

  const handleCardClick = () => {
    // 記事を開く
    window.open(article.url, '_blank')
    // 既読にする
    if (!isRead) {
      toggleRead(article.id)
    }
  }

  return (
    <Card 
      className={cn(
        "group h-full overflow-hidden transition-all hover:shadow-lg cursor-pointer",
        !isRead && "border-primary/50 bg-primary/5"
      )}
      onClick={handleCardClick}
    >
      {article.thumbnailUrl && showThumbnails && (
        <div className="aspect-video overflow-hidden relative">
          {isYouTube ? (
            <YouTubePreview
              url={article.url}
              title={article.title}
              thumbnailUrl={article.thumbnailUrl}
            />
          ) : (
            <img
              src={article.thumbnailUrl}
              alt={article.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          )}
          {!isRead && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs z-10">
              未読
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "line-clamp-2 text-lg font-semibold flex-1",
            isRead && "text-muted-foreground"
          )}>
            {article.title}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggleRead}
            >
              {isRead ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isFavorite && "text-yellow-500"
              )}
              onClick={handleToggleFavorite}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn(
          "line-clamp-3 text-sm",
          isRead ? "text-muted-foreground/70" : "text-muted-foreground"
        )}>
          {article.summary}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>{article.source}</span>
          {article.publishedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(article.publishedAt, { locale: ja })} 前</span>
            </div>
          )}
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  )
}