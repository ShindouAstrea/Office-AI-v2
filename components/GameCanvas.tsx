import React, { useRef, useEffect, useState } from 'react';
import { Player, Furniture, FurnitureType, Position } from '../types';
import { TILE_SIZE, MOVE_SPEED, MAP_ZONES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface GameCanvasProps {
  currentUser: Player;
  peers: Player[];
  furniture: Furniture[];
  onMove: (newPos: Position) => void;
  onInteract: (targetId: string | null) => void;
  buildMode: boolean;
  onPlaceFurniture: (pos: Position) => void;
  selectedFurnitureType?: FurnitureType;
  selectedVariant?: number;
  selectedRotation?: number;
  selectedObjectId?: string | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  text?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  currentUser,
  peers,
  furniture,
  onMove,
  onInteract,
  buildMode,
  onPlaceFurniture,
  selectedFurnitureType,
  selectedVariant = 0,
  selectedRotation = 0,
  selectedObjectId
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number>(0);
  
  // Local interpolation state
  const currentPosRef = useRef<Position>(currentUser.position);
  const lastPosRef = useRef<Position>(currentUser.position);
  const isMovingRef = useRef<boolean>(false);
  const frameCountRef = useRef<number>(0);

  // Mouse position for building
  const mousePosRef = useRef<Position>({ x: 0, y: 0 });

  // Visual effects state
  const particlesRef = useRef<Particle[]>([]);
  // Keep track of furniture in ref for event listeners without re-binding
  const furnitureRef = useRef(furniture);

  useEffect(() => {
      furnitureRef.current = furniture;
  }, [furniture]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }
        keysPressed.current.add(e.code);
        
        // Interaction logic 'E'
        if (e.code === 'KeyE') {
             const playerX = currentPosRef.current.x;
             const playerY = currentPosRef.current.y;
             const nearbyItem = furnitureRef.current.find(item => {
                 if (!item.position) return false;
                 if (item.type !== FurnitureType.COFFEE_MAKER && 
                     item.type !== FurnitureType.SINK && 
                     item.type !== FurnitureType.SCREEN &&
                     item.type !== FurnitureType.ARCADE) return false;
                 
                 const itemX = item.position.x * TILE_SIZE + TILE_SIZE/2;
                 const itemY = item.position.y * TILE_SIZE + TILE_SIZE/2;
                 const dist = Math.sqrt(Math.pow(itemX - playerX, 2) + Math.pow(itemY - playerY, 2));
                 return dist < TILE_SIZE * 1.5; 
             });

             if (nearbyItem) {
                 const itemX = nearbyItem.position.x * TILE_SIZE + TILE_SIZE/2;
                 const itemY = nearbyItem.position.y * TILE_SIZE + TILE_SIZE/2;
                 if (nearbyItem.type === FurnitureType.COFFEE_MAKER) {
                      for(let i=0; i<12; i++) {
                          particlesRef.current.push({
                              x: itemX + (Math.random() - 0.5) * 15,
                              y: itemY - 15,
                              vx: (Math.random() - 0.5) * 0.5,
                              vy: -1 - Math.random(),
                              life: 1.0 + Math.random() * 0.5,
                              color: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.3})`,
                              size: 3 + Math.random() * 4
                          });
                      }
                 } else if (nearbyItem.type === FurnitureType.SINK) {
                      for(let i=0; i<8; i++) {
                          particlesRef.current.push({
                              x: itemX + (Math.random() - 0.5) * 10,
                              y: itemY - 5,
                              vx: (Math.random() - 0.5) * 1.5,
                              vy: -2 - Math.random() * 1.5,
                              life: 0.6 + Math.random() * 0.4,
                              color: `rgba(100, 200, 255, ${0.6 + Math.random() * 0.4})`,
                              size: 2 + Math.random() * 3
                          });
                      }
                 } else if (nearbyItem.type === FurnitureType.SCREEN) {
                      for(let i=0; i<8; i++) {
                          particlesRef.current.push({
                              x: itemX + (Math.random() - 0.5) * 20,
                              y: itemY - 10,
                              vx: (Math.random() - 0.5) * 0.5,
                              vy: -0.5 - Math.random(),
                              life: 1.0 + Math.random() * 0.5,
                              color: '#00ff00',
                              size: 10,
                              text: Math.random() > 0.5 ? '1' : '0'
                          });
                      }
                 }
                 onInteract(nearbyItem.id);
             }
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteract]);

  // Check collision
  const checkCollision = (x: number, y: number): boolean => {
    for (const item of furniture) {
        if (!item.position) continue;
        if (item.type === FurnitureType.FLOOR || 
            item.type === FurnitureType.CHAIR || 
            item.type === FurnitureType.FOOD ||
            item.type === FurnitureType.SCREEN ||
            item.type === FurnitureType.RUG ||
            item.type === FurnitureType.LAMP
        ) continue;

        const itemPixelX = item.position.x * TILE_SIZE;
        const itemPixelY = item.position.y * TILE_SIZE;
        
        const hitboxPadding = 20; 
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

  const update = () => {
    let dx = 0;
    let dy = 0;

    if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) dy -= MOVE_SPEED;
    if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('KeyS')) dy += MOVE_SPEED;
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) dx -= MOVE_SPEED;
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) dx += MOVE_SPEED;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    const nextX = currentPosRef.current.x + dx;
    const nextY = currentPosRef.current.y + dy;

    if (!checkCollision(nextX, currentPosRef.current.y)) currentPosRef.current.x = nextX;
    if (!checkCollision(currentPosRef.current.x, nextY)) currentPosRef.current.y = nextY;

    const moved = Math.abs(currentPosRef.current.x - lastPosRef.current.x) > 0.1 || 
                  Math.abs(currentPosRef.current.y - lastPosRef.current.y) > 0.1;
    isMovingRef.current = moved;
    lastPosRef.current = { ...currentPosRef.current };

    if (moved) onMove({ ...currentPosRef.current });
    
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
    }
    frameCountRef.current++;
  };

  const drawPixelCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isWalking: boolean) => {
      const tick = Math.floor(Date.now() / 150); 
      const bob = isWalking ? (tick % 2 === 0 ? -1 : 0) : 0;
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d3436'; 
      const leftLegY = isWalking && tick % 4 === 0 ? -2 : 0;
      const rightLegY = isWalking && tick % 4 === 2 ? -2 : 0;
      ctx.fillRect(x - 5, y - 8 + leftLegY, 4, 8);
      ctx.fillRect(x + 1, y - 8 + rightLegY, 4, 8);
      ctx.fillStyle = color;
      ctx.fillRect(x - 6, y - 18 + bob, 12, 12);
      ctx.fillStyle = '#2d3436'; 
      ctx.fillRect(x - 6, y - 10 + bob, 12, 2);
      ctx.fillStyle = '#f1c40f'; 
      ctx.fillRect(x - 1, y - 10 + bob, 2, 2);
      const leftArmSwing = isWalking && tick % 4 === 2 ? 3 : 0;
      const rightArmSwing = isWalking && tick % 4 === 0 ? 3 : 0;
      ctx.fillStyle = color; 
      ctx.fillRect(x - 9, y - 17 + bob + leftArmSwing, 3, 8);
      ctx.fillRect(x + 6, y - 17 + bob + rightArmSwing, 3, 8);
      ctx.fillStyle = '#ffccaa';
      ctx.fillRect(x - 9, y - 9 + bob + leftArmSwing, 3, 3);
      ctx.fillRect(x + 6, y - 9 + bob + rightArmSwing, 3, 3);
      ctx.fillStyle = '#ffccaa'; 
      ctx.fillRect(x - 7, y - 29 + bob, 14, 12);
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 5, y - 25 + bob, 3, 4);
      ctx.fillRect(x + 2, y - 25 + bob, 3, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 4, y - 25 + bob, 1, 2);
      ctx.fillRect(x + 3, y - 25 + bob, 1, 2);
      ctx.fillStyle = '#634228'; 
      ctx.fillRect(x - 8, y - 32 + bob, 16, 5);
      ctx.fillRect(x - 8, y - 30 + bob, 3, 12);
      ctx.fillRect(x + 5, y - 30 + bob, 3, 12);
      ctx.fillRect(x - 5, y - 28 + bob, 2, 2);
      ctx.fillRect(x + 3, y - 28 + bob, 2, 2);
  };

  const getLayerPriority = (type: FurnitureType): number => {
        switch (type) {
            case FurnitureType.RUG: return 0;
            case FurnitureType.FLOOR: return 0;
            case FurnitureType.DESK:
            case FurnitureType.TABLE_ROUND:
            case FurnitureType.COUCH:
            case FurnitureType.CHAIR:
            case FurnitureType.TOILET:
            case FurnitureType.BOOKSHELF:
            case FurnitureType.ARCADE: // Base item
                return 1;
            case FurnitureType.SCREEN:
            case FurnitureType.COFFEE_MAKER:
            case FurnitureType.FOOD:
            case FurnitureType.PRINTER:
            case FurnitureType.SINK:
            case FurnitureType.PLANT:
            case FurnitureType.LAMP:
                return 2;
            case FurnitureType.WALL:
                return 1; 
            default:
                return 1;
        }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const camX = currentPosRef.current.x - ctx.canvas.width / 2;
    const camY = currentPosRef.current.y - ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // Draw Floor Grid (Static Zones)
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + (ctx.canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(camY / TILE_SIZE);
    const endRow = startRow + (ctx.canvas.height / TILE_SIZE) + 1;

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const zone = MAP_ZONES.find(z => c >= z.x && c < z.x + z.w && r >= z.y && r < z.y + z.h);
        
        if (zone?.type === 'KITCHEN') {
            ctx.fillStyle = (c + r) % 2 === 0 ? '#ecf0f1' : '#bdc3c7';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (zone?.type === 'BATHROOM') {
            ctx.fillStyle = '#dfe6e9';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#b2bec3';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (zone?.type === 'OFFICE') {
             ctx.fillStyle = '#d3a67d';
             ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        } else {
            ctx.fillStyle = '#eaddcf';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }
    
    // Prepare render list
    const renderList = [
        ...furniture.filter(f => f.position).map(f => ({ type: 'furniture', data: f, y: f.position.y * TILE_SIZE })),
        ...peers.map(p => ({ type: 'peer', data: p, y: p.position.y })),
        { type: 'player', data: currentUser, y: currentPosRef.current.y }
    ];

    // Add Ghost Object logic
    if (buildMode) {
        const gridX = (mousePosRef.current.x + camX) / TILE_SIZE;
        const gridY = (mousePosRef.current.y + camY) / TILE_SIZE;
        
        // Show ghost for NEW item OR moving item
        if (selectedFurnitureType && selectedFurnitureType !== FurnitureType.DELETE && selectedFurnitureType !== FurnitureType.SELECT) {
             const snap = (selectedFurnitureType === FurnitureType.WALL || selectedFurnitureType === FurnitureType.FLOOR) ? 1 : 0.5;
             const ghostFurniture: Furniture = {
                id: 'ghost',
                type: selectedFurnitureType,
                position: { 
                    x: Math.round(gridX / snap) * snap, 
                    y: Math.round(gridY / snap) * snap 
                },
                rotation: selectedRotation || 0,
                variant: selectedVariant || 0
            };
            renderList.push({ type: 'ghost', data: ghostFurniture, y: gridY * TILE_SIZE });

        } else if (selectedObjectId && selectedFurnitureType === FurnitureType.SELECT) {
            const selectedItem = furniture.find(f => f.id === selectedObjectId);
            if (selectedItem) {
                const snap = (selectedItem.type === FurnitureType.WALL || selectedItem.type === FurnitureType.FLOOR) ? 1 : 0.5;
                const ghostFurniture: Furniture = {
                    ...selectedItem,
                    id: 'ghost-move',
                    position: { 
                        x: Math.round(gridX / snap) * snap, 
                        y: Math.round(gridY / snap) * snap 
                    },
                    rotation: selectedRotation || selectedItem.rotation // Use updated rotation
                };
                renderList.push({ type: 'ghost', data: ghostFurniture, y: gridY * TILE_SIZE });
            }
        }
    }

    renderList.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 5) return a.y - b.y;
        const typeA = a.type === 'furniture' || a.type === 'ghost' ? (a.data as Furniture).type : null;
        const typeB = b.type === 'furniture' || b.type === 'ghost' ? (b.data as Furniture).type : null;
        if (typeA && typeB) return getLayerPriority(typeA) - getLayerPriority(typeB);
        return a.y - b.y; 
    });

    renderList.forEach(item => {
        if (item.type === 'furniture' || item.type === 'ghost') {
            const f = item.data as Furniture;
            if (!f.position) return;
            const x = f.position.x * TILE_SIZE;
            const y = f.position.y * TILE_SIZE;

            if (item.type === 'ghost') {
                ctx.save();
                ctx.globalAlpha = 0.6;
            }

            // --- DRAWING LOGIC ---
            if (f.type === FurnitureType.WALL) {
                const isVertical = f.rotation === 90 || f.rotation === 270;
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                if (isVertical) ctx.fillRect(x + 10, y, 4, TILE_SIZE);
                else ctx.fillRect(x + TILE_SIZE, y, 4, TILE_SIZE);
                let topColor = '#b2bec3'; let frontColor = '#636e72';
                if (f.variant === 1) { topColor = '#95a5a6'; frontColor = '#7f8c8d'; }
                if (isVertical) {
                    ctx.fillStyle = topColor; ctx.fillRect(x + 14, y - 20, 20, TILE_SIZE + 20);
                    ctx.fillStyle = frontColor; ctx.fillRect(x + 14, y, 20, TILE_SIZE);
                } else {
                    ctx.fillStyle = topColor; ctx.fillRect(x, y - 20, TILE_SIZE, 20);
                    ctx.fillStyle = frontColor; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    if (f.variant === 0) { ctx.fillStyle = '#535c68'; ctx.fillRect(x + 5, y + 5, 10, 5); ctx.fillRect(x + 25, y + 15, 10, 5); }
                }
            } 
            else if (f.type === FurnitureType.DESK) {
                const color = f.variant === 1 ? '#ecf0f1' : '#a67c52';
                const legColor = f.variant === 1 ? '#bdc3c7' : '#594433';
                ctx.fillStyle = legColor; ctx.fillRect(x + 4, y + 20, 4, 20); ctx.fillRect(x + TILE_SIZE - 8, y + 20, 4, 20);
                ctx.fillStyle = color === '#ecf0f1' ? '#bdc3c7' : '#7a5c44'; ctx.fillRect(x, y + 10, TILE_SIZE, 10);
                ctx.fillStyle = color; ctx.fillRect(x, y, TILE_SIZE, 10);
            }
            else if (f.type === FurnitureType.ARCADE) {
               ctx.fillStyle = '#2c3e50'; // Cabinet
               ctx.fillRect(x + 8, y - 10, 32, 50);
               ctx.fillStyle = '#8e44ad'; // Side
               ctx.fillRect(x + 6, y - 10, 4, 50);
               ctx.fillRect(x + 38, y - 10, 4, 50);
               ctx.fillStyle = '#000'; // Screen area
               ctx.fillRect(x + 12, y + 5, 24, 20);
               // Glowing screen content
               ctx.fillStyle = `hsl(${(Date.now() / 20) % 360}, 70%, 60%)`;
               ctx.fillRect(x + 14, y + 7, 20, 16);
               // Joystick
               ctx.fillStyle = '#e74c3c';
               ctx.beginPath(); ctx.arc(x + 18, y + 32, 3, 0, Math.PI * 2); ctx.fill();
               // Buttons
               ctx.fillStyle = '#f1c40f';
               ctx.beginPath(); ctx.arc(x + 28, y + 32, 2, 0, Math.PI * 2); ctx.fill();
               ctx.beginPath(); ctx.arc(x + 32, y + 30, 2, 0, Math.PI * 2); ctx.fill();
            }
            else if (f.type === FurnitureType.FLOOR) {
                 if (f.variant === 0) { ctx.fillStyle = '#eaddcf'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); ctx.fillStyle = '#dcc1ab'; ctx.fillRect(x, y, TILE_SIZE, 2); } 
                 else if (f.variant === 1) { ctx.fillStyle = '#bdc3c7'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); } 
                 else { ctx.fillStyle = '#34495e'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); }
            }
            // Basic shapes for others to ensure they render
            else if (f.type === FurnitureType.COFFEE_MAKER) { ctx.fillStyle = '#2d3436'; ctx.fillRect(x+14, y+14, 20, 24); }
            else if (f.type === FurnitureType.PLANT) { ctx.fillStyle = '#27ae60'; ctx.fillRect(x+14, y+5, 6, 6); ctx.fillRect(x+12, y+24, 24, 20); }
            else if (f.type === FurnitureType.CHAIR) { ctx.fillStyle = '#e17055'; ctx.fillRect(x+14, y+20, 20, 4); }
            else if (f.type === FurnitureType.SCREEN) { ctx.fillStyle = '#2d3436'; ctx.fillRect(x+12, y+10, 24, 16); ctx.fillRect(x+22, y+26, 4, 4); ctx.fillRect(x+18, y+30, 12, 2); ctx.fillStyle = '#0984e3'; ctx.fillRect(x+14, y+12, 20, 12); }
            else if (f.type === FurnitureType.TOILET) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 14, y + 5, 20, 10); ctx.fillStyle = '#ecf0f1'; ctx.fillRect(x + 16, y + 15, 16, 18); }
            else if (f.type === FurnitureType.SINK) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x + 24, y + 24, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); }
            else if (f.type === FurnitureType.TABLE_ROUND) { ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.ellipse(x + 24, y + 24, 20, 12, 0, 0, Math.PI*2); ctx.fill(); }
            else if (f.type === FurnitureType.FOOD) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x + 24, y + 24, 10, 6, 0, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.moveTo(x+24, y+24); ctx.lineTo(x+30, y+20); ctx.lineTo(x+30, y+28); ctx.fill(); }
            else if (f.type === FurnitureType.BOOKSHELF) { ctx.fillStyle = '#5d4037'; ctx.fillRect(x, y-20, TILE_SIZE, TILE_SIZE+20); }
            else if (f.type === FurnitureType.COUCH) { ctx.fillStyle = f.variant === 1 ? '#e74c3c' : '#3498db'; ctx.roundRect(x+2, y+15, TILE_SIZE-4, 25, 5); ctx.fill(); }
            else if (f.type === FurnitureType.LAMP) { ctx.fillStyle = '#2c3e50'; ctx.fillRect(x+22, y+10, 4, 30); ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(x+24, y+5, 20, 0, Math.PI*2); ctx.fill(); }
            else if (f.type === FurnitureType.PRINTER) { ctx.fillStyle = '#ecf0f1'; ctx.fillRect(x+8, y+10, 32, 24); }
            else if (f.type === FurnitureType.WHITEBOARD) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x+5, y-12, TILE_SIZE-10, 24); ctx.strokeStyle='#bdc3c7'; ctx.strokeRect(x+2, y-15, TILE_SIZE-4, 30); }
            else if (f.type === FurnitureType.RUG) { ctx.fillStyle = f.variant === 1 ? '#3498db' : '#e74c3c'; ctx.fillRect(x+4, y+4, TILE_SIZE-8, TILE_SIZE-8); }

            // SELECTION HIGHLIGHT
            if (buildMode && selectedObjectId === f.id && item.type !== 'ghost') {
                ctx.strokeStyle = '#00ffff'; 
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 2, y - 2, TILE_SIZE + 4, TILE_SIZE + 4);
            }

            if (item.type === 'ghost') {
                ctx.restore();
            }
        } 
        else if (item.type === 'peer' || item.type === 'player') {
            const p = item.data as Player;
            const isPeer = p.id !== currentUser.id;
            const isWalking = isPeer ? Math.random() > 0.5 : isMovingRef.current;
            drawPixelCharacter(ctx, p.position.x, p.position.y, p.color, isWalking);
            
            // Name tag
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            const textWidth = ctx.measureText(p.name).width;
            ctx.roundRect(p.position.x - textWidth/2 - 6, p.position.y - 50, textWidth + 12, 16, 4);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, p.position.x, p.position.y - 38);
        }
    });

    // Interaction Hint
    let closestInteractive: Furniture | null = null;
    let minDst = Infinity;
    
    furniture.forEach(item => {
        if (!item.position) return;
        if (item.type === FurnitureType.COFFEE_MAKER || 
            item.type === FurnitureType.SINK || 
            item.type === FurnitureType.SCREEN ||
            item.type === FurnitureType.ARCADE) {
             const itemX = item.position.x * TILE_SIZE + TILE_SIZE/2;
             const itemY = item.position.y * TILE_SIZE + TILE_SIZE/2;
             const d = Math.sqrt(Math.pow(itemX - currentPosRef.current.x, 2) + Math.pow(itemY - currentPosRef.current.y, 2));
             if (d < TILE_SIZE * 1.5 && d < minDst) {
                 minDst = d;
                 closestInteractive = item;
             }
        }
    });

    if (closestInteractive) {
        const item = closestInteractive as Furniture;
        const ix = item.position.x * TILE_SIZE + TILE_SIZE/2;
        const iy = item.position.y * TILE_SIZE;
        
        let label = t('interact.press');
        if (item.type === FurnitureType.COFFEE_MAKER) label = t('interact.coffee');
        else if (item.type === FurnitureType.SINK) label = t('interact.wash');
        else if (item.type === FurnitureType.SCREEN) label = t('interact.computer');
        else if (item.type === FurnitureType.ARCADE) label = t('interact.play');
        
        const textWidth = ctx.measureText(label).width;
        const boxWidth = Math.max(60, textWidth + 20);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect(ix - boxWidth/2, iy - 40, boxWidth, 24, 5);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, ix, iy - 24);
    }

    if (buildMode) {
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(camX + 20, camY + 20, ctx.canvas.width - 40, ctx.canvas.height - 40);
        ctx.setLineDash([]);
        ctx.fillStyle = '#e17055';
        ctx.font = '16px "Courier New", monospace';
        ctx.fillText(t('build.mode'), camX + ctx.canvas.width / 2, camY + 50);
    }

    ctx.restore();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mousePosRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
      if (!buildMode || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      const camX = currentPosRef.current.x - canvasRef.current.width / 2;
      const camY = currentPosRef.current.y - canvasRef.current.height / 2;
      
      const worldX = (e.clientX - rect.left) + camX;
      const worldY = (e.clientY - rect.top) + camY;
      
      onPlaceFurniture({ x: worldX, y: worldY });
  };

  const loop = () => {
    update();
    if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
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

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="block cursor-crosshair"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      style={{ imageRendering: 'pixelated' }} 
    />
  );
};

export default GameCanvas;