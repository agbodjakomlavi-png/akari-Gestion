import {
  User,
  UserRole,
  Conversation,
  Message,
  StatusStory,
  CallRecord,
  AppSettings,
  MessageType,
  LocationData,
  ContactData,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_STATUSES,
  INITIAL_CALLS
} from './mockData';
import { sounds } from './soundEffects';

type StorageListener = () => void;

class AppStorageService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};
  private statuses: StatusStory[] = [];
  private calls: CallRecord[] = [];
  private settings: AppSettings = {
    theme: 'dark',
    wallpaper: 'default',
    customWallpaperUrl: '',
    soundEnabled: true,
    notificationsEnabled: true,
    readReceipts: true,
    enterIsSend: true,
    lastSeenPrivacy: 'everyone',
    fontSize: 'medium'
  };

  private listeners: Set<StorageListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private autoReplyTimeouts: Map<string, number> = new Map();
  private ws: WebSocket | null = null;
  private wsUrl: string = '';
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isIntentionallyClosed = false;

  constructor() {
    this.init();
    this.initWebSocket();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem('akari_users');
      const storedCurrentUser = localStorage.getItem('akari_current_user');
      const storedConvs = localStorage.getItem('akari_conversations');
      const storedMessages = localStorage.getItem('akari_messages');
      const storedStatuses = localStorage.getItem('akari_statuses');
      const storedCalls = localStorage.getItem('akari_calls');
      const storedSettings = localStorage.getItem('akari_settings');

      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        const dummyIds = new Set(['user_sophie', 'user_sarah', 'user_thomas', 'user_alex', 'user_emma']);
        const cleaned = parsed.filter((u: User) => !dummyIds.has(u.id));
        this.users = cleaned.length > 0 ? cleaned : INITIAL_USERS;
        if (!this.users.some((u) => u.akariId === 'admin@admin.akari')) {
          this.users.unshift(INITIAL_USERS[0]);
        }
      } else {
        this.users = INITIAL_USERS;
      }

      if (storedCurrentUser) {
        const parsedUser = JSON.parse(storedCurrentUser);
        if (['user_sophie', 'user_sarah', 'user_thomas', 'user_alex', 'user_emma'].includes(parsedUser.id)) {
          this.currentUser = null;
        } else {
          this.currentUser = parsedUser;
        }
      } else {
        this.currentUser = null;
      }

      const dummyConvIds = new Set(['conv_general_akari', 'conv_sophie_admin', 'conv_commercial_team', 'conv_thomas_admin']);
      if (storedConvs) {
        const parsedConvs = JSON.parse(storedConvs);
        this.conversations = parsedConvs.filter((c: Conversation) => !dummyConvIds.has(c.id));
      } else {
        this.conversations = INITIAL_CONVERSATIONS;
      }

      if (storedMessages) {
        const parsedMsgs = JSON.parse(storedMessages);
        const cleanedMsgs: Record<string, Message[]> = {};
        for (const [k, v] of Object.entries(parsedMsgs)) {
          if (!dummyConvIds.has(k)) {
            cleanedMsgs[k] = v as Message[];
          }
        }
        this.messages = cleanedMsgs;
      } else {
        this.messages = INITIAL_MESSAGES;
      }

      this.statuses = storedStatuses ? JSON.parse(storedStatuses).filter((s: StatusStory) => !['user_sophie', 'user_sarah', 'user_thomas'].includes(s.userId)) : INITIAL_STATUSES;
      this.calls = storedCalls ? JSON.parse(storedCalls).filter((c: CallRecord) => !['user_sophie', 'user_sarah', 'user_thomas'].includes(c.callerId)) : INITIAL_CALLS;

      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      }
    } catch {
      this.users = INITIAL_USERS;
      this.currentUser = INITIAL_USERS[0];
      this.conversations = INITIAL_CONVERSATIONS;
      this.messages = INITIAL_MESSAGES;
      this.statuses = INITIAL_STATUSES;
      this.calls = INITIAL_CALLS;
    }

    this.recomputeLastMessages();

    // BroadcastChannel for multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('akari_team_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_ALL') {
            this.loadFromLocalStorageWithoutBroadcast();
          }
        };
      } catch {
        console.log('BroadcastChannel not available');
      }
    }
  }

  private initWebSocket() {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.wsUrl = `${protocol}//${window.location.host}`;
      this.connect();
    } catch (error) {
      console.warn('WebSocket init error:', error);
    }
  }

  private connect() {
    if (typeof window === 'undefined' || !this.currentUser) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      const params = new URLSearchParams({
        userId: this.currentUser.id,
      });
      
      console.log(`🔌 Connecting to ${this.wsUrl}`);
      this.ws = new WebSocket(`${this.wsUrl}?${params}`);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected - syncing with server');
        this.reconnectAttempts = 0;
        this.isIntentionallyClosed = false;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        if (this.isIntentionallyClosed) return;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
          console.log(`⏳ Reconnecting in ${delay}ms...`);
          
          if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => this.connect(), delay);
        }
      };
    } catch (error) {
      console.warn('WebSocket connection error:', error);
    }
  }

  private handleWebSocketMessage(message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'sync':
        // Server sends full sync on connection
        if (payload.conversations) {
          this.conversations = payload.conversations;
        }
        if (payload.messages) {
          this.messages = payload.messages;
        }
        if (payload.users) {
          this.users = payload.users;
        }
        console.log('📦 Server sync completed');
        this.notify();
        break;

      case 'message':
        if (payload && payload.conversationId) {
          if (!this.messages[payload.conversationId]) {
            this.messages[payload.conversationId] = [];
          }
          const exists = this.messages[payload.conversationId].some(m => m.id === payload.id);
          if (!exists) {
            this.messages[payload.conversationId].push(payload);
            const conv = this.conversations.find((c) => c.id === payload.conversationId);
            if (conv) {
              conv.lastMessage = payload;
              conv.updatedAt = Date.now();
            }
            this.notify();
          }
        }
        break;

      case 'user_joined':
        console.log(`👤 ${payload.userId} joined`);
        this.notify();
        break;

      case 'user_left':
        console.log(`👋 ${payload.userId} left`);
        this.notify();
        break;

      case 'typing':
        if (payload.userId) {
          const user = this.users.find((u) => u.id === payload.userId);
          if (user) {
            user.isTypingIn = payload.isTyping ? payload.conversationId : undefined;
            this.notify();
          }
        }
        break;

      default:
        break;
    }
  }

  private recomputeLastMessages() {
    this.conversations.forEach((conv) => {
      const msgs = this.messages[conv.id];
      if (msgs && msgs.length > 0) {
        conv.lastMessage = msgs[msgs.length - 1];
      }
    });
  }

  private persist() {
    try {
      localStorage.setItem('akari_users', JSON.stringify(this.users));
      if (this.currentUser) {
        localStorage.setItem('akari_current_user', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('akari_current_user');
      }
      localStorage.setItem('akari_conversations', JSON.stringify(this.conversations));
      localStorage.setItem('akari_messages', JSON.stringify(this.messages));
      localStorage.setItem('akari_statuses', JSON.stringify(this.statuses));
      localStorage.setItem('akari_calls', JSON.stringify(this.calls));
      localStorage.setItem('akari_settings', JSON.stringify(this.settings));
    } catch {
      // Storage quota
    }
    this.notify();
    
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SYNC_ALL' });
    }
  }

  private loadFromLocalStorageWithoutBroadcast() {
    try {
      const storedUsers = localStorage.getItem('akari_users');
      const storedCurrentUser = localStorage.getItem('akari_current_user');
      const storedConvs = localStorage.getItem('akari_conversations');
      const storedMessages = localStorage.getItem('akari_messages');
      const storedStatuses = localStorage.getItem('akari_statuses');
      const storedCalls = localStorage.getItem('akari_calls');

      if (storedUsers) this.users = JSON.parse(storedUsers);
      if (storedCurrentUser) this.currentUser = JSON.parse(storedCurrentUser);
      if (storedConvs) this.conversations = JSON.parse(storedConvs);
      if (storedMessages) this.messages = JSON.parse(storedMessages);
      if (storedStatuses) this.statuses = JSON.parse(storedStatuses);
      if (storedCalls) this.calls = JSON.parse(storedCalls);
      this.recomputeLastMessages();
      this.notify();
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Listener error
      }
    });
  }

  private sendWebSocketMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, using REST API fallback');
      this.sendViaRest(message);
    }
  }

  private sendViaRest(message: any) {
    // Fallback to REST API if WebSocket is not available
    if (message.type === 'message' && message.payload) {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: message.payload.conversationId,
          message: message.payload,
        }),
      }).catch(err => console.error('REST API error:', err));
    }
  }

  public loginWithAkariId(akariId: string, password?: string): { success: boolean; message?: string; user?: User } {
    const cleanId = akariId.trim().toLowerCase();
    if (!cleanId) {
      return {
        success: false,
        message: 'Veuillez saisir votre identifiant unique .akari',
      };
    }

    let user = this.users.find(
      (u) => u.akariId.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!user) {
      if (cleanId.includes('.akari') || cleanId.includes('@admin.akari') || cleanId.length >= 3) {
        let role: User['role'] = 'commercial';
        if (cleanId.includes('admin')) role = 'admin';
        else if (cleanId.includes('secretaire')) role = 'secretaire';
        else if (cleanId.includes('commercial') || cleanId.includes('agent')) role = 'commercial';

        const rawName = cleanId.split(/[@.]/)[0];
        const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

        const newUser: User = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: formattedName || 'Collaborateur Akari',
          email: `${rawName}@akari.team`,
          akariId: cleanId.endsWith('.akari') ? cleanId : `${cleanId}.akari`,
          role,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          phone: '+33 6 12 34 56 78',
          bio: `Membre de l'équipe Akari Team House (${role})`,
          isOnline: true,
          lastSeen: Date.now(),
          createdAt: Date.now(),
        };

        this.users.push(newUser);
        user = newUser;

        // Save to server
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser),
        }).catch(err => console.error('Error saving user:', err));
      } else {
        return {
          success: false,
          message: `Identifiant "${akariId}" introuvable. Veuillez renseigner un identifiant unique se terminant par .akari.`,
        };
      }
    }

    this.currentUser = user;
    user.isOnline = true;
    user.lastSeen = Date.now();
    this.persist();
    this.connect();
    return { success: true, user };
  }

  public logout() {
    if (this.currentUser) {
      const user = this.users.find((u) => u.id === this.currentUser?.id);
      if (user) {
        user.isOnline = false;
        user.lastSeen = Date.now();
      }
    }
    this.currentUser = null;
    if (this.ws) {
      this.isIntentionallyClosed = true;
      this.ws.close();
      this.ws = null;
    }
    this.persist();
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      const existing = this.users.find((u) => u.id === user.id);
      if (existing) {
        existing.isOnline = true;
        existing.lastSeen = Date.now();
      }
      this.connect();
    }
    this.persist();
  }

  public updateUserProfile(updates: Partial<User>) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...updates };
    const index = this.users.findIndex((u) => u.id === this.currentUser?.id);
    if (index >= 0) {
      this.users[index] = { ...this.users[index], ...updates };
    }
    this.persist();
  }

  public updateCurrentUser(updates: Partial<User>) {
    this.updateUserProfile(updates);
  }

  public createAkariAccount(data: {
    name: string;
    akariId: string;
    role: UserRole;
    password?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
  }): { success: boolean; message?: string; user?: User } {
    let cleanId = data.akariId.trim().toLowerCase();
    if (!cleanId.endsWith('.akari')) {
      cleanId = `${cleanId}.akari`;
    }

    if (this.users.some((u) => u.akariId.toLowerCase() === cleanId)) {
      return { success: false, message: `L'identifiant ${cleanId} existe déjà.` };
    }

    const defaultAvatars: Record<UserRole, string> = {
      admin: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      secretaire: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      commercial: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      collaborateur: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    };

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      akariId: cleanId,
      name: data.name.trim(),
      email: cleanId.includes('@') ? cleanId : `${cleanId.replace('.akari', '')}@akari.team`,
      avatar: data.avatar || defaultAvatars[data.role],
      phone: data.phone || '+33 1 40 00 00 00',
      bio: data.bio || `Membre de l'équipe Akari (${data.role}) ✨`,
      role: data.role,
      isOnline: false,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    };

    this.users.push(newUser);

    // Save to server
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(err => console.error('Error saving user:', err));

    this.persist();
    return { success: true, user: newUser };
  }

  public deleteAkariAccount(userIdOrAkariId: string): boolean {
    const target = this.users.find(
      (u) =>
        u.id === userIdOrAkariId ||
        u.akariId?.toLowerCase() === userIdOrAkariId?.toLowerCase() ||
        u.email?.toLowerCase() === userIdOrAkariId?.toLowerCase()
    );

    const targetId = target ? target.id : userIdOrAkariId;
    const targetAkariId = target ? target.akariId.toLowerCase() : '';

    this.users = this.users.filter(
      (u) =>
        u.id !== targetId &&
        (!targetAkariId || u.akariId.toLowerCase() !== targetAkariId)
    );

    this.conversations = this.conversations.filter((conv) => {
      if (conv.type === 'direct' && conv.participants.includes(targetId)) {
        delete this.messages[conv.id];
        return false;
      }
      return true;
    });

    this.conversations.forEach((conv) => {
      conv.participants = conv.participants.filter((id) => id !== targetId);
    });

    this.statuses = this.statuses.filter((s) => s.userId !== targetId);
    this.calls = this.calls.filter((c) => c.callerId !== targetId && c.receiverId !== targetId);

    this.persist();
    this.notify();
    return true;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public saveUser(user: User) {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }
    this.persist();
  }

  public getConversations(): Conversation[] {
    if (!this.currentUser) return [];
    return this.conversations
      .filter((c) => c.participants.includes(this.currentUser!.id))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
  }

  public getMessages(conversationId: string): Message[] {
    return this.messages[conversationId] || [];
  }

  public getStatuses(): StatusStory[] {
    const now = Date.now();
    return this.statuses.filter((s) => s.expiresAt > now);
  }

  public getCalls(): CallRecord[] {
    if (!this.currentUser) return [];
    return this.calls.filter(
      (c) =>
        c.callerId === this.currentUser!.id ||
        c.receiverId === this.currentUser!.id ||
        c.participants.includes(this.currentUser!.id)
    );
  }

  public getSettings(): AppSettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.persist();
  }

  public createDirectConversation(otherUserId: string): Conversation {
    if (!this.currentUser) throw new Error('Not authenticated');
    const existing = this.conversations.find(
      (c) =>
        c.type === 'direct' &&
        c.participants.includes(this.currentUser!.id) &&
        c.participants.includes(otherUserId)
    );

    if (existing) {
      return existing;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'direct',
      participants: [this.currentUser.id, otherUserId],
      unreadCounts: { [this.currentUser.id]: 0, [otherUserId]: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations.unshift(newConv);
    this.messages[newConv.id] = [];

    // Save to server
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConv),
    }).catch(err => console.error('Error saving conversation:', err));

    this.persist();
    return newConv;
  }

  public getOrCreateDirectConversation(currentUserId: string, otherUserId: string): Conversation {
    return this.createDirectConversation(otherUserId);
  }

  public createGroupConversation(
    name: string,
    participantIds: string[],
    avatar?: string,
    description?: string
  ): Conversation {
    if (!this.currentUser) throw new Error('Not authenticated');
    const allParticipants = Array.from(new Set([this.currentUser.id, ...participantIds]));
    const unreadCounts: Record<string, number> = {};
    allParticipants.forEach((pid) => (unreadCounts[pid] = 0));

    const newGroup: Conversation = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'group',
      name: name || 'Nouveau Groupe Akari',
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      description: description || 'Groupe de travail créé sur Akari',
      participants: allParticipants,
      adminIds: [this.currentUser.id],
      unreadCounts,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations.unshift(newGroup);
    this.messages[newGroup.id] = [
      {
        id: `msg_init_${Date.now()}`,
        conversationId: newGroup.id,
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        senderAvatar: this.currentUser.avatar,
        text: `Groupe créé : "${newGroup.name}" 🏢`,
        type: 'text',
        status: 'read',
        createdAt: Date.now(),
      },
    ];

    // Save to server
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup),
    }).catch(err => console.error('Error saving conversation:', err));

    this.recomputeLastMessages();
    this.persist();
    return newGroup;
  }

  public deleteConversation(id: string) {
    this.conversations = this.conversations.filter((c) => c.id !== id);
    delete this.messages[id];
    this.persist();
  }

  public togglePinConversation(id: string) {
    const conv = this.conversations.find((c) => c.id === id);
    if (conv) {
      conv.isPinned = !conv.isPinned;
      this.persist();
    }
  }

  public toggleMuteConversation(id: string) {
    const conv = this.conversations.find((c) => c.id === id);
    if (conv) {
      conv.isMuted = !conv.isMuted;
      this.persist();
    }
  }

  public toggleArchiveConversation(conversationId: string) {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.isArchived = !conv.isArchived;
      this.persist();
    }
  }

  public markAsRead(conversationId: string) {
    if (!this.currentUser) return;
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.unreadCounts[this.currentUser.id] = 0;
    }

    const msgs = this.messages[conversationId] || [];
    let hasChanged = false;
    msgs.forEach((m) => {
      if (m.senderId !== this.currentUser?.id && m.status !== 'read') {
        m.status = 'read';
        hasChanged = true;
      }
    });

    if (hasChanged || (conv && conv.unreadCounts[this.currentUser.id] !== 0)) {
      this.persist();
    }
  }

  public markConversationAsRead(conversationId: string, _userId?: string) {
    this.markAsRead(conversationId);
  }

  public sendMessage(
    conversationId: string,
    arg2: string,
    arg3?: string | MessageType,
    arg4?: MessageType | string,
    arg5?:
      | string
      | {
          mediaUrl?: string;
          mediaName?: string;
          mediaSize?: number;
          mediaDuration?: number;
          location?: LocationData;
          contact?: ContactData;
          replyToMessageId?: string;
        },
    arg6?: {
      mediaUrl?: string;
      mediaName?: string;
      mediaSize?: number;
      mediaDuration?: number;
      location?: LocationData;
      contact?: ContactData;
      replyToMessageId?: string;
    },
    arg7?: Message['replyToSnapshot']
  ): Message {
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }

    let senderId = this.currentUser ? this.currentUser.id : 'user_me';
    let senderName = this.currentUser ? this.currentUser.name : 'Utilisateur';
    let senderAvatar = this.currentUser ? this.currentUser.avatar : '';
    let type: MessageType = 'text';
    let text = '';
    let extra:
      | {
          mediaUrl?: string;
          mediaName?: string;
          mediaSize?: number;
          mediaDuration?: number;
          location?: LocationData;
          contact?: ContactData;
          replyToMessageId?: string;
        }
      | undefined = undefined;
    let replySnapshot: Message['replyToSnapshot'] | undefined = undefined;

    if (
      typeof arg3 === 'string' &&
      typeof arg4 === 'string' &&
      (arg4 === 'text' ||
        arg4 === 'image' ||
        arg4 === 'video' ||
        arg4 === 'audio' ||
        arg4 === 'document' ||
        arg4 === 'location' ||
        arg4 === 'contact')
    ) {
      senderId = arg2;
      senderName = arg3;
      const foundUser = this.users.find((u) => u.id === senderId);
      senderAvatar = foundUser?.avatar || (this.currentUser ? this.currentUser.avatar : '');
      type = arg4 as MessageType;
      text = (typeof arg5 === 'string' ? arg5 : '') || '';
      extra = arg6;
      replySnapshot = arg7;
    } else {
      text = arg2 || '';
      if (typeof arg3 === 'string') type = arg3 as MessageType;
      if (typeof arg4 === 'object' && arg4 !== null) extra = arg4 as any;
      if (typeof arg5 === 'object' && arg5 !== null) extra = arg5 as any;
    }

    if (!replySnapshot && extra?.replyToMessageId) {
      const parentMsg = this.messages[conversationId]?.find(
        (m) => m.id === extra?.replyToMessageId
      );
      if (parentMsg) {
        replySnapshot = {
          senderName: parentMsg.senderName,
          text: parentMsg.text || `[${parentMsg.type}]`,
          type: parentMsg.type,
        };
      }
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      text: text.trim(),
      type,
      status: 'sent',
      createdAt: Date.now(),
      mediaUrl: extra?.mediaUrl,
      mediaName: extra?.mediaName,
      mediaSize: extra?.mediaSize,
      mediaDuration: extra?.mediaDuration,
      location: extra?.location,
      contact: extra?.contact,
      replyToMessageId: extra?.replyToMessageId,
      replyToSnapshot: replySnapshot,
    };

    this.messages[conversationId].push(newMsg);

    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = newMsg;
      conv.updatedAt = Date.now();
      conv.participants.forEach((pid) => {
        if (this.currentUser && pid !== this.currentUser.id) {
          conv.unreadCounts[pid] = (conv.unreadCounts[pid] || 0) + 1;
        }
      });
    }

    if (this.settings.soundEnabled) {
      sounds.playSendSound();
    }

    // Send via WebSocket (with REST fallback)
    this.sendWebSocketMessage({
      type: 'message',
      payload: newMsg,
    });

    this.persist();
    this.scheduleDeliveredAndRead(conversationId, newMsg.id);

    return newMsg;
  }

  private scheduleDeliveredAndRead(conversationId: string, messageId: string) {
    setTimeout(() => {
      const msgs = this.messages[conversationId];
      const msg = msgs?.find((m) => m.id === messageId);
      if (msg && msg.status === 'sent') {
        msg.status = 'delivered';
        this.persist();
      }
    }, 1200);

    setTimeout(() => {
      const conv = this.conversations.find((c) => c.id === conversationId);
      const msgs = this.messages[conversationId];
      const msg = msgs?.find((m) => m.id === messageId);
      if (conv && conv.type === 'direct' && msg && msg.status === 'delivered') {
        msg.status = 'read';
        this.persist();
      }
    }, 3200);
  }

  public reactToMessage(conversationId: string, messageId: string, emoji: string, userId?: string) {
    const msgs = this.messages[conversationId];
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (!msg) return;

    const uId = userId || (this.currentUser ? this.currentUser.id : 'user_me');
    if (!msg.reactions) {
      msg.reactions = {};
    }

    if (msg.reactions[emoji]?.includes(uId)) {
      msg.reactions[emoji] = msg.reactions[emoji].filter((id) => id !== uId);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      if (!msg.reactions[emoji]) {
        msg.reactions[emoji] = [];
      }
      msg.reactions[emoji].push(uId);
    }

    this.persist();
  }

  public deleteMessage(conversationId: string, messageId: string) {
    const msgs = this.messages[conversationId];
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (msg) {
      msg.isDeleted = true;
      msg.text = '';
      this.persist();
    }
  }

  public toggleStarMessage(conversationId: string, messageId: string) {
    const msgs = this.messages[conversationId];
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (msg) {
      msg.isStarred = !msg.isStarred;
      this.persist();
    }
  }

  public togglePinMessage(conversationId: string, messageId: string) {
    const msgs = this.messages[conversationId];
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (msg) {
      msg.isPinned = !msg.isPinned;
      this.persist();
    }
  }

  public clearMessages(conversationId: string) {
    this.messages[conversationId] = [];
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = undefined;
      conv.updatedAt = Date.now();
    }
    this.persist();
  }

  public setUserTyping(userId: string, conversationId: string | null) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.isTypingIn = conversationId || undefined;
      this.sendWebSocketMessage({
        type: 'typing',
        payload: { userId, isTyping: !!conversationId, conversationId },
      });
      this.persist();
    }
  }

  public postStatus(
    type: 'text' | 'image' | 'video',
    content: string,
    caption?: string,
    bgColor?: string,
    fontStyle?: 'sans' | 'serif' | 'mono' | 'handwriting'
  ): StatusStory {
    if (!this.currentUser) throw new Error('Not authenticated');
    const newStory: StatusStory = {
      id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      type,
      content,
      caption,
      bgColor: bgColor || '#008069',
      fontStyle: fontStyle || 'sans',
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 3600000,
      viewers: [],
    };

    this.statuses.unshift(newStory);
    this.persist();
    return newStory;
  }

  public createStatus(
    _user: User,
    type: 'text' | 'image' | 'video',
    content: string,
    caption?: string,
    bgColor?: string,
    fontStyle?: 'sans' | 'serif' | 'mono' | 'handwriting'
  ) {
    return this.postStatus(type, content, caption, bgColor, fontStyle);
  }

  public markStatusSeen(statusId: string) {
    if (!this.currentUser) return;
    const story = this.statuses.find((s) => s.id === statusId);
    if (story && story.userId !== this.currentUser.id) {
      if (!Array.isArray(story.viewers)) {
        story.viewers = [];
      }
      if (!story.viewers.some((v) => v.userId === this.currentUser!.id)) {
        story.viewers.push({
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          userAvatar: this.currentUser.avatar,
          seenAt: Date.now(),
        });
        this.persist();
      }
    }
  }

  public deleteStatus(statusId: string) {
    this.statuses = this.statuses.filter((s) => s.id !== statusId);
    this.persist();
  }

  public addCallRecord(record: Partial<CallRecord> & { callerId: string; type: 'audio' | 'video' }) {
    if (!this.currentUser) return null;
    const newCall: CallRecord = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      callerId: record.callerId,
      callerName: record.callerName || this.currentUser.name,
      callerAvatar: record.callerAvatar || this.currentUser.avatar,
      receiverId: record.receiverId,
      receiverName: record.receiverName || 'Contact Akari',
      receiverAvatar: record.receiverAvatar || '',
      participants: record.participants || [record.callerId, record.receiverId || ''].filter(Boolean),
      type: record.type,
      status: record.status || 'completed',
      startedAt: record.startedAt || Date.now(),
      durationSeconds: record.durationSeconds || 0,
      conversationId: record.conversationId,
    };
    this.calls.unshift(newCall);
    this.persist();
    return newCall;
  }

  public resetToDefaults() {
    this.users = INITIAL_USERS;
    this.currentUser = INITIAL_USERS[0];
    this.conversations = INITIAL_CONVERSATIONS;
    this.messages = INITIAL_MESSAGES;
    this.statuses = INITIAL_STATUSES;
    this.calls = INITIAL_CALLS;
    this.recomputeLastMessages();
    this.persist();
  }

  public resetDemoData() {
    this.resetToDefaults();
  }
}

export const appStorage = new AppStorageService();
export const storageService = appStorage;
