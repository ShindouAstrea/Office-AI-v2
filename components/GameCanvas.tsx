import React, { useRef, useEffect, useState } from 'react';
import { Player, Furniture, FurnitureType, Position, Direction } from '../types';
import { TILE_SIZE, MOVE_SPEED, INTERACTION_RADIUS, AI_NPC_POSITION } from '../constants';

interface GameCanvasProps {
  currentUser: Player;
  peers: Player[];
  furniture: Furniture[];
  onMove: (newPos: Position) => void;
  onInteract: (targetId: string | null) => void;
  buildMode: boolean;
  onPlaceFurniture: (pos: Position) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  currentUser,
  peers,
  furniture,
  onMove,
  onInteract,
  buildMode,
  onPlaceFurniture
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>(0);
  
  // Local interpolation state
  const currentPosRef = useRef<Position>(currentUser.position);
  const [cameraOffset, setCameraOffset] = useState<Position>({ x: 0, y: 0 });

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check collision
  const checkCollision = (x: number, y: number): boolean => {
    // Check furniture
    for (const item of furniture) {
        // Simple AABB collision for tiles
        // Furniture positions are in TILE coordinates, user is in PIXELS
        const itemPixelX = item.position.x * TILE_SIZE;
        const itemPixelY = item.position.y * TILE_SIZE;
        
        // Player is roughly TILE_SIZE/2 radius
        // Let's assume player hitbox is slightly smaller than a tile center
        if (
            x > itemPixelX - TILE_SIZE / 2 &&
            x < itemPixelX + TILE_SIZE + TILE_SIZE / 2 &&
            y > itemPixelY - TILE_SIZE / 2 &&
            y < itemPixelY + TILE_SIZE + TILE_SIZE / 2
        ) {
            // Desk chairs are walkable, walls are not
            if (item.type === FurnitureType.WALL || item.type === FurnitureType.PLANT) return true;
        }
    }
    return false;
  };

  // Game Loop
  const update = () => {
    let dx = 0;
    let dy = 0;

    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) dy -= MOVE_SPEED;
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) dy += MOVE_SPEED;
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) dx -= MOVE_SPEED;
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) dx += MOVE_SPEED;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    const nextX = currentPosRef.current.x + dx;
    const nextY = currentPosRef.current.y + dy;

    if (!checkCollision(nextX, currentPosRef.current.y)) {
        currentPosRef.current.x = nextX;
    }
    if (!checkCollision(currentPosRef.current.x, nextY)) {
        currentPosRef.current.y = nextY;
    }

    // Sync back to parent occasionally or on stop
    // For this demo, we just update the ref and sync visually. 
    // In a real app, we'd throttle updates to server.
    if (dx !== 0 || dy !== 0) {
        onMove({ ...currentPosRef.current });
    }

    // Check interactions
    const distToNPC = Math.sqrt(
        Math.pow(currentPosRef.current.x - AI_NPC_POSITION.x, 2) + 
        Math.pow(currentPosRef.current.y - AI_NPC_POSITION.y, 2)
    );
    
    if (distToNPC < INTERACTION_RADIUS + 20) {
        onInteract('npc-gemini');
    } else {
        onInteract(null);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const camX = currentPosRef.current.x - ctx.canvas.width / 2;
    const camY = currentPosRef.current.y - ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // Draw Grid (Subtle)
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + (ctx.canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(camY / TILE_SIZE);
    const endRow = startRow + (ctx.canvas.height / TILE_SIZE) + 1;

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw Furniture
    furniture.forEach(item => {
        const x = item.position.x * TILE_SIZE;
        const y = item.position.y * TILE_SIZE;
        
        switch (item.type) {
            case FurnitureType.WALL:
                ctx.fillStyle = '#6b7280';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = '#374151'; // Shadow/Depth
                ctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);
                break;
            case FurnitureType.DESK:
                ctx.fillStyle = '#78350f';
                ctx.fillRect(x + 4, y + 10, TILE_SIZE - 8, TILE_SIZE - 20);
                break;
            case FurnitureType.PLANT:
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 15, 0, Math.PI * 2);
                ctx.fill();
                break;
            default:
                break;
        }
    });

    // Draw AI NPC
    ctx.fillStyle = '#8b5cf6'; // Violet
    ctx.beginPath();
    ctx.arc(AI_NPC_POSITION.x, AI_NPC_POSITION.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("AI Receptionist", AI_NPC_POSITION.x, AI_NPC_POSITION.y - 30);


    // Draw Peers
    peers.forEach(peer => {
        ctx.fillStyle = peer.color;
        ctx.beginPath();
        ctx.arc(peer.position.x, peer.position.y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e5e7eb';
        ctx.fillText(peer.name, peer.position.x, peer.position.y - 25);
    });

    // Draw Current User
    ctx.fillStyle = currentUser.color;
    ctx.shadowColor = currentUser.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(currentPosRef.current.x, currentPosRef.current.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Name tag
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(currentUser.name, currentPosRef.current.x, currentPosRef.current.y - 28);

    // Build mode highlight cursor
    if (buildMode) {
        // Snap to grid mouse
        // Note: Mouse tracking would need extra event listener logic, omitting for brevity in this specific loop
        // but showing the concept
    }

    ctx.restore();
  };

  const loop = () => {
    update();
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
      if (!buildMode || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert screen to world
      const camX = currentPosRef.current.x - canvasRef.current.width / 2;
      const camY = currentPosRef.current.y - canvasRef.current.height / 2;
      
      const worldX = clickX + camX;
      const worldY = clickY + camY;
      
      const gridX = Math.floor(worldX / TILE_SIZE);
      const gridY = Math.floor(worldY / TILE_SIZE);
      
      onPlaceFurniture({ x: gridX, y: gridY });
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="block cursor-crosshair"
      onClick={handleCanvasClick}
    />
  );
};

export default GameCanvas;
