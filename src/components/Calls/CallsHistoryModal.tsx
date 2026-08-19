import React from 'react';
import { X, Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { CallRecord, User } from '../../types';
import { Avatar } from '../Common/Avatar';
import { formatConversationTime, formatDuration } from '../../utils/date';

interface CallsHistoryModalProps {
  calls: CallRecord[];
  currentUser: User;
  onClose: () => void;
  onStartCall: (recipientId: string, type: 'audio' | 'video') => void;
}

export const CallsHistoryModal: React.FC<CallsHistoryModalProps> = ({
  calls,
  currentUser,
  onClose,
  onStartCall,
}) => {
  return (
    <div
      id="calls-history-modal"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Journal d'appels
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calls List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-2">
          {calls.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Phone className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun appel récent</p>
            </div>
          ) : (
            calls.map((call) => {
              const isOutgoing = call.callerId === currentUser.id;
              const otherName = isOutgoing ? call.receiverName || 'Contact' : call.callerName;
              const otherAvatar = isOutgoing ? call.receiverAvatar : call.callerAvatar;
              const otherId = isOutgoing ? call.receiverId || '' : call.callerId;

              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#202c33] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={otherAvatar} name={otherName} size="md" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {otherName}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        {call.status === 'missed' ? (
                          <span className="flex items-center gap-1 text-red-500 font-medium">
                            <PhoneMissed className="w-3.5 h-3.5" />
                            <span>Manqué</span>
                          </span>
                        ) : isOutgoing ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <PhoneOutgoing className="w-3.5 h-3.5" />
                            <span>Sortant ({formatDuration(call.durationSeconds)})</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-500">
                            <PhoneIncoming className="w-3.5 h-3.5" />
                            <span>Entrant ({formatDuration(call.durationSeconds)})</span>
                          </span>
                        )}
                        <span className="text-gray-400">• {formatConversationTime(call.startedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 text-[#00a884]">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStartCall(otherId, 'audio');
                      }}
                      className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      title="Rappeler (Audio)"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStartCall(otherId, 'video');
                      }}
                      className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      title="Rappeler (Vidéo)"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
