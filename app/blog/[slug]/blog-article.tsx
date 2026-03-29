"use client"

import Link from 'next/link'

import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { getComponentStyles, type ThemeType } from '@/lib/theme-utils'
import PageWrapper from '@/components/page-wrapper'
import { ShareButtons } from '@/components/share-buttons'
import type { BlogPost } from '@/lib/blog'

interface BlogArticleProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

// Simple markdown-to-HTML for blog content (handles headers, paragraphs, bold, italic, lists)
function renderMarkdown(content: string): string {
  return content
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('### ')) return `<h3 class="text-lg font-bold font-mono uppercase tracking-wider mt-8 mb-3 text-[hsl(var(--primary))]">${trimmed.slice(4)}</h3>`
      if (trimmed.startsWith('## ')) return `<h2 class="text-xl font-bold font-mono uppercase tracking-wider mt-10 mb-4 text-[hsl(var(--primary))]">${trimmed.slice(3)}</h2>`
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').map(line => `<li class="ml-4">${line.replace(/^- /, '')}</li>`).join('')
        return `<ul class="list-disc space-y-1 my-4 font-mono text-sm">${items}</ul>`
      }
      // Bold and italic inline
      let html = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
      return `<p class="font-mono text-sm leading-relaxed mb-4">${html}</p>`
    })
    .join('\n')
}

export function BlogArticle({ post, relatedPosts }: BlogArticleProps) {
  const { theme } = useTheme()
  const themeClasses = getComponentStyles(theme as ThemeType, 'card')

  const shareConfig = {
    title: post.title,
    text: `${post.title} -- ${post.summary}`,
    url: `https://www.16bitweather.co/blog/${post.slug}`,
  }

  return (
    <PageWrapper>
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero image */}
        {post.heroImage && (
          <div className="relative w-full h-64 sm:h-80 mb-6 rounded-lg overflow-hidden">
            <img src={post.heroImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-block text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors mb-6"
        >
          &lt; RETURN TO DISPATCH LOG
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground tracking-wider mb-4">
          <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
          <span>|</span>
          <span>{post.readTime} MIN READ</span>
          <span>|</span>
          <span>BY {post.author.toUpperCase()}</span>
        </div>

        {/* Title */}
        <h1 className={cn(
          'text-3xl sm:text-4xl font-extrabold font-mono uppercase tracking-tight mb-4',
          themeClasses.accentText
        )}>
          {post.title}
        </h1>

        {/* Summary */}
        <p className="text-base font-mono text-muted-foreground mb-6 leading-relaxed">
          {post.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map(tag => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Share */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[hsl(var(--border))]">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">SHARE</span>
          <ShareButtons config={shareConfig} />
        </div>

        {/* Body */}
        <div
          className="prose-terminal"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* Bottom share */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[hsl(var(--border))]">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">SHARE</span>
          <ShareButtons config={shareConfig} />
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[hsl(var(--border))]">
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-6">
              RELATED DISPATCHES
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map(related => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className={cn(
                    'block rounded-lg border p-4 transition-all duration-200',
                    'hover:border-[hsl(var(--primary))] hover:shadow-[0_0_10px_hsl(var(--primary)/0.1)]',
                    'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                  )}
                >
                  <p className="text-xs font-mono text-muted-foreground tracking-wider mb-2">
                    {new Date(related.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </p>
                  <h3 className="text-sm font-bold font-mono uppercase tracking-tight line-clamp-2">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </PageWrapper>
  )
}
