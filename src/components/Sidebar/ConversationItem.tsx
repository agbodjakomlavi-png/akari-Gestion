import React, { useState } from 'react';
import {
  Pin,
  VolumeX,
  Camera,
  Mic,
  MapPin,
  FileText,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { Conversation, User, StatusStory } from '../../types';
import { Avatar } from '../Common/Avatar';
import { TickIcon } from '../Common/TickIcon';
import { formatConversationTime } from '../../utils/date';

export interface ConversationItemProps {
  conversation: Conversation;
  currentUser: User;
  allUsers?: User[];
  statuses?: StatusStory[];
  isActive: boolean;
  onSelect: () => void;
  onOpenStory?: (userId: string) => void;
  onTogglePin?: (e: React.MouseEvent) => void;
  onToggleMute?: (e: React.MouseEvent) => void;
  onToggleArchive?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUser,
  allUsers = [],
  statuses = [],
  isActive,
  onSelect,
  onOpenStory,
  onTogglePin,
  onToggleMute,
  onDelete,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const safeUsers = allUsers || [];
  const safeStatuses = statuses || [];

  // Compute other user info if direct
  let displayName = conversation.name || 'Discussion';
  let avatarSrc = conversation.avatar;
  let isOtherOnline = false;
  let hasActiveStory = false;
  let isTyping = false;
  let otherUserId: string | undefined = undefined;

  if (conversation.type === 'direct') {
    const participants = conversation.participants || [];
    otherUserId = participants.find((id) => id !== currentUser?.id);
    const otherUser = safeUsers.find((u) => u.id === otherUserId);
    if (otherUser) {
      displayName = otherUser.name;
      avatarSrc = otherUser.avatar;
      isOtherOnline = !!otherUser.isOnline;
      hasActiveStory = safeStatuses.some((s) => s.userId === otherUser.id);
      isTyping = otherUser.isTypingIn === conversation.id;
    }
  } else {
    // Check if any group member is typing
    const typingMember = safeUsers.find(
      (u) => u.id !== currentUser?.id && u.isTypingIn === conversation.id
    );
    if (typingMember) {
      isTyping = true;
    }
  }

  const unreadCount =
    conversation.unreadCounts?.[currentUser?.id] ?? conversation.unreadCount ?? 0;
  const lastMsg = conversation.lastMessage;
  const isLastMsgFromMe = lastMsg?.senderId === currentUser?.id;

  const renderLastMessageContent = () => {
    if (isTyping) {
      return (
        <span className="text-[#25d366] font-medium animate-pulse text-xs">
          en train d'écrire...
        </span>
      );
    }

    if (!lastMsg) {
      return <span className="italic text-xs text-gray-400">Aucun message</span>;
    }

    if (lastMsg.isDeleted) {
      return <span className="italic text-xs text-gray-400">Ce message a été supprimé</span>;
    }

    let icon = null;
    let label = lastMsg.text;

    if (lastMsg.type === 'image') {
      icon = <Camera className="w-3.5 h-3.5 shrink-0 mr-1 text-gray-500" />;
      label = label || 'Photo';
    } else if (lastMsg.type === 'audio') {
      icon = <Mic className="w-3.5 h-3.5 shrink-0 mr-1 text-emerald-500" />;
      label = label || 'Message vocal';
    } else if (lastMsg.type === 'location') {
      icon = <MapPin className="w-3.5 h-3.5 shrink-0 mr-1 text-red-400" />;
      label = lastMsg.location?.name || 'Localisation';
    } else if (lastMsg.type === 'document') {
      icon = <FileText className="w-3.5 h-3.5 shrink-0 mr-1 text-indigo-400" />;
      label = lastMsg.mediaName || 'Document';
    } else if (lastMsg.type === 'contact') {
      icon = <UserIcon className="w-3.5 h-3.5 shrink-0 mr-1 text-blue-400" />;
      label = lastMsg.contact?.name || 'Contact';
    }

    return (
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-[220px]">
        {isLastMsgFromMe && (
          <span className="mr-1 inline-flex items-center shrink-0">
            <TickIcon status={lastMsg.status} />
          </span>
        )}
        {icon}
        <span className="truncate">{label}</span>
      </div>
    );
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    if (hasActiveStory && otherUserId && onOpenStory) {
      e.stopPropagation();
      onOpenStory(otherUserId);
    }
  };

  return (
    <div
      id={`conversation-item-${conversation.id}`}
      onClick={onSelect}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => {
        setShowOptions(false);
        setMenuOpen(false);
      }}
      className={`relative px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors border-b border-[#f0f2f5] dark:border-[#222d34]/60 ${
        isActive
          ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
          : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] bg-white dark:bg-[#111b21]'
      }`}
    >
      {/* Avatar */}
      <div onClick={handleAvatarClick}>
        <Avatar
          src={avatarSrc}
          name={displayName}
          size="lg"
          isOnline={conversation.type === 'direct' ? isOtherOnline : undefined}
          hasStory={hasActiveStory}
          className={hasActiveStory ? 'cursor-pointer' : ''}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
            {displayName}
          </span>
          {lastMsg && (
            <span
              className={`text-[11px] shrink-0 font-medium ${
                unreadCount > 0
                  ? 'text-[#00a884] font-semibold'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {formatConversationTime(lastMsg.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 truncate">{renderLastMessageContent()}</div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {conversation.isMuted && (
              <VolumeX className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            )}
            {conversation.isPinned && (
              <Pin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 rotate-45" />
            )}
            {unreadCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#25d366] text-white text-[11px] font-bold flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {showOptions && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu Dropdown */}
      {menuOpen && (
        <div
          className="absolute right-4 top-10 w-44 bg-white dark:bg-[#233138] rounded-md shadow-xl py-1 z-30 border border-gray-100 dark:border-gray-700/50 text-xs animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {onTogglePin && (
            <button
              type="button"
              onClick={(e) => {
                setMenuOpen(false);
                onTogglePin(e);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] text-gray-700 dark:text-gray-200"
            >
              {conversation.isPinned ? 'Détacher' : 'Épingler la discussion'}
            </button>
          )}
          {onToggleMute && (
            <button
              type="button"
              onClick={(e) => {
                setMenuOpen(false);
                onToggleMute(e);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#182229] text-gray-700 dark:text-gray-200"
            >
              {conversation.isMuted ? 'Rétablir les notifications' : 'Mettre en sourdine'}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                setMenuOpen(false);
                onDelete(e);
              }}
              className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
            >
              Supprimer la discussion
            </button>
          )}
        </div>
      )}
    </div>
  );
};
