# 🌐 Guide Complet Render - Akari (Français)

## 🆘 Erreur Reçue et Solution

### Erreur:
```
Requête bloquée. Cet hôte (« akari-di-e2.onrender.com ») n'est pas autorisé.
Pour autoriser cet hôte, ajoutez « akari-di-e2.onrender.com » à `server.allowedHosts` dans vite.config.js.
```

### ✅ Cause Résolu ✅

Les fichiers suivants ont été mis à jour:

1. **`vite.config.ts`** - Configuration Vite corrigée avec allowedHosts
2. **`server.ts`** - Serveur optimisé pour production
3. **`package.json`** - Scripts corrigés

---

## 📱 Redéploiement sur Render

### Étape 1: Vérifiez les modifications localement

```bash
# Validez le build
npm run lint
npm run build

# Test local
npm run start

# Vérifiez: http://localhost:3000/api/health
```

### Étape 2: Poussez vers GitHub

```bash
git add .
git commit -m "Fix Render deployment - configure allowedHosts"
git push origin main
```

### Étape 3: Redéployez sur Render

**Option A - Redéploiement automatique:**
1. GitHub Actions détecte le push
2. Pipeline se lance automatiquement
3. Image Docker est construite
4. Render redéploie (~5 minutes)

**Option B - Redéploiement manuel:**
1. Allez sur: https://dashboard.render.com
2. Sélectionnez votre service "akari-messaging"
3. Cliquez le bouton **"Manual Deploy"**
4. Sélectionnez **"Deploy latest commit"**
5. Attendez (5-10 minutes)

**Option C - Forcer un redéploiement complet:**
1. Dans Render Dashboard
2. Cliquez **"Settings"** → **"Clear build cache & redeploy"**
3. Confirmez
4. Attendez la reconstruction complète

### Étape 4: Vérifiez le déploiement

```bash
# Test de santé
curl https://akari-di-e2.onrender.com/api/health

# Réponse attendue:
{"status":"healthy","timestamp":"2026-08-21T..."}

# Test dans le navigateur:
# 1. Ouvrez https://akari-di-e2.onrender.com
# 2. Connectez-vous avec: admin.akari
# 3. Essayez d'envoyer un message
```

---

## 🔍 Dépannage Render

### ❌ Erreur persiste après redéploiement?

**Étape 1: Vérifiez les logs Render**
1. Dashboard Render → Votre service
2. Onglet **"Logs"**
3. Cherchez les erreurs VITE ou Express

**Étape 2: Vérifiez les variables d'environnement**
1. Settings → Environment
2. Vérifiez:
   - `NODE_ENV` = `production`
   - `PORT` = (auto-assigné, ne touchez pas)
   - `GEMINI_API_KEY` = (optionnel)

**Étape 3: Vérifiez le fichier source**
1. Allez sur votre repo GitHub
2. Vérifiez que les fichiers sont mis à jour:
   - `vite.config.ts` - Contient `allowedHosts`
   - `server.ts` - Contient le servage statique

**Étape 4: Nettoyez et reconstruisez**
1. Render Dashboard → Settings
2. **"Clear build cache & redeploy"**
3. Attendez 10 minutes

### ❌ Page affiche erreur 404?

**Vérifiez:** Render a-t-il exécuté `npm run build`?

1. Dans les logs, cherchez:
   ```
   ✓ built in X seconds
   ```

2. Si absent, redéployez manuellement avec cache nettoyé

### ❌ WebSocket ne se connecte pas?

**C'est normal en test local.** En production:

1. Render change automatiquement:
   - `ws://` → `wss://` (protocole sécurisé)
   - Port: assigné automatiquement

2. Vérifiez dans DevTools (F12):
   - Network → WS
   - Status: 101 Switching Protocols = ✅

### ❌ Page charge mais style absent?

**Cause:** Assets CSS pas chargés

1. F12 → Console
2. Cherchez les erreurs 404 sur les assets
3. Vérifiez que `npm run build` s'est exécuté

Solution:
```bash
# Forcez le nettoyage
git clean -fd dist/
npm run build
git add dist/
git commit -m "Rebuild with proper assets"
git push origin main
```

---

## ⚙️ Configuration Render Finale

### build.command:
```bash
npm install && npm run build
```

### start.command:
```bash
npm start
```

### Environment Variables:
```env
NODE_ENV=production
PORT=3000 (optionnel, auto-assigné)
GEMINI_API_KEY=votre_clé (optionnel)
```

---

## 📊 Fichiers clés modifiés

| Fichier | Changement |
|---------|-----------|
| `vite.config.ts` | ✅ `allowedHosts: 'all'` en dev |
| `server.ts` | ✅ Servage static optimisé |
| `package.json` | ✅ Scripts tsx corrigés |

---

## 🚀 URL de déploiement

Votre app Render:
- **Frontend:** https://akari-di-e2.onrender.com
- **API:** https://akari-di-e2.onrender.com/api/health
- **WebSocket:** wss://akari-di-e2.onrender.com

---

## 🎯 Checklist après redéploiement

- [ ] Render dit "Live" (vert)
- [ ] Pas d'erreurs dans les logs
- [ ] Page charge (pas 404)
- [ ] API health répond
- [ ] Connexion fonctionne
- [ ] Messages s'envoient/reçoivent
- [ ] WebSocket connecté (DevTools)

---

## 💡 Si Render pose toujours problème

### Essayez Railway (plus facile):

1. Allez sur: https://railway.app
2. Cliquez **"Deploy from GitHub"**
3. Sélectionnez: `agbodjakomlavi-png/akari-Gestion`
4. Railway déploie automatiquement en 2 minutes
5. Pas de configuration Vite requise

**Railway gère mieux les apps Node/Express par défaut.**

---

## 📞 Aide supplémentaire

### Render Documentation:
- Node.js Deployment: https://render.com/docs/deploy-node
- WebSocket Support: https://render.com/docs/websockets
- Build Logs: https://render.com/docs/deploy-service

### Akari Documentation:
- START_DEPLOYMENT.md - Guide général
- READY_TO_DEPLOY.md - Vue d'ensemble
- DEPLOYMENT.md - Architecture technique

---

## ✅ Résumé

**Problème:** Vite bloquait les hôtes externes  
**Solution:** Configuration allowedHosts mise à jour  
**Action:** Redéployez sur Render  
**Résultat:** App fonctionnelle en production  

---

**Status:** ✅ Prêt pour redéploiement  
**Dernière mise à jour:** 21-08-2026  
**Langue:** Français
