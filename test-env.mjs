// test-env.mjs
// Quick script to test environment variable loading

import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';

console.log('🔍 Testing Environment Variable Configuration\n');
console.log('='.repeat(50));

// Check various env files
const envFiles = [
  '.env',
  '.env.local', 
  '.env.production',
  '.env.production.local',
  '.env.test',
  '.vercel/.env.preview.local'
];

console.log('📁 Checking for environment files:\n');
envFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`  ✅ ${file} exists`);
    // Count variables (without showing values)
    try {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n').filter(line => 
        line.trim() && !line.trim().startsWith('#')
      );
      console.log(`     Contains ${lines.length} variables`);
    } catch (e) {
      console.log(`     Could not read file`);
    }
  } else {
    console.log(`  ❌ ${file} not found`);
  }
});

// Load .env.local if it exists
if (existsSync('.env.local')) {
  config({ path: '.env.local' });
}

console.log('\n' + '='.repeat(50));
console.log('🔑 Checking required environment variables:\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_OPENWEATHER_API_KEY',
  'OPENWEATHER_API_KEY'
];

const results = {
  found: [],
  missing: []
};

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName} is set`);
    // Show partial value for debugging (first 10 chars)
    const value = process.env[varName];
    const preview = value.substring(0, 10) + '...';
    console.log(`     Preview: ${preview}`);
    results.found.push(varName);
  } else {
    console.log(`  ❌ ${varName} is NOT set`);
    results.missing.push(varName);
  }
});

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:\n');
console.log(`  ✅ Found: ${results.found.length} variables`);
console.log(`  ❌ Missing: ${results.missing.length} variables`);

if (results.missing.length > 0) {
  console.log('\n⚠️  Missing variables:');
  results.missing.forEach(v => console.log(`  - ${v}`));
  console.log('\n💡 Next steps:');
  console.log('  1. Check your .env.local file');
  console.log('  2. Verify variable names are correct');
  console.log('  3. For CI/CD, check GitHub Secrets');
  console.log('  4. For Vercel, check project environment settings');
} else {
  console.log('\n✨ All required variables are configured!');
}

console.log('\n' + '='.repeat(50));
