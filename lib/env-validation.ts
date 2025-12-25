/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

interface EnvConfig {
  required: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
  optional: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

const envConfig: EnvConfig = {
  required: {
    OPENWEATHER_API_KEY: {
      name: 'OPENWEATHER_API_KEY',
      description: 'OpenWeatherMap API key (required for weather data) - server-only for security',
    },
  },
  optional: {
    NEXT_PUBLIC_SUPABASE_URL: {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'Supabase project URL (optional - for authentication)',
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Supabase anonymous key (optional - for authentication)',
    },
    SENTRY_DSN: {
      name: 'SENTRY_DSN',
      description: 'Sentry DSN (optional - for error monitoring)',
    },
    NEXT_PUBLIC_SENTRY_DSN: {
      name: 'NEXT_PUBLIC_SENTRY_DSN',
      description: 'Sentry client DSN (optional - for error monitoring)',
    },
    SENTRY_ORG: {
      name: 'SENTRY_ORG',
      description: 'Sentry organization (optional - defaults to "16bitweather")',
    },
    SENTRY_PROJECT: {
      name: 'SENTRY_PROJECT',
      description: 'Sentry project (optional - defaults to "javascript-nextjs")',
    },
  },
};

/**
 * Validate environment variables
 * Logs warnings for missing optional vars and errors for missing required vars
 */
export function validateEnv(): void {
  if (typeof window !== 'undefined') {
    // Client-side: only validate NEXT_PUBLIC_* vars
    return;
  }

  const isPlaywright =
    process.env.PLAYWRIGHT_TEST_MODE === 'true' ||
    process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE === 'true';

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  // Check required variables
  for (const [key, config] of Object.entries(envConfig.required)) {
    // In Playwright E2E runs we stub API calls, so allow missing API keys.
    if (isPlaywright && key === 'OPENWEATHER_API_KEY') {
      continue;
    }
    if (!process.env[key]) {
      missingRequired.push(key);
      console.error(`❌ Missing required environment variable: ${config.name}`);
      console.error(`   Description: ${config.description}`);
    }
  }

  // Check optional variables (log warnings)
  for (const [key, config] of Object.entries(envConfig.optional)) {
    if (!process.env[key]) {
      missingOptional.push(key);
      console.warn(`⚠️  Missing optional environment variable: ${config.name}`);
      console.warn(`   Description: ${config.description}`);
    }
  }

  // Throw error if required vars are missing (but not in test / Playwright environment)
  if (missingRequired.length > 0 && process.env.NODE_ENV !== 'test' && !isPlaywright) {
    throw new Error(
      `Missing required environment variables: ${missingRequired.join(', ')}\n` +
      'Please check your .env.local file or environment configuration.'
    );
  }

  // Log summary
  if (missingOptional.length > 0) {
    console.info(
      `ℹ️  ${missingOptional.length} optional environment variable(s) not set. ` +
      'The application will run with reduced functionality.'
    );
  } else {
    console.info('✅ All environment variables validated successfully');
  }
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value && fallback) {
    return fallback;
  }
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
export function getOptionalEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] || fallback;
}

