import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  Monitor
} from 'lucide-react';
import { User } from '../../types';
import { Avatar } from '../Common/Avatar';
import { sounds } from '../../services/soundEffects';
import { formatDuration } from '../../utils/date';

interface CallModalProps {
  type: 'audio' | 'video';
  recipient: User;
  onEndCall: (durationSeconds: number) => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  type,
  recipient,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<'calling' | 'connected'>('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera & audio
  useEffect(() => {
    // Play dial tone
    sounds.playDialPulse();

    // Connect automatically after 3.5 seconds
    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 3500);

    // Try starting video stream if video call
    if (type === 'video' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or not available
        });
    }

    return () => {
      clearTimeout(connectTimer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [type]);

  // Duration timer
  useEffect(() => {
    if (callState === 'connected') {
      const interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  const toggleMic = () => {
    setIsMuted(!isMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
  };

  const toggleCamera = () => {
    setIsVideoOff(!isVideoOff);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
    }
  };

  const handleHangUp = () => {
    sounds.playCallEndSound();
    onEndCall(duration);
  };

  return (
    <div
      id="active-call-modal"
      className="fixed inset-0 z-50 bg-[#111b21] flex items-center justify-center select-none animate-in fade-in"
    >
      <div className="relative w-full h-full sm:max-w-4xl sm:max-h-[90vh] sm:rounded-2xl overflow-hidden bg-[#0c1317] flex flex-col justify-between shadow-2xl border border-gray-800">
        {/* Top Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar src={recipient.avatar} name={recipient.name} size="md" />
            <div className="flex flex-col text-white">
              <span className="text-sm font-semibold">{recipient.name}</span>
              <span className="text-xs text-emerald-400 font-medium">
                {callState === 'calling' ? 'Appel en cours...' : formatDuration(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white">
            <span className="px-2.5 py-1 rounded-full bg-black/40 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
              🔒 Chiffré de bout en bout
            </span>
          </div>
        </div>

        {/* Video / Visual Stage */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {type === 'video' && !isVideoOff ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Remote simulation video */}
              <div className="w-full h-full bg-[#182229] flex flex-col items-center justify-center relative">
                <img
                  src={recipient.avatar}
                  alt={recipient.name}
                  className="w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-emerald-500/40 animate-pulse"
                />
                <p className="mt-4 text-white/80 font-medium text-sm">
                  {callState === 'calling' ? 'Connexion vidéo...' : 'Flux vidéo actif'}
                </p>
              </div>

              {/* Local Video Picture-in-Picture */}
              <div className="absolute top-4 right-4 w-32 h-44 sm:w-44 sm:h-56 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              </div>
            </div>
          ) : (
            /* Audio Call Screen */
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="relative">
                <Avatar
                  src={recipient.avatar}
                  name={recipient.name}
                  size="2xl"
                  className="ring-8 ring-emerald-500/20"
                />
                {callState === 'calling' && (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-30" />
                )}
              </div>

              <h2 className="mt-6 text-xl sm:text-2xl font-bold text-white">
                {recipient.name}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {callState === 'calling' ? 'Sonnerie...' : `Appel vocal • ${formatDuration(duration)}`}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-4 z-20">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            title={isMuted ? 'Activer micro' : 'Couper micro'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video (if video call) */}
          {type === 'video' && (
            <button
              type="button"
              onClick={toggleCamera}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
              title={isVideoOff ? 'Activer caméra' : 'Couper caméra'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* Speaker */}
          <button
            type="button"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              !isSpeakerOn ? 'bg-red-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            title="Haut-parleur"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Hang Up Red Button */}
          <button
            type="button"
            onClick={handleHangUp}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-transform active:scale-90"
            title="Raccrocher"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
