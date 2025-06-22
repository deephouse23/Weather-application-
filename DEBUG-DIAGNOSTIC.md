# 🔧 COMPREHENSIVE DEVELOPMENT ENVIRONMENT DIAGNOSTIC

## 🚨 CURRENT ISSUES IDENTIFIED
- Port 3000 conflicts (server trying port 3001)
- Static file 404 errors (CSS/JS files not loading)
- API key missing warnings
- Build compilation issues

## 📋 DIAGNOSTIC CHECKLIST

### 1. 🖥️ DEVELOPMENT SERVER STATUS
- [ ] Server starts without errors
- [ ] Correct port is being used
- [ ] No port conflicts
- [ ] Server responds to requests

### 2. 📦 DEPENDENCIES & INSTALLATION
- [ ] All npm packages installed correctly
- [ ] No missing dependencies
- [ ] Node.js version compatibility
- [ ] Package-lock.json integrity

### 3. 🔧 BUILD & COMPILATION
- [ ] Next.js builds successfully
- [ ] No TypeScript errors
- [ ] No import/export issues
- [ ] Static assets compile correctly

### 4. 🔑 ENVIRONMENT & API CONFIGURATION
- [ ] Environment variables load properly
- [ ] API key configuration works
- [ ] Debug configuration is valid
- [ ] No API key conflicts

### 5. 🌐 BROWSER & NETWORK
- [ ] Browser console is clean
- [ ] No CORS issues
- [ ] Static files load correctly
- [ ] Network requests succeed

### 6. 🧪 BASIC FUNCTIONALITY
- [ ] Page renders without errors
- [ ] Components load properly
- [ ] No JavaScript runtime errors
- [ ] UI interactions work

---

## 🛠️ STEP-BY-STEP DEBUGGING SCRIPT

### STEP 1: CLEAN ENVIRONMENT SETUP

```bash
# 1. Stop all running processes
taskkill /f /im node.exe
taskkill /f /im npm.exe

# 2. Clear npm cache
npm cache clean --force

# 3. Delete node_modules and reinstall
rm -rf node_modules
rm -rf .next
npm install

# 4. Check Node.js version
node --version
npm --version
```

### STEP 2: PORT CONFLICT RESOLUTION

```bash
# 1. Check what's using port 3000
netstat -ano | findstr :3000

# 2. Kill process using port 3000 (replace PID with actual process ID)
taskkill /f /pid [PID]

# 3. Or use a different port
npm run dev -- -p 3002
```

### STEP 3: DEPENDENCY VERIFICATION

```bash
# 1. Check for missing dependencies
npm ls

# 2. Check for outdated packages
npm outdated

# 3. Verify package.json integrity
npm audit

# 4. Reinstall specific problematic packages
npm install next@latest react@latest react-dom@latest
```

### STEP 4: BUILD TESTING

```bash
# 1. Test build process
npm run build

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Lint code for issues
npm run lint
```

### STEP 5: ENVIRONMENT VARIABLE TESTING

```bash
# 1. Create .env.local file for testing
echo "REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here" > .env.local
echo "REACT_APP_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here" >> .env.local

# 2. Test environment variable loading
node -e "console.log('OpenWeather API Key:', process.env.REACT_APP_OPENWEATHER_API_KEY)"
node -e "console.log('Google Pollen API Key:', process.env.REACT_APP_GOOGLE_POLLEN_API_KEY)"
```

### STEP 6: DEBUG CONFIGURATION TESTING

```bash
# 1. Verify debug files exist
ls -la local-dev-config.ts
ls -la lib/weather-api-debug.ts

# 2. Test debug configuration
node -e "
try {
  const config = require('./local-dev-config.ts');
  console.log('Debug config loaded:', config.DEBUG_API_KEY ? 'YES' : 'NO');
} catch (e) {
  console.error('Debug config error:', e.message);
}
"
```

---

## 🔍 DETAILED TROUBLESHOOTING STEPS

### A. PORT CONFLICT RESOLUTION

**Issue:** Port 3000 is in use, server trying port 3001

**Solutions:**
1. **Kill existing processes:**
   ```bash
   # Find processes using port 3000
   netstat -ano | findstr :3000
   
   # Kill the process (replace XXXX with PID)
   taskkill /f /pid XXXX
   ```

2. **Use specific port:**
   ```bash
   npm run dev -- -p 3000
   ```

3. **Check for multiple Node processes:**
   ```bash
   tasklist | findstr node
   ```

### B. STATIC FILE 404 ERRORS

**Issue:** CSS/JS files returning 404

**Solutions:**
1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check file permissions:**
   ```bash
   # Ensure files are readable
   dir /s /b *.css *.js
   ```

3. **Verify Next.js configuration:**
   ```bash
   # Check next.config.mjs
   cat next.config.mjs
   ```

### C. API KEY CONFIGURATION

**Issue:** "OpenWeather API key is missing!"

**Solutions:**
1. **Create .env.local file:**
   ```bash
   echo "REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here" > .env.local
   echo "REACT_APP_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here" >> .env.local
   ```

2. **Verify debug configuration:**
   ```bash
   # Check if debug config is loaded
   node -e "console.log(require('./local-dev-config.ts').DEBUG_API_KEY)"
   ```

3. **Test API key in browser console:**
   ```javascript
   // Open browser console and run:
   console.log('OpenWeather API Key:', process.env.REACT_APP_OPENWEATHER_API_KEY);
   console.log('Google Pollen API Key:', process.env.REACT_APP_GOOGLE_POLLEN_API_KEY);
   ```

### D. BUILD COMPILATION ISSUES

**Issue:** TypeScript/compilation errors

**Solutions:**
1. **Check TypeScript configuration:**
   ```bash
   npx tsc --noEmit
   ```

2. **Verify import paths:**
   ```bash
   # Check for missing imports
   grep -r "import.*from" app/ lib/ components/
   ```

3. **Test individual components:**
   ```bash
   # Create minimal test page
   echo 'export default function Test() { return <div>Test</div> }' > app/test/page.tsx
   ```

---

## 🧪 TESTING PROCEDURES

### 1. MINIMAL TEST PAGE

Create `app/test/page.tsx`:
```typescript
export default function TestPage() {
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: 'black' }}>
      <h1>🧪 Test Page</h1>
      <p>If you can see this, basic rendering works.</p>
      <p>OpenWeather API Key: {process.env.REACT_APP_OPENWEATHER_API_KEY ? 'SET' : 'MISSING'}</p>
      <p>Google Pollen API Key: {process.env.REACT_APP_GOOGLE_POLLEN_API_KEY ? 'SET' : 'MISSING'}</p>
    </div>
  );
}
```

### 2. API TESTING

Create `app/api-test/page.tsx`:
```typescript
"use client"

import { useEffect, useState } from 'react';

export default function ApiTestPage() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    // Test basic API call
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setStatus('API working'))
      .catch(err => setStatus('API error: ' + err.message));
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: 'black' }}>
      <h1>🔧 API Test</h1>
      <p>Status: {status}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
    </div>
  );
}
```

### 3. BROWSER CONSOLE TESTING

Open browser console and run:
```javascript
// Test environment variables
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OpenWeather API Key:', process.env.REACT_APP_OPENWEATHER_API_KEY);
console.log('Google Pollen API Key:', process.env.REACT_APP_GOOGLE_POLLEN_API_KEY);

// Test basic functionality
console.log('Window loaded:', typeof window !== 'undefined');
console.log('Document ready:', document.readyState);

// Test fetch
fetch('/api/hello')
  .then(res => res.json())
  .then(data => console.log('API response:', data))
  .catch(err => console.error('API error:', err));
```

---

## 🚨 EMERGENCY FIXES

### IF NOTHING ELSE WORKS:

1. **Complete reset:**
   ```bash
   # Backup your changes
   git stash
   
   # Clean everything
   rm -rf node_modules .next
   npm cache clean --force
   
   # Fresh install
   npm install
   npm run dev
   ```

2. **Use different port:**
   ```bash
   npm run dev -- -p 4000
   ```

3. **Check system resources:**
   ```bash
   # Check available memory
   wmic OS get TotalVisibleMemorySize,FreePhysicalMemory
   
   # Check disk space
   dir C:\
   ```

---

## 📊 DIAGNOSTIC RESULTS TEMPLATE

```
=== DEVELOPMENT ENVIRONMENT DIAGNOSTIC ===
Date: [DATE]
Node Version: [VERSION]
NPM Version: [VERSION]

1. SERVER STATUS: [✅/❌]
   - Port: [PORT]
   - Errors: [ERRORS]

2. DEPENDENCIES: [✅/❌]
   - Missing: [LIST]
   - Outdated: [LIST]

3. BUILD: [✅/❌]
   - TypeScript: [ERRORS]
   - Compilation: [ERRORS]

4. ENVIRONMENT: [✅/❌]
   - API Key: [SET/MISSING]
   - Debug Config: [LOADED/ERROR]

5. BROWSER: [✅/❌]
   - Console Errors: [COUNT]
   - Network Errors: [COUNT]

6. FUNCTIONALITY: [✅/❌]
   - Page Load: [YES/NO]
   - Components: [WORKING/ERROR]

ISSUES FOUND: [LIST]
RECOMMENDED FIXES: [LIST]
```

---

## 🎯 QUICK START COMMANDS

Run these commands in order:

```bash
# 1. Kill all Node processes
taskkill /f /im node.exe

# 2. Clear cache and reinstall
rm -rf node_modules .next
npm cache clean --force
npm install

# 3. Create environment file
echo "REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here" > .env.local
echo "REACT_APP_GOOGLE_POLLEN_API_KEY=your_google_pollen_api_key_here" >> .env.local

# 4. Start development server
npm run dev -- -p 3000

# 5. Open browser and check console
# Go to: http://localhost:3000
# Press F12 and check console for errors
```

**Remember:** This diagnostic script will help identify the exact issue. Run each step and document the results! 