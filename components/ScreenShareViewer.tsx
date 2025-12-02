import React, { useEffect, useRef } from 'react';
import { X, Maximize2 } from 'lucide-react';

interface ScreenShareViewerProps {
  stream: MediaStream;
  sharerName: string;
  onClose: () => void;
}

const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({ stream, sharerName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="fixed inset-0 z-40 bg-gray-900/95 flex flex-col items-center justify-center pb-24 pt-4 animate-fadeIn">
      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center px-6 py-2 mb-2">
        <div className="flex items-center gap-2 text-white">
            <Maximize2 size={20} className="text-indigo-400"/>
            <span className="font-bold text-lg">Compartiendo pantalla: <span className="text-indigo-300">{sharerName}</span></span>
        </div>
        <button 
            onClick={onClose}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/50 rounded-lg px-4 py-2 flex items-center gap-2 transition-all font-bold"
        >
            <X size={18} /> Salir de Pantalla Completa
        </button>
      </div>

      {/* Video Container */}
      <div className="w-full max-w-7xl flex-1 px-4 relative flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full border-2 border-gray-700 rounded-xl bg-black overflow-hidden shadow-2xl">
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted // Mute local mainly, but usually screen share audio is handled differently. Safe to mute for display.
                className="w-full h-full object-contain"
            />
        </div>
      </div>
    </div>
  );
};

export default ScreenShareViewer;