/**
 * 16-Bit Weather Platform - Aviation Service
 *
 * Copyright (C) 2025 16-Bit Weather
 * Licensed under Fair Source License, Version 0.9
 *
 * Fetches and formats aviation weather data for AI context injection
 */

export interface AviationAlert {
  id: string;
  type: 'SIGMET' | 'AIRMET' | 'CWA' | 'PIREP';
  severity: 'low' | 'moderate' | 'severe' | 'extreme';
  hazard: string;
  region: string;
  validFrom: string;
  validTo: string;
  text: string;
}

export interface AviationContext {
  contextBlock: string;
  hasActiveAlerts: boolean;
  alertCount: number;
}

/**
 * Fetch aviation alerts from the internal API
 */
export async function fetchAviationAlerts(): Promise<AviationAlert[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/aviation/alerts`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error('Failed to fetch aviation alerts:', response.status);
      return [];
    }

    const data = await response.json();
    return data.alerts || [];
  } catch (error) {
    console.error('Error fetching aviation alerts:', error);
    return [];
  }
}

/**
 * Build aviation context block for AI system prompt
 */
export function buildAviationContextBlock(alerts: AviationAlert[]): AviationContext {
  if (alerts.length === 0) {
    return {
      contextBlock: '',
      hasActiveAlerts: false,
      alertCount: 0
    };
  }

  // Group alerts by type
  const sigmets = alerts.filter(a => a.type === 'SIGMET');
  const airmets = alerts.filter(a => a.type === 'AIRMET');

  let contextBlock = `
REAL-TIME AVIATION WEATHER ALERTS (NOAA Aviation Weather Center):
====================================================
Total Active Alerts: ${alerts.length} (${sigmets.length} SIGMETs, ${airmets.length} AIRMETs)
`;

  if (sigmets.length > 0) {
    contextBlock += `
ACTIVE SIGMETs (Significant Meteorological Information):
`;
    for (const sigmet of sigmets.slice(0, 5)) {
      contextBlock += `- ${sigmet.hazard.toUpperCase()} | Region: ${sigmet.region} | ${sigmet.text}
  Valid: ${sigmet.validFrom} to ${sigmet.validTo} | Severity: ${sigmet.severity.toUpperCase()}
`;
    }
  }

  if (airmets.length > 0) {
    contextBlock += `
ACTIVE AIRMETs (Airmen's Meteorological Information):
`;
    for (const airmet of airmets.slice(0, 5)) {
      contextBlock += `- ${airmet.hazard.toUpperCase()} | Region: ${airmet.region} | ${airmet.text}
  Valid: ${airmet.validFrom} to ${airmet.validTo} | Severity: ${airmet.severity.toUpperCase()}
`;
    }
  }

  contextBlock += `====================================================
`;

  return {
    contextBlock,
    hasActiveAlerts: alerts.length > 0,
    alertCount: alerts.length
  };
}

/**
 * Get full aviation context for AI
 */
export async function getAviationContext(): Promise<AviationContext> {
  const alerts = await fetchAviationAlerts();
  return buildAviationContextBlock(alerts);
}
