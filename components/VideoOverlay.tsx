import React, { useEffect, useRef } from 'react';
import { Player, Position } from '../types';
import { SPATIAL_AUDIO_RADIUS } from '../constants';
import { Monitor, Maximize } from 'lucide-react';

interface VideoOverlayProps {
  peers: Player[];
  currentUserPos: Position;
  screenShares: { playerId: string; stream: MediaStream; playerName: string }[];
  onMaximizeScreen: (id: string) => void;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ peers, currentUserPos, screenShares, onMaximizeScreen }) => {
  
  // Calculate distance
  const getDistance = (p1: Position, p2: Position) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const nearbyPeers = peers.filter(p => getDistance(p.position, currentUserPos) < SPATIAL_AUDIO_RADIUS);

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-4 z-40 pointer-events-none items-end">
      
      {/* --- SCREEN SHARE THUMBNAILS --- */}
      {screenShares.length > 0 && (
          <div className="flex flex-col gap-2 mb-4 pointer-events-auto">
              <h3 className="text-white text-xs font-bold text-right uppercase bg-black/50 px-2 py-1 rounded self-end backdrop-blur-sm">
                  Pantallas Compartidas
              </h3>
              {screenShares.map((share) => (
                  <ScreenThumbnail 
                    key={share.playerId} 
                    share={share} 
                    onClick={() => onMaximizeScreen(share.playerId)} 
                  />
              ))}
          </div>
      )}

      {/* --- PEER AVATAR CARDS --- */}
      <div className="flex flex-col gap-2 items-end">
        {nearbyPeers.map(peer => (
            <div key={peer.id} className="w-32 h-24 bg-gray-800 rounded-lg border border-gray-600 shadow-lg overflow-hidden relative animate-fadeIn pointer-events-auto">
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="text-xl font-bold" style={{ color: peer.color }}>
                        {peer.name.charAt(0)}
                    </div>
                </div>
                <div className="absolute bottom-1 left-1 text-[10px] text-white bg-black/50 px-1 rounded truncate max-w-[90%]">
                    {peer.name}
                </div>
                <div className="absolute top-1 right-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-glow"></div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

// Helper component for video element refs
const ScreenThumbnail: React.FC<{ share: { playerId: string; stream: MediaStream; playerName: string }, onClick: () => void }> = ({ share, onClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && share.stream) {
            videoRef.current.srcObject = share.stream;
        }
    }, [share.stream]);

    return (
        <div 
            onClick={onClick}
            className="w-56 h-36 bg-gray-900 rounded-lg border-2 border-indigo-500 shadow-2xl overflow-hidden relative cursor-pointer hover:scale-105 transition-transform group"
        >
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            
            {/* Overlay Info */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-2 rounded-full">
                <Maximize size={24} className="text-white" />
            </div>

            <div className="absolute bottom-0 w-full bg-indigo-900/80 p-1 flex items-center gap-2">
                <Monitor size={12} className="text-white" />
                <span className="text-[10px] text-white font-bold truncate">
                    {share.playerName} está compartiendo
                </span>
            </div>
        </div>
    );
};

export default VideoOverlay;