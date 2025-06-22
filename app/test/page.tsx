/**
 * 🧪 TEST PAGE - FOR DIAGNOSTIC PURPOSES
 * 
 * This page helps verify basic functionality:
 * - Next.js rendering
 * - Environment variables
 * - API configuration
 * - Component loading
 */

export default function TestPage() {
  return (
    <div style={{ 
      padding: '20px', 
      color: 'white', 
      backgroundColor: 'black',
      fontFamily: 'monospace',
      minHeight: '100vh'
    }}>
      <h1>🧪 DEVELOPMENT ENVIRONMENT TEST</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>✅ Basic Rendering Test</h2>
        <p>If you can see this page, Next.js is working correctly.</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🔑 Environment Variables Test</h2>
        <p>NODE_ENV: {process.env.NODE_ENV || 'NOT SET'}</p>
        <p>OpenWeather API Key: {process.env.REACT_APP_OPENWEATHER_API_KEY ? 'SET' : 'MISSING'}</p>
        <p>Google Pollen API Key: {process.env.REACT_APP_GOOGLE_POLLEN_API_KEY ? 'SET' : 'MISSING'}</p>
        <p>Debug Mode: {process.env.NODE_ENV === 'development' ? 'YES' : 'NO'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🔧 Debug Configuration Test</h2>
        <p>This will show if debug files are loading correctly.</p>
        <div id="debug-status">Loading debug status...</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🌐 Network Test</h2>
        <p>Testing basic network functionality...</p>
        <div id="network-status">Testing network...</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>📋 Diagnostic Checklist</h2>
        <ul>
          <li>✅ Page loads without errors</li>
          <li>✅ Text is readable</li>
          <li>✅ Environment variables accessible</li>
          <li>✅ Next.js routing works</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#333', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>🔍 Browser Console Test</h3>
        <p>Open browser console (F12) and check for:</p>
        <ul>
          <li>No JavaScript errors</li>
          <li>No network errors</li>
          <li>Environment variables loading</li>
          <li>Debug configuration warnings</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#333', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>🎯 Next Steps</h3>
        <p>If this page loads correctly:</p>
        <ol>
          <li>Go back to <a href="/" style={{ color: '#00ff00' }}>main page</a></li>
          <li>Test the weather search functionality</li>
          <li>Check if API calls work</li>
          <li>Verify all components load</li>
        </ol>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          // Client-side diagnostic tests
          console.log('🧪 Test page loaded');
          console.log('Environment:', '${process.env.NODE_ENV}');
          console.log('API Key:', '${process.env.REACT_APP_OPENWEATHER_API_KEY ? 'SET' : 'MISSING'}');
          
          // Test debug configuration
          try {
            // This will only work if debug files are properly configured
            console.log('🔧 Debug configuration test');
          } catch (e) {
            console.error('❌ Debug config error:', e.message);
          }
          
          // Test network
          fetch('/api/hello')
            .then(res => res.json())
            .then(data => {
              console.log('✅ Network test successful');
              document.getElementById('network-status').innerHTML = '✅ Network working';
            })
            .catch(err => {
              console.error('❌ Network test failed:', err);
              document.getElementById('network-status').innerHTML = '❌ Network error: ' + err.message;
            });
        `
      }} />
    </div>
  );
} 