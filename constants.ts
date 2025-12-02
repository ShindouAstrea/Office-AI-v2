import { Furniture, FurnitureType, MapZone } from "./types";

export const TILE_SIZE = 48;
export const MOVE_SPEED = 6;
export const SPATIAL_AUDIO_RADIUS = 300;
export const INTERACTION_RADIUS = 80;

export const MAP_WIDTH = 40; // Tiles
export const MAP_HEIGHT = 30; // Tiles

export const AVATAR_COLORS = [
  '#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#5f27cd', '#ff9ff3', '#ff9f43', '#54a0ff'
];

export const STORAGE_KEYS = {
  FURNITURE: 'nexus_furniture_data_v1',
  CHAT: 'nexus_chat_history_v1',
  USER_PREFS: 'nexus_user_prefs_v1'
};

// Zones for Logic (Muting & Notifications)
export const KITCHEN_ZONE = { x: 2, y: 2, w: 10, h: 10 };
export const BATHROOM_ZONE = { x: 28, y: 2, w: 10, h: 8 };
export const OFFICE_1_ZONE = { x: 2, y: 18, w: 10, h: 10 };
export const OFFICE_2_ZONE = { x: 28, y: 18, w: 10, h: 10 };

// Zones for Rendering (Floor styles)
export const MAP_ZONES: MapZone[] = [
    { ...KITCHEN_ZONE, type: 'KITCHEN' },
    { ...BATHROOM_ZONE, type: 'BATHROOM' },
    { ...OFFICE_1_ZONE, type: 'OFFICE' },
    { ...OFFICE_2_ZONE, type: 'OFFICE' }
];

// Helper: Create walls with optional door gaps
const createRoom = (x: number, y: number, w: number, h: number, doorSide: 'top'|'bottom'|'left'|'right', doorPos: number): Furniture[] => {
    const walls: Furniture[] = [];
    
    // Top
    for(let i=0; i<w; i++) {
        if (doorSide === 'top' && i === doorPos) continue; // Door gap
        walls.push({ id: `w-t-${x+i}-${y}`, type: FurnitureType.WALL, position: {x: x+i, y}, rotation: 0, variant: 0});
    }
    // Bottom
    for(let i=0; i<w; i++) {
        if (doorSide === 'bottom' && i === doorPos) continue;
        walls.push({ id: `w-b-${x+i}-${y+h-1}`, type: FurnitureType.WALL, position: {x: x+i, y: y+h-1}, rotation: 0, variant: 0});
    }
    // Left
    for(let i=1; i<h-1; i++) {
        if (doorSide === 'left' && i === doorPos) continue;
        walls.push({ id: `w-l-${x}-${y+i}`, type: FurnitureType.WALL, position: {x, y: y+i}, rotation: 0, variant: 0});
    }
    // Right
    for(let i=1; i<h-1; i++) {
        if (doorSide === 'right' && i === doorPos) continue;
        walls.push({ id: `w-r-${x+w-1}-${y+i}`, type: FurnitureType.WALL, position: {x: x+w-1, y: y+i}, rotation: 0, variant: 0});
    }
    return walls;
};

// --- LAYOUT GENERATION ---
const outerWalls = createRoom(0, 0, MAP_WIDTH, MAP_HEIGHT, 'bottom', 20); // Main building with entrance at bottom

// 1. Kitchen (Top Left)
const kitchenWalls = createRoom(KITCHEN_ZONE.x, KITCHEN_ZONE.y, KITCHEN_ZONE.w, KITCHEN_ZONE.h, 'right', 5);

// 2. Bathroom (Top Right)
const bathroomWalls = createRoom(BATHROOM_ZONE.x, BATHROOM_ZONE.y, BATHROOM_ZONE.w, BATHROOM_ZONE.h, 'left', 4);
// Bathroom Stalls (Internal Walls)
const stallWalls: Furniture[] = [
    { id: 'stall-1', type: FurnitureType.WALL, position: {x: 32, y: 2}, rotation: 0, variant: 0 },
    { id: 'stall-1b', type: FurnitureType.WALL, position: {x: 32, y: 3}, rotation: 0, variant: 0 },
    { id: 'stall-2', type: FurnitureType.WALL, position: {x: 35, y: 2}, rotation: 0, variant: 0 },
    { id: 'stall-2b', type: FurnitureType.WALL, position: {x: 35, y: 3}, rotation: 0, variant: 0 },
];

// 3. Private Office 1 (Bottom Left)
const office1Walls = createRoom(OFFICE_1_ZONE.x, OFFICE_1_ZONE.y, OFFICE_1_ZONE.w, OFFICE_1_ZONE.h, 'right', 4);

// 4. Private Office 2 (Bottom Right)
const office2Walls = createRoom(OFFICE_2_ZONE.x, OFFICE_2_ZONE.y, OFFICE_2_ZONE.w, OFFICE_2_ZONE.h, 'left', 4);


export const INITIAL_FURNITURE: Furniture[] = [
    ...outerWalls,
    ...kitchenWalls,
    ...bathroomWalls,
    ...stallWalls,
    ...office1Walls,
    ...office2Walls,

    // --- KITCHEN ITEMS ---
    // Counter / Service Area (Top Wall)
    { id: 'k-coffee-1', type: FurnitureType.COFFEE_MAKER, position: {x: 3, y: 2}, rotation: 0, variant: 0 },
    { id: 'k-food-counter', type: FurnitureType.FOOD, position: {x: 4, y: 2}, rotation: 0, variant: 0 },
    { id: 'k-coffee-2', type: FurnitureType.COFFEE_MAKER, position: {x: 5, y: 2}, rotation: 0, variant: 0 },
    { id: 'k-sink-1', type: FurnitureType.SINK, position: {x: 7, y: 2}, rotation: 0, variant: 0 },
    { id: 'k-sink-2', type: FurnitureType.SINK, position: {x: 8, y: 2}, rotation: 0, variant: 0 },

    // Dining Table 1 (Top Left)
    { id: 'k-table-1', type: FurnitureType.TABLE_ROUND, position: {x: 4, y: 5}, rotation: 0, variant: 0 },
    { id: 'k-food-1', type: FurnitureType.FOOD, position: {x: 4, y: 5}, rotation: 0, variant: 0 }, 
    { id: 'k-chair-1-n', type: FurnitureType.CHAIR, position: {x: 4, y: 4}, rotation: 180, variant: 0 },
    { id: 'k-chair-1-s', type: FurnitureType.CHAIR, position: {x: 4, y: 6}, rotation: 0, variant: 0 },
    { id: 'k-chair-1-w', type: FurnitureType.CHAIR, position: {x: 3, y: 5}, rotation: 90, variant: 0 },
    { id: 'k-chair-1-e', type: FurnitureType.CHAIR, position: {x: 5, y: 5}, rotation: 270, variant: 0 },

    // Dining Table 2 (Top Right)
    { id: 'k-table-2', type: FurnitureType.TABLE_ROUND, position: {x: 9, y: 5}, rotation: 0, variant: 0 },
    { id: 'k-food-2', type: FurnitureType.FOOD, position: {x: 9, y: 5}, rotation: 0, variant: 0 },
    { id: 'k-chair-2-n', type: FurnitureType.CHAIR, position: {x: 9, y: 4}, rotation: 180, variant: 0 },
    { id: 'k-chair-2-s', type: FurnitureType.CHAIR, position: {x: 9, y: 6}, rotation: 0, variant: 0 },
    { id: 'k-chair-2-w', type: FurnitureType.CHAIR, position: {x: 8, y: 5}, rotation: 90, variant: 0 },
    { id: 'k-chair-2-e', type: FurnitureType.CHAIR, position: {x: 10, y: 5}, rotation: 270, variant: 0 },

    // Dining Table 3 (Bottom Center)
    { id: 'k-table-3', type: FurnitureType.TABLE_ROUND, position: {x: 6, y: 9}, rotation: 0, variant: 0 },
    { id: 'k-chair-3-n', type: FurnitureType.CHAIR, position: {x: 6, y: 8}, rotation: 180, variant: 0 },
    { id: 'k-chair-3-s', type: FurnitureType.CHAIR, position: {x: 6, y: 10}, rotation: 0, variant: 0 },
    { id: 'k-chair-3-w', type: FurnitureType.CHAIR, position: {x: 5, y: 9}, rotation: 90, variant: 0 },
    { id: 'k-chair-3-e', type: FurnitureType.CHAIR, position: {x: 7, y: 9}, rotation: 270, variant: 0 },
    
    // Decor
    { id: 'k-plant-1', type: FurnitureType.PLANT, position: {x: 2, y: 11}, rotation: 0, variant: 0 },

    // --- BATHROOM ITEMS ---
    { id: 'b-sink-1', type: FurnitureType.SINK, position: {x: 30, y: 8}, rotation: 0, variant: 0 },
    { id: 'b-sink-2', type: FurnitureType.SINK, position: {x: 32, y: 8}, rotation: 0, variant: 0 },
    { id: 'b-toilet-1', type: FurnitureType.TOILET, position: {x: 30, y: 3}, rotation: 0, variant: 0 },
    { id: 'b-toilet-2', type: FurnitureType.TOILET, position: {x: 33, y: 3}, rotation: 0, variant: 0 },
    { id: 'b-toilet-3', type: FurnitureType.TOILET, position: {x: 36, y: 3}, rotation: 0, variant: 0 },

    // --- OFFICE 1 (Manager) ---
    { id: 'o1-desk', type: FurnitureType.DESK, position: {x: 6, y: 22}, rotation: 0, variant: 0 },
    { id: 'o1-chair', type: FurnitureType.CHAIR, position: {x: 6, y: 23}, rotation: 0, variant: 0 },
    { id: 'o1-plant', type: FurnitureType.PLANT, position: {x: 3, y: 19}, rotation: 0, variant: 0 },
    { id: 'o1-screen', type: FurnitureType.SCREEN, position: {x: 6, y: 22}, rotation: 0, variant: 0 },

    // --- OFFICE 2 (Dev) ---
    { id: 'o2-desk', type: FurnitureType.DESK, position: {x: 32, y: 22}, rotation: 0, variant: 0 },
    { id: 'o2-chair', type: FurnitureType.CHAIR, position: {x: 32, y: 23}, rotation: 0, variant: 0 },
    { id: 'o2-screen', type: FurnitureType.SCREEN, position: {x: 32, y: 22}, rotation: 0, variant: 0 },

    // --- MAIN HALL (Open Space) ---
    // Island 1
    { id: 'm-desk-1', type: FurnitureType.DESK, position: {x: 16, y: 10}, rotation: 0, variant: 0 },
    { id: 'm-screen-1', type: FurnitureType.SCREEN, position: {x: 16, y: 10}, rotation: 0, variant: 0 },
    { id: 'm-chair-1', type: FurnitureType.CHAIR, position: {x: 16, y: 11}, rotation: 0, variant: 0 },

    { id: 'm-desk-2', type: FurnitureType.DESK, position: {x: 18, y: 10}, rotation: 0, variant: 0 },
    { id: 'm-screen-2', type: FurnitureType.SCREEN, position: {x: 18, y: 10}, rotation: 0, variant: 0 },
    { id: 'm-chair-2', type: FurnitureType.CHAIR, position: {x: 18, y: 11}, rotation: 0, variant: 0 },

    { id: 'm-desk-3', type: FurnitureType.DESK, position: {x: 20, y: 10}, rotation: 0, variant: 0 },
    { id: 'm-screen-3', type: FurnitureType.SCREEN, position: {x: 20, y: 10}, rotation: 0, variant: 0 },
    { id: 'm-chair-3', type: FurnitureType.CHAIR, position: {x: 20, y: 11}, rotation: 0, variant: 0 },

    // Island 2
    { id: 'm-desk-4', type: FurnitureType.DESK, position: {x: 16, y: 14}, rotation: 0, variant: 0 },
    { id: 'm-screen-4', type: FurnitureType.SCREEN, position: {x: 16, y: 14}, rotation: 0, variant: 0 },
    { id: 'm-chair-4', type: FurnitureType.CHAIR, position: {x: 16, y: 13}, rotation: 180, variant: 0 }, 

    { id: 'm-desk-5', type: FurnitureType.DESK, position: {x: 18, y: 14}, rotation: 0, variant: 0 },
    { id: 'm-screen-5', type: FurnitureType.SCREEN, position: {x: 18, y: 14}, rotation: 0, variant: 0 },
    { id: 'm-chair-5', type: FurnitureType.CHAIR, position: {x: 18, y: 13}, rotation: 180, variant: 0 },

    { id: 'm-desk-6', type: FurnitureType.DESK, position: {x: 20, y: 14}, rotation: 0, variant: 0 },
    { id: 'm-screen-6', type: FurnitureType.SCREEN, position: {x: 20, y: 14}, rotation: 0, variant: 0 },
    { id: 'm-chair-6', type: FurnitureType.CHAIR, position: {x: 20, y: 13}, rotation: 180, variant: 0 },

    // Plants for Decoration
    { id: 'deco-p1', type: FurnitureType.PLANT, position: {x: 14, y: 8}, rotation: 0, variant: 0 },
    { id: 'deco-p2', type: FurnitureType.PLANT, position: {x: 24, y: 8}, rotation: 0, variant: 0 },
    { id: 'deco-p3', type: FurnitureType.PLANT, position: {x: 14, y: 16}, rotation: 0, variant: 0 },
    { id: 'deco-p4', type: FurnitureType.PLANT, position: {x: 24, y: 16}, rotation: 0, variant: 0 },
    
    // NEW: ARCADE MACHINE (Lounge Area)
    { id: 'arcade-1', type: FurnitureType.ARCADE, position: {x: 22, y: 22}, rotation: 0, variant: 0 },
];