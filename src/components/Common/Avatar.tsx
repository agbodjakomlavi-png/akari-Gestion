import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  hasStory?: boolean;
  storySeen?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
  '2xl': 'w-20 h-20 text-2xl',
};

const onlineIndicatorSizes = {
  xs: 'w-2 h-2 bottom-0 right-0 border',
  sm: 'w-2.5 h-2.5 bottom-0 right-0 border-2',
  md: 'w-3 h-3 bottom-0 right-0 border-2',
  lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5 border-2',
  xl: 'w-4 h-4 bottom-0.5 right-0.5 border-2',
  '2xl': 'w-5 h-5 bottom-1 right-1 border-2',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '?',
  size = 'md',
  isOnline,
  hasStory = false,
  storySeen = false,
  onClick,
  className = '',
  id,
}) => {
  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const ringStyle = hasStory
    ? storySeen
      ? 'p-0.5 rounded-full ring-2 ring-gray-400 dark:ring-gray-600'
      : 'p-0.5 rounded-full ring-2 ring-[#00a884]'
    : '';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${ringStyle} ${
        onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      } ${className}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-[#374248] text-gray-700 dark:text-gray-200 font-semibold shadow-inner`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fallback to initials on broken image
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {isOnline && (
        <span
          className={`absolute rounded-full bg-[#25d366] border-white dark:border-[#111b21] ${onlineIndicatorSizes[size]}`}
          title="En ligne"
        />
      )}
    </div>
  );
};
