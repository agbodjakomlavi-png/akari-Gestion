import React, { useRef } from 'react';
import { Image, Camera, FileText, MapPin, UserCheck, X } from 'lucide-react';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (file: File) => void;
  onSelectDocument: (file: File) => void;
  onOpenLocationModal: () => void;
  onOpenContactShareModal: () => void;
  onOpenCameraModal: () => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  onSelectDocument,
  onOpenLocationModal,
  onOpenContactShareModal,
  onOpenCameraModal,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div
      id="attachment-menu"
      className="absolute bottom-16 left-3 bg-white dark:bg-[#233138] rounded-2xl shadow-2xl p-4 z-40 border border-gray-100 dark:border-gray-700/60 animate-in fade-in slide-in-from-bottom-4 duration-150 select-none"
    >
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onSelectImage(e.target.files[0]);
            onClose();
          }
        }}
      />

      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onSelectDocument(e.target.files[0]);
            onClose();
          }
        }}
      />

      <div className="grid grid-cols-3 gap-4">
        {/* Photo & Video */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Image className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
            Photos & Vidéos
          </span>
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={() => {
            onOpenCameraModal();
            onClose();
          }}
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
            Caméra
          </span>
        </button>

        {/* Document */}
        <button
          type="button"
          onClick={() => docInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
            Document
          </span>
        </button>

        {/* Location */}
        <button
          type="button"
          onClick={() => {
            onOpenLocationModal();
            onClose();
          }}
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
            Localisation
          </span>
        </button>

        {/* Contact */}
        <button
          type="button"
          onClick={() => {
            onOpenContactShareModal();
            onClose();
          }}
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <UserCheck className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
            Contact
          </span>
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex flex-col items-center gap-1.5 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-md group-hover:scale-105 transition-transform">
            <X className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-200">
            Fermer
          </span>
        </button>
      </div>
    </div>
  );
};
