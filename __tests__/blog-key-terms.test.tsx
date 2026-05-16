/**
 * Tests for blog Key Terms feature:
 * - KeyTerm type parsing from frontmatter
 * - KeyTerms component rendering
 * - Posts without keyTerms render unchanged
 */

import React from 'react'

jest.mock('next/link', () => {
  return function MockLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
    return <a href={href} className={className}>{children}</a>
  }
})

import { render, screen } from '@testing-library/react'
import { KeyTerms } from '@/components/blog/key-terms'
import type { KeyTerm } from '@/lib/blog'

describe('KeyTerms component', () => {
  it('should render nothing when terms array is empty', () => {
    const { container } = render(<KeyTerms terms={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render a Key Terms header', () => {
    const terms: KeyTerm[] = [
      { term: 'CAPE', definition: 'Convective Available Potential Energy.' },
    ]
    render(<KeyTerms terms={terms} />)
    expect(screen.getByText('Key Terms')).toBeInTheDocument()
  })

  it('should render term and definition pairs', () => {
    const terms: KeyTerm[] = [
      { term: 'Supercell', definition: 'A rotating thunderstorm.' },
      { term: 'CAPE', definition: 'Convective Available Potential Energy.' },
    ]
    render(<KeyTerms terms={terms} />)
    expect(screen.getByText('Supercell')).toBeInTheDocument()
    expect(screen.getByText('A rotating thunderstorm.')).toBeInTheDocument()
    expect(screen.getByText('CAPE')).toBeInTheDocument()
    expect(screen.getByText('Convective Available Potential Energy.')).toBeInTheDocument()
  })

  it('should render term as a link when href is provided', () => {
    const terms: KeyTerm[] = [
      { term: 'Supercell', definition: 'A rotating thunderstorm.', href: '/education/glossary#supercell' },
    ]
    render(<KeyTerms terms={terms} />)
    const link = screen.getByText('Supercell').closest('a')
    expect(link).not.toBeNull()
    expect(link!.getAttribute('href')).toBe('/education/glossary#supercell')
  })

  it('should render term as plain text when href is absent', () => {
    const terms: KeyTerm[] = [
      { term: 'Updraft', definition: 'A rising air current.' },
    ]
    render(<KeyTerms terms={terms} />)
    const termEl = screen.getByText('Updraft')
    expect(termEl.closest('a')).toBeNull()
  })
})

describe('Blog keyTerms frontmatter parsing', () => {
  it('should parse keyTerms from valid frontmatter', async () => {
    // Dynamic import so gray-matter runs fresh
    const { default: matter } = await import('gray-matter')

    const frontmatter = `---
title: "Test Post"
slug: test-post
date: "2026-05-15T12:00:00Z"
author: 16bitbot
summary: A test post
tags: [weather]
heroImage: ""
readTime: 3
keyTerms:
  - term: CAPE
    definition: Convective Available Potential Energy.
    href: /education/glossary#cape
  - term: Wind Shear
    definition: Change in wind speed or direction with height.
---
Content here.`

    const { data } = matter(frontmatter)
    expect(Array.isArray(data.keyTerms)).toBe(true)
    expect(data.keyTerms).toHaveLength(2)
    expect(data.keyTerms[0].term).toBe('CAPE')
    expect(data.keyTerms[0].definition).toBe('Convective Available Potential Energy.')
    expect(data.keyTerms[0].href).toBe('/education/glossary#cape')
    expect(data.keyTerms[1].term).toBe('Wind Shear')
    expect(data.keyTerms[1].href).toBeUndefined()
  })

  it('should handle posts without keyTerms gracefully', async () => {
    const { default: matter } = await import('gray-matter')

    const frontmatter = `---
title: "Old Post"
slug: old-post
date: "2026-01-01T12:00:00Z"
author: 16bitbot
summary: No key terms here
tags: [weather]
heroImage: ""
readTime: 3
---
Content here.`

    const { data } = matter(frontmatter)
    expect(data.keyTerms).toBeUndefined()
  })
})