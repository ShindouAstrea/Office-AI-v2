import { Furniture, FurnitureType } from "./types";

export const TILE_SIZE = 48;
export const MOVE_SPEED = 6; // Slightly faster for better traversal
export const SPATIAL_AUDIO_RADIUS = 300; // Pixels
export const INTERACTION_RADIUS = 80; // Pixels

export const MAP_WIDTH = 40; // Tiles
export const MAP_HEIGHT = 30; // Tiles

export const AVATAR_COLORS = [
  '#ff6b6b', // Coral Red
  '#48dbfb', // Bright Cyan
  '#1dd1a1', // Wild Caribbean Green
  '#feca57', // Casandora Yellow
  '#5f27cd', // Nasu Purple
  '#ff9ff3', // Jigglypuff Pink
  '#ff9f43', // Double Dragon Orange
  '#54a0ff', // Jim Jam Blue
];

// Helper to create walls easily
const createWallRect = (x: number, y: number, width: number, height: number): Furniture[] => {
    const walls: Furniture[] = [];
    // Top & Bottom
    for (let i = 0; i < width; i++) {
        walls.push({ id: `wall-t-${x+i}-${y}`, type: FurnitureType.WALL, position: { x: x + i, y: y }, rotation: 0 });
        walls.push({ id: `wall-b-${x+i}-${y+height-1}`, type: FurnitureType.WALL, position: { x: x + i, y: y + height - 1 }, rotation: 0 });
    }
    // Left & Right (excluding corners already added)
    for (let i = 1; i < height - 1; i++) {
        walls.push({ id: `wall-l-${x}-${y+i}`, type: FurnitureType.WALL, position: { x: x, y: y + i }, rotation: 0 });
        walls.push({ id: `wall-r-${x+width-1}-${y+i}`, type: FurnitureType.WALL, position: { x: x + width - 1, y: y + i }, rotation: 0 });
    }
    return walls;
};

const officeWalls = createWallRect(2, 2, 36, 26);

// Initial mock furniture
export const INITIAL_FURNITURE: Furniture[] = [
    // --- ZONES (Rugs) ---
    // Meeting Area Rug (Blueish)
    { id: 'rug-meeting', type: FurnitureType.FLOOR, position: { x: 25, y: 5 }, rotation: 90 }, 
    
    // Work Area Rug (Subtle)
    { id: 'rug-work', type: FurnitureType.FLOOR, position: { x: 5, y: 5 }, rotation: 0 },

    // Lounge Area Rug (Reddish)
    { id: 'rug-lounge', type: FurnitureType.FLOOR, position: { x: 25, y: 18 }, rotation: 180 },

    // --- WALLS ---
    ...officeWalls,

    // --- WORK AREA ---
    // Desk Cluster 1
    { id: 'desk-1', type: FurnitureType.DESK, position: { x: 6, y: 8 }, rotation: 0 },
    { id: 'chair-1', type: FurnitureType.CHAIR, position: { x: 6, y: 9 }, rotation: 0 },
    { id: 'desk-2', type: FurnitureType.DESK, position: { x: 8, y: 8 }, rotation: 0 },
    { id: 'chair-2', type: FurnitureType.CHAIR, position: { x: 8, y: 9 }, rotation: 0 },
    
    // Desk Cluster 2
    { id: 'desk-3', type: FurnitureType.DESK, position: { x: 6, y: 12 }, rotation: 0 },
    { id: 'chair-3', type: FurnitureType.CHAIR, position: { x: 6, y: 13 }, rotation: 0 },
    { id: 'desk-4', type: FurnitureType.DESK, position: { x: 8, y: 12 }, rotation: 0 },
    { id: 'chair-4', type: FurnitureType.CHAIR, position: { x: 8, y: 13 }, rotation: 0 },

    // Manager Desk
    { id: 'desk-mgr', type: FurnitureType.DESK, position: { x: 12, y: 10 }, rotation: 0 },
    { id: 'chair-mgr', type: FurnitureType.CHAIR, position: { x: 13, y: 10 }, rotation: 270 }, // Facing left
    { id: 'plant-mgr', type: FurnitureType.PLANT, position: { x: 12, y: 8 }, rotation: 0 },

    // --- MEETING AREA (Top Right) ---
    // Large Table constructed of desks
    { id: 'meet-1', type: FurnitureType.DESK, position: { x: 28, y: 8 }, rotation: 0 },
    { id: 'meet-2', type: FurnitureType.DESK, position: { x: 29, y: 8 }, rotation: 0 },
    { id: 'meet-3', type: FurnitureType.DESK, position: { x: 28, y: 9 }, rotation: 0 },
    { id: 'meet-4', type: FurnitureType.DESK, position: { x: 29, y: 9 }, rotation: 0 },
    // Chairs around
    { id: 'chair-m1', type: FurnitureType.CHAIR, position: { x: 27, y: 8 }, rotation: 90 },
    { id: 'chair-m2', type: FurnitureType.CHAIR, position: { x: 27, y: 9 }, rotation: 90 },
    { id: 'chair-m3', type: FurnitureType.CHAIR, position: { x: 30, y: 8 }, rotation: 270 },
    { id: 'chair-m4', type: FurnitureType.CHAIR, position: { x: 30, y: 9 }, rotation: 270 },

    // --- LOUNGE / RECEPTION (Bottom Right) ---
    { id: 'plant-l1', type: FurnitureType.PLANT, position: { x: 25, y: 24 }, rotation: 0 },
    { id: 'plant-l2', type: FurnitureType.PLANT, position: { x: 33, y: 24 }, rotation: 0 },
    { id: 'sofa-1', type: FurnitureType.CHAIR, position: { x: 27, y: 22 }, rotation: 0 }, // Using chair as sofa placeholder
    { id: 'sofa-2', type: FurnitureType.CHAIR, position: { x: 28, y: 22 }, rotation: 0 },
    { id: 'sofa-3', type: FurnitureType.CHAIR, position: { x: 29, y: 22 }, rotation: 0 },
    
    // Reception Desk
    { id: 'recep-1', type: FurnitureType.DESK, position: { x: 28, y: 19 }, rotation: 0 },
];

export const AI_NPC_POSITION = { x: 29 * TILE_SIZE + TILE_SIZE/2, y: 20 * TILE_SIZE };
export const AI_NPC_NAME = "Nova (AI)";