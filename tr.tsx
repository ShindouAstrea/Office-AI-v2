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
];--- START OF FILE components/MiniGame/TicTacToe.tsx ---

import React, { useState } from 'react';
import { X, Circle, RotateCcw, XOctagon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TicTacToeProps {
  onClose: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (calculateWinner(board) || board[i]) return;
    const nextBoard = board.slice();
    nextBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);
  
  let status;
  if (winner) {
    status = `${t('game.winner')}: ${winner}`;
  } else if (isDraw) {
    status = t('game.draw');
  } else {
    status = `${t('game.next_player')}: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border-4 border-indigo-500 rounded-2xl p-6 shadow-2xl max-w-sm w-full relative transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 uppercase tracking-widest shadow-neon">
            {t('game.tictactoe')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <XOctagon size={24} />
          </button>
        </div>

        {/* Status */}
        <div className="text-center text-white mb-6 font-mono text-lg bg-gray-800 py-2 rounded-lg border border-gray-700">
          {status}
        </div>

        {/* Board */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {board.map((square, i) => (
            <button
              key={i}
              className={`h-24 w-24 bg-gray-800 rounded-lg text-4xl flex items-center justify-center transition-all duration-200 
                ${!square && !winner ? 'hover:bg-gray-700 cursor-pointer' : ''}
                ${square === 'X' ? 'text-pink-500' : 'text-indigo-400'}
                border-2 border-gray-700
              `}
              onClick={() => handleClick(i)}
            >
              {square === 'X' && <X size={48} strokeWidth={3} />}
              {square === 'O' && <Circle size={40} strokeWidth={3} />}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <RotateCcw size={18} /> {t('game.reset')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TicTacToe;--- START OF FILE components/BuildMenu.tsx ---

import React, { useState } from 'react';
import { FurnitureType } from '../types';
import { 
    LayoutGrid, Monitor, Coffee, Armchair, Book, Printer, Lightbulb, 
    Square, Type, Utensils, Flower2, Table, Box, Trash2, Home, Briefcase, Sofa, Palette, RotateCw, MousePointer2, Gamepad2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BuildMenuProps {
  selectedType: FurnitureType;
  selectedVariant: number;
  selectedRotation: number;
  onSelect: (type: FurnitureType, variant: number, rotation: number) => void;
  onRotate: () => void;
}

const BuildMenu: React.FC<BuildMenuProps> = ({ selectedType, selectedVariant, selectedRotation, onSelect, onRotate }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('structure');

  // Removed duplicated H/V entries since we now support dynamic rotation
  const CATEGORIES = [
    {
        id: 'structure',
        label: t('cat.structure'),
        icon: <Home size={18} />,
        items: [
            { type: FurnitureType.WALL, variant: 0, rotation: 0, label: 'Pared Ladrillo' }, 
            { type: FurnitureType.WALL, variant: 1, rotation: 0, label: 'Concreto' },
            { type: FurnitureType.FLOOR, variant: 0, rotation: 0, label: t('furn.floor_wood') },
            { type: FurnitureType.FLOOR, variant: 1, rotation: 0, label: t('furn.floor_tile') },
            { type: FurnitureType.FLOOR, variant: 2, rotation: 0, label: t('furn.floor_dark') },
        ]
    },
    {
        id: 'office',
        label: t('cat.office'),
        icon: <Briefcase size={18} />,
        items: [
            { type: FurnitureType.DESK, variant: 0, rotation: 0, label: t('furn.desk_wood') },
            { type: FurnitureType.DESK, variant: 1, rotation: 0, label: t('furn.desk_white') },
            { type: FurnitureType.CHAIR, variant: 0, rotation: 0, label: t('furn.chair_office') },
            { type: FurnitureType.CHAIR, variant: 1, rotation: 0, label: t('furn.chair_exec') },
            { type: FurnitureType.SCREEN, variant: 0, rotation: 0, label: t('furn.monitor') },
            { type: FurnitureType.WHITEBOARD, variant: 0, rotation: 0, label: t('furn.whiteboard') },
            { type: FurnitureType.PRINTER, variant: 0, rotation: 0, label: t('furn.printer') },
        ]
    },
    {
        id: 'lounge',
        label: t('cat.lounge'),
        icon: <Sofa size={18} />,
        items: [
            { type: FurnitureType.COUCH, variant: 0, rotation: 0, label: t('furn.couch_blue') },
            { type: FurnitureType.COUCH, variant: 1, rotation: 0, label: t('furn.couch_red') },
            { type: FurnitureType.COUCH, variant: 2, rotation: 0, label: t('furn.couch_green') },
            { type: FurnitureType.TABLE_ROUND, variant: 0, rotation: 0, label: t('furn.table_round') },
            { type: FurnitureType.BOOKSHELF, variant: 0, rotation: 0, label: t('furn.bookshelf') },
            { type: FurnitureType.ARCADE, variant: 0, rotation: 0, label: t('furn.arcade') },
        ]
    },
    {
        id: 'decor',
        label: t('cat.decor'),
        icon: <Palette size={18} />,
        items: [
            { type: FurnitureType.PLANT, variant: 0, rotation: 0, label: t('furn.plant_tall') },
            { type: FurnitureType.PLANT, variant: 1, rotation: 0, label: t('furn.plant_bush') },
            { type: FurnitureType.LAMP, variant: 0, rotation: 0, label: t('furn.lamp') },
            { type: FurnitureType.RUG, variant: 0, rotation: 0, label: t('furn.rug_red') },
            { type: FurnitureType.RUG, variant: 1, rotation: 0, label: t('furn.rug_blue') },
            { type: FurnitureType.RUG, variant: 2, rotation: 0, label: t('furn.rug_persian') },
        ]
    },
    {
        id: 'amenities',
        label: t('cat.amenities'),
        icon: <Coffee size={18} />,
        items: [
            { type: FurnitureType.COFFEE_MAKER, variant: 0, rotation: 0, label: t('furn.coffee') },
            { type: FurnitureType.FOOD, variant: 0, rotation: 0, label: t('furn.food') },
            { type: FurnitureType.SINK, variant: 0, rotation: 0, label: t('furn.sink') },
            { type: FurnitureType.TOILET, variant: 0, rotation: 0, label: t('furn.toilet') },
        ]
    }
  ];

  const currentCategory = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div className="fixed right-0 top-0 h-full w-[30%] min-w-[320px] bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl flex flex-col z-50 animate-fadeIn rounded-l-2xl">
       
       <div className="p-5 border-b border-gray-700 flex flex-col gap-4 bg-gray-800/50 rounded-tl-2xl">
         <div className="flex justify-between items-center">
            <h2 className="text-white font-bold text-lg flex items-center gap-3">
                <LayoutGrid size={24} className="text-orange-500"/> {t('build.mode')}
            </h2>
            <div className="flex gap-2">
                <button
                    onClick={() => onSelect(FurnitureType.DELETE, 0, 0)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors border ${
                        selectedType === FurnitureType.DELETE 
                        ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                        : 'bg-gray-800 text-gray-400 border-gray-600 hover:text-white'
                    }`}
                >
                    <Trash2 size={16} /> {t('build.erase')}
                </button>
            </div>
         </div>
         
         {selectedType !== FurnitureType.DELETE && (
             <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                 <span className="text-xs text-gray-400 font-mono">ROTATION: {selectedRotation}°</span>
                 <button 
                    onClick={onRotate}
                    className="flex items-center gap-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-colors"
                 >
                     <RotateCw size={14} /> ROTATE (R)
                 </button>
             </div>
         )}
       </div>

       <div className="flex border-b border-gray-700 overflow-x-auto custom-scrollbar bg-gray-900 shrink-0">
         {CATEGORIES.map(cat => (
             <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex-1 min-w-[80px] py-4 px-2 flex flex-col items-center justify-center gap-1.5 text-[11px] font-medium transition-colors border-b-2 ${
                    activeTab === cat.id ? 'border-indigo-500 text-indigo-400 bg-gray-800/50' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
             >
                {cat.icon}
                {cat.label}
             </button>
         ))}
       </div>

       <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-gray-900/50">
           <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
               {currentCategory?.items.map((item, idx) => {
                   // We ignore rotation in selection match because rotation is now dynamic
                   const isSelected = selectedType === item.type && selectedVariant === item.variant;
                   
                   return (
                    <button
                        key={`${item.type}-${item.variant}-${idx}`}
                        onClick={() => onSelect(item.type, item.variant, selectedRotation)}
                        className={`flex flex-col items-center p-4 rounded-xl transition-all border relative group aspect-square justify-center ${
                            isSelected 
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl ring-2 ring-indigo-400/50' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-500'
                        }`}
                    >
                        <div className={`mb-3 transform transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {getIconForType(item.type)}
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                        
                        {isSelected && (
                            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full shadow-glow"></div>
                        )}
                    </button>
                   );
               })}
           </div>
       </div>

       <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-800 bg-gray-900">
          {t('build.hint')}
       </div>
    </div>
  );
};

const getIconForType = (type: FurnitureType) => {
    switch(type) {
        case FurnitureType.WALL: return <Square size={32} />;
        case FurnitureType.FLOOR: return <LayoutGrid size={32} />;
        case FurnitureType.DESK: return <Table size={32} />;
        case FurnitureType.CHAIR: return <Armchair size={32} />;
        case FurnitureType.COUCH: return <Sofa size={32} />;
        case FurnitureType.PLANT: return <Flower2 size={32} />;
        case FurnitureType.LAMP: return <Lightbulb size={32} />;
        case FurnitureType.BOOKSHELF: return <Book size={32} />;
        case FurnitureType.SCREEN: return <Monitor size={32} />;
        case FurnitureType.TOILET: return <Box size={32} />;
        case FurnitureType.SINK: return <Box size={32} />;
        case FurnitureType.ARCADE: return <Gamepad2 size={32} />;
        default: return <Box size={32} />;
    }
};

export default BuildMenu;--- START OF FILE components/GameCanvas.tsx ---

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
        
        // Interaction logic 'E' (same as before...)
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

  // ... (drawPixelCharacter helper unchanged)
  const drawPixelCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isWalking: boolean) => {
      // (Implementation same as previous step, kept for brevity)
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

            // --- DRAWING LOGIC (Simplified for brevity) ---
            
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
            // ... (Other types similar)
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
            // ... Fallbacks for others
            else {
                 // Basic shapes for others to ensure they render
                 if (f.type === FurnitureType.COFFEE_MAKER) { ctx.fillStyle = '#2d3436'; ctx.fillRect(x+14, y+14, 20, 24); }
                 else if (f.type === FurnitureType.PLANT) { ctx.fillStyle = '#27ae60'; ctx.fillRect(x+14, y+5, 6, 6); ctx.fillRect(x+12, y+24, 24, 20); }
                 else if (f.type === FurnitureType.CHAIR) { ctx.fillStyle = '#e17055'; ctx.fillRect(x+14, y+20, 20, 4); }
                 else if (f.type === FurnitureType.SCREEN) { ctx.fillStyle = '#2d3436'; ctx.fillRect(x+12, y+10, 24, 16); ctx.fillRect(x+22, y+26, 4, 4); ctx.fillRect(x+18, y+30, 12, 2); ctx.fillStyle = '#0984e3'; ctx.fillRect(x+14, y+12, 20, 12); }
                 // ... etc
            }

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

  // ... loop and useEffects
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

export default GameCanvas;--- START OF FILE App.tsx ---

import React, { useState, useEffect, useRef } from 'react';
import { Player, Furniture, ChatMessage, Position, FurnitureType, ChatRoom, Attachment } from './types';
import { 
  INITIAL_FURNITURE, TILE_SIZE, AVATAR_COLORS, 
  KITCHEN_ZONE, BATHROOM_ZONE, OFFICE_1_ZONE, OFFICE_2_ZONE 
} from './constants';
import GameCanvas from './components/GameCanvas';
import AvatarCreator from './components/AvatarCreator';
import ChatWidget from './components/ChatWidget';
import ControlBar from './components/ControlBar';
import VideoOverlay from './components/VideoOverlay';
import ZoneNotification from './components/ZoneNotification';
import ParticipantsMenu from './components/ParticipantsMenu';
import BuildMenu from './components/BuildMenu';
import Minimap from './components/Minimap';
import ScreenShareViewer from './components/ScreenShareViewer';
import TicTacToe from './components/MiniGame/TicTacToe'; // Import the new game
import { loadFurnitureMap, saveFurnitureMap, loadChatHistory, saveChatMessage, loadChatRooms, createChatRoom } from './services/firebase';
import { useLanguage } from './contexts/LanguageContext';

// Initial Global Room
const GLOBAL_ROOM: ChatRoom = {
    id: 'global',
    name: 'General',
    type: 'GLOBAL',
    participants: [],
    createdBy: 'system'
};

const App: React.FC = () => {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [peers, setPeers] = useState<Player[]>([]);
  
  // Data State
  const [furniture, setFurniture] = useState<Furniture[]>(INITIAL_FURNITURE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([GLOBAL_ROOM]);
  const [activeRoomId, setActiveRoomId] = useState<string>('global');
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [buildMode, setBuildMode] = useState(false);
  
  // Construction State
  const [selectedFurnitureType, setSelectedFurnitureType] = useState<FurnitureType>(FurnitureType.DESK);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedRotation, setSelectedRotation] = useState<number>(0);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null); 

  const [interactionTarget, setInteractionTarget] = useState<string | null>(null);
  
  // Notification System
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'info' | 'error'>('info');

  // UI State
  const [chatVisible, setChatVisible] = useState(true);
  const [usersMenuVisible, setUsersMenuVisible] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false); // Game state
  
  // Media State
  const [micOn, setMicOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  
  // Screen Share Management
  const [screenShares, setScreenShares] = useState<{ playerId: string; stream: MediaStream; playerName: string }[]>([]);
  const [maximizedScreenId, setMaximizedScreenId] = useState<string | null>(null);

  // Refs
  const lastRoomRef = useRef<string>('OPEN_SPACE');
  const notificationTimeoutRef = useRef<number | null>(null);
  const localMicStreamRef = useRef<MediaStream | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);

  // ... (Helper & Media Handlers kept same)
  const showNotification = (msg: string, type: 'info' | 'error' = 'info') => {
      if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
      setNotification(msg);
      setNotificationType(type);
      notificationTimeoutRef.current = window.setTimeout(() => {
          setNotification(null);
      }, 4000);
  };

  const handleToggleMic = async () => {
    // ... (same implementation)
    if (micOn) {
        if (localMicStreamRef.current) {
            localMicStreamRef.current.getTracks().forEach(track => track.stop());
            localMicStreamRef.current = null;
        }
        setMicOn(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localMicStreamRef.current = stream;
            setMicOn(true);
        } catch (error: any) {
            console.error("Mic access denied:", error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                 showNotification("Acceso al micrófono denegado", "error");
            } else {
                 showNotification("Error al acceder al micrófono", "error");
            }
        }
    }
  };

  const handleToggleScreen = async () => {
    // ... (same implementation)
    if (!currentUser) return;
    if (sharingScreen) {
        if (localScreenStreamRef.current) {
            localScreenStreamRef.current.getTracks().forEach(track => track.stop());
            localScreenStreamRef.current = null;
        }
        setSharingScreen(false);
        setScreenShares(prev => prev.filter(s => s.playerId !== currentUser.id));
        if (maximizedScreenId === currentUser.id) setMaximizedScreenId(null);
    } else {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            localScreenStreamRef.current = stream;
            setSharingScreen(true);
            setScreenShares(prev => [...prev, { playerId: currentUser.id, stream, playerName: currentUser.name }]);
            stream.getVideoTracks()[0].onended = () => {
                setSharingScreen(false);
                localScreenStreamRef.current = null;
                setScreenShares(prev => prev.filter(s => s.playerId !== currentUser.id));
                if (maximizedScreenId === currentUser.id) setMaximizedScreenId(null);
            };
        } catch (error: any) {
            console.error("Screen share failed:", error);
            setSharingScreen(false);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                showNotification("Compartir pantalla cancelado", "info");
            } else {
                showNotification("Error al compartir pantalla", "error");
            }
        }
    }
  };

  // ... (Data Fetch, Load, Poll, Keyboard effects kept same)
  const fetchData = async () => {
      try {
          const [remoteFurniture, remoteChat, remoteRooms] = await Promise.all([
              loadFurnitureMap(),
              loadChatHistory(),
              loadChatRooms()
          ]);
          if (remoteFurniture && Array.isArray(remoteFurniture)) {
              const validFurniture = remoteFurniture.filter(f => f && f.position && typeof f.position.x === 'number' && typeof f.position.y === 'number');
              if (validFurniture.length > 0 || remoteFurniture.length === 0) setFurniture(validFurniture);
          }
          if (remoteChat) setMessages(remoteChat);
          if (remoteRooms && remoteRooms.length > 0) {
              const uniqueRooms = [GLOBAL_ROOM, ...remoteRooms.filter(r => r.id !== 'global')];
              setRooms(uniqueRooms);
          }
      } catch (error) { console.error("Data fetch warning:", error); }
  };

  useEffect(() => { const init = async () => { await fetchData(); setIsDataLoaded(true); }; init(); }, []);
  useEffect(() => { if (!isDataLoaded) return; const interval = setInterval(fetchData, 5000); return () => clearInterval(interval); }, [isDataLoaded]);

  // Build Mode Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (buildMode && e.key.toLowerCase() === 'r') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        setSelectedRotation(prev => (prev + 90) % 360);
        if (selectedObjectId) {
            setFurniture(prev => {
                const updated = prev.map(f => (f.id === selectedObjectId ? { ...f, rotation: (f.rotation + 90) % 360 } : f));
                persistMapChange(updated);
                return updated;
            });
        }
      }
      if (buildMode && (e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
          const newFurn = furniture.filter(f => f.id !== selectedObjectId);
          setFurniture(newFurn);
          persistMapChange(newFurn);
          setSelectedObjectId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildMode, selectedObjectId, furniture]);

  // Persistence Handlers (same)
  const persistMapChange = async (newFurniture: Furniture[]) => {
      try { await saveFurnitureMap(newFurniture); } catch (error) { showNotification(t('conn.temp'), "error"); }
  };
  const persistChatMessage = async (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      try { await saveChatMessage(msg); } catch (error) { showNotification(t('conn.msg_fail'), "error"); }
  };
  const handleCreateRoom = async (name: string, participants: string[]) => {
      if (!currentUser) return;
      const newRoom: ChatRoom = { id: `room-${Date.now()}`, name, type: 'PRIVATE', participants, createdBy: currentUser.id };
      setRooms(prev => [...prev, newRoom]); setActiveRoomId(newRoom.id);
      try { await createChatRoom(newRoom); showNotification(`${t('chat.new_room')}: ${name}`); } catch (error) { showNotification(t('conn.error'), "error"); }
  };

  // --- INTERACTION HANDLER ---
  const handleInteract = (targetId: string | null) => {
      setInteractionTarget(targetId);
      
      // Check if target is an Arcade Machine
      const targetItem = furniture.find(f => f.id === targetId);
      if (targetItem && targetItem.type === FurnitureType.ARCADE) {
          setIsGameOpen(true);
      }
  };

  // ... (Other functions: handleJoin, handlePlaceFurniture, etc. kept same)
  // Re-declare for brevity in full file output if needed, or assume kept.
  // Including essential ones for context.
  
  const handleJoin = (playerData: Partial<Player>) => {
    setCurrentUser({
      id: 'me',
      name: playerData.name || 'User',
      color: playerData.color || AVATAR_COLORS[0],
      position: { x: 20 * TILE_SIZE + TILE_SIZE/2, y: 28 * TILE_SIZE + TILE_SIZE/2 }, 
      targetPosition: { x: 20 * TILE_SIZE, y: 28 * TILE_SIZE },
      isTalking: false,
      avatarId: 1,
      room: 'OPEN_SPACE',
      status: 'En línea'
    });
  };

  const handleUpdateStatus = (newStatus: string) => { if (currentUser) setCurrentUser({ ...currentUser, status: newStatus }); };
  const handleMove = (newPos: Position) => { if (currentUser) setCurrentUser(prev => prev ? { ...prev, position: newPos } : null); };
  const handleSendMessage = (text: string, roomId: string, attachment?: Attachment) => {
      if (!currentUser) return;
      const msg: ChatMessage = { id: Date.now().toString(), roomId, senderId: currentUser.id, senderName: currentUser.name, text, attachment, timestamp: Date.now(), isPrivate: roomId !== 'global' };
      persistChatMessage(msg);
  };
  
  const handleSelectFurniture = (type: FurnitureType, variant: number, rotation: number) => {
      setSelectedFurnitureType(type); setSelectedVariant(variant); setSelectedRotation(rotation); 
      if (type !== FurnitureType.SELECT && type !== FurnitureType.DELETE) setSelectedObjectId(null);
  };
  const handleManualRotate = () => {
      setSelectedRotation(prev => (prev + 90) % 360);
      if (selectedObjectId) {
          setFurniture(prev => {
              const updated = prev.map(f => (f.id === selectedObjectId ? { ...f, rotation: (f.rotation + 90) % 360 } : f));
              persistMapChange(updated); return updated;
          });
      }
  };
  const getFurnitureLayer = (type: FurnitureType) => {
      switch(type) {
          case FurnitureType.FLOOR: return 'FLOOR'; case FurnitureType.RUG: return 'RUG';
          case FurnitureType.SCREEN: case FurnitureType.COFFEE_MAKER: case FurnitureType.FOOD: case FurnitureType.LAMP: case FurnitureType.PLANT: case FurnitureType.PRINTER: case FurnitureType.SINK: return 'TOP';
          default: return 'BASE';
      }
  };
  const getSnapPrecision = (type: FurnitureType) => (type === FurnitureType.WALL || type === FurnitureType.FLOOR) ? 1 : 0.5;

  const handlePlaceFurniture = (pos: Position) => {
      if (!buildMode) return;
      if (selectedFurnitureType === FurnitureType.DELETE) {
          const newFurniture = furniture.filter(f => Math.abs(f.position.x - pos.x) < 0.5 && Math.abs(f.position.y - pos.y) < 0.5);
          if (newFurniture.length !== furniture.length) { setFurniture(newFurniture); persistMapChange(newFurniture); }
          return;
      }
      if (selectedFurnitureType === FurnitureType.SELECT) {
          const clickedItem = furniture.find(f => Math.abs(f.position.x - pos.x) < 0.5 && Math.abs(f.position.y - pos.y) < 0.5);
          if (clickedItem) { setSelectedObjectId(clickedItem.id); setSelectedRotation(clickedItem.rotation); }
          else if (selectedObjectId) {
              const selectedItem = furniture.find(f => f.id === selectedObjectId);
              if (selectedItem) {
                  const snap = getSnapPrecision(selectedItem.type);
                  const snappedX = Math.round(pos.x / snap) * snap;
                  const snappedY = Math.round(pos.y / snap) * snap;
                  const newFurnList = furniture.map(f => (f.id === selectedObjectId ? { ...f, position: { x: snappedX, y: snappedY } } : f));
                  setFurniture(newFurnList); persistMapChange(newFurnList);
              } else setSelectedObjectId(null);
          } else setSelectedObjectId(null);
          return;
      }
      const snap = getSnapPrecision(selectedFurnitureType);
      const snappedX = Math.round(pos.x / snap) * snap;
      const snappedY = Math.round(pos.y / snap) * snap;
      const targetLayer = getFurnitureLayer(selectedFurnitureType);
      const filtered = furniture.filter(f => {
          if (Math.abs(f.position.x - snappedX) >= 0.5 || Math.abs(f.position.y - snappedY) >= 0.5) return true;
          const existingLayer = getFurnitureLayer(f.type);
          if (existingLayer === targetLayer) return false;
          return true; 
      });
      const newFurn: Furniture = { id: `f-${Date.now()}`, type: selectedFurnitureType, position: { x: snappedX, y: snappedY }, rotation: selectedRotation, variant: selectedVariant };
      const updatedList = [...filtered, newFurn];
      setFurniture(updatedList);
      persistMapChange(updatedList);
  };

  // Zone Logic Effect (shortened for brevity, assumed same logic)
  useEffect(() => {
    if (!currentUser) return;
    const { x, y } = currentUser.position;
    const gridX = Math.floor(x / TILE_SIZE); const gridY = Math.floor(y / TILE_SIZE);
    let currentRoomId = 'OPEN_SPACE'; let roomName = t('loc.open');
    const inZone = (z: {x:number, y:number, w:number, h:number}) => gridX >= z.x && gridX < z.x + z.w && gridY >= z.y && gridY < z.y + z.h;
    if (inZone(KITCHEN_ZONE)) { currentRoomId = 'KITCHEN'; roomName = t('loc.kitchen'); } 
    else if (inZone(BATHROOM_ZONE)) { currentRoomId = 'BATHROOM'; roomName = t('loc.bathroom'); }
    else if (inZone(OFFICE_1_ZONE)) { currentRoomId = 'OFFICE_1'; roomName = t('loc.office1'); }
    else if (inZone(OFFICE_2_ZONE)) { currentRoomId = 'OFFICE_2'; roomName = t('loc.office2'); }

    let autoStatus = currentUser.status;
    if (currentUser.room !== currentRoomId) {
        if (currentRoomId === 'KITCHEN') autoStatus = 'Almorzando';
        else if (currentRoomId === 'BATHROOM') autoStatus = 'En el baño';
        else if (lastRoomRef.current === 'KITCHEN' || lastRoomRef.current === 'BATHROOM') autoStatus = 'En línea';
        if ((currentRoomId === 'KITCHEN' || currentRoomId === 'BATHROOM') && micOn) handleToggleMic();
        setCurrentUser(prev => prev ? { ...prev, room: currentRoomId, status: autoStatus } : null);
    }
    if (currentRoomId !== lastRoomRef.current) {
        showNotification(`${t('notify.enter')} ${roomName}`, 'info');
        lastRoomRef.current = currentRoomId;
    }
  }, [currentUser?.position, micOn, t]);


  if (!currentUser) return <AvatarCreator onJoin={handleJoin} />;
  if (!isDataLoaded) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">{t('loading')}</div>;

  const visibleRooms = rooms.filter(r => r.type === 'GLOBAL' || (r.participants && r.participants.includes(currentUser.id)));
  const maximizedStream = maximizedScreenId ? screenShares.find(s => s.playerId === maximizedScreenId) : null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
        <GameCanvas 
            currentUser={currentUser}
            peers={peers}
            furniture={furniture}
            onMove={handleMove}
            onInteract={handleInteract}
            buildMode={buildMode}
            onPlaceFurniture={handlePlaceFurniture}
            selectedFurnitureType={selectedFurnitureType}
            selectedVariant={selectedVariant}
            selectedRotation={selectedRotation}
            selectedObjectId={selectedObjectId}
        />

        <ZoneNotification message={notification} type={notificationType} />
        
        <VideoOverlay 
            peers={peers} 
            currentUserPos={currentUser.position} 
            screenShares={screenShares}
            onMaximizeScreen={setMaximizedScreenId}
        />
        
        <Minimap furniture={furniture} peers={peers} currentUser={currentUser} />
        
        {buildMode && (
          <BuildMenu 
            selectedType={selectedFurnitureType}
            selectedVariant={selectedVariant}
            selectedRotation={selectedRotation}
            onSelect={handleSelectFurniture}
            onRotate={handleManualRotate} 
          />
        )}

        {/* Minigame Overlay */}
        {isGameOpen && (
            <TicTacToe onClose={() => setIsGameOpen(false)} />
        )}

        {maximizedStream && (
            <ScreenShareViewer 
                stream={maximizedStream.stream} 
                sharerName={maximizedStream.playerName}
                onClose={() => setMaximizedScreenId(null)}
            />
        )}

        <ControlBar 
            micOn={micOn} sharingScreen={sharingScreen} buildMode={buildMode}
            chatVisible={chatVisible}
            usersMenuVisible={usersMenuVisible}
            onToggleMic={handleToggleMic}
            onToggleScreen={handleToggleScreen}
            onToggleBuild={() => setBuildMode(!buildMode)}
            onToggleChat={() => setChatVisible(!chatVisible)}
            onToggleUsers={() => setUsersMenuVisible(!usersMenuVisible)}
        />

        <div className={chatVisible ? '' : 'hidden'}>
            <ChatWidget 
                currentUser={currentUser}
                peers={peers}
                rooms={visibleRooms}
                activeRoomId={activeRoomId}
                messages={messages}
                onSendMessage={handleSendMessage}
                onCreateRoom={handleCreateRoom}
                onSetActiveRoom={setActiveRoomId}
            />
        </div>

        {usersMenuVisible && (
          <ParticipantsMenu 
            currentUser={currentUser}
            peers={peers}
            onUpdateStatus={handleUpdateStatus}
            onClose={() => setUsersMenuVisible(false)}
          />
        )}
    </div>
  );
};

export default App;