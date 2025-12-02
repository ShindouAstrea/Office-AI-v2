import React from 'react';
import { Player, Position } from '../types';
import { SPATIAL_AUDIO_RADIUS } from '../constants';

interface VideoOverlayProps {
  peers: Player[];
  currentUserPos: Position;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ peers, currentUserPos }) => {
  
  // Calculate distance
  const getDistance = (p1: Position, p2: Position) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const nearbyPeers = peers.filter(p => getDistance(p.position, currentUserPos) < SPATIAL_AUDIO_RADIUS);

  // Displays indicators for nearby peers (active speakers, etc.)
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-40 pointer-events-none">
      
      {/* Peer Views */}
      {nearbyPeers.map(peer => (
        <div key={peer.id} className="w-48 h-32 bg-gray-800 rounded-lg border border-gray-600 shadow-lg overflow-hidden relative animate-fadeIn pointer-events-auto">
             <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-2xl font-bold" style={{ color: peer.color }}>
                    {peer.name.charAt(0)}
                </div>
             </div>
             <div className="absolute bottom-1 left-2 text-xs text-white bg-black/50 px-1 rounded truncate max-w-[100px]">
                 {peer.name}
             </div>
             <div className="absolute top-1 right-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow"></div>
             </div>
        </div>
      ))}
    </div>
  );
};

export default VideoOverlay;