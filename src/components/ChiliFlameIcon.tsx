import React from 'react';

interface ChiliFlameIconProps {
  level: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ChiliFlameIcon({ level, className = '', size = 'md' }: ChiliFlameIconProps) {
  // Sizing map
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24 md:w-28 md:h-28',
    xl: 'w-36 h-36 md:w-40 md:h-40',
  };

  const selectedSize = sizeClasses[size];

  // Leaf path for Level 0
  const renderLevel0 = () => {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${selectedSize} ${className} transition-all duration-300 drop-shadow-sm`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Modern Minimalist Fresh Leaves for Level 0 (No Spicy) */}
        {/* Main Leaf */}
        <path
          d="M 50,80 C 25,75 15,45 35,25 C 55,25 65,45 50,80 Z"
          fill="#4ADE80"
          className="transition-colors duration-300"
        />
        {/* Small secondary leaf */}
        <path
          d="M 52,70 C 65,65 75,45 65,35 C 55,35 50,55 52,70 Z"
          fill="#22C55E"
          className="opacity-90 transition-colors duration-300"
        />
        {/* Leaf Vein */}
        <path
          d="M 42,50 C 37,42 35,35 35,25"
          stroke="#16A34A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 57,55 C 60,48 62,43 65,35"
          stroke="#15803D"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Cute fresh dew drops */}
        <circle cx="32" cy="40" r="2.5" fill="white" fillOpacity="0.4" />
        <circle cx="60" cy="48" r="1.5" fill="white" fillOpacity="0.3" />
      </svg>
    );
  };

  // Level 1 to 5: Chili with dynamic Flame
  const getChiliColors = () => {
    switch (level) {
      case 1:
        return {
          body: '#84CC16', // Lime green
          highlight: '#BEF264',
          shadow: '#4D7C0F',
          stem: '#3F6212',
        };
      case 2:
        return {
          body: '#EAB308', // Warm yellow/orange
          highlight: '#FEF08A',
          shadow: '#A16207',
          stem: '#1E293B',
        };
      case 3:
        return {
          body: '#F97316', // Orange-red
          highlight: '#FFEDD5',
          shadow: '#C2410C',
          stem: '#1E293B',
        };
      case 4:
        return {
          body: '#EF4444', // Red
          highlight: '#FEE2E2',
          shadow: '#B91C1C',
          stem: '#1E293B',
        };
      case 5:
      default:
        return {
          body: '#991B1B', // Crimson/Maroon
          highlight: '#FEE2E2',
          shadow: '#7F1D1D',
          stem: '#0F172A',
        };
    }
  };

  const getFlamePathAndColors = () => {
    switch (level) {
      case 1:
        return {
          outer: {
            path: 'M 50,75 C 38,72 40,55 46,40 C 51,28 54,35 54,42 C 58,45 60,60 56,72 C 54,76 52,76 50,75 Z',
            fill: '#FCD34D', // Soft yellow
          },
          inner: null,
          sparks: false,
        };
      case 2:
        return {
          outer: {
            path: 'M 50,78 C 35,75 32,50 44,32 C 48,22 55,20 54,34 C 59,28 65,38 64,52 C 63,65 58,78 50,78 Z',
            fill: '#F59E0B', // Amber
          },
          inner: {
            path: 'M 50,74 C 41,71 40,56 46,45 C 50,38 52,42 53,46 C 56,48 57,58 54,68 C 53,71 52,72 50,74 Z',
            fill: '#FDE047', // Light yellow core
          },
          sparks: false,
        };
      case 3:
        return {
          outer: {
            path: 'M 50,80 C 30,76 28,42 42,22 C 46,14 52,18 50,32 C 57,22 68,32 66,54 C 64,70 58,80 50,80 Z',
            fill: '#EF4444', // Red
          },
          inner: {
            path: 'M 50,76 C 36,73 35,50 44,34 C 47,28 51,32 50,40 C 54,32 61,40 60,54 C 59,66 55,76 50,76 Z',
            fill: '#F59E0B', // Amber core
          },
          sparks: false,
        };
      case 4:
        return {
          outer: {
            path: 'M 50,82 C 22,78 24,35 40,14 C 45,6 52,12 48,28 C 56,12 73,22 71,50 C 69,72 62,82 50,82 Z',
            fill: '#DC2626', // Red-orange
          },
          inner: {
            path: 'M 50,78 C 30,74 32,45 43,26 C 47,20 51,25 48,36 C 54,24 65,32 64,52 C 62,68 57,78 50,78 Z',
            fill: '#F59E0B', // Yellow core
          },
          sparks: true,
        };
      case 5:
      default:
        return {
          outer: {
            path: 'M 50,82 C 15,75 20,28 38,8 C 44,-2 52,4 47,26 C 56,5 78,12 76,46 C 74,70 65,82 50,82 Z',
            fill: '#991B1B', // Dark red
          },
          inner: {
            path: 'M 50,80 C 22,75 25,35 41,18 C 46,10 52,15 48,32 C 55,15 70,22 68,48 C 66,66 59,80 50,80 Z',
            fill: '#EA580C', // Orange
          },
          core: {
            path: 'M 50,75 C 30,71 32,44 42,28 C 45,22 49,26 47,38 C 52,26 62,32 61,50 C 60,62 56,75 50,75 Z',
            fill: '#FACC15', // Yellow blazing center
          },
          sparks: true,
        };
    }
  };

  if (level === 0) {
    return renderLevel0();
  }

  const chili = getChiliColors();
  const flame = getFlamePathAndColors();

  return (
    <div className="relative flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className={`${selectedSize} ${className} transition-all duration-300 drop-shadow-md select-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dynamic Flame Layers */}
        {flame.outer && (
          <path
            d={flame.outer.path}
            fill={flame.outer.fill}
            className="transition-all duration-500 origin-bottom"
            style={{
              animation: level >= 3 ? 'pulse 2s infinite ease-in-out' : 'none',
            }}
          />
        )}
        {flame.inner && (
          <path
            d={flame.inner.path}
            fill={flame.inner.fill}
            className="transition-all duration-500 origin-bottom scale-95"
          />
        )}
        {/* @ts-ignore */}
        {flame.core && (
          <path
            // @ts-ignore
            d={flame.core.path}
            // @ts-ignore
            fill={flame.core.fill}
            className="transition-all duration-500 origin-bottom scale-90"
          />
        )}

        {/* Floating Sparks/Embers for high spice levels */}
        {flame.sparks && (
          <>
            <circle cx="28" cy="22" r="2" fill="#FBBF24" className="animate-ping" style={{ animationDuration: '1.5s' }} />
            <circle cx="74" cy="30" r="1.5" fill="#F87171" className="animate-ping" style={{ animationDuration: '1.8s' }} />
            <circle cx="45" cy="5" r="2" fill="#FCD34D" className="animate-bounce" style={{ animationDuration: '2.5s' }} />
            <circle cx="62" cy="12" r="1.5" fill="#EF4444" className="animate-bounce" style={{ animationDuration: '2s' }} />
          </>
        )}

        {/* Chili Pepper Group (slanted) */}
        <g transform="translate(0, 5) rotate(0, 50, 50)" className="transition-transform duration-300">
          {/* Shadow of the chili on the flame */}
          <path
            d="M 22,62 C 45,86 74,76 83,48 C 74,53 45,58 22,62 Z"
            fill="black"
            fillOpacity="0.15"
          />

          {/* Chili Body */}
          <path
            d="M 22,62 C 45,86 74,76 83,48 C 73,53 45,58 22,62 Z"
            fill={chili.body}
            className="transition-colors duration-300"
          />

          {/* Glossy White/Yellow Highlight */}
          <path
            d="M 32,64 C 48,59 64,55 74,51"
            stroke={chili.highlight}
            strokeWidth="3.5"
            strokeLinecap="round"
            className="opacity-75 transition-colors duration-300"
          />

          {/* Secondary smaller highlight on bottom curve */}
          <path
            d="M 45,75 C 58,72 70,64 78,54"
            stroke={chili.shadow}
            strokeWidth="1.5"
            strokeLinecap="round"
            className="opacity-40 transition-colors duration-300"
          />

          {/* Chili Stem Green Cap */}
          <path
            d="M 79,49 C 81,46 84,46 85,49 C 83,52 80,52 79,49 Z"
            fill={chili.stem}
            className="transition-colors duration-300"
          />

          {/* Chili Stem Stick */}
          <path
            d="M 82,49 C 87,44 91,37 90,30 C 88,31 85,38 80,45"
            stroke={chili.stem}
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-colors duration-300"
          />
        </g>
      </svg>
    </div>
  );
}
