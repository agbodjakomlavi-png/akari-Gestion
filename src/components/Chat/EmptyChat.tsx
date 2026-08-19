import React from 'react';
import { Lock, MessageSquarePlus, CircleDashed, Shield, Settings, Phone } from 'lucide-react';
import { AkariLogo } from '../Common/AkariLogo';

interface EmptyChatProps {
  isAdmin?: boolean;
  onOpenNewChat?: () => void;
  onOpenStatus?: () => void;
  onOpenCalls?: () => void;
  onOpenAdmin?: () => void;
  onOpenSettings?: () => void;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({
  isAdmin = false,
  onOpenNewChat,
  onOpenStatus,
  onOpenCalls,
  onOpenAdmin,
  onOpenSettings,
}) => {
  return (
    <div
      id="empty-chat-placeholder"
      className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#111b21] p-8 text-center border-b-8 border-[#00a884] select-none"
    >
      <div className="max-w-lg flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Akari Team House Official Logo */}
        <div className="mb-6 p-4 rounded-3xl bg-white dark:bg-[#182229] shadow-xl border border-gray-200/80 dark:border-gray-800">
          <AkariLogo size={64} showName={false} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-[#e9edef] mb-2 tracking-tight">
          Akari Messagerie Interne
        </h1>

        <p className="text-sm text-gray-500 dark:text-[#8696a0] leading-relaxed mb-6 max-w-sm">
          Espace d'échange et de communication sécurisé de l'équipe Akari. Sélectionnez une conversation pour commencer.
        </p>

        {/* Interactive Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-8">
          {onOpenNewChat && (
            <button
              id="empty-chat-new-msg-btn"
              type="button"
              onClick={onOpenNewChat}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Nouveau message</span>
            </button>
          )}

          {onOpenStatus && (
            <button
              id="empty-chat-status-btn"
              type="button"
              onClick={onOpenStatus}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#202c33] text-gray-800 dark:text-gray-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <CircleDashed className="w-4 h-4 text-[#00a884]" />
              <span>Statuts / Stories</span>
            </button>
          )}

          {isAdmin && onOpenAdmin ? (
            <button
              id="empty-chat-admin-btn"
              type="button"
              onClick={onOpenAdmin}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-[#182229] border border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#00a884]" />
              <span>Gérer .akari</span>
            </button>
          ) : onOpenCalls ? (
            <button
              id="empty-chat-calls-btn"
              type="button"
              onClick={onOpenCalls}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#202c33] text-gray-800 dark:text-gray-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Appels</span>
            </button>
          ) : null}

          {onOpenSettings && (
            <button
              id="empty-chat-settings-btn"
              type="button"
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#202c33] text-gray-800 dark:text-gray-200 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Paramètres</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-[#667781] pt-4 border-t border-gray-200 dark:border-gray-700/60 w-full justify-center">
          <Lock className="w-3.5 h-3.5" />
          <span>Vos messages sont chiffrés de bout en bout sur le réseau Akari</span>
        </div>
      </div>
    </div>
  );
};
