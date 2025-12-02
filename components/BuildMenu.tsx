import React from 'react';
import { FurnitureType } from '../types';
import { 
    LayoutGrid, 
    Monitor, 
    Coffee, 
    Armchair, 
    Book, 
    Printer, 
    Lightbulb, 
    Square, 
    Type, 
    Utensils, 
    Flower2, 
    Table,
    Box,
    Trash2
} from 'lucide-react';

interface BuildMenuProps {
  selectedType: FurnitureType;
  onSelect: (type: FurnitureType) => void;
}

const ITEMS = [
  { type: FurnitureType.DELETE, label: 'Erase', icon: <Trash2 size={20} className="text-red-500" /> },
  { type: FurnitureType.WALL, label: 'Wall', icon: <Square size={20} className="text-gray-400" /> },
  { type: FurnitureType.FLOOR, label: 'Floor', icon: <LayoutGrid size={20} className="text-gray-500" /> },
  { type: FurnitureType.DESK, label: 'Desk', icon: <Table size={20} className="text-amber-700" /> },
  { type: FurnitureType.CHAIR, label: 'Chair', icon: <Armchair size={20} className="text-orange-600" /> },
  { type: FurnitureType.TABLE_ROUND, label: 'Round Table', icon: <Table size={20} className="rounded-full text-gray-400" /> },
  { type: FurnitureType.COUCH, label: 'Couch', icon: <Armchair size={20} className="text-blue-500" /> },
  { type: FurnitureType.BOOKSHELF, label: 'Bookshelf', icon: <Book size={20} className="text-amber-800" /> },
  { type: FurnitureType.PLANT, label: 'Plant', icon: <Flower2 size={20} className="text-green-500" /> },
  { type: FurnitureType.LAMP, label: 'Lamp', icon: <Lightbulb size={20} className="text-yellow-400" /> },
  { type: FurnitureType.SCREEN, label: 'Screen', icon: <Monitor size={20} className="text-blue-400" /> },
  { type: FurnitureType.WHITEBOARD, label: 'Whiteboard', icon: <Type size={20} className="text-white" /> },
  { type: FurnitureType.PRINTER, label: 'Printer', icon: <Printer size={20} className="text-gray-300" /> },
  { type: FurnitureType.RUG, label: 'Rug', icon: <Square size={20} className="text-red-500 fill-current" /> },
  { type: FurnitureType.COFFEE_MAKER, label: 'Coffee', icon: <Coffee size={20} className="text-amber-900" /> },
  { type: FurnitureType.SINK, label: 'Sink', icon: <Box size={20} className="text-blue-200" /> },
  { type: FurnitureType.TOILET, label: 'Toilet', icon: <Box size={20} className="text-white" /> },
  { type: FurnitureType.FOOD, label: 'Food', icon: <Utensils size={20} className="text-orange-400" /> },
];

const BuildMenu: React.FC<BuildMenuProps> = ({ selectedType, onSelect }) => {
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl p-4 z-50 animate-fadeIn max-w-[90vw] overflow-x-auto custom-scrollbar">
       <div className="flex gap-2">
         {ITEMS.map((item) => (
           <button
             key={item.type}
             onClick={() => onSelect(item.type)}
             className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all min-w-[70px] ${
                selectedType === item.type 
                ? 'bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-400' 
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
             }`}
             title={item.label}
           >
             <div className="mb-1">{item.icon}</div>
             <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
           </button>
         ))}
       </div>
       <div className="text-center text-gray-500 text-xs mt-2 font-mono">
          {selectedType === FurnitureType.DELETE 
            ? "Click on an item to remove it" 
            : `Click on map to place ${ITEMS.find(i => i.type === selectedType)?.label}`
          }
       </div>
    </div>
  );
};

export default BuildMenu;