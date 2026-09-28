import React from 'react';

interface SatQueryLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const SatQueryLogo: React.FC<SatQueryLogoProps> = ({ 
  size = 'md', 
  showText = true 
}) => {
  const iconSize = size === 'sm' ? 26 : size === 'lg' ? 42 : 32;

  return (
    <div className="flex items-center space-x-2.5 group select-none">
      {/* Precision Satellite & Earth Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Earth Body */}
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="url(#earthGradientNew)"
            stroke="#2563eb"
            strokeWidth="2"
          />

          {/* Continents Contour */}
          <path
            d="M40 34C44 38 48 38 52 35C56 32 60 36 62 42C64 48 58 54 52 56C46 58 44 64 48 68"
            stroke="#16a34a"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Satellite Orbital Ring */}
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="18"
            transform="rotate(-28 50 50)"
            stroke="url(#orbitGradientNew)"
            strokeWidth="2"
            strokeDasharray="4 2.5"
          />

          {/* Satellite Node at Apex */}
          <g transform="translate(82, 33)">
            <circle cx="0" cy="0" r="4.5" fill="#2563eb" />
            <circle cx="0" cy="0" r="8" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
            <line x1="-7" y1="0" x2="-4" y2="0" stroke="#2563eb" strokeWidth="1.5" />
            <line x1="4" y1="0" x2="7" y2="0" stroke="#2563eb" strokeWidth="1.5" />
          </g>

          {/* Gradients */}
          <defs>
            <radialGradient id="earthGradientNew" cx="35%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
            </radialGradient>
            <linearGradient id="orbitGradientNew" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="60%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-1 leading-none">
            <span className="font-sans font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
              SatQuery
            </span>
            <span className="font-sans font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-base">
              AI
            </span>
          </div>
          <span className="text-[8.5px] font-mono tracking-widest text-slate-500 dark:text-zinc-400 font-semibold uppercase mt-0.5">
            EARTH INTELLIGENCE
          </span>
        </div>
      )}
    </div>
  );
};
