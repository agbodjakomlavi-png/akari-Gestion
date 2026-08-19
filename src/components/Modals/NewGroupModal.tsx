import React, { useState, useRef } from 'react';
import { X, Users, Check, Camera, Search, Upload } from 'lucide-react';
import { User } from '../../types';
import { Avatar } from '../Common/Avatar';

interface NewGroupModalProps {
  allUsers: User[];
  currentUser: User;
  onClose: () => void;
  onCreateGroup: (name: string, participantIds: string[], avatar?: string, description?: string) => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  allUsers,
  currentUser,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eligibleUsers = allUsers.filter((u) => u.id !== currentUser.id);

  const filteredUsers = eligibleUsers.filter((u) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.akariId?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    onCreateGroup(
      groupName.trim(),
      selectedUserIds,
      avatarUrl.trim() || undefined,
      description.trim() || undefined
    );
    onClose();
  };

  return (
    <div
      id="new-group-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#008069] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Nouveau Groupe de Travail</h2>
              <p className="text-xs text-white/80">
                Créez un canal d'échange pour votre équipe
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

        {/* Group Info Form */}
        <form onSubmit={handleCreate} className="p-4 space-y-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-4">
            {/* Group Avatar upload button */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#202c33] border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-[#00a884] overflow-hidden relative group"
                title="Choisir une icône pour le groupe"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Group Icon" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400 group-hover:text-[#00a884] transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold">
                  Modifier
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-[10px] text-gray-400 mt-1">Photo groupe</span>
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex: Pôle Commercial Ouest, Réunion Direction..."
                  required
                  className="w-full bg-gray-50 dark:bg-[#202c33] text-xs sm:text-sm text-gray-900 dark:text-gray-100 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
                  autoFocus
                />
              </div>

              <div>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du groupe (optionnel)"
                  className="w-full bg-gray-50 dark:bg-[#202c33] text-xs text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Member Search & Selection Header */}
        <div className="p-3 bg-gray-50 dark:bg-[#182229] border-b border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Sélectionner les collaborateurs ({selectedUserIds.length} sélectionné{selectedUserIds.length > 1 ? 's' : ''})
            </span>
            <span className="text-[11px] text-[#00a884] font-medium">Au moins 1 membre</span>
          </div>

          <div className="flex items-center bg-white dark:bg-[#202c33] rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Filtrer les collaborateurs..."
              className="w-full bg-transparent text-xs text-gray-800 dark:text-gray-100 focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60 p-2">
          {filteredUsers.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            return (
              <div
                key={user.id}
                onClick={() => toggleUser(user.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-500/30'
                    : 'hover:bg-gray-50 dark:hover:bg-[#202c33]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={user.avatar} name={user.name} size="md" isOnline={user.isOnline} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user.name}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                      {user.akariId}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#00a884] border-[#00a884] text-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Button Footer */}
        <div className="p-3 sm:p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-700/60">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedUserIds.length === 0}
            className="w-full py-3 bg-[#00a884] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#029070] shadow-md transition-all cursor-pointer"
          >
            Créer le groupe ({selectedUserIds.length} participant{selectedUserIds.length > 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
};
