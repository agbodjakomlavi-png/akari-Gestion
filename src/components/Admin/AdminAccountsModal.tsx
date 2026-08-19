import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Trash2,
  Key,
  Check,
  Copy,
  AlertCircle,
  Building2,
  Briefcase,
  FileText,
  Search,
  Users,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { storageService } from '../../services/storage';
import { Avatar } from '../Common/Avatar';

interface AdminAccountsModalProps {
  currentUser: User;
  onClose: () => void;
}

export const AdminAccountsModal: React.FC<AdminAccountsModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');

  // Form fields for new account creation
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('secretaire');
  const [prefix, setPrefix] = useState('');
  const [password, setPassword] = useState('akari');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const [createdSuccess, setCreatedSuccess] = useState<User | null>(null);
  const [deletedSuccessMsg, setDeletedSuccessMsg] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // In-app confirmation dialog state (replaces native window.confirm)
  const [userPendingDelete, setUserPendingDelete] = useState<User | null>(null);

  // Keep synced with storage
  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setUsers(storageService.getUsers());
    });
    return unsub;
  }, []);

  // Compute final identifier
  const suggestedId = prefix
    ? `${prefix.toLowerCase().replace(/[^a-z0-9.]/g, '')}.${role === 'secretaire' ? 'secretaire' : role === 'commercial' ? 'commercial' : role === 'admin' ? 'admin' : 'agent'}.akari`
    : name
    ? `${name.toLowerCase().trim().split(' ')[0].replace(/[^a-z0-9]/g, '')}.${role === 'secretaire' ? 'secretaire' : role === 'commercial' ? 'commercial' : role === 'admin' ? 'admin' : 'agent'}.akari`
    : `nouveau.${role}.akari`;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setCreatedSuccess(null);
    setDeletedSuccessMsg('');

    if (!name.trim()) {
      setErrorMessage('Veuillez renseigner le nom complet du collaborateur.');
      return;
    }

    const finalAkariId = suggestedId;

    const result = storageService.createAkariAccount({
      name: name.trim(),
      akariId: finalAkariId,
      role,
      password: password || 'akari',
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
    });

    if (result.success && result.user) {
      setCreatedSuccess(result.user);
      setUsers(storageService.getUsers());
      // Reset form
      setName('');
      setPrefix('');
      setPhone('');
      setBio('');
    } else {
      setErrorMessage(result.message || 'Impossible de créer cet identifiant.');
    }
  };

  // Immediate deletion execution without native blocked dialogs
  const executeDeleteUser = (userToDelete: User) => {
    if (userToDelete.id === currentUser.id) {
      setErrorMessage('Vous ne pouvez pas supprimer votre propre compte administrateur actuellement connecté.');
      return;
    }

    const isAdmin = userToDelete.role === 'admin';
    const deletedName = userToDelete.name;
    const deletedAkariId = userToDelete.akariId;

    // Call storage service deletion
    storageService.deleteAkariAccount(userToDelete.id);

    // Refresh state immediately
    const updatedUsers = storageService.getUsers();
    setUsers(updatedUsers);
    setUserPendingDelete(null);

    setDeletedSuccessMsg(
      `Le compte ${isAdmin ? 'administrateur' : ''} "${deletedName}" (${deletedAkariId}) a été supprimé avec succès de la base de données.`
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.akariId.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      id="admin-accounts-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-[#111b21] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-[#008069] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Gestion des Comptes & Accès Akari</h2>
              <p className="text-xs text-white/80">
                Administration centrale des comptes (Admins, Secrétariat, Commerciaux)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#182229] px-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setDeletedSuccessMsg('');
            }}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registre des Utilisateurs ({users.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setDeletedSuccessMsg('');
            }}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Créer un Nouvel Identifiant</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Deletion Success Banner */}
          {deletedSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{deletedSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeletedSuccessMsg('')}
                className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-red-600 hover:text-red-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'create' ? (
            <div>
              {createdSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Identifiant créé avec succès pour {createdSuccess.name} !
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `Identifiant Akari: ${createdSuccess.akariId}\nMot de passe: ${createdSuccess.password || 'akari'}`
                        )
                      }
                      className="text-xs px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId ? 'Copié !' : 'Copier accès'}</span>
                    </button>
                  </div>
                  <div className="bg-white/80 dark:bg-black/40 p-2.5 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 flex flex-col gap-1">
                    <div>
                      <span className="text-gray-400">Identifiant :</span>{' '}
                      <strong>{createdSuccess.akariId}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Mot de passe :</span>{' '}
                      <strong>{createdSuccess.password || 'akari'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400">Rôle attribué :</span>{' '}
                      <span className="uppercase text-emerald-600 font-semibold">{createdSuccess.role}</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Nom complet du collaborateur *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ex: Julien Morel"
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Rôle & Fonction dans l'entreprise *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                    >
                      <option value="admin">Administrateur / Direction (.admin.akari)</option>
                      <option value="secretaire">Secrétariat Général (.secretaire.akari)</option>
                      <option value="commercial">Pôle Commercial (.commercial.akari)</option>
                      <option value="collaborateur">Collaborateur (.agent.akari)</option>
                    </select>
                  </div>
                </div>

                {/* Custom prefix */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Préfixe d'identifiant personnalisé (Optionnel)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="ex: julien ou j.morel"
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                    />
                    <div className="px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-mono font-bold truncate max-w-[200px]">
                      {suggestedId}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Mot de passe initial
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe temporaire"
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Numéro de téléphone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+33 6 00 00 00 00"
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Description du poste / Statut
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="ex: Responsable administratif ou Agent de négociation 📋"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#00a884] hover:bg-[#029070] text-white font-medium rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer et enregistrer l'identifiant .akari</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, identifiant .akari, rôle..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />
              </div>

              {/* Role filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterRole('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    filterRole === 'all'
                      ? 'bg-[#00a884] text-white'
                      : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Tous ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('admin')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    filterRole === 'admin'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>Admins ({users.filter((u) => u.role === 'admin').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('secretaire')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    filterRole === 'secretaire'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Secrétariat ({users.filter((u) => u.role === 'secretaire').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterRole('commercial')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    filterRole === 'commercial'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 dark:bg-[#202c33] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Commerciaux ({users.filter((u) => u.role === 'commercial').length})</span>
                </button>
              </div>

              {/* Users list */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    Aucun compte trouvé pour ces critères.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const isAdmin = u.role === 'admin';

                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 flex items-center justify-between transition-colors ${
                          isAdmin ? 'bg-emerald-500/5 dark:bg-emerald-950/10' : 'hover:bg-gray-50 dark:hover:bg-[#182229]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={u.name} size="md" isOnline={u.isOnline} />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[10px] text-gray-400 font-normal">(Vous)</span>
                                )}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                                  u.role === 'admin'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                    : u.role === 'secretaire'
                                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {u.role.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-gray-600 dark:text-gray-300 font-medium">
                              {u.akariId}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-xs">
                              {u.bio || u.phone || 'Collaborateur Akari'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Copy ID */}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.akariId)}
                            className="p-2 rounded-lg text-gray-500 hover:text-[#00a884] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Copier l'identifiant"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete Account button */}
                          {isSelf ? (
                            <span className="text-[10px] text-gray-400 px-2 py-1 italic">
                              Session active
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setUserPendingDelete(u)}
                              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                                isAdmin
                                  ? 'bg-red-50 hover:bg-red-600 dark:bg-red-950/40 dark:hover:bg-red-600 text-red-600 hover:text-white border border-red-200 dark:border-red-800'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                              }`}
                              title={isAdmin ? `Supprimer cet administrateur (${u.name})` : `Supprimer ce compte (${u.name})`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              {isAdmin && <span className="text-[11px] text-red-600 hover:text-white">Supprimer Admin</span>}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Custom React In-Modal Confirmation Dialog (100% Reliable in iframe) */}
        {userPendingDelete && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white dark:bg-[#182229] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950/60">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    Confirmer la suppression
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Action irréversible sur la base de données
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#111b21] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                <p className="text-gray-800 dark:text-gray-200">
                  Êtes-vous certain de vouloir supprimer définitivement le compte{' '}
                  <strong className="text-gray-900 dark:text-white">{userPendingDelete.name}</strong> ?
                </p>
                <div className="font-mono text-gray-500 dark:text-gray-400 text-[11px]">
                  Identifiant : <strong>{userPendingDelete.akariId}</strong> • Rôle :{' '}
                  <span className="uppercase text-emerald-600 font-bold">{userPendingDelete.role}</span>
                </div>
                {userPendingDelete.role === 'admin' && (
                  <p className="text-red-600 dark:text-red-400 font-semibold text-[11px] pt-1">
                    ⚠️ Ce compte possède des privilèges d'administrateur qui seront révoqués immédiatement.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserPendingDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => executeDeleteUser(userPendingDelete)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Oui, Supprimer définitivement</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
