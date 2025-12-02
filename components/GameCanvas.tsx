import React, { useRef, useEffect, useState } from 'react';
import { Player, Furniture, FurnitureType, Position } from '../types';
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
        // Skip walkable items
        if (item.type === FurnitureType.FLOOR || item.type === FurnitureType.CHAIR) continue;

        const itemPixelX = item.position.x * TILE_SIZE;
        const itemPixelY = item.position.y * TILE_SIZE;
        
        // Player is roughly TILE_SIZE/2 radius
        // Hitbox slightly smaller than tile to allow squeezing through
        const hitboxPadding = 5;
        if (
            x > itemPixelX - TILE_SIZE / 2 + hitboxPadding &&
            x < itemPixelX + TILE_SIZE + TILE_SIZE / 2 - hitboxPadding &&
            y > itemPixelY - TILE_SIZE / 2 + hitboxPadding &&
            y < itemPixelY + TILE_SIZE + TILE_SIZE / 2 - hitboxPadding
        ) {
             return true;
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

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // 1. Background (Wood Floor)
    ctx.fillStyle = '#eaddcf'; // Warm wood color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const camX = currentPosRef.current.x - ctx.canvas.width / 2;
    const camY = currentPosRef.current.y - ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // 2. Floor Pattern (Subtle Tiles)
    ctx.strokeStyle = '#dcc1ab';
    ctx.lineWidth = 1;
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + (ctx.canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(camY / TILE_SIZE);
    const endRow = startRow + (ctx.canvas.height / TILE_SIZE) + 1;

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        // Draw tile lines
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE, r * TILE_SIZE);
        ctx.lineTo((c + 1) * TILE_SIZE, r * TILE_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE, r * TILE_SIZE);
        ctx.lineTo(c * TILE_SIZE, (r + 1) * TILE_SIZE);
        ctx.stroke();
      }
    }

    // 3. Draw Floor Objects (Rugs) first so they are under everything
    furniture.filter(f => f.type === FurnitureType.FLOOR).forEach(item => {
        const x = item.position.x * TILE_SIZE;
        const y = item.position.y * TILE_SIZE;
        
        // Use rotation to determine color/style
        // 0: Work Rug (Gray/Blue), 90: Meeting Rug (Blue), 180: Lounge Rug (Red/Orange)
        let color = '#dfe6e9';
        let width = 6 * TILE_SIZE;
        let height = 4 * TILE_SIZE;

        if (item.rotation === 90) { // Meeting
            color = '#81ecec'; 
            width = 8 * TILE_SIZE;
            height = 6 * TILE_SIZE;
        } else if (item.rotation === 180) { // Lounge
            color = '#ffccc7'; // Soft red
            width = 10 * TILE_SIZE;
            height = 7 * TILE_SIZE;
        }

        ctx.fillStyle = color;
        // Draw rounded rect rug
        drawRoundedRect(ctx, x, y, width, height, 20);
        
        // Rug border
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // 4. Sort remaining entities by Y position for proper depth sorting (z-index)
    // We mix furniture and players in one render pass
    const renderables = [
        ...furniture.filter(f => f.type !== FurnitureType.FLOOR).map(f => ({ type: 'furniture', data: f, y: f.position.y * TILE_SIZE })),
        ...peers.map(p => ({ type: 'peer', data: p, y: p.position.y })),
        { type: 'player', data: currentUser, y: currentPosRef.current.y },
        { type: 'npc', data: { position: AI_NPC_POSITION }, y: AI_NPC_POSITION.y }
    ];

    renderables.sort((a, b) => a.y - b.y);

    renderables.forEach(item => {
        if (item.type === 'furniture') {
            const f = item.data as Furniture;
            const x = f.position.x * TILE_SIZE;
            const y = f.position.y * TILE_SIZE;

            if (f.type === FurnitureType.WALL) {
                // 2.5D Wall
                const height = TILE_SIZE + 15;
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(x + 5, y + 5, TILE_SIZE, TILE_SIZE);
                
                // Front Face
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(x, y - 15, TILE_SIZE, height);
                
                // Top Face (Lighter)
                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(x, y - 15, TILE_SIZE, 15);
                
                // Border
                ctx.strokeStyle = '#7f8c8d';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y - 15, TILE_SIZE, height);
            } 
            else if (f.type === FurnitureType.DESK) {
                // Wood Desk
                // Legs
                ctx.fillStyle = '#a1835d'; // Darker wood
                ctx.fillRect(x + 5, y + 20, 5, 20);
                ctx.fillRect(x + TILE_SIZE - 10, y + 20, 5, 20);

                // Top
                ctx.fillStyle = '#eebb88'; // Nice oak
                drawRoundedRect(ctx, x, y + 5, TILE_SIZE, 30, 4);
                
                // Shadow underneath
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(x + 2, y + 35, TILE_SIZE - 4, 8);

                // Laptop
                ctx.fillStyle = '#dfe6e9';
                ctx.fillRect(x + 12, y + 10, 24, 16);
                ctx.fillStyle = '#2d3436'; // Screen off
                ctx.fillRect(x + 14, y + 12, 20, 12);
            }
            else if (f.type === FurnitureType.PLANT) {
                // Pot
                ctx.fillStyle = '#e17055'; // Terracotta
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2 + 5, 12, 0, Math.PI * 2);
                ctx.fill();

                // Leaves
                ctx.fillStyle = '#00b894';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2 - 8, y + TILE_SIZE/2 - 5, 10, 0, Math.PI * 2);
                ctx.arc(x + TILE_SIZE/2 + 8, y + TILE_SIZE/2 - 5, 10, 0, Math.PI * 2);
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2 - 12, 12, 0, Math.PI * 2);
                ctx.fill();
            }
            else if (f.type === FurnitureType.CHAIR) {
                // Chair seat
                ctx.fillStyle = '#fab1a0'; // Soft red/orange
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 14, 0, Math.PI * 2);
                ctx.fill();
                // Backrest (darker)
                ctx.fillStyle = '#e17055';
                ctx.beginPath();
                // Simple orientation based on rotation
                // Default back is 'North' for 0
                const offset = 10;
                let bx = x + TILE_SIZE/2;
                let by = y + TILE_SIZE/2 - offset;
                
                if (f.rotation === 90) { bx = x + TILE_SIZE/2 + offset; by = y + TILE_SIZE/2; }
                if (f.rotation === 180) { bx = x + TILE_SIZE/2; by = y + TILE_SIZE/2 + offset; }
                if (f.rotation === 270) { bx = x + TILE_SIZE/2 - offset; by = y + TILE_SIZE/2; }
                
                ctx.arc(bx, by, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        } 
        else if (item.type === 'npc') {
             // Draw AI NPC (Nova)
             const px = AI_NPC_POSITION.x;
             const py = AI_NPC_POSITION.y;
             
             // Halo effect
             ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
             ctx.beginPath();
             ctx.arc(px, py, 25 + Math.sin(Date.now() / 500) * 3, 0, Math.PI * 2);
             ctx.fill();

             ctx.fillStyle = '#8b5cf6'; // Violet body
             ctx.beginPath();
             ctx.arc(px, py, 16, 0, Math.PI * 2);
             ctx.fill();
             
             // Robot eyes
             ctx.fillStyle = 'white';
             ctx.beginPath();
             ctx.arc(px - 5, py - 2, 4, 0, Math.PI * 2);
             ctx.arc(px + 5, py - 2, 4, 0, Math.PI * 2);
             ctx.fill();

             ctx.fillStyle = 'white';
             ctx.font = 'bold 12px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText("Nova", px, py - 25);
        }
        else {
            // Player or Peer
            const p = item.data as Player;
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(p.position.x, p.position.y + 15, 12, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Body
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.position.x, p.position.y, 16, 0, Math.PI * 2);
            ctx.fill();
            
            // Outline
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Name
            ctx.fillStyle = '#2d3436';
            ctx.font = 'bold 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, p.position.x, p.position.y - 24);
        }
    });

    if (buildMode) {
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.strokeRect(camX + 20, camY + 20, ctx.canvas.width - 40, ctx.canvas.height - 40);
        ctx.fillStyle = '#e17055';
        ctx.fillText("BUILD MODE ACTIVE - Click to place Plants", camX + ctx.canvas.width / 2, camY + 50);
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
      className="block cursor-crosshair bg-[#eaddcf]"
      onClick={handleCanvasClick}
    />
  );
};

export default GameCanvas;