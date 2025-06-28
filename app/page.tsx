"use client"

console.log('MainPage module loaded');

const MainPage = () => {
  console.log('MainPage component rendered');
  return (
    <div className="min-h-screen bg-black text-cyan-400 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 font-mono">16-Bit Weather</h1>
        <p className="text-lg mb-4">Debug version - testing deployment</p>
        <div className="bg-gray-900 p-4 rounded border border-cyan-400">
          <p className="text-sm">This page was causing "Element type is invalid" errors due to complex theme utilities.</p>
          <p className="text-sm mt-2">Will restore full functionality after deployment is confirmed working.</p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded border border-cyan-400">
            <h2 className="text-xl font-mono mb-2">Navigation</h2>
            <ul className="text-sm space-y-1">
              <li>• Weather Systems (debug)</li>
              <li>• Cloud Types (debug)</li>
              <li>• Fun Facts</li>
              <li>• Games</li>
              <li>• About</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 p-4 rounded border border-cyan-400">
            <h2 className="text-xl font-mono mb-2">Status</h2>
            <ul className="text-sm space-y-1">
              <li>✅ Not Found Page: Fixed</li>
              <li>✅ Weather Systems: Debug</li>
              <li>✅ Cloud Types: Debug</li>
              <li>✅ Radar Page: Debug</li>
              <li>✅ Main Page: Debug</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

console.log('MainPage type:', typeof MainPage);
export default MainPage;