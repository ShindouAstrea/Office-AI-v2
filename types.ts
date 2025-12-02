export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum FurnitureType {
  WALL = 'WALL',
  DESK = 'DESK',
  PLANT = 'PLANT',
  CHAIR = 'CHAIR',
  FLOOR = 'FLOOR',
  // New items
  COFFEE_MAKER = 'COFFEE_MAKER',
  SCREEN = 'SCREEN',
  TOILET = 'TOILET',
  SINK = 'SINK',
  FOOD = 'FOOD',
  TABLE_ROUND = 'TABLE_ROUND',
  // Additional items for rendering
  RUG = 'RUG',
  BOOKSHELF = 'BOOKSHELF',
  COUCH = 'COUCH',
  WHITEBOARD = 'WHITEBOARD',
  PRINTER = 'PRINTER',
  LAMP = 'LAMP',
  // Tool types
  DELETE = 'DELETE'
}

export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  position: Position;
  targetPosition: Position; // For smooth interpolation
  isTalking: boolean;
  avatarId: number;
  // Changed to string to support custom statuses
  status?: string; 
  room?: string;
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  position: Position;
  rotation: number; // 0, 90, 180, 270
  variant?: number; // 0: Default, 1: Alt Color, 2: Alt Style, etc.
}

export interface MapZone {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'KITCHEN' | 'BATHROOM' | 'OFFICE';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isPrivate: boolean;
  targetId?: string;
}

export interface GameState {
  currentUser: Player | null;
  peers: Player[];
  furniture: Furniture[];
  chatHistory: ChatMessage[];
  mode: 'PLAY' | 'BUILD' | 'LOBBY';
}