/**
 * 16-Bit Weather Platform - Stargazer Navigation Component
 *
 * Horizontal tab navigation bar for stargazer categories.
 * Terminal-styled with strong visual affordance for clickability.
 * Matches SpaceWeatherNav patterns exactly.
 */

'use client';

import React from 'react';
import { Cloud, Telescope, Calendar, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StargazerTabId = 'conditions' | 'targets' | 'events' | 'launches';

interface StargazerNavProps {
  activeTab: string;
  onTabChange: (tab: StargazerTabId) => void;
}

const tabs: { id: StargazerTabId; label: string; icon: React.ElementType }[] = [
  { id: 'conditions', label: 'Conditions', icon: Cloud },
  { id: 'targets', label: 'Targets', icon: Telescope },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'launches', label: 'Launches', icon: Rocket },
];

export default function StargazerNav({ activeTab, onTabChange }: StargazerNavProps) {
  return (
    <nav
      className="border border-border rounded-lg bg-card/50 overflow-x-auto scrollbar-none"
      role="tablist"
      aria-label="Stargazer sections"
    >
      <div className="flex min-w-max md:min-w-0 border-b border-border/50">
        <div className="flex items-center px-3 py-2 text-xs font-mono text-muted-foreground/50 border-r border-border/30">
          //
        </div>
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              role="tab"
              type="button"
              id={`tab-${id}`}
              aria-selected={isActive}
              aria-controls={`panel-${id}`}
              onClick={() => onTabChange(id)}
              className={cn(
                'group flex items-center gap-2 px-5 py-3 font-mono text-sm uppercase tracking-wider',
                'transition-all duration-200 whitespace-nowrap md:flex-1 md:justify-center',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10 font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-muted-foreground/50'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive ? 'text-cyan-400' : 'text-muted-foreground group-hover:text-foreground'
                )}
                aria-hidden="true"
              />
              <span className={cn(
                isActive ? '' : 'group-hover:underline underline-offset-4'
              )}>
                {isActive ? `[ ${label} ]` : label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
