import React, { useState } from 'react';
import { X, UserCheck, Send } from 'lucide-react';
import { User, ContactData } from '../../types';
import { Avatar } from '../Common/Avatar';

interface ContactShareModalProps {
  allUsers: User[];
  onClose: () => void;
  onSendContact: (contact: ContactData) => void;
}

export const ContactShareModal: React.FC<ContactShareModalProps> = ({
  allUsers,
  onClose,
  onSendContact,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleSend = () => {
    if (!selectedUser) return;
    onSendContact({
      name: selectedUser.name,
      phone: selectedUser.phone || '+33 6 00 00 00 00',
      email: selectedUser.email,
    });
    onClose();
  };

  return (
    <div
      id="contact-share-modal"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Partager un contact
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Users list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-2">
          {allUsers.map((user) => {
            const isSelected = selectedUser?.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40'
                    : 'hover:bg-gray-50 dark:hover:bg-[#202c33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-400">{user.phone || user.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Send button */}
        <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-gray-700/60">
          <button
            type="button"
            onClick={handleSend}
            disabled={!selectedUser}
            className="w-full py-2.5 bg-[#00a884] disabled:opacity-40 text-white font-semibold text-sm rounded-lg hover:bg-[#029070] flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer le contact sélectionné</span>
          </button>
        </div>
      </div>
    </div>
  );
};
