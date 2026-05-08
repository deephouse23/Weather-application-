'use client';

/**
 * 16-Bit Weather Platform - Travel Hub
 *
 * Shell layout for the unified /travel page. Provides a Fly/Drive mode toggle,
 * slots for Trip Input + Trip Result, and renders the active mode's content.
 * Persists the selected mode in localStorage so the user's choice survives reloads.
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Plane, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TravelHubMode = 'fly' | 'drive';

export interface TravelHubProps {
  tripInput?: ReactNode;
  tripResult?: ReactNode;
  flyContent: ReactNode;
  driveContent: ReactNode;
  defaultMode?: TravelHubMode;
  className?: string;
}

const STORAGE_KEY = 'travel-hub-mode';

function isTravelHubMode(value: unknown): value is TravelHubMode {
  return value === 'fly' || value === 'drive';
}

export default function TravelHub({
  tripInput,
  tripResult,
  flyContent,
  driveContent,
  defaultMode,
  className,
}: TravelHubProps) {
  const initialMode: TravelHubMode = defaultMode ?? 'drive';
  const [mode, setMode] = useState<TravelHubMode>(initialMode);

  // Hydrate mode from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isTravelHubMode(stored)) {
        setMode(stored);
      }
    } catch {
      // Ignore storage access errors (private mode, etc.)
    }
  }, []);

  const handleModeChange = (next: TravelHubMode) => {
    setMode(next);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage access errors.
    }
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Hub header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono uppercase">
          Travel Hub
        </h1>
        <p className="text-sm font-mono text-muted-foreground tracking-wider">
          // WILL YOUR TRIP SUCK? PICK A MODE TO FIND OUT.
        </p>
      </div>

      {/* Trip input slot */}
      {tripInput && (
        <>
          <div className="border-t border-border" />
          <div>{tripInput}</div>
        </>
      )}

      {/* Trip result slot */}
      {tripResult && (
        <>
          <div className="border-t border-border" />
          <div>{tripResult}</div>
        </>
      )}

      {/* Mode toggle */}
      <div className="border-t border-border" />
      <div
        role="tablist"
        aria-label="Travel mode"
        className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-stretch md:items-center"
      >
        <ModeButton
          mode="fly"
          active={mode === 'fly'}
          onClick={() => handleModeChange('fly')}
          icon={<Plane className="h-5 w-5" aria-hidden="true" />}
          label="Fly"
        />
        <ModeButton
          mode="drive"
          active={mode === 'drive'}
          onClick={() => handleModeChange('drive')}
          icon={<Car className="h-5 w-5" aria-hidden="true" />}
          label="Drive"
        />
      </div>

      {/* Active mode content */}
      <div className="border-t border-border" />
      <div
        role="tabpanel"
        id={`travel-hub-panel-${mode}`}
        aria-labelledby={`travel-hub-tab-${mode}`}
      >
        {mode === 'fly' ? flyContent : driveContent}
      </div>
    </div>
  );
}

interface ModeButtonProps {
  mode: TravelHubMode;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

function ModeButton({ mode, active, onClick, icon, label }: ModeButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      id={`travel-hub-tab-${mode}`}
      aria-selected={active}
      aria-controls={`travel-hub-panel-${mode}`}
      onClick={onClick}
      className={cn(
        'flex-1 md:flex-none md:min-w-[180px] inline-flex items-center justify-center gap-3',
        'px-6 py-4 md:px-8 md:py-3 rounded-lg font-mono text-base font-bold uppercase tracking-wider',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'bg-primary text-primary-foreground border border-primary'
          : 'bg-card text-foreground border border-border hover:bg-card/80'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
