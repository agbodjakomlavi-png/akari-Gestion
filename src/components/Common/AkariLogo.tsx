import React from 'react';

interface AkariLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'auto' | 'light' | 'dark';
  showText?: boolean;
  showName?: boolean;
}

export const AkariLogo: React.FC<AkariLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'auto',
  showText = true,
  showName,
}) => {
  const isTextVisible = showName !== undefined ? showName : showText;

  // Numerical dimensions
  let height = 36;
  if (typeof size === 'number') {
    height = size;
  } else {
    switch (size) {
      case 'sm':
        height = 28;
        break;
      case 'md':
        height = 36;
        break;
      case 'lg':
        height = 50;
        break;
      case 'xl':
        height = 68;
        break;
    }
  }

  // Determine colors based on variant
  // In uploaded image:
  // - On white background: Black square with white bulb, black text & black elongated 'i'
  // - On dark background: White square with black bulb, white text & white elongated 'i'
  
  const emblemBgClass =
    variant === 'dark'
      ? 'fill-white'
      : variant === 'light'
      ? 'fill-black'
      : 'fill-black dark:fill-white';

  const emblemStrokeClass =
    variant === 'dark'
      ? 'stroke-black'
      : variant === 'light'
      ? 'stroke-white'
      : 'stroke-white dark:stroke-black';

  const textFillClass =
    variant === 'dark'
      ? 'fill-white'
      : variant === 'light'
      ? 'fill-black'
      : 'fill-black dark:fill-white';

  const width = isTextVisible ? Math.round(height * (340 / 120)) : height;

  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ height }}>
      <svg
        viewBox={isTextVisible ? '0 0 340 120' : '10 10 100 100'}
        height={height}
        width={width}
        className="overflow-visible"
      >
        {/* Left Square Emblem */}
        <rect x="10" y="10" width="100" height="100" className={emblemBgClass} />

        {/* Radiating Light Rays */}
        {/* Top Ray */}
        <line x1="60" y1="20" x2="60" y2="27" className={emblemStrokeClass} strokeWidth="3" strokeLinecap="round" />
        {/* Top-Left Ray */}
        <line x1="40" y1="26" x2="45" y2="31" className={emblemStrokeClass} strokeWidth="3" strokeLinecap="round" />
        {/* Top-Right Ray */}
        <line x1="80" y1="26" x2="75" y2="31" className={emblemStrokeClass} strokeWidth="3" strokeLinecap="round" />
        {/* Left Ray */}
        <line x1="30" y1="46" x2="37" y2="46" className={emblemStrokeClass} strokeWidth="3" strokeLinecap="round" />
        {/* Right Ray */}
        <line x1="90" y1="46" x2="83" y2="46" className={emblemStrokeClass} strokeWidth="3" strokeLinecap="round" />

        {/* Lightbulb Bulb Outline */}
        <path
          d="M60 35 C48 35 42 43 42 53 C42 61 47 67 51 72 L51 81 L69 81 L69 72 C73 67 78 61 78 53 C78 43 72 35 60 35 Z"
          fill="none"
          className={emblemStrokeClass}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bulb Screws & Bottom Contact */}
        <line x1="53" y1="85" x2="67" y2="85" className={emblemStrokeClass} strokeWidth="2.8" strokeLinecap="round" />
        <line x1="55" y1="89" x2="65" y2="89" className={emblemStrokeClass} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M57 89 C57 93 63 93 63 89" fill="none" className={emblemStrokeClass} strokeWidth="2.5" strokeLinecap="round" />

        {/* Filament inside bulb */}
        <path d="M54 58 L57 48 L63 48 L66 58" fill="none" className={emblemStrokeClass} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {isTextVisible && (
          <>
            {/* Wordmark 'akar' */}
            <text
              x="122"
              y="66"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontSize="56"
              fontWeight="900"
              letterSpacing="-1.5"
              className={textFillClass}
            >
              akar
            </text>

            {/* Subtitle 'team house' */}
            <text
              x="124"
              y="99"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              fontSize="25"
              fontWeight="400"
              letterSpacing="0.2"
              className={textFillClass}
            >
              team house
            </text>

            {/* Custom Letter 'i' Structure extending both lines */}
            {/* 'i' Dot */}
            <circle cx="272" cy="30" r="5.5" className={textFillClass} />
            {/* 'i' Elongated Stem */}
            <rect x="266.5" y="41" width="11" height="67" rx="1.5" className={textFillClass} />
          </>
        )}
      </svg>
    </div>
  );
};
