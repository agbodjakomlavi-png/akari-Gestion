import React, { useState } from 'react';
import { Conversation, Message, User, AppSettings, LocationData, ContactData } from '../../types';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ContactInfoModal } from '../Modals/ContactInfoModal';
import { LocationModal } from '../Modals/LocationModal';
import { ContactShareModal } from '../Modals/ContactShareModal';
import { MediaLightboxModal } from '../Modals/MediaLightboxModal';

interface ChatContainerProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: User;
  allUsers: User[];
  settings: AppSettings;
  onBack: () => void;
  onSendMessage: (text: string, replyToMessage?: Message) => void;
  onSendMedia: (file: File) => void;
  onSendVoiceNote: (durationSeconds: number) => void;
  onSendLocation: (location: LocationData) => void;
  onSendContact: (contact: ContactData) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onStarMessage: (messageId: string) => void;
  onPinMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onClearChat: () => void;
  onDeleteChat: () => void;
  onStartAudioCall: () => void;
  onStartVideoCall: () => void;
  onTyping: (isTyping: boolean) => void;
  onOpenSettings: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  conversation,
  messages,
  currentUser,
  allUsers,
  settings,
  onBack,
  onSendMessage,
  onSendMedia,
  onSendVoiceNote,
  onSendLocation,
  onSendContact,
  onReactToMessage,
  onStarMessage,
  onPinMessage,
  onDeleteMessage,
  onClearChat,
  onDeleteChat,
  onStartAudioCall,
  onStartVideoCall,
  onTyping,
  onOpenSettings,
}) => {
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showContactShareModal, setShowContactShareModal] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  const handleSendText = (text: string) => {
    onSendMessage(text, replyToMessage || undefined);
    setReplyToMessage(null);
  };

  return (
    <div
      id="chat-container-main"
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#efeae2] dark:bg-[#0c1317] relative z-10"
    >
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        currentUser={currentUser}
        allUsers={allUsers}
        onBack={onBack}
        onStartAudioCall={onStartAudioCall}
        onStartVideoCall={onStartVideoCall}
        onToggleSearchInChat={() => setIsSearchOpen(!isSearchOpen)}
        onOpenInfo={() => setShowContactInfo(true)}
        onClearChat={onClearChat}
        onDeleteChat={onDeleteChat}
        onOpenWallpaper={onOpenSettings}
      />

      {/* Messages */}
      <ChatMessages
        messages={messages}
        conversation={conversation}
        currentUser={currentUser}
        wallpaper={settings.wallpaper}
        customWallpaperUrl={settings.customWallpaperUrl}
        theme={settings.theme}
        fontSize={settings.fontSize}
        searchInChatQuery={searchQuery}
        isSearchOpen={isSearchOpen}
        onCloseSearch={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
        }}
        onSearchChange={setSearchQuery}
        onReply={(msg) => setReplyToMessage(msg)}
        onReact={onReactToMessage}
        onStar={onStarMessage}
        onPin={onPinMessage}
        onDelete={onDeleteMessage}
        onOpenMediaLightbox={(url, type) => setLightboxMedia({ url, type })}
      />

      {/* Input */}
      <ChatInput
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        onSendMessage={handleSendText}
        onSendMedia={onSendMedia}
        onSendVoiceNote={onSendVoiceNote}
        onOpenLocationModal={() => setShowLocationModal(true)}
        onOpenContactModal={() => setShowContactShareModal(true)}
        onOpenCameraModal={() => {
          // Trigger file input or location
          setShowLocationModal(false);
        }}
        onTyping={onTyping}
      />

      {/* Contact Info Modal */}
      {showContactInfo && (
        <ContactInfoModal
          conversation={conversation}
          messages={messages}
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setShowContactInfo(false)}
          onStartAudioCall={onStartAudioCall}
          onStartVideoCall={onStartVideoCall}
          onClearChat={onClearChat}
          onDeleteChat={onDeleteChat}
          onOpenMediaLightbox={(url, type) => setLightboxMedia({ url, type })}
        />
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onSendLocation={(loc) => {
            onSendLocation(loc);
            setShowLocationModal(false);
          }}
        />
      )}

      {/* Contact Share Modal */}
      {showContactShareModal && (
        <ContactShareModal
          allUsers={allUsers}
          onClose={() => setShowContactShareModal(false)}
          onSendContact={(c) => {
            onSendContact(c);
            setShowContactShareModal(false);
          }}
        />
      )}

      {/* Media Lightbox */}
      {lightboxMedia && (
        <MediaLightboxModal
          url={lightboxMedia.url}
          type={lightboxMedia.type}
          onClose={() => setLightboxMedia(null)}
        />
      )}
    </div>
  );
};
