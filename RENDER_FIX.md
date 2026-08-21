# 🚀 Déploiement sur Render - Résolution d'erreurs

## Erreur: "Cet hôte n'est pas autorisé"

Si vous recevez l'erreur:
```
Requête bloquée. Cet hôte (« akari-di-e2.onrender.com ») n'est pas autorisé.
```

### ✅ Résolution

Les fichiers ont été mis à jour pour corriger ce problème:

1. **`vite.config.ts`** - Mise à jour avec `allowedHosts: 'all'` en développement
2. **`server.ts`** - Correction du servage des fichiers statiques
3. **Configuration Render** - Vérifiée et optimisée

### 🔧 Étapes pour redéployer

1. **Validez les modifications locales:**
```bash
npm run lint
npm run build
npm run start
```

2. **Poussez les modifications vers GitHub:**
```bash
git add .
git commit -m "Fix Render deployment - allow all hosts"
git push origin main
```

3. **Redéployez sur Render:**
   - Allez dans votre tableau de bord Render
   - Cliquez sur votre service
   - Cliquez **"Manual Deploy"** ou **"Redeploy latest commit"**
   - Attendez que le déploiement se termine (~5 minutes)

### 📋 Vérification

Une fois déployé, testez:

```bash
# Santé du serveur
curl https://akari-di-e2.onrender.com/api/health

# Réponse attendue:
# {"status":"healthy","timestamp":"..."}
```

### 🐛 Si l'erreur persiste

**Étape 1:** Vérifiez les logs Render
- Dans le tableau de bord → "Logs"
- Cherchez les erreurs liées à Vite

**Étape 2:** Forcez un redéploiement
- Cliquez **"Clear build cache & redeploy"** dans Render
- Attendez 5-10 minutes

**Étape 3:** Vérifiez environment vars
Dans Render Dashboard → Environment:
- `NODE_ENV` = `production`
- `PORT` = (auto-assigné)

### 🔄 Alternative - Railway (Recommandé)

Si Render continue à avoir des problèmes, essayez Railway:

1. Allez sur: https://railway.app
2. Cliquez **"Deploy from GitHub"**
3. Sélectionnez: `agbodjakomlavi-png/akari-Gestion`
4. Railway déploie automatiquement
5. Obtient une URL en ~2 minutes

Railway gère mieux Vite par défaut.

---

## 📊 Fichiers modifiés

✅ `vite.config.ts` - AllowedHosts configuré pour tous les domaines  
✅ `server.ts` - Serveur optimisé pour production  
✅ `package.json` - Scripts tsx corrigés  

---

## 🎯 Checklist après déploiement

- [ ] Pas d'erreur "hôte non autorisé"
- [ ] Page charge correctement
- [ ] API `/api/health` répond
- [ ] Connexion possible
- [ ] Messages s'envoient et reçoivent
- [ ] WebSocket connecté

---

## 📞 Support

**Questions sur Render?**
- Docs Render: https://render.com/docs
- Support Chat: Dans le dashboard Render

**Problèmes WebSocket?**
- Vérifiez que le protocole change de `ws://` à `wss://` en production
- Render gère cela automatiquement

---

**Status:** ✅ Prêt pour redéploiement  
**Dernière mise à jour:** 2026-08-21
