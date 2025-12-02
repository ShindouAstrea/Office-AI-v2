import React, { useRef, useEffect } from 'react';
import { Player, Furniture, FurnitureType, Position } from '../types';
import { TILE_SIZE, MOVE_SPEED, MAP_ZONES } from '../constants';

interface GameCanvasProps {
  currentUser: Player;
  peers: Player[];
  furniture: Furniture[];
  onMove: (newPos: Position) => void;
  onInteract: (targetId: string | null) => void;
  buildMode: boolean;
  onPlaceFurniture: (pos: Position) => void;
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
        keysPressed.current.add(e.code);

        if (e.code === 'KeyE') {
             const playerX = currentPosRef.current.x;
             const playerY = currentPosRef.current.y;
             
             // Find nearest interactive item
             const nearbyItem = furnitureRef.current.find(item => {
                 if (item.type !== FurnitureType.COFFEE_MAKER && 
                     item.type !== FurnitureType.SINK && 
                     item.type !== FurnitureType.SCREEN) return false;
                 
                 const itemX = item.position.x * TILE_SIZE + TILE_SIZE/2;
                 const itemY = item.position.y * TILE_SIZE + TILE_SIZE/2;
                 const dist = Math.sqrt(Math.pow(itemX - playerX, 2) + Math.pow(itemY - playerY, 2));
                 return dist < TILE_SIZE * 1.5; // Interaction range
             });

             if (nearbyItem) {
                 // Trigger Interaction Visual Effect
                 const itemX = nearbyItem.position.x * TILE_SIZE + TILE_SIZE/2;
                 const itemY = nearbyItem.position.y * TILE_SIZE + TILE_SIZE/2;
                 
                 if (nearbyItem.type === FurnitureType.COFFEE_MAKER) {
                      // Spawn Steam Particles
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
                      // Spawn Water Splash Particles
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
                      // Spawn Matrix/Tech Particles
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
    // Check furniture
    for (const item of furniture) {
        // Skip walkable items
        if (item.type === FurnitureType.FLOOR || 
            item.type === FurnitureType.CHAIR || 
            item.type === FurnitureType.FOOD ||
            item.type === FurnitureType.SCREEN ||
            item.type === FurnitureType.RUG
        ) continue;

        const itemPixelX = item.position.x * TILE_SIZE;
        const itemPixelY = item.position.y * TILE_SIZE;
        
        // Player hitbox logic
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
    
    // Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.015; // Fade out speed
        if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
        }
    }
    
    frameCountRef.current++;
  };

  // Helper to draw a pixel character
  const drawPixelCharacter = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      color: string, 
      isWalking: boolean
  ) => {
      const tick = Math.floor(Date.now() / 150); 
      const bob = isWalking ? (tick % 2 === 0 ? -1 : 0) : 0;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#2d3436'; 
      const leftLegY = isWalking && tick % 4 === 0 ? -2 : 0;
      const rightLegY = isWalking && tick % 4 === 2 ? -2 : 0;
      ctx.fillRect(x - 5, y - 8 + leftLegY, 4, 8);
      ctx.fillRect(x + 1, y - 8 + rightLegY, 4, 8);

      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x - 6, y - 18 + bob, 12, 12);
      
      // Belt
      ctx.fillStyle = '#2d3436'; 
      ctx.fillRect(x - 6, y - 10 + bob, 12, 2);
      ctx.fillStyle = '#f1c40f'; 
      ctx.fillRect(x - 1, y - 10 + bob, 2, 2);

      // Arms
      const leftArmSwing = isWalking && tick % 4 === 2 ? 3 : 0;
      const rightArmSwing = isWalking && tick % 4 === 0 ? 3 : 0;
      ctx.fillStyle = color; 
      ctx.fillRect(x - 9, y - 17 + bob + leftArmSwing, 3, 8);
      ctx.fillRect(x + 6, y - 17 + bob + rightArmSwing, 3, 8);
      ctx.fillStyle = '#ffccaa';
      ctx.fillRect(x - 9, y - 9 + bob + leftArmSwing, 3, 3);
      ctx.fillRect(x + 6, y - 9 + bob + rightArmSwing, 3, 3);

      // Head
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

  const draw = (ctx: CanvasRenderingContext2D) => {
    // 1. Background
    ctx.fillStyle = '#111827'; // Dark outer void
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const camX = currentPosRef.current.x - ctx.canvas.width / 2;
    const camY = currentPosRef.current.y - ctx.canvas.height / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // 2. Map Generation (Floor) based on Zones
    const startCol = Math.floor(camX / TILE_SIZE);
    const endCol = startCol + (ctx.canvas.width / TILE_SIZE) + 1;
    const startRow = Math.floor(camY / TILE_SIZE);
    const endRow = startRow + (ctx.canvas.height / TILE_SIZE) + 1;

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        // Determine Zone
        const zone = MAP_ZONES.find(z => c >= z.x && c < z.x + z.w && r >= z.y && r < z.y + z.h);
        
        if (zone?.type === 'KITCHEN') {
            // Checkered Floor
            ctx.fillStyle = (c + r) % 2 === 0 ? '#ecf0f1' : '#bdc3c7';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (zone?.type === 'BATHROOM') {
            // Ceramic Tile
            ctx.fillStyle = '#dfe6e9';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#b2bec3';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
            // Inner tile cross
            ctx.beginPath();
            ctx.moveTo(x + TILE_SIZE/2, y);
            ctx.lineTo(x + TILE_SIZE/2, y + TILE_SIZE);
            ctx.moveTo(x, y + TILE_SIZE/2);
            ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE/2);
            ctx.stroke();
        } else if (zone?.type === 'OFFICE') {
             // Darker wood for offices
             ctx.fillStyle = '#d3a67d';
             ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
             ctx.fillStyle = '#c5966c';
             ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else {
            // Default Wood Floor
            ctx.fillStyle = '#eaddcf';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#dcc1ab';
            ctx.fillRect(c * TILE_SIZE - 2, r * TILE_SIZE - 2, 4, 4);
        }
      }
    }
    
    // 2.5 Draw Rugs (Decoration layer before main entities)
    furniture.forEach(f => {
        if (f.type === FurnitureType.RUG) {
            const x = f.position.x * TILE_SIZE;
            const y = f.position.y * TILE_SIZE;
            ctx.fillStyle = '#e74c3c'; // Red Rug
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            // Fringe
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(x + 2, y + 4, 2, TILE_SIZE - 8);
            ctx.fillRect(x + TILE_SIZE - 4, y + 4, 2, TILE_SIZE - 8);
        }
    });

    // 3. Sort and Draw Entities
    const renderables = [
        ...furniture.filter(f => f.type !== FurnitureType.RUG).map(f => ({ type: 'furniture', data: f, y: f.position.y * TILE_SIZE })),
        ...peers.map(p => ({ type: 'peer', data: p, y: p.position.y })),
        { type: 'player', data: currentUser, y: currentPosRef.current.y }
    ];

    // Sort by Y for depth
    renderables.sort((a, b) => a.y - b.y);

    renderables.forEach(item => {
        if (item.type === 'furniture') {
            const f = item.data as Furniture;
            const x = f.position.x * TILE_SIZE;
            const y = f.position.y * TILE_SIZE;

            if (f.type === FurnitureType.WALL) {
                // Pixel Art Wall
                const h = TILE_SIZE + 20;
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x + TILE_SIZE, y, 4, TILE_SIZE);
                ctx.fillStyle = '#b2bec3'; // Top
                ctx.fillRect(x, y - 20, TILE_SIZE, 20);
                ctx.fillStyle = '#636e72'; // Front
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                // Bricks
                ctx.fillStyle = '#535c68';
                ctx.fillRect(x + 5, y + 5, 10, 5);
                ctx.fillRect(x + 25, y + 15, 10, 5);
            } 
            else if (f.type === FurnitureType.DESK) {
                ctx.fillStyle = '#594433'; // Legs
                ctx.fillRect(x + 4, y + 20, 4, 20);
                ctx.fillRect(x + TILE_SIZE - 8, y + 20, 4, 20);
                ctx.fillStyle = '#7a5c44'; // Top Side
                ctx.fillRect(x, y + 10, TILE_SIZE, 10);
                ctx.fillStyle = '#a67c52'; // Top Surface
                ctx.fillRect(x, y, TILE_SIZE, 10);
            }
            else if (f.type === FurnitureType.SCREEN) {
                // Computer Screen
                ctx.fillStyle = '#2d3436';
                ctx.fillRect(x + 12, y + 10, 24, 16); // Monitor
                ctx.fillRect(x + 22, y + 26, 4, 4);   // Stand
                ctx.fillRect(x + 18, y + 30, 12, 2);  // Base
                ctx.fillStyle = '#0984e3'; // Blue screen glow
                ctx.fillRect(x + 14, y + 12, 20, 12);
            }
            else if (f.type === FurnitureType.TOILET) {
                // Toilet
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x + 14, y + 5, 20, 10); // Tank
                ctx.fillStyle = '#ecf0f1';
                ctx.fillRect(x + 16, y + 15, 16, 18); // Bowl
                ctx.fillStyle = '#bdc3c7'; // Shadow/Detail
                ctx.fillRect(x + 18, y + 18, 12, 10);
            }
            else if (f.type === FurnitureType.SINK) {
                 // Sink
                 ctx.fillStyle = '#ffffff';
                 ctx.beginPath();
                 ctx.ellipse(x + 24, y + 24, 16, 10, 0, 0, Math.PI * 2);
                 ctx.fill();
                 ctx.fillStyle = '#b2bec3'; // Faucet
                 ctx.fillRect(x + 22, y + 10, 4, 8);
            }
            else if (f.type === FurnitureType.TABLE_ROUND) {
                // Round Table
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.ellipse(x + 24, y + 35, 15, 5, 0, 0, Math.PI*2);
                ctx.fill();

                ctx.fillStyle = '#ecf0f1';
                ctx.beginPath();
                ctx.ellipse(x + 24, y + 24, 20, 12, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#bdc3c7'; // Leg
                ctx.fillRect(x + 22, y + 24, 4, 15);
            }
            else if (f.type === FurnitureType.COFFEE_MAKER) {
                // Machine
                ctx.fillStyle = '#2d3436';
                ctx.fillRect(x + 14, y + 14, 20, 24);
                ctx.fillStyle = '#000'; // Glass pot
                ctx.fillRect(x + 16, y + 24, 16, 10);
            }
            else if (f.type === FurnitureType.FOOD) {
                 // Plate
                 ctx.fillStyle = '#fff';
                 ctx.beginPath();
                 ctx.ellipse(x + 24, y + 24, 10, 6, 0, 0, Math.PI*2);
                 ctx.fill();
                 // Pizza slice?
                 ctx.fillStyle = '#e67e22';
                 ctx.beginPath();
                 ctx.moveTo(x+24, y+24);
                 ctx.lineTo(x+30, y+20);
                 ctx.lineTo(x+30, y+28);
                 ctx.fill();
            }
            else if (f.type === FurnitureType.PLANT) {
                ctx.fillStyle = '#d35400';
                ctx.fillRect(x + 12, y + 24, 24, 20);
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(x + 14, y + 5, 6, 6);
                ctx.fillRect(x + 24, y + 2, 8, 8);
                ctx.fillRect(x + 10, y + 12, 8, 8);
            }
            else if (f.type === FurnitureType.CHAIR) {
                ctx.fillStyle = '#e17055'; 
                if (f.rotation === 0 || f.rotation === 180) {
                     ctx.fillRect(x + 12, y + 20, 24, 4);
                     ctx.fillStyle = '#d35400';
                     ctx.fillRect(x + 12, y + 5, 24, 15);
                } else {
                     ctx.fillRect(x + 14, y + 20, 20, 4);
                     ctx.fillStyle = '#d35400';
                     ctx.fillRect(x + 14, y + 5, 4, 15);
                }
                ctx.fillStyle = '#636e72';
                ctx.fillRect(x + 22, y + 24, 4, 12);
                ctx.fillRect(x + 16, y + 36, 16, 4);
            }
            // NEW FURNITURE RENDERERS
            else if (f.type === FurnitureType.BOOKSHELF) {
                // Bookshelf
                ctx.fillStyle = '#5d4037'; // Wood frame
                ctx.fillRect(x, y - 20, TILE_SIZE, TILE_SIZE + 20);
                // Shelves and Shadow
                ctx.fillStyle = '#3e2723';
                ctx.fillRect(x + 4, y - 10, TILE_SIZE - 8, 4);
                ctx.fillRect(x + 4, y + 10, TILE_SIZE - 8, 4);
                
                // Books
                const colors = ['#c0392b', '#2980b9', '#27ae60', '#f1c40f'];
                for(let i=0; i<6; i++) {
                    ctx.fillStyle = colors[i % colors.length];
                    ctx.fillRect(x + 6 + (i*6), y - 18, 4, 8);
                    ctx.fillRect(x + 6 + (i*6), y + 2, 4, 8);
                }
            }
            else if (f.type === FurnitureType.COUCH) {
                // Couch
                ctx.fillStyle = '#3498db'; // Cushion color
                ctx.roundRect(x + 2, y + 15, TILE_SIZE - 4, 25, 5);
                ctx.fill();
                ctx.fillStyle = '#2980b9'; // Backrest
                ctx.roundRect(x + 2, y + 5, TILE_SIZE - 4, 15, 5);
                ctx.fill();
                // Arms?
                ctx.fillStyle = '#2980b9'; 
                // Simple blocky couch
            }
            else if (f.type === FurnitureType.WHITEBOARD) {
                // Legs
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(x + 4, y + 10, 4, 30);
                ctx.fillRect(x + TILE_SIZE - 8, y + 10, 4, 30);
                // Board
                ctx.fillStyle = '#bdc3c7'; // Frame
                ctx.fillRect(x + 2, y - 15, TILE_SIZE - 4, 30);
                ctx.fillStyle = '#ffffff'; // Surface
                ctx.fillRect(x + 5, y - 12, TILE_SIZE - 10, 24);
                // Scribbles
                ctx.strokeStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(x + 10, y);
                ctx.lineTo(x + 20, y - 5);
                ctx.lineTo(x + 30, y);
                ctx.stroke();
            }
            else if (f.type === FurnitureType.PRINTER) {
                // Boxy Printer
                ctx.fillStyle = '#ecf0f1';
                ctx.fillRect(x + 8, y + 10, 32, 24);
                ctx.fillStyle = '#bdc3c7'; // Detail
                ctx.fillRect(x + 12, y + 14, 24, 4); // Screen/Buttons
                ctx.fillStyle = '#ffffff'; // Paper
                ctx.fillRect(x + 14, y + 6, 20, 6);
            }
            else if (f.type === FurnitureType.LAMP) {
                // Floor Lamp
                ctx.fillStyle = '#2c3e50'; // Pole
                ctx.fillRect(x + 22, y + 10, 4, 30);
                ctx.fillStyle = '#f1c40f'; // Shade
                ctx.beginPath();
                ctx.moveTo(x + 14, y + 10);
                ctx.lineTo(x + 34, y + 10);
                ctx.lineTo(x + 30, y - 5);
                ctx.lineTo(x + 18, y - 5);
                ctx.fill();
                // Glow
                ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
                ctx.beginPath();
                ctx.arc(x + 24, y + 5, 20, 0, Math.PI * 2);
                ctx.fill();
            }

        } 
        else {
            const p = item.data as Player;
            const isPeer = p.id !== currentUser.id;
            const isWalking = isPeer ? Math.random() > 0.5 : isMovingRef.current;
            
            drawPixelCharacter(ctx, p.position.x, p.position.y, p.color, isWalking);

            // Name Tag Only (Status removed from canvas)
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            const textWidth = ctx.measureText(p.name).width;
            
            // Fixed height box for just name
            const boxHeight = 16;
            ctx.roundRect(p.position.x - textWidth/2 - 6, p.position.y - 50, textWidth + 12, boxHeight, 4);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, p.position.x, p.position.y - 38);
        }
    });

    // 4. Draw Particles
    particlesRef.current.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        
        if (p.text) {
             ctx.font = `bold ${p.size}px monospace`;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText(p.text, p.x, p.y);
        } else {
             ctx.beginPath();
             ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
             ctx.fill();
        }
        
        ctx.restore();
    });

    // 5. Interaction Hint
    let closestInteractive: Furniture | null = null;
    let minDst = Infinity;
    
    furniture.forEach(item => {
        if (item.type === FurnitureType.COFFEE_MAKER || 
            item.type === FurnitureType.SINK || 
            item.type === FurnitureType.SCREEN) {
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
        
        let label = "Press E";
        if (item.type === FurnitureType.COFFEE_MAKER) label = "Make Coffee";
        else if (item.type === FurnitureType.SINK) label = "Wash Hands";
        else if (item.type === FurnitureType.SCREEN) label = "Use Computer";
        
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
        ctx.fillText("BUILD MODE", camX + ctx.canvas.width / 2, camY + 50);
    }

    ctx.restore();
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