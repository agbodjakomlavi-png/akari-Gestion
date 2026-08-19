import React, { useState } from 'react';
import {
  X,
  Phone,
  Video,
  Lock,
  Star,
  Bell,
  Trash2,
  Users,
  Image,
  FileText,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { Conversation, Message, User } from '../../types';
import { Avatar } from '../Common/Avatar';
import { formatConversationTime, formatFileSize } from '../../utils/date';

interface ContactInfoModalProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: User;
  allUsers: User[];
  onClose: () => void;
  onStartAudioCall: () => void;
  onStartVideoCall: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
  onOpenMediaLightbox: (url: string, type: 'image' | 'video') => void;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  conversation,
  messages,
  currentUser,
  allUsers,
  onClose,
  onStartAudioCall,
  onStartVideoCall,
  onClearChat,
  onDeleteChat,
  onOpenMediaLightbox,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'docs'>('media');

  let title = conversation.name || 'Contact';
  let avatarSrc = conversation.avatar;
  let bio = '';
  let phone = '';

  if (conversation.type === 'direct') {
    const otherId = conversation.participants.find((p) => p !== currentUser.id);
    const otherUser = allUsers.find((u) => u.id === otherId);
    if (otherUser) {
      title = otherUser.name;
      avatarSrc = otherUser.avatar;
      bio = otherUser.bio;
      phone = otherUser.phone || '';
    }
  } else {
    bio = conversation.description || 'Groupe de discussion';
  }

  // Filter media messages
  const mediaMessages = messages.filter(
    (m) => (m.type === 'image' || m.type === 'video') && m.mediaUrl && !m.isDeleted
  );
  const docMessages = messages.filter(
    (m) => m.type === 'document' && !m.isDeleted
  );

  return (
    <div
      id="contact-info-modal"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Infos du {conversation.type === 'group' ? 'groupe' : 'contact'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Details */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/80">
          {/* Avatar & Main actions */}
          <div className="p-6 flex flex-col items-center text-center">
            <Avatar src={avatarSrc} name={title} size="2xl" />
            <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            {phone && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{phone}</p>}
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-xs">{bio}</p>

            {/* Audio & Video Call Quick Buttons */}
            <div className="flex items-center gap-6 mt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartAudioCall();
                }}
                className="flex flex-col items-center gap-1 text-[#00a884] hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Audio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartVideoCall();
                }}
                className="flex flex-col items-center gap-1 text-[#00a884] hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Vidéo</span>
              </button>
            </div>
          </div>

          {/* Group participants (if group) */}
          {conversation.type === 'group' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#00a884]" />
                  <span>{conversation.participants.length} membres</span>
                </span>
              </div>

              <div className="space-y-2">
                {conversation.participants.map((pid) => {
                  const user = allUsers.find((u) => u.id === pid);
                  const isMe = pid === currentUser.id;
                  const isAdmin = conversation.adminIds?.includes(pid);

                  return (
                    <div
                      key={pid}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#202c33]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={isMe ? currentUser.avatar : user?.avatar}
                          name={isMe ? 'Vous' : user?.name || 'Contact'}
                          size="sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {isMe ? 'Vous' : user?.name || 'Contact'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {isMe ? currentUser.bio : user?.bio}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-[#00a884]">
                          Admin
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Media, Links & Docs */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Médias et documents partagés
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('media')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    activeMediaTab === 'media'
                      ? 'bg-[#00a884] text-white'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Médias ({mediaMessages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('docs')}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    activeMediaTab === 'docs'
                      ? 'bg-[#00a884] text-white'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Docs ({docMessages.length})
                </button>
              </div>
            </div>

            {activeMediaTab === 'media' ? (
              mediaMessages.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Aucun média partagé</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mediaMessages.slice(0, 9).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onOpenMediaLightbox(m.mediaUrl!, m.type as 'image' | 'video')}
                      className="aspect-square rounded-lg overflow-hidden bg-black/10 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {m.type === 'image' ? (
                        <img
                          src={m.mediaUrl}
                          alt="media"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video src={m.mediaUrl} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : docMessages.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucun document partagé</p>
            ) : (
              <div className="space-y-2">
                {docMessages.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-[#202c33]"
                  >
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs text-gray-800 dark:text-gray-200 truncate flex-1">
                      {m.mediaName || 'Document'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatFileSize(m.mediaSize || 1000000)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Encryption notice */}
          <div className="p-4 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
            <ShieldCheck className="w-5 h-5 text-[#00a884] shrink-0" />
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100 block">
                Chiffrement de bout en bout
              </span>
              <span>Les messages et les appels sont sécurisés. Touchez pour vérifier.</span>
            </div>
          </div>

          {/* Danger zone: Clear / Delete */}
          <div className="p-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClearChat();
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202c33] flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
              <span>Effacer tous les messages</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onDeleteChat();
                onClose();
              }}
              className="w-full text-left p-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Supprimer la discussion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
