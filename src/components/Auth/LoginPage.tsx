import React, { useState } from 'react';
import {
  Shield,
  Key,
  ArrowRight,
  ArrowLeft,
  Building2,
  AlertCircle,
  HelpCircle,
  Lock
} from 'lucide-react';
import { AkariLogo } from '../Common/AkariLogo';
import { storageService } from '../../services/storage';
import { User } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onBackToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  // Always initialize fields completely blank
  const [akariId, setAkariId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!akariId.trim()) {
      setError('Veuillez renseigner votre identifiant unique .akari');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = storageService.loginWithAkariId(akariId, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message || 'Identifiant invalide ou introuvable.');
      }
    }, 250);
  };

  const getDetectedRole = () => {
    const lower = akariId.toLowerCase().trim();
    if (!lower) return null;
    if (lower.includes('admin')) return { label: 'Direction & Administration', color: 'text-emerald-600 dark:text-emerald-400 font-bold' };
    if (lower.includes('secretaire')) return { label: 'Secrétariat Général', color: 'text-blue-600 dark:text-blue-400 font-bold' };
    if (lower.includes('commercial') || lower.includes('agent')) return { label: 'Pôle Commercial', color: 'text-amber-600 dark:text-amber-400 font-bold' };
    if (lower.endsWith('.akari')) return { label: 'Collaborateur Akari', color: 'text-teal-600 dark:text-teal-400 font-bold' };
    return null;
  };

  const detectedRole = getDetectedRole();

  return (
    <div
      id="akari-login-page"
      className="min-h-[100dvh] w-full bg-[#efeae2] dark:bg-[#0c1317] flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-200"
    >
      {/* Background banner */}
      <div className="absolute top-0 left-0 right-0 h-48 sm:h-56 bg-gradient-to-b from-[#008069] to-[#00a884] dark:from-[#005c4b] dark:to-[#0b141a] z-0" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-[#111b21] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Back to Landing Page link */}
        {onBackToHome && (
          <div className="pt-4 px-6">
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Retour à la page d'accueil</span>
            </button>
          </div>
        )}

        {/* Header Branding */}
        <div className="pt-6 pb-4 px-6 sm:px-8 text-center flex flex-col items-center">
          <div className="mb-3 transform hover:scale-105 transition-transform duration-200">
            <AkariLogo size={46} showName={true} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            Connexion Collaborateur
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Authentification sécurisée par identifiant unique <strong>.akari</strong>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Akari Unique Identifier Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="akari-id-input"
                className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4 text-[#00a884]" />
                <span>Identifiant Unique (.akari)</span>
              </label>
              {detectedRole && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 ${detectedRole.color}`}>
                  {detectedRole.label}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="akari-id-input"
                type="text"
                value={akariId}
                onChange={(e) => setAkariId(e.target.value)}
                placeholder="Saisissez votre identifiant unique..."
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-[#202c33] border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] transition-all"
                autoComplete="off"
                required
                autoFocus
              />
            </div>
            
            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 pt-0.5">
              <HelpCircle className="w-3 h-3 text-[#00a884]" />
              <span>Format : <em>admin@admin.akari</em>, <em>nom.secretaire.akari</em> ou <em>nom.commercial.akari</em></span>
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="akari-password-input"
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Mot de passe</span>
              </label>
            </div>

            <div className="relative">
              <input
                id="akari-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Saisissez votre mot de passe"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:border-transparent transition-all pr-14"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium cursor-pointer"
              >
                {showPassword ? 'Masquer' : 'Voir'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="akari-login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3.5 px-4 bg-[#00a884] hover:bg-[#029070] text-white font-bold rounded-xl text-sm sm:text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-70 cursor-pointer group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Valider et accéder à la messagerie</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-gray-400 dark:text-gray-500 inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#00a884]" />
              <span>Session interne sécurisée & chiffrée de bout en bout</span>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
