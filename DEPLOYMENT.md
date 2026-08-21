# Akari - Real-Time Messaging App

A fully-featured WhatsApp-like team collaboration platform with **real-time WebSocket messaging**, built with React 19, TypeScript, Express, and WebSocket.

## What Changed ✨

- **Removed blocking configs:** Firebase dependencies removed, Netlify config deprecated
- **WebSocket integration:** Real-time messaging sync between users
- **Combined frontend + backend:** Single Node.js server serves both
- **Production-ready:** ESM modules, proper error handling, scalable architecture

## Requirements

- **Node.js:** ≥18.0.0
- **npm:** ≥9.0.0

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Server starts on `http://localhost:3000` with WebSocket support at `ws://localhost:3000`.

## Production Build

```bash
npm run build
```

## Deployment

### Locally
```bash
npm run start
```

### Docker
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Cloud Deployment (Railway, Render, Heroku)

1. **Set environment variables:**
   ```
   NODE_ENV=production
   PORT=3000
   GEMINI_API_KEY=your_key_here
   ```

2. **Deploy:**
   - Railway: Connect GitHub repo, auto-deploys
   - Render: Create Web Service, select Node environment
   - Heroku: `git push heroku main` (requires Procfile)

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    restart: always
```

## Features

- 🔐 **User Authentication** via .akari identifiers
- 💬 **Real-time messaging** (text, images, videos, voice, documents)
- 👥 **Direct & group conversations**
- 📱 **Status/stories** with 24h expiry
- ☎️ **Call history** tracking
- 🔌 **WebSocket sync** across multiple tabs
- 🎨 **Theming** (light/dark mode)
- 🔊 **Sound effects** & notifications
- 👮 **Admin panel** for user management

## API Endpoints

- `GET /api/health` - Server health check
- `POST /api/messages` - Send message (REST fallback)
- `GET /api/messages/:conversationId` - Fetch messages

## WebSocket Protocol

**Connect:** `ws://localhost:3000?userId=<USER_ID>&conversationId=<CONV_ID>`

**Message types:**
```json
{
  "type": "message|typing|reaction|ping",
  "payload": { /* ... */ }
}
```

## File Structure

```
├── server.ts              # Express + WebSocket server
├── src/
│   ├── App.tsx           # Main React app
│   ├── services/
│   │   ├── storage.ts    # Data management + WebSocket client
│   │   ├── firebase.ts   # (Disabled)
│   │   └── mockData.ts   # Demo data
│   ├── components/       # React components
│   └── types.ts          # TypeScript interfaces
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Troubleshooting

**WebSocket not connecting:**
- Ensure `NODE_ENV` is set correctly
- Check firewall allows WebSocket connections
- Verify `ws://` protocol on HTTP, `wss://` on HTTPS

**Port in use:**
```bash
npm run start -- --port 4000
```

**Build size too large:**
- Disabled source maps in production
- Using Terser minification
- Tree-shaking enabled

## License

Private project - Akari Team House
