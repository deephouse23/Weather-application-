"use client"

/**
 * Metric Info Tooltip
 *
 * Small info icon that appears in the corner of weather metric cards.
 * On hover/focus, shows a brief definition and a link to the glossary.
 *
 * IMPORTANT: Uses Radix Tooltip on a <button> element — NOT on the Card itself.
 * Using TooltipTrigger asChild on Card components causes React error #185
 * (infinite re-render loop when authenticated). This approach is safe because
 * the trigger is a simple button, not the Card.
 */

import React from "react"
import Link from "next/link"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { getMetricDefinition } from "@/lib/weather-definitions"

interface MetricInfoTooltipProps {
  metricId: string
}

export function MetricInfoTooltip({ metricId }: MetricInfoTooltipProps) {
  const metric = getMetricDefinition(metricId)
  if (!metric) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full text-muted-foreground opacity-40 hover:opacity-100 hover:bg-primary/10 transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
          aria-label={`Learn about ${metric.name}`}
        >
          <Info size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="end"
        className="max-w-[280px] p-3"
      >
        <p className="font-semibold text-sm mb-1">{metric.name}</p>
        <p className="text-xs leading-relaxed text-popover-foreground/80 mb-2">
          {metric.brief}
        </p>
        <Link
          href={`/learn/glossary#${metric.id}`}
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          Learn more →
        </Link>
      </TooltipContent>
    </Tooltip>
  )
}
