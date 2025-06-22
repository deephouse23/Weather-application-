interface SunriseSunsetProps {
  sunrise: string;
  sunset: string;
}

export default function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  return (
    <div className="flex justify-center space-x-8 px-4 py-3 bg-[#1a1a2e] border border-[#4ecdc4]">
      {/* Sunrise */}
      <div className="flex items-center space-x-2">
        <SunriseIcon />
        <div className="text-center">
          <div className="text-xs text-[#4ecdc4] uppercase tracking-wider">SUNRISE</div>
          <div className="text-sm font-bold text-[#ffe66d]">{sunrise}</div>
        </div>
      </div>

      {/* Sunset */}
      <div className="flex items-center space-x-2">
        <SunsetIcon />
        <div className="text-center">
          <div className="text-xs text-[#4ecdc4] uppercase tracking-wider">SUNSET</div>
          <div className="text-sm font-bold text-[#ff6b6b]">{sunset}</div>
        </div>
      </div>
    </div>
  );
}

// 16-bit pixel art sunrise icon
function SunriseIcon() {
  return (
    <div className="relative w-8 h-8" style={{ imageRendering: "pixelated" as const }}>
      {/* Ground line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4ecdc4]"></div>
      
      {/* Sun */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#ffe66d] rounded-full"></div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#ffcc02] rounded-full"></div>
      
      {/* Sun rays */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-[#ffe66d]"></div>
      <div className="absolute bottom-2 left-2 w-1.5 h-0.5 bg-[#ffe66d] transform rotate-45 origin-right"></div>
      <div className="absolute bottom-2 right-2 w-1.5 h-0.5 bg-[#ffe66d] transform -rotate-45 origin-left"></div>
      
      {/* Upward arrow indicating sunrise */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-[#4ecdc4]"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-0.5">
        <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#4ecdc4]"></div>
      </div>
    </div>
  );
}

// 16-bit pixel art sunset icon
function SunsetIcon() {
  return (
    <div className="relative w-8 h-8" style={{ imageRendering: "pixelated" as const }}>
      {/* Ground line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4ecdc4]"></div>
      
      {/* Sun (positioned as if setting) */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-[#ff6b6b] rounded-t-full"></div>
      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-1.5 bg-[#ff4757] rounded-t-full"></div>
      
      {/* Horizontal rays */}
      <div className="absolute bottom-1 left-1 w-1.5 h-0.5 bg-[#ff6b6b]"></div>
      <div className="absolute bottom-1 right-1 w-1.5 h-0.5 bg-[#ff6b6b]"></div>
      <div className="absolute bottom-2 left-0.5 w-1 h-0.5 bg-[#ff6b6b]"></div>
      <div className="absolute bottom-2 right-0.5 w-1 h-0.5 bg-[#ff6b6b]"></div>
      
      {/* Downward arrow indicating sunset */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-[#4ecdc4]"></div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 translate-y-0.5">
        <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-[#4ecdc4]"></div>
      </div>
    </div>
  );
} 