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
  const lastPosRef = useRef<Position>(currentUser.position);
  const isMovingRef = useRef<boolean>(false);
  const frameCountRef = useRef<number>(0);

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
        const hitboxPadding = 10;
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

    // Update moving state for animation
    const moved = Math.abs(currentPosRef.current.x - lastPosRef.current.x) > 0.1 || 
                  Math.abs(currentPosRef.current.y - lastPosRef.current.y) > 0.1;
    isMovingRef.current = moved;
    lastPosRef.current = { ...currentPosRef.current };

    if (moved) {
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
    
    frameCountRef.current++;
  };

  // Helper to draw a pixel character
  const drawPixelCharacter = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      color: string, 
      isWalking: boolean,
      isNpc: boolean = false
  ) => {
      const tick = Math.floor(Date.now() / 150); // Animation speed
      // Bobbing effect (entire body moves up/down)
      const bob = isWalking ? (tick % 2 === 0 ? -1 : 0) : 0;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- LEGS & BOOTS ---
      ctx.fillStyle = '#2d3436'; // Dark pants/boots
      
      const leftLegY = isWalking && tick % 4 === 0 ? -2 : 0;
      const rightLegY = isWalking && tick % 4 === 2 ? -2 : 0;
      
      // Left Leg
      ctx.fillRect(x - 5, y - 8 + leftLegY, 4, 8);
      // Right Leg
      ctx.fillRect(x + 1, y - 8 + rightLegY, 4, 8);

      // --- BODY (Tunic/Armor) ---
      ctx.fillStyle = isNpc ? '#8b5cf6' : color;
      ctx.fillRect(x - 6, y - 18 + bob, 12, 12);
      
      // Belt
      ctx.fillStyle = '#2d3436'; 
      ctx.fillRect(x - 6, y - 10 + bob, 12, 2);
      ctx.fillStyle = '#f1c40f'; // Gold buckle
      ctx.fillRect(x - 1, y - 10 + bob, 2, 2);

      // --- ARMS ---
      // Swing arms opposite to legs
      const leftArmSwing = isWalking && tick % 4 === 2 ? 3 : 0; // Opposite right leg
      const rightArmSwing = isWalking && tick % 4 === 0 ? 3 : 0; // Opposite left leg
      
      ctx.fillStyle = isNpc ? '#8b5cf6' : color; // Sleeve color matches body
      // Left Arm
      ctx.fillRect(x - 9, y - 17 + bob + leftArmSwing, 3, 8);
      // Right Arm
      ctx.fillRect(x + 6, y - 17 + bob + rightArmSwing, 3, 8);
      
      // Hands
      ctx.fillStyle = isNpc ? '#d1d8e0' : '#ffccaa';
      ctx.fillRect(x - 9, y - 9 + bob + leftArmSwing, 3, 3);
      ctx.fillRect(x + 6, y - 9 + bob + rightArmSwing, 3, 3);

      // --- HEAD ---
      // Skin
      ctx.fillStyle = isNpc ? '#d1d8e0' : '#ffccaa'; 
      ctx.fillRect(x - 7, y - 29 + bob, 14, 12);
      
      // Eyes (Anime/RPG style)
      ctx.fillStyle = '#000';
      if (isNpc) {
          // Visor
          ctx.fillStyle = '#00d2d3';
          ctx.fillRect(x - 6, y - 25 + bob, 12, 4);
      } else {
          // Eyes
          ctx.fillRect(x - 5, y - 25 + bob, 3, 4);
          ctx.fillRect(x + 2, y - 25 + bob, 3, 4);
          // Sparkle
          ctx.fillStyle = '#fff';
          ctx.fillRect(x - 4, y - 25 + bob, 1, 2);
          ctx.fillRect(x + 3, y - 25 + bob, 1, 2);
      }

      // Hair (RPG style volume)
      if (!isNpc) {
        ctx.fillStyle = '#634228'; // Brown hair
        // Top Helmet/Hair
        ctx.fillRect(x - 8, y - 32 + bob, 16, 5);
        // Sideburns / Back hair
        ctx.fillRect(x - 8, y - 30 + bob, 3, 12);
        ctx.fillRect(x + 5, y - 30 + bob, 3, 12);
        // Bangs
        ctx.fillRect(x - 5, y - 28 + bob, 2, 2);
        ctx.fillRect(x + 3, y - 28 + bob, 2, 2);
        ctx.fillRect(x - 1, y - 28 + bob, 2, 3);
      } else {
          // Robot Antenna
          ctx.fillStyle = '#a55eea';
          ctx.fillRect(x - 1, y - 34 + bob, 2, 6);
          ctx.fillStyle = '#ff5252';
          ctx.fillRect(x - 1, y - 35 + bob, 2, 2);
      }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // 1. Background (Wood Floor)
    ctx.fillStyle = '#eaddcf'; // Warm wood color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const camX = currentPosRef.current.x - ctx.canvas.width / 2;
    const camY = currentPosRef.current.y - ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // 2. Floor Pattern (Pixel Grid)
    ctx.strokeStyle = '#dcc1ab';
    ctx.lineWidth = 1;
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + (ctx.canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(camY / TILE_SIZE);
    const endRow = startRow + (ctx.canvas.height / TILE_SIZE) + 1;

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        // Pixel dot in corner of tiles instead of full lines for cleaner look
        ctx.fillStyle = '#dcc1ab';
        ctx.fillRect(c * TILE_SIZE - 2, r * TILE_SIZE - 2, 4, 4);
      }
    }

    // 3. Draw Floor Objects (Rugs)
    furniture.filter(f => f.type === FurnitureType.FLOOR).forEach(item => {
        const x = item.position.x * TILE_SIZE;
        const y = item.position.y * TILE_SIZE;
        
        let color = '#dfe6e9';
        let width = 6 * TILE_SIZE;
        let height = 4 * TILE_SIZE;

        if (item.rotation === 90) { // Meeting
            color = '#81ecec'; 
            width = 8 * TILE_SIZE;
            height = 6 * TILE_SIZE;
        } else if (item.rotation === 180) { // Lounge
            color = '#ffccc7'; 
            width = 10 * TILE_SIZE;
            height = 7 * TILE_SIZE;
        }

        ctx.fillStyle = color;
        // Pixelated Rug (No rounded corners)
        ctx.fillRect(x, y, width, height);
        // Rug Pattern (Checkers)
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for(let rx = 0; rx < width; rx += 20) {
            for(let ry = 0; ry < height; ry += 20) {
                if ((rx+ry)%40 === 0) ctx.fillRect(x + rx, y + ry, 20, 20);
            }
        }
    });

    // 4. Sort and Draw Entities
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
                // Pixel Art Wall
                const height = TILE_SIZE + 20;
                // Side shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x + TILE_SIZE, y, 4, TILE_SIZE);

                // Top
                ctx.fillStyle = '#b2bec3';
                ctx.fillRect(x, y - 20, TILE_SIZE, 20);
                // Front
                ctx.fillStyle = '#636e72';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Bricks
                ctx.fillStyle = '#535c68';
                ctx.fillRect(x + 5, y + 5, 10, 5);
                ctx.fillRect(x + 25, y + 15, 10, 5);
                ctx.fillRect(x + 2, y + 25, 10, 5);
            } 
            else if (f.type === FurnitureType.DESK) {
                // Pixel Desk
                // Legs
                ctx.fillStyle = '#594433'; 
                ctx.fillRect(x + 4, y + 20, 4, 20);
                ctx.fillRect(x + TILE_SIZE - 8, y + 20, 4, 20);

                // Top (Side)
                ctx.fillStyle = '#7a5c44'; 
                ctx.fillRect(x, y + 10, TILE_SIZE, 10);
                // Top (Surface)
                ctx.fillStyle = '#a67c52';
                ctx.fillRect(x, y, TILE_SIZE, 10);

                // Laptop
                ctx.fillStyle = '#b2bec3';
                ctx.fillRect(x + 15, y + 2, 18, 6); // Base
                ctx.fillStyle = '#2d3436';
                ctx.fillRect(x + 16, y - 8, 16, 10); // Screen Back
                ctx.fillStyle = '#74b9ff';
                ctx.fillRect(x + 17, y - 7, 14, 8); // Screen Lit
            }
            else if (f.type === FurnitureType.PLANT) {
                // Pot
                ctx.fillStyle = '#d35400';
                ctx.fillRect(x + 12, y + 24, 24, 20);
                ctx.fillStyle = '#e67e22'; // Rim
                ctx.fillRect(x + 10, y + 20, 28, 6);

                // Leaves (Pixels)
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(x + 14, y + 5, 6, 6);
                ctx.fillRect(x + 24, y + 2, 8, 8);
                ctx.fillRect(x + 28, y + 10, 6, 6);
                ctx.fillRect(x + 10, y + 12, 8, 8);
                ctx.fillRect(x + 20, y + 15, 8, 8);
            }
            else if (f.type === FurnitureType.CHAIR) {
                // Pixel Chair
                ctx.fillStyle = '#e17055'; 
                
                // Rotation logic for pixels
                if (f.rotation === 0 || f.rotation === 180) {
                     ctx.fillRect(x + 12, y + 20, 24, 4); // Seat
                     ctx.fillStyle = '#d35400';
                     ctx.fillRect(x + 12, y + 5, 24, 15); // Back
                } else {
                     ctx.fillRect(x + 14, y + 20, 20, 4); // Seat
                     ctx.fillStyle = '#d35400';
                     ctx.fillRect(x + 14, y + 5, 4, 15); // Back side
                }
                
                // Leg
                ctx.fillStyle = '#636e72';
                ctx.fillRect(x + 22, y + 24, 4, 12);
                ctx.fillRect(x + 16, y + 36, 16, 4); // Base
            }
        } 
        else if (item.type === 'npc') {
             drawPixelCharacter(ctx, AI_NPC_POSITION.x, AI_NPC_POSITION.y, '', false, true);
             
             // Name Tag
             ctx.fillStyle = 'rgba(0,0,0,0.5)';
             ctx.beginPath();
             ctx.roundRect(AI_NPC_POSITION.x - 30, AI_NPC_POSITION.y - 45, 60, 16, 4);
             ctx.fill();
             ctx.fillStyle = '#d1d8e0'; // Robot grey
             ctx.font = '10px "Courier New", monospace';
             ctx.textAlign = 'center';
             ctx.fillText("NOVA-AI", AI_NPC_POSITION.x, AI_NPC_POSITION.y - 34);
        }
        else {
            const p = item.data as Player;
            // Determine if moving (peers)
            const isPeer = p.id !== currentUser.id;
            const isWalking = isPeer ? Math.random() > 0.5 : isMovingRef.current; // Mock peer movement
            
            drawPixelCharacter(ctx, p.position.x, p.position.y, p.color, isWalking, false);

            // Name Tag
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            const textWidth = ctx.measureText(p.name).width;
            ctx.roundRect(p.position.x - textWidth/2 - 4, p.position.y - 45, textWidth + 8, 16, 4);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, p.position.x, p.position.y - 34);
        }
    });

    if (buildMode) {
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(camX + 20, camY + 20, ctx.canvas.width - 40, ctx.canvas.height - 40);
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#e17055';
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText("BUILD MODE - Click grid to plant", camX + ctx.canvas.width / 2, camY + 50);
    }

    ctx.restore();
  };

  const loop = () => {
    update();
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            // Disable smoothing for crisp pixel art
            ctx.imageSmoothingEnabled = false;
            draw(ctx);
        }
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
      className="block cursor-crosshair"
      onClick={handleCanvasClick}
      style={{ imageRendering: 'pixelated' }} 
    />
  );
};

export default GameCanvas;