import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Send, Mic } from 'lucide-react';
import { formatDuration } from '../../utils/date';

interface VoiceRecorderProps {
  onCancel: () => void;
  onSendVoiceNote: (durationSeconds: number) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onCancel,
  onSendVoiceNote,
}) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    const finalDuration = Math.max(1, seconds);
    onSendVoiceNote(finalDuration);
  };

  return (
    <div
      id="voice-recorder-bar"
      className="flex-1 flex items-center justify-between bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-2 rounded-lg animate-in fade-in"
    >
      {/* Delete / Cancel */}
      <button
        type="button"
        onClick={onCancel}
        className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
        title="Annuler l'enregistrement"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Recording Indicator & Timer */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
        <span className="text-xs font-mono font-semibold text-gray-800 dark:text-gray-200">
          {formatDuration(seconds)}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Enregistrement audio...</span>
        </div>
      </div>

      {/* Send Voice Note */}
      <button
        type="button"
        onClick={handleSend}
        className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#029070] shadow-md transition-transform active:scale-95"
        title="Envoyer la note vocale"
      >
        <Send className="w-5 h-5 ml-0.5" />
      </button>
    </div>
  );
};
