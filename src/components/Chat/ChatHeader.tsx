import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Info,
  VolumeX,
  Trash2,
  Image,
  Download
} from 'lucide-react';
import { Conversation, User } from '../../types';
import { Avatar } from '../Common/Avatar';
import { formatLastSeen } from '../../utils/date';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  onStartAudioCall: () => void;
  onStartVideoCall: () => void;
  onToggleSearchInChat: () => void;
  onOpenInfo: () => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
  onOpenWallpaper: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUser,
  allUsers,
  onBack,
  onStartAudioCall,
  onStartVideoCall,
  onToggleSearchInChat,
  onOpenInfo,
  onClearChat,
  onDeleteChat,
  onOpenWallpaper,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  let title = conversation.name || 'Discussion';
  let avatarSrc = conversation.avatar;
  let statusSubtitle = '';
  let isOnline = false;

  if (conversation.type === 'direct') {
    const otherId = conversation.participants.find((p) => p !== currentUser.id);
    const otherUser = allUsers.find((u) => u.id === otherId);
    if (otherUser) {
      title = otherUser.name;
      avatarSrc = otherUser.avatar;
      isOnline = otherUser.isOnline;

      if (otherUser.isTypingIn === conversation.id) {
        statusSubtitle = "en train d'écrire...";
      } else {
        statusSubtitle = formatLastSeen(otherUser.lastSeen, otherUser.isOnline);
      }
    }
  } else {
    // Group: show members summary
    const memberNames = conversation.participants
      .map((pid) => (pid === currentUser.id ? 'Vous' : allUsers.find((u) => u.id === pid)?.name || ''))
      .filter(Boolean)
      .join(', ');
    statusSubtitle = memberNames;
  }

  return (
    <div
      id="chat-header"
      className="h-16 px-3 sm:px-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-[#e9edef] dark:border-[#222d34] flex items-center justify-between z-20 select-none shadow-sm"
    >
      {/* Contact info & back */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="lg:hidden p-1.5 -ml-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#374248]"
          title="Retour aux discussions"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <Avatar
          src={avatarSrc}
          name={title}
          size="md"
          isOnline={conversation.type === 'direct' ? isOnline : undefined}
          onClick={onOpenInfo}
          className="cursor-pointer"
        />

        <div
          onClick={onOpenInfo}
          className="flex flex-col min-w-0 cursor-pointer text-left group"
        >
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:underline">
            {title}
          </span>
          <span
            className={`text-xs truncate ${
              statusSubtitle.includes('écrire')
                ? 'text-[#25d366] font-medium'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {statusSubtitle}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 text-gray-600 dark:text-gray-300">
        {/* Video Call */}
        <button
          id="chat-video-call-btn"
          type="button"
          onClick={onStartVideoCall}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#374248] transition-colors"
          title="Appel vidéo"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Audio Call */}
        <button
          id="chat-audio-call-btn"
          type="button"
          onClick={onStartAudioCall}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#374248] transition-colors"
          title="Appel vocal"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Search in chat */}
        <button
          id="chat-search-toggle-btn"
          type="button"
          onClick={onToggleSearchInChat}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#374248] transition-colors hidden sm:flex"
          title="Rechercher dans la discussion"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* More Options */}
        <div className="relative" ref={menuRef}>
          <button
            id="chat-more-options-btn"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#374248] transition-colors"
            title="Plus d'options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white dark:bg-[#233138] rounded-md shadow-xl py-1.5 z-50 border border-gray-100 dark:border-gray-700/50 text-sm animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenInfo();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-3 text-gray-700 dark:text-gray-200"
              >
                <Info className="w-4 h-4 text-gray-400" />
                <span>Infos du {conversation.type === 'group' ? 'groupe' : 'contact'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenWallpaper();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-3 text-gray-700 dark:text-gray-200"
              >
                <Image className="w-4 h-4 text-gray-400" />
                <span>Fond d'écran</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onClearChat();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-3 text-gray-700 dark:text-gray-200"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
                <span>Effacer les messages</span>
              </button>

              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteChat();
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-3 text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Supprimer la discussion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
