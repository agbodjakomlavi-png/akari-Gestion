import React, { useState } from 'react';
import { authService } from '../services/auth';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [akariId, setAkariId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authService.login(akariId, password);
    
    if (result.success) {
      const user = authService.getUser();
      if (user) {
        onLoginSuccess(user);
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00a884] to-[#008069] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Akari</h1>
          <p className="text-gray-600 mt-2">Messagerie d'Équipe Sécurisée</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identifiant Akari
            </label>
            <input
              type="text"
              placeholder="ex: admin.akari"
              value={akariId}
              onChange={(e) => setAkariId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !akariId || !password}
            className="w-full bg-[#00a884] hover:bg-[#008069] text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Démo:</strong> Utilisez les identifiants fournis par l'administrateur.
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Admin: <code className="bg-blue-100 px-2 py-1 rounded">admin.akari</code> / <code className="bg-blue-100 px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
