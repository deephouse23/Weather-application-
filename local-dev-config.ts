/**
 * ⚠️ TEMPORARY DEBUG CONFIGURATION - NEVER COMMIT THIS FILE ⚠️
 * 
 * This file contains hardcoded API keys for local development debugging.
 * This file is explicitly ignored by .gitignore and should NEVER be committed to version control.
 * 
 * USAGE:
 * 1. Replace 'YOUR_API_KEY_HERE' with your actual OpenWeather API key
 * 2. Use this for local development only
 * 3. Delete this file before pushing to production
 * 4. Never share this file or commit it to git
 * 
 * SECURITY WARNING:
 * - This file contains sensitive API keys
 * - Only use for local development
 * - Delete immediately after debugging
 * - Never commit to version control
 */

// ============================================================================
// 🔑 TEMPORARY DEBUG API KEY - REPLACE WITH YOUR ACTUAL KEY
// ============================================================================
// TODO: Replace this with your actual OpenWeather API key
export const DEBUG_API_KEY: string = '9898cddb2331f6caf7f4984465b93bfe';

// ============================================================================
// 🚨 SECURITY CHECK - VERIFY THIS IS NOT COMMITTED
// ============================================================================
export const DEBUG_CONFIG = {
  isDebugMode: true,
  isLocalDevelopment: true,
  shouldNeverBeCommitted: true,
  createdAt: new Date().toISOString(),
  warning: 'DELETE THIS FILE BEFORE COMMITTING TO GIT'
};

// ============================================================================
// 📝 DEBUG UTILITIES
// ============================================================================
export const debugLog = (message: string, data?: any) => {
  if (DEBUG_CONFIG.isDebugMode) {
    console.log(`🔧 [DEBUG] ${message}`, data || '');
  }
};

export const validateDebugConfig = () => {
  if (DEBUG_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ DEBUG API KEY NOT SET - Please replace with your actual API key');
    console.error('📝 Edit this file and replace "YOUR_API_KEY_HERE" with your OpenWeather API key');
    return false;
  }
  
  if (DEBUG_API_KEY.length < 10) {
    console.error('❌ DEBUG API KEY TOO SHORT - Please check your API key');
    return false;
  }
  
  console.log('✅ DEBUG CONFIG VALIDATED - API key is set');
  return true;
};

// ============================================================================
// 🧹 CLEANUP REMINDER
// ============================================================================
export const cleanupReminder = () => {
  console.warn(`
    🚨 CLEANUP REMINDER 🚨
    
    This debug configuration should be removed before production:
    1. Delete this file: local-dev-config.ts
    2. Remove any imports of this file
    3. Ensure .env files are properly configured
    4. Test that environment variables work correctly
    
    Current debug mode: ${DEBUG_CONFIG.isDebugMode}
    API key configured: ${DEBUG_API_KEY ? 'YES' : 'NO'}
  `);
};

// Auto-run validation on import
if (typeof window !== 'undefined') {
  // Client-side validation
  validateDebugConfig();
  cleanupReminder();
} 