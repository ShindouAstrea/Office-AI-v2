import { Furniture, FurnitureType } from "./types";

export const TILE_SIZE = 48;
export const MOVE_SPEED = 4; // Pixels per frame
export const SPATIAL_AUDIO_RADIUS = 300; // Pixels
export const INTERACTION_RADIUS = 60; // Pixels

export const MAP_WIDTH = 40; // Tiles
export const MAP_HEIGHT = 30; // Tiles

export const AVATAR_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#06b6d4', // Cyan
];

// Initial mock furniture
export const INITIAL_FURNITURE: Furniture[] = [
    // Walls
    ...Array.from({ length: 20 }).map((_, i) => ({
        id: `wall-top-${i}`,
        type: FurnitureType.WALL,
        position: { x: i + 10, y: 5 },
        rotation: 0
    })),
    // Desks
    { id: 'desk-1', type: FurnitureType.DESK, position: { x: 12, y: 8 }, rotation: 0 },
    { id: 'desk-2', type: FurnitureType.DESK, position: { x: 15, y: 8 }, rotation: 0 },
    { id: 'desk-3', type: FurnitureType.DESK, position: { x: 12, y: 12 }, rotation: 0 },
    { id: 'desk-4', type: FurnitureType.DESK, position: { x: 15, y: 12 }, rotation: 0 },
    // Reception
    { id: 'reception-desk', type: FurnitureType.DESK, position: { x: 20, y: 20 }, rotation: 0 },
    { id: 'plant-1', type: FurnitureType.PLANT, position: { x: 19, y: 20 }, rotation: 0 },
    { id: 'plant-2', type: FurnitureType.PLANT, position: { x: 21, y: 20 }, rotation: 0 },
];

export const AI_NPC_POSITION = { x: 20 * TILE_SIZE, y: 19 * TILE_SIZE };
export const AI_NPC_NAME = "Nova (AI)";
