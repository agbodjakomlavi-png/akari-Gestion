import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  User,
  Volume2,
  VolumeX,
  Type,
  Image as ImageIcon,
  Check,
  Upload,
  RefreshCw,
  Sparkles,
  Camera,
  Shield,
  Trash2,
  Sun,
  Moon,
  Trees,
  Flame
} from 'lucide-react';
import { AppSettings, User as UserType, AppTheme, FontSizeOption } from '../../types';
import { Avatar } from '../Common/Avatar';
import { storageService } from '../../services/storage';
import { LogOut } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  currentUser: UserType;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onUpdateUser: (updatedUser: Partial<UserType>) => void;
  onClose: () => void;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  currentUser,
  onUpdateSettings,
  onUpdateUser,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'wallpaper' | 'profile' | 'privacy'>('appearance');

  // Profile editable state
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [profileSaved, setProfileSaved] = useState(false);

  // Custom wallpaper state
  const [customWallpaperInput, setCustomWallpaperInput] = useState(settings.customWallpaperUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);

  // Handle avatar file selection from computer or phone
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setAvatar(base64Url);
          onUpdateUser({ avatar: base64Url });
          setProfileSaved(true);
          setTimeout(() => setProfileSaved(false), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom wallpaper file selection from computer or phone
  const handleWallpaperFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setCustomWallpaperInput(base64Url);
          onUpdateSettings({
            wallpaper: 'custom',
            customWallpaperUrl: base64Url,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      avatar,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const themeOptions: { id: AppTheme; label: string; desc: string; icon: any; sentBg: string; recBg: string }[] = [
    {
      id: 'dark',
      label: 'Akari Dark (Sombre)',
      desc: 'Palette sombre officielle avec bulles émeraudes',
      icon: Moon,
      sentBg: 'bg-[#005c4b] text-white',
      recBg: 'bg-[#202c33] text-white',
    },
    {
      id: 'light',
      label: 'Akari Clair',
      desc: 'Thème lumineux haute clarté pour bureau',
      icon: Sun,
      sentBg: 'bg-[#d9fdd3] text-gray-900',
      recBg: 'bg-[#ffffff] text-gray-900',
    },
    {
      id: 'emerald',
      label: 'Émeraude Akari',
      desc: 'Vert impérial profond et accents raffinés',
      icon: Trees,
      sentBg: 'bg-[#054c3b] text-white',
      recBg: 'bg-[#14382d] text-white',
    },
    {
      id: 'midnight',
      label: 'Midnight OLED',
      desc: 'Noir absolu économe en batterie et contrasté',
      icon: Sparkles,
      sentBg: 'bg-[#004d40] text-white',
      recBg: 'bg-[#1a1a1a] text-white',
    },
    {
      id: 'sunset',
      label: 'Sunset Crépuscule',
      desc: 'Teintes chaleureuses terracotta et ambre',
      icon: Flame,
      sentBg: 'bg-[#c8653b] text-white',
      recBg: 'bg-[#2d1f1f] text-white',
    },
  ];

  return (
    <div
      id="akari-settings-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#111b21] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-[#008069] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Paramètres de l'Application</h2>
              <p className="text-xs text-white/80">
                Personnalisation des thèmes, tailles, profil et arrière-plans
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#182229] px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Thèmes & Tailles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wallpaper')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'wallpaper'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Fond de Discussion</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Sons & Confidentialité</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: APPEARANCE & THEMES & FONT SIZES */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* THEMES SELECTION */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                  Thème Visuel & Couleurs des Messages
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Le thème s'applique instantanément à l'interface ainsi qu'aux bulles de messages envoyés et reçus.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {themeOptions.map((th) => {
                    const Icon = th.icon;
                    const isSelected = settings.theme === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => onUpdateSettings({ theme: th.id })}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#00a884] ring-2 ring-[#00a884]/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#182229]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-[#00a884]" />
                            <span className="text-xs font-bold text-gray-900 dark:text-white">
                              {th.label}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#00a884]" />}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                          {th.desc}
                        </p>

                        {/* Interactive mini bubble preview */}
                        <div className="flex flex-col gap-1 bg-black/5 dark:bg-black/40 p-2 rounded-lg text-[10px]">
                          <div className={`self-start px-2 py-0.5 rounded-md ${th.recBg}`}>
                            Reçu : Bonjour Akari
                          </div>
                          <div className={`self-end px-2 py-0.5 rounded-md ${th.sentBg}`}>
                            Envoyé : Bien reçu !
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FONT SIZE SELECTION */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-[#00a884]" />
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Taille de Police des Discussions
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ajuste la lisibilité et l'échelle typographique des messages dans toute la plateforme.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as FontSizeOption[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onUpdateSettings({ fontSize: size })}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        settings.fontSize === size
                          ? 'border-[#00a884] ring-2 ring-[#00a884]/20 bg-emerald-50/20 dark:bg-emerald-950/20 text-[#00a884] font-bold'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#182229] text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div
                        className={`mb-1 ${
                          size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base font-semibold'
                        }`}
                      >
                        {size === 'small' ? 'Petite' : size === 'medium' ? 'Moyenne' : 'Grande'}
                      </div>
                      <span className="text-[10px] opacity-70 block">
                        {size === 'small' ? '12.5px' : size === 'medium' ? '14px (Défaut)' : '16.5px'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Font preview container */}
                <div className="p-3 bg-gray-50 dark:bg-[#182229] rounded-xl border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200">
                  <span className="text-[10px] text-gray-400 block mb-1">Aperçu du texte :</span>
                  <p
                    className={
                      settings.fontSize === 'small'
                        ? 'text-[12.5px]'
                        : settings.fontSize === 'large'
                        ? 'text-[16.5px]'
                        : 'text-[14px]'
                    }
                  >
                    « Akari Team House : la communication professionnelle simplifiée et sécurisée. »
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WALLPAPER / ARRIÈRE-PLAN */}
          {activeTab === 'wallpaper' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-1">
                  Arrière-plan de discussion personnalisé
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Choisissez un fond prédéfini ou importez une image personnalisée depuis votre ordinateur ou téléphone.
                </p>

                {/* Upload Image from Device */}
                <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#182229] flex flex-col items-center justify-center text-center gap-3">
                  <input
                    ref={wallpaperInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWallpaperFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#00a884] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => wallpaperInputRef.current?.click()}
                      className="px-4 py-2 bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      Sélectionner une image de votre appareil
                    </button>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Formats supportés : JPG, PNG, WebP (PC ou Mobile)
                    </p>
                  </div>
                </div>

                {/* Custom URL Option */}
                <div className="mt-4 space-y-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Ou coller l'URL d'une image en ligne :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customWallpaperInput}
                      onChange={(e) => setCustomWallpaperInput(e.target.value)}
                      placeholder="https://example.com/mon-fond.jpg"
                      className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          wallpaper: 'custom',
                          customWallpaperUrl: customWallpaperInput,
                        })
                      }
                      className="px-3.5 py-2 bg-[#00a884] text-white text-xs font-medium rounded-xl hover:bg-[#029070]"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>

                {/* Preset Wallpapers */}
                <div className="mt-6">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                    Fonds prédéfinis :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'default', label: 'Défaut Akari', color: 'bg-[#efeae2] dark:bg-[#0b141a]' },
                      { id: 'subtle-emerald', label: 'Émeraude Nuit', color: 'bg-[#081d17]' },
                      { id: 'dark', label: 'Sombre Profond', color: 'bg-[#0c1317]' },
                      { id: 'sunset', label: 'Sunset Crépuscule', color: 'bg-gradient-to-b from-amber-700 to-orange-950' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onUpdateSettings({ wallpaper: w.id as any })}
                        className={`h-24 rounded-xl border relative overflow-hidden flex flex-col justify-end p-2 text-left cursor-pointer transition-transform hover:scale-105 ${
                          w.color
                        } ${
                          settings.wallpaper === w.id
                            ? 'border-[#00a884] ring-2 ring-[#00a884]'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span className="text-[11px] font-semibold text-white drop-shadow-md">
                          {w.label}
                        </span>
                        {settings.wallpaper === w.id && (
                          <div className="absolute top-2 right-2 p-1 rounded-full bg-[#00a884] text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE & LOCAL PHOTO UPLOAD */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {profileSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Profil mis à jour avec succès !</span>
                </div>
              )}

              {/* Profile Photo Change section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[#182229] border border-gray-100 dark:border-gray-800">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />

                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar src={avatar} name={name} size="xl" />
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] transition-opacity">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Modifier</span>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Photo de profil
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Importez une image depuis votre ordinateur ou galerie photo.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1.5 px-3 py-1.5 bg-[#00a884] text-white text-xs font-medium rounded-lg hover:bg-[#029070] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Changer la photo de profil</span>
                  </button>
                </div>
              </div>

              {/* Unique Akari ID Display */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#00a884]" />
                  <span>Identifiant unique Akari (Non modifiable)</span>
                </label>
                <input
                  type="text"
                  value={currentUser.akariId || currentUser.email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-[#182229] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-500 font-mono"
                />
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Numéro de téléphone / Ligne directe
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Statut / Actu professionnelle
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Enregistrer les modifications
              </button>
            </form>
          )}

          {/* TAB 4: SOUNDS & PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#182229] rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Effets sonores (Envoi & Réception)
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Sons Web Audio natifs lors des actions de discussion.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.soundEnabled ? 'bg-[#00a884]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      settings.soundEnabled ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#182229] rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Confirmations de lecture (Vu / Lu)
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Affiche les doubles coches bleues lors de la lecture.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ readReceipts: !settings.readReceipts })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.readReceipts ? 'bg-[#00a884]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      settings.readReceipts ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#182229] rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Touche Entrée pour envoyer
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Appuyer sur Entrée valide l'envoi immédiat du message.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ enterIsSend: !settings.enterIsSend })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.enterIsSend ? 'bg-[#00a884]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      settings.enterIsSend ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              {/* Déconnexion */}
              {onLogout && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Se déconnecter et revenir à l'accueil</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
