import React, { useRef, useEffect } from 'react';
import { Furniture, FurnitureType, Player } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '../constants';

interface MinimapProps {
  furniture: Furniture[];
  peers: Player[];
  currentUser: Player;
}

const Minimap: React.FC<MinimapProps> = ({ furniture, peers, currentUser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Constants for minimap size
  const WIDTH = 200;
  const HEIGHT = (MAP_HEIGHT / MAP_WIDTH) * WIDTH; // Maintain aspect ratio

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Background (Floor)
    ctx.fillStyle = 'rgba(31, 41, 55, 0.8)'; // Gray-800 transparent
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Calculate scale factors
    // Map data is in Grid Coordinates (0 to MAP_WIDTH)
    const scaleX = WIDTH / MAP_WIDTH;
    const scaleY = HEIGHT / MAP_HEIGHT;

    // Draw Walls and Structures (Static)
    furniture.forEach(item => {
      if (!item.position) return;
      if (item.type === FurnitureType.WALL) {
        ctx.fillStyle = '#6b7280'; // Gray-500
        ctx.fillRect(
          item.position.x * scaleX, 
          item.position.y * scaleY, 
          scaleX + 0.5, // +0.5 to avoid gaps in sub-pixel rendering
          scaleY + 0.5
        );
      }
    });

    // Draw Peers
    peers.forEach(peer => {
      const px = (peer.position.x / TILE_SIZE) * scaleX;
      const py = (peer.position.y / TILE_SIZE) * scaleY;

      ctx.fillStyle = peer.color;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Current User (Distinctive)
    const ux = (currentUser.position.x / TILE_SIZE) * scaleX;
    const uy = (currentUser.position.y / TILE_SIZE) * scaleY;

    // Pulse effect ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ux, uy, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ux, uy, 3, 0, Math.PI * 2);
    ctx.fill();

  }, [furniture, peers, currentUser]);

  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-none">
      <div className="border-2 border-gray-600 rounded-lg overflow-hidden shadow-2xl bg-gray-900">
        <canvas 
          ref={canvasRef} 
          width={WIDTH} 
          height={HEIGHT} 
          className="block"
        />
        <div className="bg-gray-800/90 text-[10px] text-gray-400 text-center py-0.5 font-mono border-t border-gray-700">
          MAP
        </div>
      </div>
    </div>
  );
};

export default Minimap;