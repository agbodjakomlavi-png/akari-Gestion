import React, { useState } from 'react';
import { X, MapPin, Navigation, Send } from 'lucide-react';
import { LocationData } from '../../types';

interface LocationModalProps {
  onClose: () => void;
  onSendLocation: (location: LocationData) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  onClose,
  onSendLocation,
}) => {
  const [name, setName] = useState('Position actuelle');
  const [address, setAddress] = useState('Paris, France');
  const [latitude, setLatitude] = useState(48.8566);
  const [longitude, setLongitude] = useState(2.3522);
  const [isLocating, setIsLocating] = useState(false);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setName('Ma position GPS en direct');
          setAddress(`Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          // Fallback to default
        }
      );
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSendLocation({
      latitude,
      longitude,
      name: name.trim() || 'Position partagée',
      address: address.trim() || undefined,
    });
    onClose();
  };

  return (
    <div
      id="location-share-modal"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 select-none animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Partager une position
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Live Button */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-[#00a884] font-semibold text-xs rounded-xl border border-emerald-500/30 transition-colors"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Géolocalisation...' : 'Obtenir ma position GPS actuelle'}</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Nom du lieu
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#202c33] text-sm text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Adresse ou coordonnées
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#202c33] text-sm text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#00a884] text-white font-semibold text-sm rounded-lg hover:bg-[#029070] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer la position</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
