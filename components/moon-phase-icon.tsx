'use client';

import React, { useId } from 'react';

export type MoonPhase =
  | 'new moon'
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full moon'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

interface MoonPhaseIconProps {
  phase: string;
  illumination: number; // 0-100
  size?: number; // size in pixels
  className?: string;
}

/**
 * Normalizes a phase string to one of the 8 standard moon phases
 */
function normalizePhase(phase: string): MoonPhase {
  const phaseLower = phase.toLowerCase();

  if (phaseLower.includes('new')) return 'new moon';
  if (phaseLower.includes('waxing crescent')) return 'waxing crescent';
  if (phaseLower.includes('first quarter')) return 'first quarter';
  if (phaseLower.includes('waxing gibbous')) return 'waxing gibbous';
  if (phaseLower.includes('full')) return 'full moon';
  if (phaseLower.includes('waning gibbous')) return 'waning gibbous';
  if (phaseLower.includes('last quarter') || phaseLower.includes('third quarter')) return 'last quarter';
  if (phaseLower.includes('waning crescent')) return 'waning crescent';

  return 'new moon';
}

/**
 * MoonPhaseIcon - A custom SVG moon phase visualization
 *
 * Renders a realistic moon phase using SVG with:
 * - Lit portion in a warm lunar color (using theme accent)
 * - Dark portion showing the shadowed side
 * - Smooth curves for crescent and gibbous phases
 */
export function MoonPhaseIcon({
  phase,
  illumination,
  size = 48,
  className = '',
}: MoonPhaseIconProps) {
  // Generate unique IDs for SVG defs to avoid conflicts with multiple instances
  const uniqueId = useId();
  const gradientId = `moonLitGradient-${uniqueId}`;
  const glowId = `moonGlow-${uniqueId}`;
  const clipId = `moonClip-${uniqueId}`;

  const normalizedPhase = normalizePhase(phase);
  const radius = 45; // Slightly smaller than viewBox to allow for potential glow effects
  const center = 50;

  // Calculate the illumination curve based on phase and illumination percentage
  // The curve offset determines how much of the moon is lit
  // For quarters: 0 offset (half lit)
  // For crescents: positive offset (less than half lit)
  // For gibbous: negative offset (more than half lit)

  const getIlluminationPath = (): { litPath: string; darkPath: string } => {
    // Clamp illumination between 0 and 100
    const illum = Math.max(0, Math.min(100, illumination));

    // Calculate the curve control point offset based on illumination
    // 0% = new moon (full dark), 50% = quarter, 100% = full moon (full lit)
    // The offset ranges from radius (crescent) to 0 (quarter) to -radius (gibbous)
    const illuminationFactor = (illum - 50) / 50; // -1 to 1
    const curveOffset = -illuminationFactor * radius * 1.3; // Multiply for more pronounced curve

    // Determine which side is lit based on waxing vs waning
    const isWaxing = normalizedPhase.includes('waxing') ||
                     normalizedPhase === 'first quarter' ||
                     normalizedPhase === 'new moon';
    const isWaning = normalizedPhase.includes('waning') ||
                     normalizedPhase === 'last quarter';
    const isFullMoon = normalizedPhase === 'full moon';
    const isNewMoon = normalizedPhase === 'new moon';

    // Full moon - entire circle is lit
    if (isFullMoon || illum >= 99) {
      return {
        litPath: `M ${center} ${center - radius}
                  A ${radius} ${radius} 0 1 1 ${center} ${center + radius}
                  A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`,
        darkPath: '',
      };
    }

    // New moon - entire circle is dark
    if (isNewMoon && illum <= 1) {
      return {
        litPath: '',
        darkPath: `M ${center} ${center - radius}
                   A ${radius} ${radius} 0 1 1 ${center} ${center + radius}
                   A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`,
      };
    }

    // Calculate curve based on illumination
    // At 50%: straight line (quarter)
    // Below 50%: crescent (curve inward)
    // Above 50%: gibbous (curve outward)

    const curveX = center + curveOffset;

    if (isWaxing) {
      // Waxing: right side is lit
      // Lit path: right half with curved terminator
      const litPath = `M ${center} ${center - radius}
                       A ${radius} ${radius} 0 0 1 ${center} ${center + radius}
                       Q ${curveX} ${center} ${center} ${center - radius}`;

      // Dark path: left half with curved terminator
      const darkPath = `M ${center} ${center - radius}
                        A ${radius} ${radius} 0 0 0 ${center} ${center + radius}
                        Q ${curveX} ${center} ${center} ${center - radius}`;

      return { litPath, darkPath };
    } else if (isWaning) {
      // Waning: left side is lit
      // Lit path: left half with curved terminator
      const litPath = `M ${center} ${center - radius}
                       A ${radius} ${radius} 0 0 0 ${center} ${center + radius}
                       Q ${curveX} ${center} ${center} ${center - radius}`;

      // Dark path: right half with curved terminator
      const darkPath = `M ${center} ${center - radius}
                        A ${radius} ${radius} 0 0 1 ${center} ${center + radius}
                        Q ${curveX} ${center} ${center} ${center - radius}`;

      return { litPath, darkPath };
    }

    // Fallback for edge cases
    return {
      litPath: '',
      darkPath: `M ${center} ${center - radius}
                 A ${radius} ${radius} 0 1 1 ${center} ${center + radius}
                 A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`,
    };
  };

  const { litPath, darkPath } = getIlluminationPath();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label={`${phase}, ${illumination}% illuminated`}
      role="img"
    >
      <defs>
        {/* Gradient for the lit portion - warm lunar glow */}
        <radialGradient id={gradientId} cx="40%" cy="40%" r="60%">
          <stop offset="0%" style={{ stopColor: 'var(--terminal-text-primary, #f5f5dc)', stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: 'var(--terminal-accent-primary, #e8e4d0)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'var(--terminal-text-secondary, #c0c0a0)', stopOpacity: 1 }} />
        </radialGradient>

        {/* Outer glow for the moon */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip path for the moon circle */}
        <clipPath id={clipId}>
          <circle cx={center} cy={center} r={radius} />
        </clipPath>
      </defs>

      {/* Background circle - represents the dark/shadowed portion */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="var(--terminal-bg-elevated, #1a1a2e)"
        stroke="var(--terminal-border, #333355)"
        strokeWidth="1"
        filter={`url(#${glowId})`}
      />

      {/* Dark portion of the moon (the shadow) */}
      {darkPath && (
        <path
          d={darkPath}
          fill="var(--terminal-bg-primary, #0a0a15)"
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Lit portion of the moon */}
      {litPath && (
        <path
          d={litPath}
          fill={`url(#${gradientId})`}
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Subtle crater details on lit portion */}
      {litPath && (
        <g clipPath={`url(#${clipId})`} opacity="0.15">
          <circle cx="35" cy="40" r="8" fill="var(--terminal-text-muted, #666)" />
          <circle cx="55" cy="55" r="5" fill="var(--terminal-text-muted, #666)" />
          <circle cx="60" cy="35" r="4" fill="var(--terminal-text-muted, #666)" />
          <circle cx="45" cy="65" r="6" fill="var(--terminal-text-muted, #666)" />
          <circle cx="70" cy="50" r="3" fill="var(--terminal-text-muted, #666)" />
        </g>
      )}

      {/* Rim highlight on the lit edge */}
      <circle
        cx={center}
        cy={center}
        r={radius - 1}
        fill="none"
        stroke="var(--terminal-text-primary, #ffffff)"
        strokeWidth="0.5"
        opacity="0.3"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}

export default MoonPhaseIcon;
