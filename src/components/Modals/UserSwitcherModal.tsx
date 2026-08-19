import React from 'react';
import { X, UserCheck, Sparkles, RefreshCw } from 'lucide-react';
import { User } from '../../types';
import { Avatar } from '../Common/Avatar';

interface UserSwitcherModalProps {
  allUsers: User[];
  currentUser: User;
  onClose: () => void;
  onSwitchUser: (user: User) => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  allUsers,
  currentUser,
  onClose,
  onSwitchUser,
}) => {
  return (
    <div
      id="user-switcher-modal"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Changer de compte actif
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

        {/* Explanatory Banner */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300">
          <p className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              Passez d'un compte à l'autre en 1 clic pour tester les conversations en direct, les notifications et le double-check bleu !
            </span>
          </p>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-2">
          {allUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                onClick={() => {
                  if (!isCurrent) {
                    onSwitchUser(user);
                    onClose();
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30'
                    : 'hover:bg-gray-50 dark:hover:bg-[#202c33]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.name} size="md" isOnline={user.isOnline} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {user.name}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00a884] text-[10px] font-bold text-white">
                          ACTIF
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.phone || user.email}
                    </span>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    type="button"
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-[#00a884] hover:text-white text-xs font-semibold rounded-lg transition-colors text-gray-700 dark:text-gray-200"
                  >
                    Sélectionner
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
