import React, { useState } from 'react';
import {
  MoreVertical,
  CircleDashed,
  Phone,
  Settings,
  Users,
  Sun,
  Moon,
  LogOut,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import { User, AppSettings } from '../../types';
import { Avatar } from '../Common/Avatar';
import { AkariLogo } from '../Common/AkariLogo';

interface SidebarHeaderProps {
  currentUser: User;
  settings: AppSettings;
  onOpenStatusModal: () => void;
  onOpenNewGroupModal: () => void;
  onOpenCallsModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAdminModal?: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  currentUser,
  settings,
  onOpenStatusModal,
  onOpenNewGroupModal,
  onOpenCallsModal,
  onOpenSettingsModal,
  onOpenAdminModal,
  onToggleTheme,
  onLogout,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const copyAkariId = () => {
    navigator.clipboard.writeText(currentUser.akariId || currentUser.email);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return { label: 'Direction & Admin', bg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
      case 'secretaire':
        return { label: 'Secrétariat', bg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      case 'commercial':
        return { label: 'Agent Commercial', bg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Collaborateur', bg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div
      id="sidebar-header"
      className="h-16 px-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between select-none shrink-0 relative transition-colors"
    >
      {/* Left: User Avatar & App Brand */}
      <div className="flex items-center gap-3">
        <div
          onClick={onOpenSettingsModal}
          className="cursor-pointer relative group"
          title={`Profil : ${currentUser.name} (${currentUser.akariId})`}
        >
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            size="md"
            isOnline={currentUser.isOnline}
          />
          <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <AkariLogo size={22} showName={true} />
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1">
            <span className="truncate max-w-[120px] sm:max-w-[150px]">{currentUser.akariId}</span>
            <button
              type="button"
              onClick={copyAkariId}
              className="hover:text-[#00a884]"
              title="Copier mon identifiant"
            >
              {copiedId ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </span>
        </div>
      </div>

      {/* Right Actions Toolbar */}
      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600 dark:text-gray-300">
        {/* Admin generation button if admin role */}
        {currentUser.role === 'admin' && onOpenAdminModal && (
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Gérer et générer les identifiants .akari"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Stories / Status Button */}
        <button
          type="button"
          onClick={onOpenStatusModal}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Statuts & Stories Akari"
        >
          <CircleDashed className="w-5 h-5" />
        </button>

        {/* Calls Log Button */}
        <button
          type="button"
          onClick={onOpenCallsModal}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Journal des appels"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Quick Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title={`Changer de thème (Actuel: ${settings.theme})`}
        >
          {settings.theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" />
          )}
        </button>

        {/* More Menu Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Menu principal"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Context Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 top-12 w-64 bg-white dark:bg-[#233138] rounded-xl shadow-2xl py-2 z-50 border border-gray-100 dark:border-gray-700 text-xs animate-in fade-in"
              onMouseLeave={() => setShowDropdown(false)}
            >
              {/* User Header in Dropdown */}
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/50 mb-1">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                  {currentUser.akariId}
                </p>
                <div className="mt-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${roleBadge.bg}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              {currentUser.role === 'admin' && onOpenAdminModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenAdminModal();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-semibold cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Gestion des Identifiants (.akari)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onOpenNewGroupModal();
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-3 text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Créer un groupe de travail</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onOpenSettingsModal();
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-3 text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres & Arrière-plans</span>
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-700/50" />

              <button
                type="button"
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 text-red-600 dark:text-red-400 font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
