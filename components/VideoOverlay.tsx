import React from 'react';
import { Player, Position } from '../types';
import { SPATIAL_AUDIO_RADIUS } from '../constants';

interface VideoOverlayProps {
  peers: Player[];
  currentUserPos: Position;
  camOn: boolean;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ peers, currentUserPos, camOn }) => {
  
  // Calculate distance
  const getDistance = (p1: Position, p2: Position) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const nearbyPeers = peers.filter(p => getDistance(p.position, currentUserPos) < SPATIAL_AUDIO_RADIUS);

  // In a real app, this would map to WebRTC streams.
  // Here we simulate the "Active Video" UI.

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-40 pointer-events-none">
      {/* Self View */}
      {camOn && (
        <div className="w-48 h-32 bg-gray-900 rounded-lg border-2 border-indigo-500 shadow-lg overflow-hidden relative pointer-events-auto">
             <img src="https://picsum.photos/200/300" alt="Self" className="w-full h-full object-cover opacity-80" />
             <div className="absolute bottom-1 right-2 text-xs text-white bg-black/50 px-1 rounded">You</div>
        </div>
      )}

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
