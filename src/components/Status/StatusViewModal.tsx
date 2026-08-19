import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Trash2, Eye } from 'lucide-react';
import { StatusStory, User } from '../../types';
import { Avatar } from '../Common/Avatar';
import { formatConversationTime } from '../../utils/date';

interface StatusViewModalProps {
  statuses: StatusStory[];
  initialIndex?: number;
  currentUser: User;
  onClose: () => void;
  onDeleteStatus: (statusId: string) => void;
  onReplyToStatus: (userId: string, replyText: string) => void;
  onMarkSeen: (statusId: string) => void;
}

export const StatusViewModal: React.FC<StatusViewModalProps> = ({
  statuses,
  initialIndex = 0,
  currentUser,
  onClose,
  onDeleteStatus,
  onReplyToStatus,
  onMarkSeen,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showViewers, setShowViewers] = useState(false);

  const durationMs = 5000;
  const currentStory = statuses[currentIndex];
  const isMine = currentStory?.userId === currentUser.id;
  const currentStoryId = currentStory?.id;
  const markedSeenRef = useRef<Set<string>>(new Set());

  // Mark current status as seen cleanly once per story ID
  useEffect(() => {
    if (currentStoryId && !markedSeenRef.current.has(currentStoryId)) {
      markedSeenRef.current.add(currentStoryId);
      onMarkSeen(currentStoryId);
    }
  }, [currentStoryId, onMarkSeen]);

  // Story progress timer incrementation
  useEffect(() => {
    if (!currentStory || isPaused) return;

    const interval = 50;
    const step = (interval / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentStory]);

  // Auto-advance or close when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      if (currentIndex < statuses.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setProgress(0);
      } else {
        onClose();
      }
    }
  }, [progress, currentIndex, statuses.length, onClose]);

  // Reset progress on manual index change
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !currentStory) return;
    onReplyToStatus(currentStory.userId, `Réponse à votre statut : "${replyText.trim()}"`);
    setReplyText('');
    onClose();
  };

  if (!currentStory) return null;

  return (
    <div
      id="status-story-viewer-modal"
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-md h-full sm:h-[90vh] bg-[#111b21] sm:rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Top Header: Progress bars & User profile */}
        <div className="p-4 bg-gradient-to-b from-black/80 to-transparent z-20">
          {/* Progress Bars */}
          <div className="flex items-center gap-1.5 mb-3">
            {statuses.map((s, idx) => (
              <div
                key={s.id}
                className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User info */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Avatar src={currentStory.userAvatar} name={currentStory.userName} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{currentStory.userName}</span>
                <span className="text-[11px] text-white/70">
                  {formatConversationTime(currentStory.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isMine && (
                <button
                  type="button"
                  onClick={() => onDeleteStatus(currentStory.id)}
                  className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                  title="Supprimer ce statut"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Content View */}
        <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
          {currentStory.type === 'text' ? (
            <div
              className="w-full h-full rounded-xl flex items-center justify-center p-8 text-center"
              style={{ backgroundColor: currentStory.bgColor || '#008069' }}
            >
              <p
                className={`text-xl sm:text-2xl font-semibold text-white leading-relaxed ${
                  currentStory.fontStyle === 'serif'
                    ? 'font-serif'
                    : currentStory.fontStyle === 'mono'
                    ? 'font-mono'
                    : ''
                }`}
              >
                {currentStory.content}
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img
                src={currentStory.content}
                alt="Story"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
              {currentStory.caption && (
                <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xs p-3 rounded-lg text-center text-white text-sm">
                  {currentStory.caption}
                </div>
              )}
            </div>
          )}

          {/* Left/Right Click Nav Overlays */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white/80 hover:text-white flex items-center justify-center hover:bg-black/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white/80 hover:text-white flex items-center justify-center hover:bg-black/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Actions: Viewers list for owner or quick reply for friends */}
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
          {isMine ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setShowViewers(!showViewers)}
                className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white py-1"
              >
                <Eye className="w-4 h-4" />
                <span>{(currentStory.viewers || []).length} vues</span>
              </button>

              {showViewers && (
                <div className="mt-2 w-full max-h-36 overflow-y-auto bg-black/80 rounded-lg p-2 text-xs divide-y divide-white/10">
                  {(currentStory.viewers || []).length === 0 ? (
                    <p className="text-white/60 text-center py-2">Aucune vue pour l'instant</p>
                  ) : (
                    (currentStory.viewers || []).map((v) => (
                      <div key={v.userId} className="flex items-center justify-between py-1.5 text-white">
                        <span>{v.userName}</span>
                        <span className="text-[10px] text-white/60">
                          {formatConversationTime(v.seenAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendReply();
                }}
                placeholder="Répondre au statut..."
                className="flex-1 bg-white/20 text-white placeholder-white/60 text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button
                type="button"
                onClick={handleSendReply}
                className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#029070] shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
