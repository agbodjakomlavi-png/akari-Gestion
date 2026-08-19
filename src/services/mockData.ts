import { User, Conversation, Message, StatusStory, CallRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    akariId: 'admin@admin.akari',
    name: 'Direction & Administration',
    email: 'admin@admin.akari',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+33 1 00 00 00 00',
    bio: 'Direction Générale • Administrateur Système Akari',
    role: 'admin',
    password: 'admin',
    isOnline: true,
    lastSeen: Date.now(),
    createdAt: Date.now(),
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_MESSAGES: Record<string, Message[]> = {};

export const INITIAL_STATUSES: StatusStory[] = [];

export const INITIAL_CALLS: CallRecord[] = [];
