import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/auth';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  type: string;
  status: string;
  createdAt: number;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

interface PrivateChatProps {
  contact: Contact;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  onBack: () => void;
}

export function PrivateChat({
  contact,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onBack,
}: PrivateChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (ws) ws.close();
    };
  }, [contact.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Get or create conversation
      const response = await authService.fetchWithAuth(
        `${window.location.origin}/api/conversations/direct`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otherUserId: contact.id }),
        }
      );

      if (!response.ok) throw new Error('Failed to create conversation');

      const conversation = await response.json();
      setConversationId(conversation.id);

      // Fetch messages
      const messagesResponse = await authService.fetchWithAuth(
        `${window.location.origin}/api/conversations/${conversation.id}/messages`
      );

      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        setMessages(data);
      }

      // Connect WebSocket
      const token = authService.getToken();
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}?token=${token}`);

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'message' && message.payload.conversationId === conversation.id) {
            setMessages(prev => [...prev, message.payload]);
          } else if (message.type === 'typing' && message.payload.userId === contact.id) {
            setIsTyping(message.payload.isTyping);
          }
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(socket);
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !conversationId || !ws || ws.readyState !== WebSocket.OPEN) return;

    try {
      const response = await authService.fetchWithAuth(
        `${window.location.origin}/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            type: 'text',
          }),
        }
      );

      if (response.ok) {
        const message = await response.json();
        setMessages(prev => [...prev, message]);
        setText('');
        
        // Send via WebSocket too
        ws.send(JSON.stringify({
          type: 'message',
          payload: message,
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (ws && ws.readyState === WebSocket.OPEN && conversationId) {
      ws.send(JSON.stringify({
        type: 'typing',
        payload: { conversationId, isTyping: true },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chargement de la conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{contact.name}</p>
          <p className="text-xs text-gray-500">
            {contact.isOnline ? '🟢 En ligne' : '⚪ Hors ligne'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun message. Commencez la conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.senderId === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.senderId !== currentUserId && (
                <img
                  src={message.senderAvatar}
                  alt={message.senderName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}

              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === currentUserId
                    ? 'bg-[#00a884] text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm break-words">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === currentUserId ? 'text-green-100' : 'text-gray-600'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex gap-2">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="bg-gray-200 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-600">Typing...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 flex gap-2"
      >
        <input
          type="text"
          placeholder="Écrivez votre message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={handleTyping}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a884]"
        />
        
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-[#00a884] hover:bg-[#008069] text-white p-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
