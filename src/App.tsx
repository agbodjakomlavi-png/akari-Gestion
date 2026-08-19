import React, { useState, useEffect } from 'react';
import {
  User,
  Conversation,
  Message,
  StatusStory,
  CallRecord,
  AppSettings,
  LocationData,
  ContactData,
} from './types';
import { storageService } from './services/storage';
import { soundManager } from './services/soundEffects';
import { LandingPage } from './components/Landing/LandingPage';
import { LoginPage } from './components/Auth/LoginPage';
import { AdminAccountsModal } from './components/Admin/AdminAccountsModal';
import { SidebarHeader } from './components/Sidebar/SidebarHeader';
import { SidebarSearch, FilterType } from './components/Sidebar/SidebarSearch';
import { ConversationList } from './components/Sidebar/ConversationList';
import { ChatContainer } from './components/Chat/ChatContainer';
import { EmptyChat } from './components/Chat/EmptyChat';
import { StatusViewModal } from './components/Status/StatusViewModal';
import { CreateStatusModal } from './components/Status/CreateStatusModal';
import { NewChatModal } from './components/Modals/NewChatModal';
import { NewGroupModal } from './components/Modals/NewGroupModal';
import { CallsHistoryModal } from './components/Calls/CallsHistoryModal';
import { CallModal } from './components/Calls/CallModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { MessageSquarePlus, Users } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(() => storageService.getUsers());
  const [conversations, setConversations] = useState<Conversation[]>(() => storageService.getConversations());
  const [statuses, setStatuses] = useState<StatusStory[]>(() => storageService.getStatuses());
  const [calls, setCalls] = useState<CallRecord[]>(() => storageService.getCalls());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());

  // Non-authenticated view: landing page or login page
  const [unauthView, setUnauthView] = useState<'landing' | 'login'>('landing');

  // Active view states
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Modal Visibility State
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [statusViewerIndex, setStatusViewerIndex] = useState(0);
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCallsHistory, setShowCallsHistory] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: 'audio' | 'video'; recipient: User } | null>(null);

  // Complete Logout handler that redirects directly to Landing Page
  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setUnauthView('landing');
    setActiveConversationId(null);
    setShowSettings(false);
    setShowAdminModal(false);
    setShowNewChat(false);
    setShowNewGroup(false);
    setShowStatusViewer(false);
    setShowCreateStatus(false);
    setShowCallsHistory(false);
    setActiveCall(null);
  };

  // Sync state with storage service & cross-tab events
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setCurrentUser(storageService.getCurrentUser());
      setAllUsers(storageService.getUsers());
      setConversations(storageService.getConversations());
      setStatuses(storageService.getStatuses());
      setCalls(storageService.getCalls());
      setSettings(storageService.getSettings());
    });
    return unsubscribe;
  }, []);

  // Sync theme class on document element
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme]);

  // If user is not logged in: show Landing Page or Login Page
  if (!currentUser) {
    if (unauthView === 'landing') {
      return (
        <LandingPage
          theme={settings.theme}
          onGoToLogin={() => {
            setUnauthView('login');
          }}
          onToggleTheme={() =>
            storageService.updateSettings({
              theme: settings.theme === 'light' ? 'dark' : 'light',
            })
          }
        />
      );
    }

    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveConversationId(null);
        }}
        onBackToHome={() => setUnauthView('landing')}
      />
    );
  }

  // Messages of the active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const activeMessages = activeConversationId ? storageService.getMessages(activeConversationId) : [];

  // When opening a conversation, automatically mark unread messages as read
  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    storageService.markConversationAsRead(convId, currentUser.id);
  };

  // Send a text message
  const handleSendMessage = (text: string, replyToMsg?: Message) => {
    if (!activeConversation) return;

    storageService.sendMessage(
      activeConversation.id,
      currentUser.id,
      currentUser.name,
      'text',
      text,
      replyToMsg ? { replyToMessageId: replyToMsg.id } : undefined,
      replyToMsg
        ? {
            senderName: replyToMsg.senderName,
            text: replyToMsg.text,
            type: replyToMsg.type,
          }
        : undefined
    );

    if (settings.soundEnabled) {
      soundManager.playSendSound();
    }
  };

  // Send an attachment media
  const handleSendMedia = (file: File) => {
    if (!activeConversation) return;

    const fileType = file.type;
    let msgType: 'image' | 'video' | 'document' = 'document';

    if (fileType.startsWith('image/')) msgType = 'image';
    else if (fileType.startsWith('video/')) msgType = 'video';

    const reader = new FileReader();
    reader.onload = (e) => {
      const mediaUrl = e.target?.result as string;
      storageService.sendMessage(
        activeConversation.id,
        currentUser.id,
        currentUser.name,
        msgType,
        msgType === 'document' ? file.name : '',
        {
          mediaUrl,
          mediaName: file.name,
          mediaSize: file.size,
        }
      );
    };
    reader.readAsDataURL(file);
  };

  // Send a voice note recording
  const handleSendVoiceNote = (durationSeconds: number) => {
    if (!activeConversation) return;

    storageService.sendMessage(
      activeConversation.id,
      currentUser.id,
      currentUser.name,
      'audio',
      'Message vocal',
      {
        mediaDuration: durationSeconds,
      }
    );
  };

  // Send a GPS location
  const handleSendLocation = (location: LocationData) => {
    if (!activeConversation) return;

    storageService.sendMessage(
      activeConversation.id,
      currentUser.id,
      currentUser.name,
      'location',
      'Position géographique partagée',
      {
        location,
      }
    );
  };

  // Send a contact card
  const handleSendContact = (contact: ContactData) => {
    if (!activeConversation) return;

    storageService.sendMessage(
      activeConversation.id,
      currentUser.id,
      currentUser.name,
      'contact',
      `Fiche contact : ${contact.name}`,
      {
        contact,
      }
    );
  };

  // Post a status / story
  const handlePostStatus = (
    type: 'text' | 'image' | 'video',
    content: string,
    caption?: string,
    bgColor?: string,
    fontStyle?: 'sans' | 'serif' | 'mono' | 'handwriting'
  ) => {
    storageService.createStatus(currentUser, type, content, caption, bgColor, fontStyle);
    setShowCreateStatus(false);
  };

  // Start a call
  const handleStartCall = (recipientId?: string, type: 'audio' | 'video' = 'audio') => {
    let recipient: User | undefined;

    if (recipientId) {
      recipient = allUsers.find((u) => u.id === recipientId);
    } else if (activeConversation && activeConversation.type === 'direct') {
      const otherId = activeConversation.participants.find((p) => p !== currentUser.id);
      recipient = allUsers.find((u) => u.id === otherId);
    }

    if (!recipient && allUsers.length > 1) {
      recipient = allUsers.find((u) => u.id !== currentUser.id);
    }

    if (recipient) {
      setActiveCall({ type, recipient });
    }
  };

  // End a call
  const handleEndCall = (durationSeconds: number) => {
    if (activeCall) {
      storageService.addCallRecord({
        callerId: currentUser.id,
        callerName: currentUser.name,
        callerAvatar: currentUser.avatar,
        receiverId: activeCall.recipient.id,
        receiverName: activeCall.recipient.name,
        receiverAvatar: activeCall.recipient.avatar,
        conversationId: activeConversationId || undefined,
        type: activeCall.type,
        status: durationSeconds > 0 ? 'completed' : 'missed',
        durationSeconds,
      });
    }
    setActiveCall(null);
  };

  // Start new conversation from contact selection
  const handleSelectUserForChat = (selectedUser: User) => {
    const conv = storageService.getOrCreateDirectConversation(currentUser.id, selectedUser.id);
    setActiveConversationId(conv.id);
    setShowNewChat(false);
  };

  // Create new group
  const handleCreateGroup = (
    name: string,
    description: string,
    participantIds: string[],
    avatar?: string
  ) => {
    const newConv = storageService.createGroupConversation(
      name,
      participantIds,
      avatar,
      description
    );
    setActiveConversationId(newConv.id);
    setShowNewGroup(false);
  };

  // Filtered conversations based on search and chip filter
  const filteredConversations = conversations.filter((conv) => {
    if (conv.isArchived) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (conv.type === 'group') {
        if (!conv.name?.toLowerCase().includes(q)) return false;
      } else {
        const otherId = conv.participants.find((p) => p !== currentUser.id);
        const otherUser = allUsers.find((u) => u.id === otherId);
        if (
          !otherUser?.name.toLowerCase().includes(q) &&
          !otherUser?.akariId?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
    }

    // Filter pill condition
    if (activeFilter === 'unread') {
      return (conv.unreadCounts[currentUser.id] || 0) > 0;
    }
    if (activeFilter === 'groups') {
      return conv.type === 'group';
    }
    if (activeFilter === 'direct') {
      return conv.type === 'direct';
    }

    return true;
  });

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-[13px]';
      case 'large':
        return 'text-[16px]';
      case 'medium':
      default:
        return 'text-[14px]';
    }
  };

  return (
    <div
      id="akari-app-root"
      className={`h-[100dvh] w-full flex overflow-hidden bg-[#efeae2] dark:bg-[#0c1317] select-none ${getFontSizeClass()}`}
    >
      <div className="w-full h-full flex flex-row overflow-hidden relative">
        {/* Left Sidebar Pane */}
        <div
          id="sidebar-pane"
          className={`w-full md:w-[380px] lg:w-[420px] xl:w-[460px] h-full min-h-0 shrink-0 flex flex-col bg-[#ffffff] dark:bg-[#111b21] border-r border-gray-200 dark:border-gray-700/50 relative z-20 overflow-hidden ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <SidebarHeader
            currentUser={currentUser}
            settings={settings}
            onOpenStatusModal={() => {
              if (statuses.length > 0) {
                setStatusViewerIndex(0);
                setShowStatusViewer(true);
              } else {
                setShowCreateStatus(true);
              }
            }}
            onOpenNewGroupModal={() => setShowNewGroup(true)}
            onOpenCallsModal={() => setShowCallsHistory(true)}
            onOpenSettingsModal={() => setShowSettings(true)}
            onOpenAdminModal={
              currentUser.role === 'admin' ? () => setShowAdminModal(true) : undefined
            }
            onToggleTheme={() =>
              storageService.updateSettings({
                theme: settings.theme === 'light' ? 'dark' : 'light',
              })
            }
            onLogout={handleLogout}
          />

          {/* Search & Filter Pills */}
          <SidebarSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Conversations List */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <ConversationList
              conversations={filteredConversations}
              activeConversationId={activeConversationId}
              currentUser={currentUser}
              allUsers={allUsers}
              statuses={statuses}
              onSelectConversation={handleSelectConversation}
              onOpenStory={(userId) => {
                const idx = statuses.findIndex((s) => s.userId === userId);
                if (idx !== -1) {
                  setStatusViewerIndex(idx);
                  setShowStatusViewer(true);
                }
              }}
              onTogglePin={(convId) => storageService.togglePinConversation(convId)}
              onToggleMute={(convId) => storageService.toggleMuteConversation(convId)}
              onToggleArchive={(convId) => storageService.toggleArchiveConversation(convId)}
              onDeleteConversation={(convId) => {
                storageService.deleteConversation(convId);
                if (activeConversationId === convId) setActiveConversationId(null);
              }}
            />

            {/* Bottom Floating Action Buttons (Nouvelle discussion en bas) */}
            <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2">
              {/* Quick group creation button */}
              <button
                id="sidebar-bottom-new-group-fab"
                type="button"
                onClick={() => setShowNewGroup(true)}
                className="w-10 h-10 rounded-full bg-white dark:bg-[#202c33] text-[#00a884] shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Créer un groupe de travail"
              >
                <Users className="w-4 h-4" />
              </button>

              {/* Main New Chat Floating Action Button (FAB) */}
              <button
                id="sidebar-bottom-new-chat-fab"
                type="button"
                onClick={() => setShowNewChat(true)}
                className="w-13 h-13 rounded-full bg-[#00a884] hover:bg-[#029070] text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                title="Nouvelle discussion (Annuaire des collaborateurs)"
              >
                <MessageSquarePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Chat Pane */}
        <div
          id="main-chat-pane"
          className={`flex-1 h-full min-h-0 min-w-0 flex flex-col relative overflow-hidden bg-[#efeae2] dark:bg-[#0c1317] ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <ChatContainer
              conversation={activeConversation}
              messages={activeMessages}
              currentUser={currentUser}
              allUsers={allUsers}
              settings={settings}
              onBack={() => setActiveConversationId(null)}
              onSendMessage={handleSendMessage}
              onSendMedia={handleSendMedia}
              onSendVoiceNote={handleSendVoiceNote}
              onSendLocation={handleSendLocation}
              onSendContact={handleSendContact}
              onReactToMessage={(msgId, emoji) =>
                storageService.reactToMessage(activeConversation.id, msgId, emoji, currentUser.id)
              }
              onStarMessage={(msgId) => storageService.toggleStarMessage(activeConversation.id, msgId)}
              onPinMessage={(msgId) => storageService.togglePinMessage(activeConversation.id, msgId)}
              onDeleteMessage={(msgId) => storageService.deleteMessage(activeConversation.id, msgId)}
              onClearChat={() => storageService.clearMessages(activeConversation.id)}
              onDeleteChat={() => {
                storageService.deleteConversation(activeConversation.id);
                setActiveConversationId(null);
              }}
              onStartAudioCall={() => handleStartCall(undefined, 'audio')}
              onStartVideoCall={() => handleStartCall(undefined, 'video')}
              onTyping={(isTyping) =>
                storageService.setUserTyping(currentUser.id, isTyping ? activeConversation.id : null)
              }
              onOpenSettings={() => setShowSettings(true)}
            />
          ) : (
            <EmptyChat
              isAdmin={currentUser.role === 'admin'}
              onOpenNewChat={() => setShowNewChat(true)}
              onOpenStatus={() => {
                if (statuses.length > 0) {
                  setStatusViewerIndex(0);
                  setShowStatusViewer(true);
                } else {
                  setShowCreateStatus(true);
                }
              }}
              onOpenCalls={() => setShowCallsHistory(true)}
              onOpenAdmin={() => setShowAdminModal(true)}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
        </div>
      </div>

      {/* MODALS */}

      {/* Admin Accounts Management Modal */}
      {showAdminModal && currentUser.role === 'admin' && (
        <AdminAccountsModal
          currentUser={currentUser}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {/* Status Viewer Story Modal */}
      {showStatusViewer && statuses.length > 0 && (
        <StatusViewModal
          statuses={statuses}
          initialIndex={statusViewerIndex}
          currentUser={currentUser}
          onClose={() => setShowStatusViewer(false)}
          onDeleteStatus={(statusId) => storageService.deleteStatus(statusId)}
          onReplyToStatus={(userId, replyText) => {
            const conv = storageService.getOrCreateDirectConversation(currentUser.id, userId);
            setActiveConversationId(conv.id);
            storageService.sendMessage(conv.id, currentUser.id, currentUser.name, 'text', replyText);
          }}
          onMarkSeen={(statusId) => storageService.markStatusSeen(statusId)}
        />
      )}

      {/* Create Status Modal */}
      {showCreateStatus && (
        <CreateStatusModal
          currentUser={currentUser}
          onClose={() => setShowCreateStatus(false)}
          onPostStatus={handlePostStatus}
        />
      )}

      {/* New Chat & Directory Modal */}
      {showNewChat && (
        <NewChatModal
          allUsers={allUsers}
          currentUser={currentUser}
          onClose={() => setShowNewChat(false)}
          onSelectUser={handleSelectUserForChat}
          onOpenNewGroup={() => setShowNewGroup(true)}
          onAddNewContact={(newUser) => {
            storageService.saveUser(newUser);
          }}
          onDeleteUser={(u) => {
            storageService.deleteAkariAccount(u.id);
          }}
        />
      )}

      {/* New Group Modal */}
      {showNewGroup && (
        <NewGroupModal
          allUsers={allUsers}
          currentUser={currentUser}
          onClose={() => setShowNewGroup(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {/* Active Audio/Video Call Modal */}
      {activeCall && (
        <CallModal
          type={activeCall.type}
          recipient={activeCall.recipient}
          onEndCall={handleEndCall}
        />
      )}

      {/* Calls History Modal */}
      {showCallsHistory && (
        <CallsHistoryModal
          calls={calls}
          currentUser={currentUser}
          onClose={() => setShowCallsHistory(false)}
          onStartCall={(recipientId, type) => {
            handleStartCall(recipientId, type);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          currentUser={currentUser}
          settings={settings}
          onClose={() => setShowSettings(false)}
          onUpdateUser={(updates) => storageService.updateCurrentUser(updates)}
          onUpdateSettings={(updates) => storageService.updateSettings(updates)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
