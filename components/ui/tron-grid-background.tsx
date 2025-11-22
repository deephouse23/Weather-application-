"use client"

import React from "react"

interface TronGridBackgroundProps {
  theme: string | undefined
}

export const TronGridBackground = ({ theme }: TronGridBackgroundProps) => {
  if ((theme || 'dark') !== 'tron') return null;

  return (
    <>
      <style jsx>{`
        @keyframes tronWave {
          0% {
            transform: translateY(100vh);
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh);
            opacity: 0.8;
          }
        }

        .tron-grid-base {
          background-image: 
            linear-gradient(rgba(0, 220, 255, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 220, 255, 0.18) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .tron-grid-detail {
          background-image: 
            linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px);
          background-size: 10px 10px;
        }

        .tron-wave {
          background: linear-gradient(
            to top,
            transparent 0%,
            rgba(0, 204, 255, 0.4) 45%,
            rgba(0, 240, 255, 0.6) 50%,
            rgba(0, 204, 255, 0.4) 55%,
            transparent 100%
          );
          height: 200px;
          width: 100%;
          animation: tronWave 3.5s infinite linear;
          filter: blur(2px);
        }

        .tron-wave-glow {
          background: linear-gradient(
            to top,
            transparent 0%,
            rgba(0, 220, 255, 0.2) 40%,
            rgba(0, 240, 255, 0.35) 50%,
            rgba(0, 220, 255, 0.2) 60%,
            transparent 100%
          );
          height: 300px;
          width: 100%;
          animation: tronWave 3.5s infinite linear;
          animation-delay: 0.2s;
          filter: blur(4px);
        }

        .tron-pulse-grid {
          background-image: 
            linear-gradient(rgba(0, 220, 255, 0.25) 2px, transparent 2px),
            linear-gradient(90deg, rgba(0, 220, 255, 0.25) 2px, transparent 2px);
          background-size: 50px 50px;
          animation: tronGridPulse 3.5s infinite linear;
        }

        @keyframes tronGridPulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base static grid */}
        <div className="absolute inset-0 tron-grid-base opacity-15" />

        {/* Detail grid */}
        <div className="absolute inset-0 tron-grid-detail opacity-8" />

        {/* Pulsing grid overlay */}
        <div className="absolute inset-0 tron-pulse-grid" />

        {/* Animated wave effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="tron-wave absolute left-0 right-0" />
        </div>

        {/* Secondary wave with glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="tron-wave-glow absolute left-0 right-0" />
        </div>

        {/* Subtle corner accent lines */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#00DCFF] opacity-25"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#00DCFF] opacity-25"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#00DCFF] opacity-25"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#00DCFF] opacity-25"></div>
      </div>
    </>
  );
};

