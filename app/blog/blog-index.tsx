"use client"

import { useState } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import PageWrapper from '@/components/page-wrapper'
import { ShareButtons } from '@/components/share-buttons'
import type { BlogPost } from '@/lib/blog'

const POSTS_PER_PAGE = 10

interface BlogIndexProps {
  posts: BlogPost[]
  tags: string[]
}

export function BlogIndex({ posts, tags }: BlogIndexProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'card')

  const filtered = selectedTag
    ? posts.filter(p => p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()))
    : posts

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-xs font-mono tracking-widest text-muted-foreground">
            // TRANSMISSION LOG
          </p>
          <h1
            className={cn(
              'text-4xl sm:text-5xl md:text-6xl font-extrabold font-mono',
              themeClasses.accentText,
              themeClasses.glow
            )}
          >
            WEATHER BLOG
          </h1>
          <p className={cn('text-base sm:text-lg font-mono max-w-2xl mx-auto', themeClasses.text)}>
            Weekly dispatches from 16bitbot. Space weather, severe storms, weather
            phenomena, and climate records.
          </p>
          <ShareButtons
            config={{
              title: '16 Bit Weather Blog',
              text: 'Weekly weather intelligence from 16bitbot at 16bitweather.co',
              url: 'https://www.16bitweather.co/blog',
            }}
            className="mt-3 justify-center"
          />
        </div>

        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => { setSelectedTag(null); setPage(1) }}
              className={cn(
                'px-3 py-1 text-xs font-mono uppercase tracking-wider rounded border transition-colors',
                !selectedTag
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
              )}
            >
              ALL
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => { setSelectedTag(tag); setPage(1) }}
                className={cn(
                  'px-3 py-1 text-xs font-mono uppercase tracking-wider rounded border transition-colors',
                  selectedTag === tag
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Post count */}
        <p className="text-xs font-mono text-muted-foreground text-center tracking-wider">
          SHOWING {paginated.length} OF {filtered.length} DISPATCHES
        </p>

        {/* Posts */}
        <div className="space-y-6">
          {paginated.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={cn(
                'block rounded-lg border p-6 transition-all duration-200',
                'hover:border-[hsl(var(--primary))] hover:shadow-[0_0_15px_hsl(var(--primary)/0.15)]',
                'border-[hsl(var(--border))]',
                'bg-[hsl(var(--card))]',
                i === 0 && 'border-[hsl(var(--primary)/0.5)]'
              )}
            >
              {post.heroImage && i === 0 && (
                <div className="relative w-full h-48 mb-4 rounded overflow-hidden">
                  <img
                    src={post.heroImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground tracking-wider mb-2">
                {i === 0 && <span className="text-[hsl(var(--primary))]">FEATURED</span>}
                {i === 0 && <span>|</span>}
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                <span>|</span>
                <span>{post.readTime} MIN READ</span>
                <span>|</span>
                <span>BY {post.author.toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-bold font-mono uppercase tracking-tight mb-2">
                {post.title}
              </h2>
              <p className="text-sm font-mono text-muted-foreground line-clamp-2 mb-3">
                {post.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {paginated.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-mono text-muted-foreground">NO DISPATCHES FOUND</p>
            <p className="text-sm font-mono text-muted-foreground mt-2">Check back soon for weather intelligence.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-[hsl(var(--border))] rounded disabled:opacity-30 hover:border-[hsl(var(--primary))] transition-colors"
            >
              PREV
            </button>
            <span className="px-4 py-2 text-xs font-mono tracking-wider text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-[hsl(var(--border))] rounded disabled:opacity-30 hover:border-[hsl(var(--primary))] transition-colors"
            >
              NEXT
            </button>
          </div>
        )}

        {/* RSS link */}
        <div className="text-center pt-4 border-t border-[hsl(var(--border))]">
          <a
            href="/blog/rss.xml"
            className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors"
          >
            RSS FEED
          </a>
        </div>
      </div>
    </PageWrapper>
  )
}
