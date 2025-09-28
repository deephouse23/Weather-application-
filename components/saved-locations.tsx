import { Pin } from 'lucide-react';

const SavedLocations = () => {
  const locations = [
    { name: 'New York, NY', temp: '22°C' },
    { name: 'London, UK', temp: '18°C' },
    { name: 'Tokyo, JP', temp: '28°C' },
  ];

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border-2 border-gray-700">
      <h2 className="text-lg font-bold mb-4 text-white flex items-center">
        <Pin className="w-4 h-4 mr-2" />
        Saved Locations
      </h2>
      <ul className="space-y-2">
        {locations.map((loc) => (
          <li key={loc.name} className="flex justify-between items-center bg-gray-900/60 p-2 rounded">
            <span className="text-white">{loc.name}</span>
            <span className="text-blue-400 font-mono">{loc.temp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SavedLocations;
