'use client'

import { Article } from '@/types'
import { ArticleCard } from './article-card'
import { cn } from '@/lib/utils'

interface LayoutProps {
  articles: Article[]
}

export function HeroLayout({ articles }: LayoutProps) {
  if (articles.length === 0) return null

  const [hero, ...rest] = articles

  return (
    <div className="grid gap-6">
      {/* Hero article */}
      <a
        href={hero.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block overflow-hidden rounded-xl hover:opacity-95 transition-opacity"
      >
        {hero.thumbnailUrl && (
          <img
            src={hero.thumbnailUrl}
            alt={hero.title}
            className="h-96 w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 p-8 text-white">
          <h2 className="mb-2 text-4xl font-bold">{hero.title}</h2>
          <p className="mb-4 text-lg opacity-90">{hero.summary}</p>
          <div className="flex items-center gap-4 text-sm opacity-75">
            <span>{hero.source}</span>
            {hero.publishedAt && (
              <span>{new Date(hero.publishedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </a>

      {/* Grid of smaller articles */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {rest.slice(0, 8).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

export function GridLayout({ articles }: LayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}

export function MagazineLayout({ articles }: LayoutProps) {
  return (
    <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
      {articles.map((article, index) => (
        <div
          key={article.id}
          className={cn(
            "break-inside-avoid",
            index % 5 === 0 && "md:col-span-2"
          )}
        >
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  )
}

export function ListLayout({ articles }: LayoutProps) {
  return (
    <div className="divide-y">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block py-4 hover:bg-muted/50 transition-colors cursor-pointer"
        >
          <div className="flex gap-4">
            {article.thumbnailUrl && (
              <img
                src={article.thumbnailUrl}
                alt={article.title}
                className="h-24 w-32 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold">{article.title}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{article.summary}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{article.source}</span>
                {article.publishedAt && (
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

export function CompactLayout({ articles }: LayoutProps) {
  return (
    <div className="rounded-lg border">
      {articles.map((article, index) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "block p-4 hover:bg-muted/50",
            index !== articles.length - 1 && "border-b"
          )}
        >
          <h3 className="font-medium">{article.title}</h3>
          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
            <span>{article.source}</span>
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            )}
          </div>
        </a>
      ))}
    </div>
  )
}