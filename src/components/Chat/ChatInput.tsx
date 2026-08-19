import React, { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Message, MessageType } from '../../types';
import { AttachmentMenu } from './AttachmentMenu';
import { VoiceRecorder } from './VoiceRecorder';

interface ChatInputProps {
  replyToMessage: Message | null;
  onCancelReply: () => void;
  onSendMessage: (text: string) => void;
  onSendMedia: (file: File) => void;
  onSendVoiceNote: (durationSeconds: number) => void;
  onOpenLocationModal: () => void;
  onOpenContactModal: () => void;
  onOpenCameraModal: () => void;
  onTyping: (isTyping: boolean) => void;
}

const EMOJI_CATEGORIES: { name: string; emojis: string[] }[] = [
  {
    name: 'Émotions',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    name: 'Gestes',
    emojis: ['👍', '👎', '👌', '🤌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶']
  },
  {
    name: 'Symboles & Cœurs',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨', '🌟', '💫', '💥', '💯', '💢', '💬', '💭', '🗯️', '💤', '🎉', '🎊', '🎁', '🏆', '🥇', '🚀', '⚡', '💡']
  },
  {
    name: 'Nourriture & Boissons',
    emojis: ['☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🍳', '🧇', '🥞', '🥐', '🥖', '🥨', '🥯', '🧀', '🥗', '🥪', '🌮', '🌯', '🍣', '🍜', '🍱', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭']
  }
];

export const ChatInput: React.FC<ChatInputProps> = ({
  replyToMessage,
  onCancelReply,
  onSendMessage,
  onSendMedia,
  onSendVoiceNote,
  onOpenLocationModal,
  onOpenContactModal,
  onOpenCameraModal,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [activeEmojiCat, setActiveEmojiCat] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setIsEmojiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    // Auto expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    // Trigger typing state
    onTyping(true);
    if (typingTimeoutRef.current !== null) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div
      id="chat-input-bar-container"
      className="relative bg-[#f0f2f5] dark:bg-[#202c33] border-t border-[#e9edef] dark:border-[#222d34] px-3 py-2 select-none"
    >
      {/* Reply Banner */}
      {replyToMessage && (
        <div className="mb-2 p-2 bg-white dark:bg-[#182229] rounded-lg border-l-4 border-[#00a884] flex items-center justify-between shadow-xs">
          <div className="flex-1 min-w-0 mr-2">
            <span className="text-xs font-semibold text-[#00a884] block">
              Répondre à {replyToMessage.senderName}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate block">
              {replyToMessage.text || `[${replyToMessage.type}]`}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {isEmojiOpen && (
        <div
          ref={emojiRef}
          className="absolute bottom-16 left-3 w-80 sm:w-96 bg-white dark:bg-[#233138] rounded-xl shadow-2xl p-3 z-50 border border-gray-200 dark:border-gray-700 animate-in fade-in"
        >
          {/* Categories Tab */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 mb-2">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveEmojiCat(idx)}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                  activeEmojiCat === idx
                    ? 'bg-[#00a884] text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182229]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-8 gap-1 h-52 overflow-y-auto p-1">
            {EMOJI_CATEGORIES[activeEmojiCat].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-[#182229] rounded transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Popover Menu */}
      <AttachmentMenu
        isOpen={isAttachmentOpen}
        onClose={() => setIsAttachmentOpen(false)}
        onSelectImage={onSendMedia}
        onSelectDocument={onSendMedia}
        onOpenLocationModal={onOpenLocationModal}
        onOpenContactShareModal={onOpenContactModal}
        onOpenCameraModal={onOpenCameraModal}
      />

      {/* Input Bar Row */}
      {isRecordingVoice ? (
        <VoiceRecorder
          onCancel={() => setIsRecordingVoice(false)}
          onSendVoiceNote={(duration) => {
            setIsRecordingVoice(false);
            onSendVoiceNote(duration);
          }}
        />
      ) : (
        <div className="flex items-end gap-2">
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => {
              setIsEmojiOpen(!isEmojiOpen);
              setIsAttachmentOpen(false);
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Emojis"
          >
            <Smile className="w-6 h-6" />
          </button>

          {/* Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => {
              setIsAttachmentOpen(!isAttachmentOpen);
              setIsEmojiOpen(false);
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title="Joindre un fichier"
          >
            <Paperclip className="w-6 h-6 rotate-45" />
          </button>

          {/* Textarea Input */}
          <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg px-3.5 py-2 flex items-center shadow-xs min-h-[42px] max-h-[120px]">
            <textarea
              id="chat-message-textarea"
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Tapez un message..."
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none max-h-[100px] leading-relaxed"
            />
          </div>

          {/* Send / Mic Action Button */}
          {text.trim() ? (
            <button
              id="chat-send-btn"
              type="button"
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#029070] shadow-md transition-transform active:scale-95 shrink-0"
              title="Envoyer"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          ) : (
            <button
              id="chat-voice-record-btn"
              type="button"
              onClick={() => setIsRecordingVoice(true)}
              className="w-10 h-10 rounded-full bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#374248] flex items-center justify-center transition-colors shrink-0"
              title="Enregistrer un message vocal"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
