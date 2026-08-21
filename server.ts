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
const wss = new WebSocketServer({ server });

const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const VITE_MANIFEST = 'dist/.vite/manifest.json';

// In-memory data store (replace with database in production)
const messageStore: Record<string, any[]> = {};
const userConnections: Map<string, Set<any>> = new Map();
const conversationUsers: Map<string, Set<string>> = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve built frontend in production
if (NODE_ENV === 'production' && fs.existsSync('dist')) {
  app.use(express.static('dist'));
}

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/messages', (req, res) => {
  const { conversationId, message } = req.body;
  if (!conversationId || !message) {
    return res.status(400).json({ error: 'Missing conversationId or message' });
  }

  if (!messageStore[conversationId]) {
    messageStore[conversationId] = [];
  }

  const storedMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
    status: 'delivered',
  };

  messageStore[conversationId].push(storedMessage);

  // Broadcast to connected users
  broadcastToConversation(conversationId, {
    type: 'message',
    payload: storedMessage,
  });

  res.json(storedMessage);
});

app.get('/api/messages/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const messages = messageStore[conversationId] || [];
  res.json(messages);
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const userId = new URL(req.url || '', 'http://localhost').searchParams.get('userId');
  const conversationId = new URL(req.url || '', 'http://localhost').searchParams.get('conversationId');

  if (!userId) {
    ws.close(1008, 'Missing userId');
    return;
  }

  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(ws);

  if (conversationId) {
    if (!conversationUsers.has(conversationId)) {
      conversationUsers.set(conversationId, new Set());
    }
    conversationUsers.get(conversationId)!.add(userId);

    ws.send(
      JSON.stringify({
        type: 'joined',
        payload: {
          conversationId,
          userId,
          users: Array.from(conversationUsers.get(conversationId) || []),
        },
      })
    );

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
      if (!conversationId) {
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'No conversation' } }));
        return;
      }

      if (!messageStore[conversationId]) {
        messageStore[conversationId] = [];
      }

      const storedMsg = {
        ...payload,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        senderId: userId,
        createdAt: Date.now(),
        status: 'delivered',
      };

      messageStore[conversationId].push(storedMsg);
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

    case 'reaction':
      if (conversationId && payload.messageId) {
        broadcastToConversation(conversationId, {
          type: 'reaction',
          payload: { messageId: payload.messageId, emoji: payload.emoji, userId },
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

// Catch-all for SPA routing in production
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Akari server running on http://0.0.0.0:${PORT}`);
  console.log(`📨 WebSocket available at ws://0.0.0.0:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
