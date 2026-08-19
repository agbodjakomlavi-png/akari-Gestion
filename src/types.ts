export type UserRole = 'admin' | 'secretaire' | 'commercial' | 'collaborateur';

export interface User {
  id: string;
  akariId: string; // e.g. "admin@admin.akari", "sophie.secretaire.akari", "thomas.commercial.akari"
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  bio: string;
  role: UserRole;
  password?: string;
  isOnline: boolean;
  lastSeen: number; // Unix timestamp ms
  isTypingIn?: string; // conversationId where typing
  createdAt: number;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface ContactData {
  name: string;
  phone: string;
  email?: string;
  akariId?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: number;
  
  // Media fields
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number; // in bytes
  mediaDuration?: number; // in seconds for audio/video
  
  // Rich payload fields
  location?: LocationData;
  contact?: ContactData;
  
  // Reply & context
  replyToMessageId?: string;
  replyToSnapshot?: {
    senderName: string;
    text: string;
    type: MessageType;
  };
  
  // Reactions & status
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isStarred?: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  isForwarded?: boolean;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For groups or custom nickname
  avatar?: string; // For groups
  description?: string;
  participants: string[]; // User IDs
  adminIds?: string[]; // User IDs of group admins
  lastMessage?: Message;
  unreadCounts: Record<string, number>; // userId -> count
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface StatusStory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'text' | 'image' | 'video';
  content: string; // URL for image/video or text string
  caption?: string;
  bgColor?: string; // For text statuses
  fontStyle?: 'sans' | 'serif' | 'mono' | 'handwriting';
  createdAt: number;
  expiresAt: number;
  viewers: {
    userId: string;
    userName: string;
    userAvatar?: string;
    seenAt: number;
  }[];
}

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId?: string;
  receiverName?: string;
  receiverAvatar?: string;
  conversationId?: string;
  isGroup?: boolean;
  participants: string[];
  type: 'audio' | 'video';
  status: 'missed' | 'completed' | 'declined' | 'ongoing';
  startedAt: number;
  endedAt?: number;
  durationSeconds: number;
}

export type AppTheme = 'dark' | 'light' | 'emerald' | 'midnight' | 'sunset';
export type FontSizeOption = 'small' | 'medium' | 'large';

export interface AppSettings {
  theme: AppTheme;
  wallpaper: 'default' | 'doodle' | 'dark' | 'subtle-emerald' | 'sunset' | 'custom';
  customWallpaperUrl?: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  readReceipts: boolean;
  enterIsSend: boolean;
  lastSeenPrivacy: 'everyone' | 'contacts' | 'nobody';
  fontSize: FontSizeOption;
}
