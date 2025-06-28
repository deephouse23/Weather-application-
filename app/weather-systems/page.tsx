"use client"

console.log('WeatherSystems module loaded');

const WeatherSystemsPage = () => {
  console.log('WeatherSystems component rendered');
  return (
    <div className="min-h-screen bg-black text-cyan-400 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 font-mono">Weather Systems</h1>
        <p className="text-lg mb-4">Debug version - testing deployment</p>
        <div className="bg-gray-900 p-4 rounded border border-cyan-400">
          <p className="text-sm">This page was causing "Element type is invalid" errors due to complex theme utilities.</p>
          <p className="text-sm mt-2">Will restore full functionality after deployment is confirmed working.</p>
        </div>
      </div>
    </div>
  );
};

console.log('WeatherSystems type:', typeof WeatherSystemsPage);
export default WeatherSystemsPage; 