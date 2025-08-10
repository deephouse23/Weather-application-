/**
 * 16-Bit Weather Platform - News Ticker Feature
 * 
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 * 
 * News Ticker Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsTicker from './NewsTicker';
import { ThemeProvider } from '@/components/theme-provider';

// Mock the theme provider
jest.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'dark' }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock the theme utils
jest.mock('@/lib/theme-utils', () => ({
  getComponentStyles: () => ({
    background: 'bg-black',
    text: 'text-white',
    borderColor: 'border-gray-800',
    accentBg: 'bg-cyan-500',
    accentText: 'text-cyan-400',
    hoverBg: 'hover:bg-gray-800',
    glow: ''
  })
}));

describe('NewsTicker Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders news ticker with mock data', () => {
    render(
      <ThemeProvider>
        <NewsTicker />
      </ThemeProvider>
    );

    // Check if breaking news is displayed
    expect(screen.getByText(/Severe flooding reported in Wisconsin/)).toBeInTheDocument();
  });

  it('filters news by category', () => {
    render(
      <ThemeProvider>
        <NewsTicker categories={['weather']} />
      </ThemeProvider>
    );

    // Should show weather news
    expect(screen.getByText(/Heat wave continues across California/)).toBeInTheDocument();
    
    // Should not show non-weather news
    expect(screen.queryByText(/Local schools announce closures/)).not.toBeInTheDocument();
  });

  it('handles pause/play functionality', () => {
    render(
      <ThemeProvider>
        <NewsTicker />
      </ThemeProvider>
    );

    const pauseButton = screen.getByTitle('Pause');
    fireEvent.click(pauseButton);

    // After clicking, should show Play button
    expect(screen.getByTitle('Play')).toBeInTheDocument();
  });

  it('handles speed change', () => {
    render(
      <ThemeProvider>
        <NewsTicker speed="slow" />
      </ThemeProvider>
    );

    const speedButton = screen.getByText('SLOW');
    fireEvent.click(speedButton);

    // Should cycle to MEDIUM
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('handles close functionality', () => {
    render(
      <ThemeProvider>
        <NewsTicker />
      </ThemeProvider>
    );

    const closeButton = screen.getByTitle('Close ticker');
    fireEvent.click(closeButton);

    // Ticker should be removed from DOM
    expect(screen.queryByText(/Severe flooding reported in Wisconsin/)).not.toBeInTheDocument();

    // Check localStorage
    expect(localStorage.getItem('newsTickerClosed')).toBe('true');
  });

  it('respects localStorage closed state', () => {
    localStorage.setItem('newsTickerClosed', 'true');

    render(
      <ThemeProvider>
        <NewsTicker />
      </ThemeProvider>
    );

    // Should not render if previously closed
    expect(screen.queryByText(/Severe flooding reported in Wisconsin/)).not.toBeInTheDocument();
  });

  it('filters by priority', () => {
    render(
      <ThemeProvider>
        <NewsTicker priority="high" />
      </ThemeProvider>
    );

    // Should show high priority items
    expect(screen.getByText(/Severe flooding reported in Wisconsin/)).toBeInTheDocument();
    
    // Count high priority items (should be visible)
    const highPriorityTexts = [
      /Severe flooding reported in Wisconsin/,
      /Tornado watch issued for Kansas/,
      /Local schools announce closures/
    ];

    highPriorityTexts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('limits number of items displayed', () => {
    render(
      <ThemeProvider>
        <NewsTicker maxItems={2} />
      </ThemeProvider>
    );

    // With duplicates for scrolling, should have 4 total instances (2 items x 2)
    const allItems = screen.getAllByText(/BREAKING|Heat wave|Tornado|Local|climate|Hurricane/);
    
    // Should be limited to maxItems * 2 (for duplicate)
    expect(allItems.length).toBeLessThanOrEqual(4);
  });
});