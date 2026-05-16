import Link from 'next/link'
import type { KeyTerm } from '@/lib/blog'

interface KeyTermsProps {
  terms: KeyTerm[]
}

/**
 * Compact reading-aid block rendered near the top of blog articles.
 * Shows term + short definition, with optional glossary link.
 * Designed for scanning, not as a standalone glossary page.
 */
export function KeyTerms({ terms }: KeyTermsProps) {
  if (terms.length === 0) return null

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 mb-6">
      <h2 className="text-xs font-mono uppercase tracking-widest text-[hsl(var(--primary))] mb-3">
        Key Terms
      </h2>
      <dl className="space-y-2">
        {terms.map(({ term, definition, href }) => (
          <div key={term} className="flex flex-col sm:flex-row sm:gap-3 gap-0.5">
            <dt className="text-sm font-mono font-bold uppercase tracking-wider text-foreground shrink-0">
              {href ? (
                <Link
                  href={href}
                  className="hover:text-[hsl(var(--primary))] transition-colors"
                >
                  {term}
                </Link>
              ) : (
                term
              )}
            </dt>
            <dd className="text-xs font-mono text-muted-foreground leading-relaxed">
              {definition}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}