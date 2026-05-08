/**
 * 16-Bit Weather Platform - Aviation Demo Mode Hook
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Persistent user preference for forcing the aviation flight-lookup API to
 * return synthesized mock data even when real providers are configured.
 * Useful for screenshots and offline demos. State is shared across all
 * mounted consumers via a custom event so flipping the toggle in one
 * component instantly updates the rest.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { safeStorage } from '@/lib/safe-storage';

export const DEMO_MODE_STORAGE_KEY = 'bitweather_aviation_demo_mode';
const DEMO_MODE_EVENT = 'bitweather:aviation-demo-mode-change';

function readStored(): boolean {
  return safeStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
}

export function useDemoMode(): readonly [boolean, (next: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(false);

  // Hydrate from storage after mount to avoid SSR mismatch.
  useEffect(() => {
    setEnabled(readStored());
  }, []);

  // Sync across tabs (storage event) and within the same tab (custom event).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DEMO_MODE_STORAGE_KEY) {
        setEnabled(e.newValue === 'true');
      }
    };
    const onLocalChange = () => setEnabled(readStored());

    window.addEventListener('storage', onStorage);
    window.addEventListener(DEMO_MODE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(DEMO_MODE_EVENT, onLocalChange);
    };
  }, []);

  const setMode = useCallback((next: boolean) => {
    safeStorage.setItem(DEMO_MODE_STORAGE_KEY, String(next));
    setEnabled(next);
    window.dispatchEvent(new Event(DEMO_MODE_EVENT));
  }, []);

  return [enabled, setMode] as const;
}
