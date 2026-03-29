"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'


import { toast } from '@/components/ui/use-toast'
import { Copy, Check } from 'lucide-react'
import { XIcon, FacebookIcon, LinkedInIcon } from '@/components/icons/social'

export interface ShareConfig {
  title: string
  text: string
  url: string
}

export interface ShareButtonsProps {
  config: ShareConfig
  className?: string
}

const PLATFORMS = [
  {
    id: 'x',
    name: 'X',
    ariaLabel: 'Share on X',
    Icon: XIcon,
    getUrl: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    ariaLabel: 'Share on Facebook',
    Icon: FacebookIcon,
    getUrl: (_text: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    ariaLabel: 'Share on LinkedIn',
    Icon: LinkedInIcon,
    getUrl: (_text: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
] as const

export function ShareButtons({ config, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${config.text}\n${config.url}`)
      setCopied(true)
      toast({
        title: 'LINK COPIED',
        description: 'Share URL copied to clipboard',
        duration: 3000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({
        title: 'COPY FAILED',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
        duration: 3000,
      })
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {PLATFORMS.map((platform) => (
        <a
          key={platform.id}
          href={platform.getUrl(config.text, config.url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={platform.ariaLabel}
          className={cn(
            'inline-flex items-center justify-center rounded-md p-2',
            'font-mono text-xs uppercase tracking-wider',
            'transition-colors duration-200',
            'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
            'text-[hsl(var(--muted-foreground))]',
            'border border-[hsl(var(--border-subtle,var(--border)))]',
          )}
        >
          <platform.Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy link'}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2',
          'font-mono text-xs uppercase tracking-wider',
          'transition-colors duration-200',
          'hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
          'text-[hsl(var(--muted-foreground))]',
          'border border-[hsl(var(--border-subtle,var(--border)))]',
          copied && 'text-green-400 border-green-400/50',
        )}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}
