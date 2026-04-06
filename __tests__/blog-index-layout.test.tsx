/**
 * Tests for blog index layout: featured hero card + smaller grid cards
 */

import React from 'react'

jest.mock('next/link', () => {
  return function MockLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return <a href={href} className={className}>{children}</a>
  }
})

jest.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'retro' }),
}))

jest.mock('@/lib/theme-utils', () => ({
  getComponentStyles: () => ({
    accentText: 'text-accent',
    glow: 'glow',
    text: 'text-base',
  }),
}))

jest.mock('@/components/page-wrapper', () => {
  return function MockPageWrapper({ children }: { children: React.ReactNode }) {
    return <div data-testid="page-wrapper">{children}</div>
  }
})

jest.mock('@/components/share-buttons', () => ({
  ShareButtons: () => <div data-testid="share-buttons" />,
}))

import { render, screen } from '@testing-library/react'
import type { BlogPost } from '@/lib/blog'

const makePosts = (count: number): BlogPost[] =>
  Array.from({ length: count }, (_, i) => ({
    slug: `post-${i}`,
    title: `Post Title ${i}`,
    date: new Date(2026, 3, 5 - i).toISOString(),
    author: '16bitbot',
    summary: `Summary for post ${i}`,
    tags: ['weather', 'testing'],
    heroImage: i === 0 ? '/api/og/blog?title=Featured' : '',
    readTime: 3,
    content: `Content for post ${i}`,
  }))

describe('Blog index layout', () => {
  let BlogIndex: React.ComponentType<{ posts: BlogPost[]; tags: string[]; initialTag: string | null }>

  beforeAll(async () => {
    const mod = await import('@/app/blog/blog-index')
    BlogIndex = mod.BlogIndex
  })

  it('should render a FEATURED INTEL badge on the first post', () => {
    render(<BlogIndex posts={makePosts(4)} tags={[]} initialTag={null} />)
    expect(screen.getByText('FEATURED INTEL')).toBeInTheDocument()
  })

  it('should render remaining posts in a grid container', () => {
    const { container } = render(<BlogIndex posts={makePosts(4)} tags={[]} initialTag={null} />)
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    // Grid should contain 3 posts (4 total minus 1 featured)
    const gridLinks = grid!.querySelectorAll('a')
    expect(gridLinks).toHaveLength(3)
  })
})
