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
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  position: Position;
  rotation: number; // 0, 90, 180, 270
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

export interface AIResponseState {
    text: string;
    loading: boolean;
}
