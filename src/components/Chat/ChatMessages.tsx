import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Lock, Search, X } from 'lucide-react';
import { Message, Conversation, User, AppTheme, FontSizeOption } from '../../types';
import { MessageBubble } from './MessageBubble';
import { formatMessageDateDivider } from '../../utils/date';

interface ChatMessagesProps {
  messages: Message[];
  conversation: Conversation;
  currentUser: User;
  wallpaper: string;
  customWallpaperUrl?: string;
  theme?: AppTheme;
  fontSize?: FontSizeOption;
  searchInChatQuery: string;
  isSearchOpen: boolean;
  onCloseSearch: () => void;
  onSearchChange: (query: string) => void;
  onReply: (message: Message) => void;
  onReact: (messageId: string, emoji: string) => void;
  onStar: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onOpenMediaLightbox: (url: string, type: 'image' | 'video') => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  conversation,
  currentUser,
  wallpaper,
  customWallpaperUrl,
  theme = 'dark',
  fontSize = 'medium',
  searchInChatQuery,
  isSearchOpen,
  onCloseSearch,
  onSearchChange,
  onReply,
  onReact,
  onStar,
  onPin,
  onDelete,
  onOpenMediaLightbox,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length, conversation.id]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 200;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Group messages by date
  const groupedMessages: { dateDivider: string; msgs: Message[] }[] = [];
  let currentDateDivider = '';
  let currentGroup: Message[] = [];

  messages.forEach((msg) => {
    const divider = formatMessageDateDivider(msg.createdAt);
    if (divider !== currentDateDivider) {
      if (currentGroup.length > 0) {
        groupedMessages.push({ dateDivider: currentDateDivider, msgs: currentGroup });
      }
      currentDateDivider = divider;
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  });
  if (currentGroup.length > 0) {
    groupedMessages.push({ dateDivider: currentDateDivider, msgs: currentGroup });
  }

  // Determine wallpaper style
  const getWallpaperBackground = () => {
    if (wallpaper === 'custom' && customWallpaperUrl) {
      return '';
    }
    if (wallpaper === 'subtle-emerald' || theme === 'emerald') {
      return 'bg-[#081d17]';
    }
    if (wallpaper === 'sunset' || theme === 'sunset') {
      return 'bg-gradient-to-b from-amber-50 to-orange-100 dark:from-[#1f1414] dark:to-[#170e0e]';
    }
    if (wallpaper === 'dark' || theme === 'midnight') {
      return 'bg-[#0c1317] dark:bg-[#000000]';
    }
    if (theme === 'light') {
      return 'bg-[#efeae2]';
    }
    return 'bg-[#efeae2] dark:bg-[#0b141a]';
  };

  return (
    <div
      id="chat-messages-container"
      ref={containerRef}
      onScroll={handleScroll}
      className={`flex-1 overflow-y-auto px-4 py-4 relative transition-colors ${getWallpaperBackground()}`}
      style={
        wallpaper === 'custom' && customWallpaperUrl
          ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${customWallpaperUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {/* In-chat search bar overlay if opened */}
      {isSearchOpen && (
        <div className="sticky top-0 z-30 mb-3 bg-white dark:bg-[#202c33] p-2.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchInChatQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher dans cette discussion..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            autoFocus
          />
          {searchInChatQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Effacer
            </button>
          )}
          <button
            type="button"
            onClick={onCloseSearch}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* End-to-end encryption security banner */}
      <div className="flex justify-center mb-4 select-none">
        <div className="bg-[#ffeecd] dark:bg-[#182229] border border-[#f5c6cb] dark:border-gray-800 text-[#54656f] dark:text-[#8696a0] px-4 py-2 rounded-xl text-[11px] text-center max-w-md shadow-xs flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
          <span>
            Les messages et appels sont chiffrés de bout en bout sur le réseau Akari. Personne d'autre ne peut les lire ou les écouter.
          </span>
        </div>
      </div>

      {/* Message Stream */}
      {groupedMessages.map((group, gIdx) => (
        <div key={gIdx} className="space-y-1">
          {/* Date Divider Pill */}
          <div className="flex justify-center my-3 select-none sticky top-2 z-10">
            <span className="bg-white/80 dark:bg-[#182229]/80 backdrop-blur-xs text-gray-600 dark:text-gray-400 text-[11px] font-semibold px-3 py-1 rounded-lg shadow-xs border border-gray-100 dark:border-gray-800 uppercase tracking-wider">
              {group.dateDivider}
            </span>
          </div>

          {/* Message Bubbles in Group */}
          {group.msgs.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSender={msg.senderId === currentUser.id}
              isGroup={conversation.type === 'group'}
              currentUser={currentUser}
              theme={theme}
              fontSize={fontSize}
              searchHighlight={searchInChatQuery}
              onReply={onReply}
              onReact={onReact}
              onStar={onStar}
              onPin={onPin}
              onDelete={onDelete}
              onOpenMediaLightbox={onOpenMediaLightbox}
            />
          ))}
        </div>
      ))}

      {/* Scroll to bottom floating button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 md:right-10 z-30 w-10 h-10 rounded-full bg-white dark:bg-[#202c33] text-gray-600 dark:text-gray-200 shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#2a3942] transition-transform hover:scale-110"
          title="Faire défiler vers le bas"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
