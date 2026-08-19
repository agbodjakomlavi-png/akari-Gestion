import React, { useState } from 'react';
import {
  Star,
  Pin,
  Reply,
  Trash2,
  Smile,
  FileText,
  Download,
  MapPin,
  ExternalLink,
  Phone,
  ChevronDown,
  CornerDownRight
} from 'lucide-react';
import { Message, MessageType, User, AppTheme, FontSizeOption } from '../../types';
import { TickIcon } from '../Common/TickIcon';
import { AudioWavePlayer } from '../Common/AudioWavePlayer';
import { formatMessageTime, formatFileSize } from '../../utils/date';

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
  isGroup: boolean;
  currentUser: User;
  theme?: AppTheme;
  fontSize?: FontSizeOption;
  searchHighlight?: string;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onStar: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onOpenMediaLightbox: (url: string, type: 'image' | 'video') => void;
}

const EMOJI_QUICK_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSender,
  isGroup,
  currentUser,
  theme = 'dark',
  fontSize = 'medium',
  searchHighlight = '',
  onReply,
  onReact,
  onStar,
  onPin,
  onDelete,
  onOpenMediaLightbox,
}) => {
  const [showReactionsPicker, setShowReactionsPicker] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const isDeleted = message.isDeleted;

  const highlightText = (text: string) => {
    if (!searchHighlight.trim() || isDeleted) return text;
    const parts = text.split(new RegExp(`(${searchHighlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchHighlight.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-500/60 text-black px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const renderMediaContent = () => {
    if (isDeleted) return null;

    if (message.type === 'image' && message.mediaUrl) {
      return (
        <div className="mb-1 rounded-lg overflow-hidden cursor-pointer group relative">
          <img
            src={message.mediaUrl}
            alt={message.mediaName || 'Image'}
            referrerPolicy="no-referrer"
            onClick={() => onOpenMediaLightbox(message.mediaUrl!, 'image')}
            className="max-w-full max-h-[320px] object-cover rounded-md group-hover:opacity-95 transition-opacity"
          />
        </div>
      );
    }

    if (message.type === 'video' && message.mediaUrl) {
      return (
        <div className="mb-1 rounded-lg overflow-hidden cursor-pointer">
          <video
            src={message.mediaUrl}
            controls
            className="max-w-full max-h-[320px] rounded-md"
          />
        </div>
      );
    }

    if (message.type === 'audio') {
      return (
        <div className="py-1">
          <AudioWavePlayer
            duration={message.mediaDuration || 15}
            isSender={isSender}
            senderAvatar={message.senderAvatar}
          />
        </div>
      );
    }

    if (message.type === 'document') {
      return (
        <div className="flex items-center gap-3 p-2 bg-black/10 dark:bg-black/20 rounded-lg mb-1">
          <div className="w-10 h-10 rounded bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">
              {message.mediaName || 'Document.pdf'}
            </p>
            <p className="text-[11px] opacity-70">
              {formatFileSize(message.mediaSize || 1024 * 120)} • PDF
            </p>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            title="Télécharger"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (message.type === 'location' && message.location) {
      return (
        <div className="mb-1 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
          <div className="h-32 bg-emerald-900/40 relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <div className="p-2 bg-black/10 dark:bg-black/20">
            <p className="text-xs font-semibold truncate">
              {message.location.name || 'Position partagée'}
            </p>
            <p className="text-[11px] opacity-75 truncate">
              {message.location.address || `${message.location.latitude.toFixed(4)}, ${message.location.longitude.toFixed(4)}`}
            </p>
          </div>
        </div>
      );
    }

    if (message.type === 'contact' && message.contact) {
      return (
        <div className="p-2.5 bg-black/10 dark:bg-black/20 rounded-lg mb-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-sm">
            {message.contact.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{message.contact.name}</p>
            <p className="text-[11px] opacity-75">{message.contact.phone}</p>
          </div>
          <a
            href={`tel:${message.contact.phone}`}
            className="p-2 rounded-full bg-[#00a884] text-white hover:bg-[#029070]"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>
      );
    }

    return null;
  };

  // Compute theme bubble styles
  const getBubbleColorClasses = () => {
    if (isDeleted) {
      return 'bg-gray-100 dark:bg-[#182229] text-gray-400 italic';
    }

    if (isSender) {
      switch (theme) {
        case 'light':
          return 'bg-[#d9fdd3] text-[#111b21] shadow-xs';
        case 'emerald':
          return 'bg-[#054c3b] text-[#e9edef] shadow-md';
        case 'midnight':
          return 'bg-[#004d40] text-white shadow-md border border-emerald-900/30';
        case 'sunset':
          return 'bg-[#c8653b] text-white shadow-md';
        case 'dark':
        default:
          return 'bg-[#005c4b] text-[#e9edef] shadow-xs';
      }
    } else {
      switch (theme) {
        case 'light':
          return 'bg-[#ffffff] text-[#111b21] shadow-xs border border-gray-100';
        case 'emerald':
          return 'bg-[#14382d] text-[#e9edef] shadow-md border border-emerald-900/40';
        case 'midnight':
          return 'bg-[#1a1a1a] text-white shadow-md border border-gray-800';
        case 'sunset':
          return 'bg-[#2d1f1f] text-white shadow-md border border-red-950/40';
        case 'dark':
        default:
          return 'bg-[#202c33] text-[#e9edef] shadow-xs';
      }
    }
  };

  // Compute font size classes
  const getTextSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-[12.5px] leading-relaxed';
      case 'large':
        return 'text-[15.5px] leading-relaxed';
      case 'medium':
      default:
        return 'text-[13.5px] leading-relaxed';
    }
  };

  return (
    <div
      id={`msg-bubble-${message.id}`}
      className={`group relative flex flex-col mb-2 select-text ${
        isSender ? 'items-end' : 'items-start'
      }`}
    >
      {/* Sender name for group chats if incoming */}
      {!isSender && isGroup && (
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 ml-2 mb-0.5">
          {message.senderName}
        </span>
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[88%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl px-3.5 py-2 shadow-xs transition-colors duration-150 ${
          isSender ? 'rounded-tr-xs' : 'rounded-tl-xs'
        } ${getBubbleColorClasses()}`}
      >
        {/* Reply Quote Banner */}
        {message.replyToSnapshot && !isDeleted && (
          <div
            className={`mb-1.5 p-2 rounded-lg border-l-4 text-xs ${
              isSender
                ? 'bg-black/10 dark:bg-black/30 border-emerald-400'
                : 'bg-black/10 dark:bg-black/30 border-[#00a884]'
            }`}
          >
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block text-[11px]">
              {message.replyToSnapshot.senderName}
            </span>
            <span className="opacity-80 line-clamp-1 text-[11px]">
              {message.replyToSnapshot.text}
            </span>
          </div>
        )}

        {/* Media Content */}
        {renderMediaContent()}

        {/* Text Content */}
        {message.text && !isDeleted && (
          <p className={`whitespace-pre-wrap break-words pr-2 ${getTextSizeClass()}`}>
            {highlightText(message.text)}
          </p>
        )}

        {/* Timestamp & Tick status footer */}
        <div className="flex items-center justify-end gap-1 mt-1 select-none text-[10.5px] opacity-75 float-right ml-3 -mb-0.5">
          {message.isPinned && <Pin className="w-2.5 h-2.5 rotate-45" />}
          {message.isStarred && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />}
          <span>{formatMessageTime(message.createdAt)}</span>
          {isSender && <TickIcon status={message.status} />}
        </div>

        {/* Hover Action Trigger Button */}
        {!isDeleted && (
          <button
            type="button"
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            className="absolute top-1 right-1 p-0.5 rounded bg-black/10 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity text-current hover:opacity-100"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Actions Dropdown */}
        {showActionsDropdown && (
          <div
            className="absolute right-0 top-7 w-36 bg-white dark:bg-[#233138] rounded-xl shadow-xl py-1 z-40 border border-gray-100 dark:border-gray-700/50 text-xs animate-in fade-in"
            onMouseLeave={() => setShowActionsDropdown(false)}
          >
            <button
              type="button"
              onClick={() => {
                setShowActionsDropdown(false);
                onReply(message);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2 text-gray-700 dark:text-gray-200"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Répondre</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowActionsDropdown(false);
                setShowReactionsPicker(true);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2 text-gray-700 dark:text-gray-200"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>Réagir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowActionsDropdown(false);
                onStar(message.id);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2 text-gray-700 dark:text-gray-200"
            >
              <Star className="w-3.5 h-3.5" />
              <span>{message.isStarred ? 'Retirer étoile' : 'Ajouter étoile'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowActionsDropdown(false);
                onPin(message.id);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2 text-gray-700 dark:text-gray-200"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{message.isPinned ? 'Détacher' : 'Épingler'}</span>
            </button>

            {isSender && (
              <button
                type="button"
                onClick={() => {
                  setShowActionsDropdown(false);
                  onDelete(message.id);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-red-600 dark:text-red-400 border-t border-gray-100 dark:border-gray-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Reaction floating toolbar */}
      {showReactionsPicker && (
        <div className="mt-1 flex items-center gap-1 bg-white dark:bg-[#202c33] p-1.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 z-30 animate-in zoom-in-95">
          {EMOJI_QUICK_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(message.id, emoji);
                setShowReactionsPicker(false);
              }}
              className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-sm transition-transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Reactions display chips */}
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div className="flex items-center gap-1 mt-0.5 px-1 flex-wrap">
          {Object.entries(message.reactions).map(([emoji, userIds]) => {
            const users = (userIds as string[]) || [];
            const hasReacted = users.includes(currentUser.id);
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message.id, emoji)}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] shadow-xs border transition-all ${
                  hasReacted
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'bg-white dark:bg-[#202c33] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{emoji}</span>
                {users.length > 1 && <span>{users.length}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
