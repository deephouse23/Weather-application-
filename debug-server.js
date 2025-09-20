// Debug script to see what's happening with the server
const { spawn } = require('child_process');
const path = require('path');

console.log('Debug: Starting Next.js server with test environment...\n');

// Set environment variables
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-key-for-testing',
  NEXT_PUBLIC_OPENWEATHER_API_KEY: 'test-api-key',
  NODE_ENV: 'development'
};

console.log('Environment variables set:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL);
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('- NODE_ENV:', env.NODE_ENV);
console.log('\nStarting server...\n');

// Start the dev server
const server = spawn('npm', ['run', 'dev'], {
  env: env,
  shell: true,
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

server.on('exit', (code, signal) => {
  console.log(`Server exited with code ${code} and signal ${signal}`);
  if (code !== 0) {
    console.log('\nServer crashed! This is the issue Playwright is facing.');
    console.log('Check the error messages above to see what went wrong.');
  }
});

// Keep the script running
process.on('SIGINT', () => {
  console.log('\nStopping server...');
  server.kill();
  process.exit();
});

console.log('Server is running. Press Ctrl+C to stop.\n');
