import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, perMessageDeflate: false });

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// SHARED SERVER DATABASE
// =====================================================
const serverDb = {
  users: new Map(),
  conversations: new Map(),
  messages: new Map(),
  credentials: new Map(), // userId -> { password, tokens: [] }
};

// Initialize with admin account
function initializeDb() {
  const adminUser = {
    id: 'user_admin_001',
    name: 'Administrateur',
    email: 'admin@akari.local',
    akariId: 'admin.akari',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: Date.now(),
    isActive: true,
  };

  serverDb.users.set(adminUser.id, adminUser);
  serverDb.credentials.set(adminUser.id, {
    password: 'admin123', // Default password - must be changed
    tokens: [],
  });

  console.log('✅ Admin account initialized');
  console.log('   ID: admin.akari');
  console.log('   Password: admin123');
}

initializeDb();

const userConnections: Map<string, Set<any>> = new Map();
const userSessions: Map<string, string> = new Map(); // token -> userId

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth middleware
function verifyToken(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const userId = userSessions.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = userId;
  req.user = serverDb.users.get(userId);
  next();
}

// Serve static files
const distPath = join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1h',
    etag: false,
    index: false,
  }));
}

// =====================================================
// AUTHENTICATION ENDPOINTS
// =====================================================

// Login
app.post('/api/auth/login', (req, res) => {
  const { akariId, password } = req.body;

  if (!akariId || !password) {
    return res.status(400).json({ error: 'Missing akariId or password' });
  }

  const user = Array.from(serverDb.users.values()).find(
    u => u.akariId === akariId
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const creds = serverDb.credentials.get(user.id);
  if (!creds || creds.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account disabled' });
  }

  // Generate token
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
  userSessions.set(token, user.id);
  creds.tokens.push(token);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      akariId: user.akariId,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

// Logout
app.post('/api/auth/logout', verifyToken, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    userSessions.delete(token);
    const creds = serverDb.credentials.get(req.userId);
    if (creds) {
      creds.tokens = creds.tokens.filter(t => t !== token);
    }
  }
  res.json({ success: true });
});

// Get current user
app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    akariId: req.user.akariId,
    role: req.user.role,
    avatar: req.user.avatar,
  });
});

// =====================================================
// ADMIN ENDPOINTS
// =====================================================

// Create user account (admin only)
app.post('/api/admin/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const { name, email, akariId, role, avatar } = req.body;

  if (!name || !email || !akariId || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user exists
  if (Array.from(serverDb.users.values()).some(u => u.akariId === akariId)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const tempPassword = Math.random().toString(36).substr(2, 10);

  const newUser = {
    id: userId,
    name,
    email,
    akariId,
    role,
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: Date.now(),
    isActive: true,
  };

  serverDb.users.set(userId, newUser);
  serverDb.credentials.set(userId, { password: tempPassword, tokens: [] });

  res.json({
    user: newUser,
    tempPassword,
    message: 'User created. Share the temporary password with the user.',
  });
});

// List all users (for contacts)
app.get('/api/users', verifyToken, (req, res) => {
  const users = Array.from(serverDb.users.values())
    .filter(u => u.isActive && u.id !== req.userId)
    .map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      akariId: u.akariId,
      avatar: u.avatar,
      isOnline: userConnections.has(u.id),
    }));

  res.json(users);
});

// List all users (admin only)
app.get('/api/admin/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const users = Array.from(serverDb.users.values()).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    akariId: u.akariId,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  res.json(users);
});

// Disable user (admin only)
app.post('/api/admin/users/:userId/disable', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  const user = serverDb.users.get(req.params.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.isActive = false;
  res.json({ success: true });
});

// =====================================================
// MESSAGING ENDPOINTS
// =====================================================

// Get conversations (only user's conversations)
app.get('/api/conversations', verifyToken, (req, res) => {
  const conversations = Array.from(serverDb.conversations.values())
    .filter(c => c.participants.includes(req.userId))
    .map(c => ({
      ...c,
      otherUserId: c.participants.find(p => p !== req.userId),
      otherUser: serverDb.users.get(c.participants.find(p => p !== req.userId)),
    }));

  res.json(conversations);
});

// Get or create direct conversation
app.post('/api/conversations/direct', verifyToken, (req, res) => {
  const { otherUserId } = req.body;

  if (!otherUserId) {
    return res.status(400).json({ error: 'Missing otherUserId' });
  }

  const otherUser = serverDb.users.get(otherUserId);
  if (!otherUser || !otherUser.isActive) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if conversation exists
  let conversation = Array.from(serverDb.conversations.values()).find(
    c => c.type === 'direct' && 
         c.participants.includes(req.userId) && 
         c.participants.includes(otherUserId)
  );

  if (!conversation) {
    const convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    conversation = {
      id: convId,
      type: 'direct',
      participants: [req.userId, otherUserId],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    serverDb.conversations.set(convId, conversation);
    serverDb.messages.set(convId, []);
  }

  res.json(conversation);
});

// Get messages (only if user is participant)
app.get('/api/conversations/:conversationId/messages', verifyToken, (req, res) => {
  const { conversationId } = req.params;
  const conversation = serverDb.conversations.get(conversationId);

  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  if (!conversation.participants.includes(req.userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const messages = serverDb.messages.get(conversationId) || [];
  res.json(messages);
});

// Send message
app.post('/api/conversations/:conversationId/messages', verifyToken, (req, res) => {
  const { conversationId } = req.params;
  const { text, type } = req.body;

  const conversation = serverDb.conversations.get(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  if (!conversation.participants.includes(req.userId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!serverDb.messages.has(conversationId)) {
    serverDb.messages.set(conversationId, []);
  }

  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    conversationId,
    senderId: req.userId,
    senderName: req.user.name,
    senderAvatar: req.user.avatar,
    text,
    type: type || 'text',
    status: 'delivered',
    createdAt: Date.now(),
  };

  serverDb.messages.get(conversationId).push(message);
  conversation.updatedAt = Date.now();

  // Broadcast to recipient only
  const recipientId = conversation.participants.find(p => p !== req.userId);
  broadcastToUser(recipientId, {
    type: 'message',
    payload: message,
  });

  res.json(message);
});

// =====================================================
// HEALTH & SYNC
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// =====================================================
// WEBSOCKET HANDLING
// =====================================================

wss.on('connection', (ws, req) => {
  const token = new URL(req.url || '', 'http://localhost').searchParams.get('token');
  const userId = userSessions.get(token || '');

  if (!userId) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  console.log(`✅ ${userId} connected via WebSocket`);

  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(ws);

  // Notify all users that someone came online
  broadcastAll({
    type: 'user_online',
    payload: { userId, name: serverDb.users.get(userId)?.name },
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(message, userId, ws);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log(`❌ ${userId} disconnected`);
    const connections = userConnections.get(userId);
    if (connections) {
      connections.delete(ws);
      if (connections.size === 0) {
        userConnections.delete(userId);
        // Notify all users that someone went offline
        broadcastAll({
          type: 'user_offline',
          payload: { userId },
        });
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleWebSocketMessage(message: any, userId: string, ws: any) {
  const { type, payload } = message;

  switch (type) {
    case 'message':
      if (payload && payload.conversationId) {
        const conversation = serverDb.conversations.get(payload.conversationId);
        if (conversation && conversation.participants.includes(userId)) {
          if (!serverDb.messages.has(payload.conversationId)) {
            serverDb.messages.set(payload.conversationId, []);
          }

          const msg = {
            ...payload,
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            senderId: userId,
            createdAt: Date.now(),
            status: 'delivered',
          };

          serverDb.messages.get(payload.conversationId).push(msg);
          conversation.updatedAt = Date.now();

          // Send only to other participant
          const recipientId = conversation.participants.find(p => p !== userId);
          broadcastToUser(recipientId, {
            type: 'message',
            payload: msg,
          });
        }
      }
      break;

    case 'typing':
      if (payload && payload.conversationId) {
        const conversation = serverDb.conversations.get(payload.conversationId);
        if (conversation) {
          const recipientId = conversation.participants.find(p => p !== userId);
          broadcastToUser(recipientId, {
            type: 'typing',
            payload: { userId, isTyping: payload.isTyping },
          });
        }
      }
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      console.warn('Unknown message type:', type);
  }
}

function broadcastToUser(userId: string | undefined, message: any) {
  if (!userId) return;
  
  const connections = userConnections.get(userId);
  if (connections) {
    const messageStr = JSON.stringify(message);
    connections.forEach((ws) => {
      if (ws.readyState === 1) {
        ws.send(messageStr);
      }
    });
  }
}

function broadcastAll(message: any) {
  const messageStr = JSON.stringify(message);

  for (const connections of userConnections.values()) {
    connections.forEach((ws) => {
      if (ws.readyState === 1) {
        ws.send(messageStr);
      }
    });
  }
}

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not built. Run: npm run build' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Akari server running on http://0.0.0.0:${PORT}`);
  console.log(`📨 WebSocket available at ws://0.0.0.0:${PORT}`);
  console.log(`💾 Secure database initialized`);
  console.log(`Environment: ${NODE_ENV}`);
});
