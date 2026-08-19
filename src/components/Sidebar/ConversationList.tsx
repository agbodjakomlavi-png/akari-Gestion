import React from 'react';
import { Conversation, User, StatusStory } from '../../types';
import { ConversationItem } from './ConversationItem';
import { FilterType } from './SidebarSearch';
import { MessageSquareOff } from 'lucide-react';

export interface ConversationListProps {
  conversations: Conversation[];
  currentUser: User;
  allUsers: User[];
  statuses?: StatusStory[];
  activeConversationId: string | null;
  searchQuery?: string;
  activeFilter?: FilterType;
  onSelectConversation: (id: string) => void;
  onOpenStory?: (userId: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleMute?: (id: string) => void;
  onToggleArchive?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations = [],
  currentUser,
  allUsers = [],
  statuses = [],
  activeConversationId,
  searchQuery = '',
  activeFilter = 'all',
  onSelectConversation,
  onOpenStory,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  onDeleteConversation,
}) => {
  const safeStatuses = statuses || [];
  const safeUsers = allUsers || [];

  // Filter logic (if not already filtered)
  const filteredConversations = (conversations || []).filter((conv) => {
    if (!conv) return false;
    if (conv.isArchived) return false;

    // Search query match
    let matchesSearch = true;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      let title = conv.name || '';
      if (conv.type === 'direct') {
        const otherId = (conv.participants || []).find((p) => p !== currentUser?.id);
        const otherUser = safeUsers.find((u) => u.id === otherId);
        title = otherUser?.name || '';
      }
      const lastMsgText = conv.lastMessage?.text || '';
      matchesSearch = title.toLowerCase().includes(q) || lastMsgText.toLowerCase().includes(q);
    }

    if (!matchesSearch) return false;

    // Filter chip logic
    if (activeFilter === 'unread') {
      const unread = conv.unreadCounts?.[currentUser?.id] ?? conv.unreadCount ?? 0;
      return unread > 0;
    }
    if (activeFilter === 'favorites') {
      return conv.isPinned === true;
    }
    if (activeFilter === 'groups') {
      return conv.type === 'group';
    }

    return true;
  });

  if (filteredConversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 dark:text-gray-500">
        <MessageSquareOff className="w-12 h-12 mb-3 stroke-[1.5]" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Aucune discussion trouvée
        </p>
        <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
          {searchQuery ? 'Essayez un autre mot-clé' : 'Démarrez une nouvelle conversation'}
        </p>
      </div>
    );
  }

  return (
    <div id="conversation-list" className="flex-1 overflow-y-auto divide-y divide-transparent">
      {filteredConversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          currentUser={currentUser}
          allUsers={safeUsers}
          statuses={safeStatuses}
          isActive={conv.id === activeConversationId}
          onSelect={() => onSelectConversation(conv.id)}
          onOpenStory={onOpenStory}
          onTogglePin={(e) => {
            e.stopPropagation();
            if (onTogglePin) onTogglePin(conv.id);
          }}
          onToggleMute={(e) => {
            e.stopPropagation();
            if (onToggleMute) onToggleMute(conv.id);
          }}
          onToggleArchive={(e) => {
            e.stopPropagation();
            if (onToggleArchive) onToggleArchive(conv.id);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            if (onDeleteConversation) onDeleteConversation(conv.id);
          }}
        />
      ))}

      {/* End of list encrypted notice */}
      <div className="py-6 px-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <span>🔒 Vos messages personnels sont chiffrés de bout en bout</span>
        </div>
      </div>
    </div>
  );
};
