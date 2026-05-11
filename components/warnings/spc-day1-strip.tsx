'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  RISK_LABELS,
  RISK_ORDER,
  OUTLOOK_TYPE_LABELS,
  type SPCOutlookGeoJSON,
} from '@/lib/services/spc-outlook-service'

type OutlookApi = SPCOutlookGeoJSON & { noRiskLabel?: string | null }

export default function SPCDay1RiskStrip() {
  const [label, setLabel] = useState<string | null>(null)
  const [fill, setFill] = useState<string>('#64748b')
  const [issue, setIssue] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/weather/spc-outlook?day=1&type=cat')
      if (!res.ok) throw new Error('outlook')
      const data = (await res.json()) as OutlookApi
      const risks = (data.features ?? [])
        .map((f) => f.properties)
        .filter((p) => p.LABEL in RISK_ORDER)
        .sort((a, b) => RISK_ORDER[a.LABEL] - RISK_ORDER[b.LABEL])
      const highest = risks.at(-1)
      if (highest) {
        setLabel(RISK_LABELS[highest.LABEL] ?? highest.LABEL2 ?? highest.LABEL)
        setFill((highest.fill as string) || '#f97316')
        setIssue((highest.ISSUE as string) || (highest.VALID as string) || null)
      } else {
        setLabel(data.noRiskLabel ?? `No ${OUTLOOK_TYPE_LABELS.cat} risk in current outlook`)
        setFill('#22c55e')
        setIssue(null)
      }
    } catch {
      setLabel('SPC outlook unavailable')
      setFill('#64748b')
      setIssue(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 10 * 60 * 1000)
    return () => clearInterval(t)
  }, [load])

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4',
        'bg-card/60 border-border font-mono text-sm'
      )}
    >
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="inline-block w-3 h-3 rounded-sm border border-border shrink-0"
          style={{ backgroundColor: fill }}
          aria-hidden
        />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          SPC Day 1 convective
        </span>
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <p className="text-muted-foreground animate-pulse">Loading outlook…</p>
        ) : (
          <p className="font-bold truncate">{label}</p>
        )}
        {issue && !loading && (
          <p className="text-xs text-muted-foreground truncate">Issued / valid: {issue}</p>
        )}
      </div>
      <a
        href="/severe"
        className="text-xs font-semibold underline text-primary shrink-0 self-start sm:self-center"
      >
        Open SPC maps
      </a>
    </div>
  )
}
