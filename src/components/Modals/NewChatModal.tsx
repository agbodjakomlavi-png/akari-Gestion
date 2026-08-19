import React, { useState } from 'react';
import {
  X,
  Search,
  Users,
  MessageSquare,
  Building2,
  Briefcase,
  FileText,
  Shield,
  Phone,
  UserPlus,
  Check,
  Trash2
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { Avatar } from '../Common/Avatar';

interface NewChatModalProps {
  allUsers: User[];
  currentUser: User;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  onOpenNewGroup?: () => void;
  onAddNewContact?: (newUser: User) => void;
  onDeleteUser?: (user: User) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  allUsers,
  currentUser,
  onClose,
  onSelectUser,
  onOpenNewGroup,
  onAddNewContact,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form for custom/external contact
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('commercial');
  const [newPhone, setNewPhone] = useState('');
  const [newBio, setNewBio] = useState('');

  // All other users on the platform
  const otherUsers = allUsers.filter((u) => u.id !== currentUser.id);

  const filteredUsers = otherUsers.filter((u) => {
    // Role filter
    if (roleFilter !== 'all' && u.role !== roleFilter) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchId = u.akariId?.toLowerCase().includes(q);
      const matchRole = u.role?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchBio = u.bio?.toLowerCase().includes(q);
      return matchName || matchId || matchRole || matchPhone || matchBio;
    }

    return true;
  });

  const handleCreateCustomContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const cleanPrefix = newName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const finalAkariId = `${cleanPrefix || 'contact'}.${newRole === 'secretaire' ? 'secretaire' : newRole === 'commercial' ? 'commercial' : 'agent'}.akari`;

    const newContact: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newName.trim(),
      email: `${cleanPrefix}@akari.team`,
      akariId: finalAkariId,
      role: newRole,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      phone: newPhone.trim() || '+33 6 00 00 00 00',
      bio: newBio.trim() || 'Collaborateur sur Akari Team House',
      isOnline: true,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    };

    if (onAddNewContact) {
      onAddNewContact(newContact);
    }
    onSelectUser(newContact);
    onClose();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Direction & Admin', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'secretaire':
        return { label: 'Secrétariat', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'commercial':
        return { label: 'Commercial', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      default:
        return { label: 'Collaborateur', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
    }
  };

  return (
    <div
      id="new-chat-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#008069] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Nouvelle Discussion</h2>
              <p className="text-xs text-white/80">
                Annuaire des collaborateurs Akari Team House
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: Create New Group */}
        {onOpenNewGroup && (
          <div className="p-3 bg-gray-50 dark:bg-[#182229] border-b border-gray-100 dark:border-gray-800">
            <button
              id="new-chat-create-group-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenNewGroup();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#202c33] border border-emerald-500/30 hover:border-[#00a884] text-gray-900 dark:text-white transition-all shadow-xs hover:shadow-md cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-[#00a884] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <span className="text-xs sm:text-sm font-bold block text-gray-900 dark:text-white">
                  Créer un groupe de travail
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  Rassemblez plusieurs collaborateurs dans un canal commun
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Search input */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center bg-gray-100 dark:bg-[#202c33] rounded-xl px-3.5 py-2.5">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, identifiant .akari ou fonction..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:outline-none placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === 'all'
                  ? 'bg-[#00a884] text-white'
                  : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Tous ({otherUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('secretaire')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === 'secretaire'
                  ? 'bg-[#00a884] text-white'
                  : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Secrétariat
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('commercial')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === 'commercial'
                  ? 'bg-[#00a884] text-white'
                  : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Commerciaux
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-[#00a884] text-white'
                  : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Direction
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-2">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Aucun collaborateur correspondant trouvé dans l'annuaire
            </div>
          ) : (
            filteredUsers.map((user) => {
              const badge = getRoleBadge(user.role);
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#202c33] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="md"
                      isOnline={user.isOnline}
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {user.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                        {user.akariId}
                      </span>
                      {user.bio && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[240px]">
                          {user.bio}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {currentUser.role === 'admin' && user.id !== currentUser.id && onDeleteUser && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteUser(user);
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title={user.role === 'admin' ? `Supprimer cet administrateur (${user.name})` : `Supprimer ce compte (${user.name})`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onSelectUser(user);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-[#00a884]/10 text-[#00a884] group-hover:bg-[#00a884] group-hover:text-white transition-colors"
                      title="Démarrer la discussion"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 dark:bg-[#182229] border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 text-center">
          Tous les collaborateurs enregistrés sont visibles pour faciliter la collaboration.
        </div>
      </div>
    </div>
  );
};
