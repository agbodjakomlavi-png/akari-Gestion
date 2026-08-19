import React, { useState, useRef } from 'react';
import { X, Type, Image, Send, Palette } from 'lucide-react';
import { User } from '../../types';

interface CreateStatusModalProps {
  currentUser: User;
  onClose: () => void;
  onPostStatus: (
    type: 'text' | 'image' | 'video',
    content: string,
    caption?: string,
    bgColor?: string,
    fontStyle?: 'sans' | 'serif' | 'mono'
  ) => void;
}

const BG_COLORS = [
  '#008069',
  '#53bdeb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#0284c7',
  '#16a34a',
  '#1f2937'
];

export const CreateStatusModal: React.FC<CreateStatusModalProps> = ({
  currentUser,
  onClose,
  onPostStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('#008069');
  const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setActiveTab('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (activeTab === 'text') {
      if (!textContent.trim()) return;
      onPostStatus('text', textContent.trim(), undefined, selectedBgColor, fontStyle);
    } else {
      if (!imagePreview) return;
      onPostStatus('image', imagePreview, imageCaption.trim());
    }
    onClose();
  };

  const cycleFont = () => {
    if (fontStyle === 'sans') setFontStyle('serif');
    else if (fontStyle === 'serif') setFontStyle('mono');
    else setFontStyle('sans');
  };

  return (
    <div
      id="create-status-modal"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

      <div className="relative w-full max-w-md h-[550px] bg-[#111b21] rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl border border-gray-800">
        {/* Header Tabs */}
        <div className="p-4 flex items-center justify-between z-20 border-b border-gray-800/80 bg-black/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeTab === 'text'
                  ? 'bg-[#00a884] text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/60'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Texte</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!imagePreview) {
                  fileInputRef.current?.click();
                } else {
                  setActiveTab('image');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeTab === 'image'
                  ? 'bg-[#00a884] text-white'
                  : 'text-gray-400 hover:text-white bg-gray-800/60'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>{imagePreview ? 'Photo prête' : 'Ajouter photo'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative flex items-center justify-center p-6">
          {activeTab === 'text' ? (
            <div
              className="w-full h-full rounded-xl flex flex-col items-center justify-center p-6 transition-colors"
              style={{ backgroundColor: selectedBgColor }}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Tapez un statut..."
                rows={5}
                className={`w-full bg-transparent text-white text-center text-xl font-bold placeholder-white/60 focus:outline-none resize-none leading-relaxed ${
                  fontStyle === 'serif' ? 'font-serif' : fontStyle === 'mono' ? 'font-mono' : ''
                }`}
                autoFocus
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="max-h-[300px] max-w-full object-contain rounded-lg shadow-md"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-emerald-500 transition-colors"
                >
                  <Image className="w-12 h-12 stroke-1" />
                  <span className="text-xs font-medium">Cliquez pour choisir une photo</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-black/40 border-t border-gray-800/80 flex items-center justify-between gap-3">
          {activeTab === 'text' ? (
            <div className="flex items-center gap-2">
              {/* Palette BG colors */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] no-scrollbar py-1">
                {BG_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedBgColor(col)}
                    className={`w-6 h-6 rounded-full shrink-0 border-2 transition-transform ${
                      selectedBgColor === col ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>

              {/* Font switch */}
              <button
                type="button"
                onClick={cycleFont}
                className="px-2.5 py-1 rounded bg-gray-800 text-xs font-bold text-white hover:bg-gray-700"
              >
                {fontStyle.toUpperCase()}
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              placeholder="Ajouter une légende..."
              className="flex-1 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          )}

          {/* Post Button */}
          <button
            type="button"
            onClick={handlePost}
            className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#029070] shadow-lg transition-transform active:scale-95 shrink-0"
            title="Publier le statut"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
