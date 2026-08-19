import React from 'react';
import {
  Shield,
  Key,
  ArrowRight,
  Users,
  MessageSquare,
  Lock,
  Building2,
  Briefcase,
  FileText,
  Sparkles,
  PhoneCall,
  Video,
  Mic,
  Palette,
  Layers,
  CircleDot,
  CheckCircle2,
  Sun,
  Moon,
  Smartphone
} from 'lucide-react';
import { AkariLogo } from '../Common/AkariLogo';
import { AppTheme } from '../../types';

interface LandingPageProps {
  theme: AppTheme;
  onGoToLogin: (presetAkariId?: string) => void;
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  onGoToLogin,
  onToggleTheme,
}) => {
  const roleStructure = [
    {
      role: 'Direction & Administration',
      id: 'admin@admin.akari',
      desc: 'Gestion centrale des identifiants collaborateurs, sécurité des accès et gouvernance de la plateforme.',
      icon: Shield,
      badge: 'Admin',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      role: 'Secrétariat Général',
      id: '*.secretaire.akari',
      desc: 'Coordination générale, accueil, gestion des plannings et diffusion documentaire interne.',
      icon: FileText,
      badge: 'Secrétariat',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      role: 'Pôle Commercial & Ventes',
      id: '*.commercial.akari',
      desc: 'Prospection clients, négociation terrain et échanges d\'équipe en direct.',
      icon: Briefcase,
      badge: 'Commercial',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  ];

  const mainPillars = [
    {
      icon: Key,
      title: 'Identifiants Uniques Sécurisés',
      desc: 'Chaque collaborateur dispose d\'un identifiant d\'entreprise officiel (.akari) généré par l\'administration sans numéro personnel requis.',
    },
    {
      icon: Users,
      title: 'Annuaire Unifié de l\'Équipe',
      desc: 'Tous les membres de l\'entreprise sont visibles sur la plateforme avec leur statut en ligne et leur pôle de rattachement.',
    },
    {
      icon: Building2,
      title: 'Groupes de Travail Dédiés',
      desc: 'Créez librement des canaux de discussion par projet, par service ou pour vos réunions d\'équipe avec photo et description.',
    },
    {
      icon: Lock,
      title: 'Chiffrement de Bout en Bout',
      desc: 'Toutes les communications (textes, notes vocales, médias, documents PDF) sont strictement protégées et confidentielles.',
    },
    {
      icon: PhoneCall,
      title: 'Appels Audio & Vidéo HD',
      desc: 'Contactez vos collègues en direct via des communications vocales et vidéo fluides directement intégrées.',
    },
    {
      icon: Palette,
      title: 'Thèmes & Personnalisation',
      desc: '5 thèmes professionnels, réglage des tailles de police et import d\'images d\'arrière-plan personnalisées depuis votre appareil.',
    },
  ];

  return (
    <div
      id="akari-landing-page"
      className="min-h-[100dvh] w-full bg-[#f8fafc] dark:bg-[#0c1317] text-gray-900 dark:text-[#e9edef] flex flex-col transition-colors duration-200"
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-[#111b21]/85 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AkariLogo size={36} showName={true} />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182229] transition-colors cursor-pointer"
              title="Changer le thème"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Login CTA in Header */}
            <button
              id="landing-header-login-btn"
              type="button"
              onClick={() => onGoToLogin()}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029070] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 px-4 sm:px-6">
        {/* Glow ambient decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[650px] h-96 sm:h-[650px] bg-[#00a884]/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-[#00a884] dark:text-emerald-400 text-xs font-semibold mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plateforme Interne Officielle Akari Team House</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white mb-6">
            La messagerie instantanée collaborative de l'équipe{' '}
            <span className="text-[#00a884] dark:text-[#00a884]">Akari</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed mb-8">
            Espace d'échange moderne, rapide et sécurisé pour la direction, le secrétariat et les agents commerciaux. Connectez-vous avec vos identifiants uniques <strong>.akari</strong>.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              id="landing-hero-login-btn"
              type="button"
              onClick={() => onGoToLogin()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00a884] hover:bg-[#029070] text-white text-base font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Key className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Se connecter avec vos identifiants</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Structure des Pôles et Identifiants */}
      <section className="py-12 px-4 sm:px-6 bg-white dark:bg-[#111b21] border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Organisation des Pôles & Accès Sécurisés
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Architecture des identifiants d'entreprise Akari Team House
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roleStructure.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#182229] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#00a884]/10 text-[#00a884] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      {item.role}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#00a884] font-semibold">
                      {item.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Fonctionnalités avancées de communication
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
              Une infrastructure complète, ergonomique et hautement réactive pour répondre aux exigences quotidiennes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mainPillars.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-[#111b21] border border-gray-200 dark:border-gray-800 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00a884] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 sm:px-6 bg-white dark:bg-[#111b21] border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <AkariLogo size={24} showName={true} />
            <span className="text-gray-400">|</span>
            <span>Plateforme collaborative interne</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#00a884]" />
              <span>Chiffrement de bout en bout</span>
            </span>
            <span>•</span>
            <span>Serveurs Akari Team House</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
