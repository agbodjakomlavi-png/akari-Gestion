# 🔐 Akari - Guide d'Administration et de Sécurité

## 🎯 Résumé de l'Architecture

### Authentification Stricte
- ✅ **Seul l'admin peut créer des comptes**
- ✅ **Identifiants générés automatiquement** (akariId + mot de passe temporaire)
- ✅ **Tokens JWT** pour les sessions
- ✅ **Pas d'auto-inscription**

### Messagerie Sécurisée
- ✅ **Messages privés** - seul l'expéditeur et le destinataire voient les messages
- ✅ **Temps réel** avec WebSocket
- ✅ **Conversations persistantes** - accessibles uniquement aux 2 participants
- ✅ **Reste en mémoire serveur** - pour démo (upgrade vers DB pour production)

### Contrôle d'Accès
- ✅ **Base de données partagée** sur le serveur
- ✅ **Chaque message vérifié** - seuls les participants can voir
- ✅ **Sessions avec tokens** - sécurisées et tracées

---

## 👨‍💼 Guide Administrateur

### 1. Démarrage du Serveur

```bash
npm run start
```

Le serveur démarre avec:
- **Admin par défaut:**
  - ID: `admin.akari`
  - Mot de passe: `admin123`
  - 🔴 **À changer immédiatement en production!**

### 2. Créer des Comptes Utilisateur

#### Via API (cURL):

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sophie Dupont",
    "email": "sophie@company.com",
    "akariId": "sophie.dupont.akari",
    "role": "secretaire",
    "avatar": "https://images.unsplash.com/..."
  }'
```

**Réponse:**
```json
{
  "user": {
    "id": "user_xxx",
    "name": "Sophie Dupont",
    "akariId": "sophie.dupont.akari",
    "role": "secretaire"
  },
  "tempPassword": "aB9xKm2Qs7"
}
```

#### Partager avec l'utilisateur:
- **ID:** `sophie.dupont.akari`
- **Mot de passe temporaire:** `aB9xKm2Qs7`
- Message: *"Connectez-vous avec ces identifiants. Vous devriez changer votre mot de passe."*

### 3. Lister Tous les Utilisateurs (Admin)

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Désactiver un Compte

```bash
curl -X POST http://localhost:3000/api/admin/users/{userId}/disable \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 👥 Guide Utilisateur

### 1. Connexion

1. Allez à `http://localhost:3000`
2. Entrez votre **ID Akari** (ex: `sophie.dupont.akari`)
3. Entrez votre **mot de passe**
4. Cliquez **"Se connecter"**

### 2. Interface Principale

**Après connexion:**

```
┌─────────────────────────────────────┐
│ Akari - Messagerie d'Équipe         │
├─────────────────────────────────────┤
│  [Contacts]      │  [Chat]          │
│                  │                  │
│ • Sophie (🟢)    │ Messages...      │
│ • Thomas (⚪)    │                  │
│ • Admin (🟢)     │ [Saisie message] │
│                  │                  │
└─────────────────────────────────────┘
```

- **Colonne gauche:** Liste des contacts avec statut en ligne
- **Colonne droite:** Chat privé avec le contact sélectionné
- **Messages en temps réel:** Apparaissent instantanément

### 3. Envoyer un Message Privé

1. Cliquez sur un contact dans la liste
2. La conversation s'ouvre
3. Tapez votre message
4. Cliquez **"Envoyer"** ou appuyez sur Entrée
5. Le message apparaît instantanément chez le destinataire (s'il est en ligne)

### 4. Voir les Contacts

- **🟢 Vert** = Utilisateur en ligne
- **⚪ Gris** = Utilisateur hors ligne

---

## 🔒 Sécurité & Architecture

### Base de Données Partagée

**Fichier:** `server.ts` - Objet `serverDb`

```typescript
serverDb = {
  users: Map<userId, user>,
  conversations: Map<convId, conversation>,
  messages: Map<convId, messages[]>,
  credentials: Map<userId, { password, tokens }>,
}
```

**Chaque message vérifié:**
```typescript
// Avant de recevoir un message:
if (!conversation.participants.includes(userId)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Authentification par Token

```typescript
// Login génère un token unique
token = `token_${Date.now()}_${random}`
userSessions.set(token, userId)

// Toute requête vérifie le token
if (!userSessions.get(token)) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Messagerie Privée

**Seul le destinataire reçoit les messages:**

```typescript
// Le serveur envoie à SEUL le destinataire
const recipientId = conversation.participants.find(p => p !== userId);
broadcastToUser(recipientId, { type: 'message', payload: msg });
```

### WebSocket Sécurisé

```typescript
// Connexion validée avec token
const userId = userSessions.get(token);
if (!userId) {
  ws.close(1008, 'Unauthorized');
}
```

---

## 🧪 Scénario de Test - 2 Utilisateurs

### Préparation

```bash
# Terminal 1: Démarrer le serveur
npm run start

# Terminal 2: Créer des comptes utilisateur
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test","akariId":"alice.test.akari","role":"commercial"}'

curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test","akariId":"bob.test.akari","role":"commercial"}'
```

### Test

**Navigateur 1 (Alice):**
1. Ouvrez `http://localhost:3000`
2. Connectez-vous: `alice.test.akari` / `PASSWORD1`
3. Cliquez sur **Bob** dans la liste de contacts
4. Envoyez: "Salut Bob!" ✉️

**Navigateur 2 (Bob):**
1. Ouvrez `http://localhost:3000` (mode privé)
2. Connectez-vous: `bob.test.akari` / `PASSWORD2`
3. Cliquez sur **Alice** dans la liste de contacts
4. Vous voyez le message de Alice! ✨
5. Répondez: "Salut Alice!"

**Navigateur 1 (Alice):**
- Vois le message de Bob instantanément

**Vérification de Sécurité:**
- Alice ne voit QUE la conversation avec Bob
- Bob ne voit QUE la conversation avec Alice
- Aucun autre utilisateur ne peut voir ces messages
- Essayez d'accéder directement à `/api/conversations/OTHER_CONV_ID/messages` → ❌ Access denied

---

## 📊 Base de Données

### En-Mémoire (Démo)

**Avantages:**
- Rapide ⚡
- Simple à déployer 🚀
- Idéal pour démo/test ✅

**Inconvénients:**
- Données perdues au redémarrage 🔄
- Limité à 1 serveur
- Pas d'historique persistent

### Production: Upgrade vers PostgreSQL

```typescript
// Remplacer Map par requêtes PostgreSQL
const users = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

---

## 🚨 Checklist de Sécurité

- [ ] Changer le mot de passe admin (`admin123` → mot de passe fort)
- [ ] Utiliser HTTPS en production
- [ ] Implémenter une vraie base de données
- [ ] Ajouter rate limiting sur /api/auth/login
- [ ] Monitorer les tentatives de connexion échouées
- [ ] Implémenter l'expiration des tokens
- [ ] Ajouter des logs d'audit
- [ ] Chiffrer les mots de passe (bcrypt)
- [ ] CORS configuré correctement
- [ ] Valider toutes les entrées utilisateur

---

## 🔄 Flux de Communication

```
Alice              Serveur            Bob
  |                  |                 |
  |-- Login -------->|                 |
  |<-- Token --------|                 |
  |                  |                 |
  |-- WebSocket Connect ----------->|
  |                  |<-- WebSocket Connect
  |                  |                 |
  |-- Message ------>|-- Broadcast --->|
  |                  |                 |
  |<----- Ack -------|                 |
  |                  |  Message Received
  |<---- Sync -------|<-- ACK ---------|
  |                  |                 |
```

---

## 📞 Support

Pour des questions sur l'authentification ou la messagerie:
- Consultez `server.ts` pour l'API
- Consultez `src/services/auth.ts` pour la sécurité client
- Vérifiez les logs du serveur pour les erreurs

---

**Status:** ✅ Prêt pour démo  
**Sécurité:** ⚠️ Démo uniquement - upgrade pour production  
**Scalabilité:** 🔄 En-mémoire - passer à DB pour multi-serveur
