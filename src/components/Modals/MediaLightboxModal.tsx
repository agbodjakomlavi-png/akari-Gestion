import React from 'react';
import { X, Download } from 'lucide-react';

interface MediaLightboxModalProps {
  url: string;
  type: 'image' | 'video';
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  url,
  type,
  onClose,
}) => {
  return (
    <div
      id="media-lightbox-modal"
      className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 select-none animate-in fade-in"
      onClick={onClose}
    >
      {/* Header toolbar */}
      <div
        className="flex items-center justify-end gap-3 p-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={url}
          download="media"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          title="Télécharger"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Media View */}
      <div
        className="flex-1 flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'image' ? (
          <img
            src={url}
            alt="Média"
            referrerPolicy="no-referrer"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl"
          />
        )}
      </div>

      <div className="h-4" />
    </div>
  );
};
