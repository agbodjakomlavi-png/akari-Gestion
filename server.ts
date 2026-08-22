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
// SHARED SERVER DATABASE (replaces localStorage)
// =====================================================
const serverDb = {
  conversations: new Map(),
  messages: new Map(),
  users: new Map(),
};

// Initialize with mock data
function initializeDb() {
  // Mock users
  const mockUsers = [
    {
      id: 'user_admin',
      akariId: 'admin.akari',
      name: 'Admin Akari',
      email: 'admin@akari.team',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      isOnline: true,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    },
    {
      id: 'user_sophie',
      akariId: 'sophie.secretaire.akari',
      name: 'Sophie Secrétaire',
      email: 'sophie@akari.team',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'secretaire',
      isOnline: true,
      lastSeen: Date.now(),
      createdAt: Date.now(),
    },
  ];

  mockUsers.forEach(user => {
    serverDb.users.set(user.id, user);
  });

  // Mock conversation
  const mockConv = {
    id: 'conv_admin_sophie',
    type: 'direct',
    participants: ['user_admin', 'user_sophie'],
    unreadCounts: { user_admin: 0, user_sophie: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  serverDb.conversations.set(mockConv.id, mockConv);
  serverDb.messages.set(mockConv.id, []);
}

initializeDb();

const userConnections: Map<string, Set<any>> = new Map();
const conversationUsers: Map<string, Set<string>> = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from dist directory
const distPath = join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1h',
    etag: false,
    index: false,
  }));
}

// =====================================================
// REST API ENDPOINTS
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Sync all data (conversations, users, messages)
app.get('/api/sync', (req, res) => {
  const conversations = Array.from(serverDb.conversations.values());
  const messages: Record<string, any[]> = {};
  const users = Array.from(serverDb.users.values());

  // Include messages for each conversation
  for (const [convId, msgs] of serverDb.messages) {
    messages[convId] = msgs;
  }

  res.json({
    conversations,
    messages,
    users,
    timestamp: Date.now(),
  });
});

// Get single user by ID or akariId
app.get('/api/users/:identifier', (req, res) => {
  const { identifier } = req.params;
  
  let user = Array.from(serverDb.users.values()).find(
    u => u.id === identifier || u.akariId === identifier || u.email === identifier
  );

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Create or update user
app.post('/api/users', (req, res) => {
  const user = req.body;
  
  if (!user.id) {
    user.id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  }

  serverDb.users.set(user.id, user);
  
  // Broadcast user update to all connected clients
  broadcastAll({
    type: 'user_updated',
    payload: user,
  });

  res.json(user);
});

// Get all conversations for a user
app.get('/api/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  const conversations = Array.from(serverDb.conversations.values())
    .filter(c => c.participants.includes(userId));
  
  res.json(conversations);
});

// Create conversation
app.post('/api/conversations', (req, res) => {
  const { type, participants, name, description } = req.body;
  
  const convId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const conversation = {
    id: convId,
    type,
    participants: Array.from(new Set(participants)),
    name,
    description,
    unreadCounts: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  participants.forEach(pid => {
    conversation.unreadCounts[pid] = 0;
  });

  serverDb.conversations.set(convId, conversation);
  serverDb.messages.set(convId, []);

  // Broadcast new conversation
  broadcastAll({
    type: 'conversation_created',
    payload: conversation,
  });

  res.json(conversation);
});

// Get messages for a conversation
app.get('/api/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const messages = serverDb.messages.get(conversationId) || [];
  res.json(messages);
});

// Send message (REST endpoint)
app.post('/api/messages', (req, res) => {
  const { conversationId, message } = req.body;
  
  if (!conversationId || !message) {
    return res.status(400).json({ error: 'Missing conversationId or message' });
  }

  if (!serverDb.messages.has(conversationId)) {
    serverDb.messages.set(conversationId, []);
  }

  const storedMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    conversationId,
    createdAt: Date.now(),
    status: 'delivered',
  };

  serverDb.messages.get(conversationId).push(storedMessage);

  // Update conversation lastMessage
  const conv = serverDb.conversations.get(conversationId);
  if (conv) {
    conv.lastMessage = storedMessage;
    conv.updatedAt = Date.now();
  }

  // Broadcast to all connected users in this conversation
  broadcastToConversation(conversationId, {
    type: 'message',
    payload: storedMessage,
  });

  res.json(storedMessage);
});

// =====================================================
// WEBSOCKET HANDLING
// =====================================================

wss.on('connection', (ws, req) => {
  const userId = new URL(req.url || '', 'http://localhost').searchParams.get('userId');
  const conversationId = new URL(req.url || '', 'http://localhost').searchParams.get('conversationId');

  if (!userId) {
    ws.close(1008, 'Missing userId');
    return;
  }

  console.log(`👤 User ${userId} connected`);

  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(ws);

  // Send initial sync
  ws.send(JSON.stringify({
    type: 'sync',
    payload: {
      conversations: Array.from(serverDb.conversations.values()),
      messages: Object.fromEntries(serverDb.messages),
      users: Array.from(serverDb.users.values()),
    },
  }));

  if (conversationId) {
    if (!conversationUsers.has(conversationId)) {
      conversationUsers.set(conversationId, new Set());
    }
    conversationUsers.get(conversationId)!.add(userId);

    // Notify others that user joined
    broadcastToConversation(conversationId, {
      type: 'user_joined',
      payload: { userId },
    });
  }

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(message, userId, conversationId, ws);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log(`👋 User ${userId} disconnected`);
    
    const userWs = userConnections.get(userId);
    if (userWs) {
      userWs.delete(ws);
      if (userWs.size === 0) {
        userConnections.delete(userId);
      }
    }

    if (conversationId) {
      const convUsers = conversationUsers.get(conversationId);
      if (convUsers) {
        convUsers.delete(userId);
        if (convUsers.size === 0) {
          conversationUsers.delete(conversationId);
        } else {
          broadcastToConversation(conversationId, {
            type: 'user_left',
            payload: { userId },
          });
        }
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function handleWebSocketMessage(message: any, userId: string, conversationId: string | null, ws: any) {
  const { type, payload } = message;

  switch (type) {
    case 'message':
      if (!conversationId || !payload) break;

      if (!serverDb.messages.has(conversationId)) {
        serverDb.messages.set(conversationId, []);
      }

      const storedMsg = {
        ...payload,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        senderId: userId,
        conversationId,
        createdAt: Date.now(),
        status: 'delivered',
      };

      serverDb.messages.get(conversationId)!.push(storedMsg);

      // Update conversation
      const conv = serverDb.conversations.get(conversationId);
      if (conv) {
        conv.lastMessage = storedMsg;
        conv.updatedAt = Date.now();
      }

      // Broadcast to all users in conversation
      broadcastToConversation(conversationId, {
        type: 'message',
        payload: storedMsg,
      });
      break;

    case 'typing':
      if (conversationId) {
        broadcastToConversation(conversationId, {
          type: 'typing',
          payload: { userId, isTyping: payload.isTyping },
        });
      }
      break;

    case 'join_conversation':
      if (payload.conversationId) {
        const convId = payload.conversationId;
        if (!conversationUsers.has(convId)) {
          conversationUsers.set(convId, new Set());
        }
        conversationUsers.get(convId)!.add(userId);

        // Send messages for this conversation
        const messages = serverDb.messages.get(convId) || [];
        ws.send(JSON.stringify({
          type: 'conversation_messages',
          payload: { conversationId: convId, messages },
        }));

        broadcastToConversation(convId, {
          type: 'user_joined',
          payload: { userId },
        });
      }
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      console.warn('Unknown message type:', type);
  }
}

function broadcastToConversation(conversationId: string, message: any) {
  const users = conversationUsers.get(conversationId) || new Set();
  const messageStr = JSON.stringify(message);

  users.forEach((userId) => {
    const connections = userConnections.get(userId);
    if (connections) {
      connections.forEach((ws) => {
        if (ws.readyState === 1) {
          ws.send(messageStr);
        }
      });
    }
  });
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

// SPA fallback: serve index.html for all unmatched routes
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
  console.log(`💾 Shared database initialized`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Static files: ${fs.existsSync(distPath) ? 'Ready' : 'Not built (run npm run build)'}`);
});
