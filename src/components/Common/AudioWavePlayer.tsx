import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { formatDuration } from '../../utils/date';

interface AudioWavePlayerProps {
  duration?: number;
  isSender?: boolean;
}

export const AudioWavePlayer: React.FC<AudioWavePlayerProps> = ({
  duration = 12,
  isSender = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const timerRef = useRef<number | null>(null);

  // Pseudo waveform heights for visual fidelity
  const waveBars = [
    30, 45, 80, 60, 25, 40, 75, 90, 65, 40, 55, 70, 85, 40, 30, 60, 95, 75, 50, 35, 70, 80, 50, 30, 60, 45, 35, 20
  ];

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 100 / speed;
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, duration, speed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    if (speed === 1) setSpeed(1.5);
    else if (speed === 1.5) setSpeed(2);
    else setSpeed(1);
  };

  const progressRatio = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const activeBarIndex = Math.floor(progressRatio * waveBars.length);

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[240px] max-w-full">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
          isSender
            ? 'bg-[#00a884] text-white hover:bg-[#029070]'
            : 'bg-[#00a884] text-white hover:bg-[#029070]'
        }`}
        title={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div
          className="flex items-center gap-[2px] h-8 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            setCurrentTime(clickPos * duration);
          }}
        >
          {waveBars.map((height, idx) => {
            const isActive = idx <= activeBarIndex;
            return (
              <div
                key={idx}
                className={`w-[3px] rounded-full transition-all duration-75 ${
                  isActive
                    ? isSender
                      ? 'bg-emerald-800 dark:bg-emerald-300'
                      : 'bg-[#00a884]'
                    : isSender
                    ? 'bg-emerald-900/30 dark:bg-emerald-600/40'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{ height: `${Math.max(15, height * 0.32)}px` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
          <span>{isPlaying ? formatDuration(currentTime) : formatDuration(duration)}</span>
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[10px] font-bold tracking-wider uppercase transition-colors"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
};
