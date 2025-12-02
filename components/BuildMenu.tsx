import React, { useState } from 'react';
import { FurnitureType } from '../types';
import { 
    LayoutGrid, Monitor, Coffee, Armchair, Book, Printer, Lightbulb, 
    Square, Type, Utensils, Flower2, Table, Box, Trash2, Home, Briefcase, Sofa, Palette, X
} from 'lucide-react';

interface BuildMenuProps {
  selectedType: FurnitureType;
  selectedVariant: number;
  selectedRotation: number;
  onSelect: (type: FurnitureType, variant: number, rotation: number) => void;
}

// Data Structure defining all available build items
const CATEGORIES = [
    {
        id: 'structure',
        label: 'Structure',
        icon: <Home size={18} />,
        items: [
            { type: FurnitureType.WALL, variant: 0, rotation: 0, label: 'Brick Wall (H)' },
            { type: FurnitureType.WALL, variant: 0, rotation: 90, label: 'Brick Wall (V)' },
            { type: FurnitureType.WALL, variant: 1, rotation: 0, label: 'Concrete (H)' },
            { type: FurnitureType.WALL, variant: 1, rotation: 90, label: 'Concrete (V)' },
            { type: FurnitureType.FLOOR, variant: 0, rotation: 0, label: 'Wood Floor' },
            { type: FurnitureType.FLOOR, variant: 1, rotation: 0, label: 'Tile Floor' },
            { type: FurnitureType.FLOOR, variant: 2, rotation: 0, label: 'Dark Floor' },
        ]
    },
    {
        id: 'office',
        label: 'Office',
        icon: <Briefcase size={18} />,
        items: [
            { type: FurnitureType.DESK, variant: 0, rotation: 0, label: 'Wood Desk' },
            { type: FurnitureType.DESK, variant: 1, rotation: 0, label: 'White Desk' },
            { type: FurnitureType.CHAIR, variant: 0, rotation: 0, label: 'Office Chair' },
            { type: FurnitureType.CHAIR, variant: 1, rotation: 0, label: 'Exec Chair' },
            { type: FurnitureType.SCREEN, variant: 0, rotation: 0, label: 'Monitor' },
            { type: FurnitureType.WHITEBOARD, variant: 0, rotation: 0, label: 'Whiteboard' },
            { type: FurnitureType.PRINTER, variant: 0, rotation: 0, label: 'Printer' },
        ]
    },
    {
        id: 'lounge',
        label: 'Lounge',
        icon: <Sofa size={18} />,
        items: [
            { type: FurnitureType.COUCH, variant: 0, rotation: 0, label: 'Blue Couch' },
            { type: FurnitureType.COUCH, variant: 1, rotation: 0, label: 'Red Couch' },
            { type: FurnitureType.COUCH, variant: 2, rotation: 0, label: 'Green Couch' },
            { type: FurnitureType.TABLE_ROUND, variant: 0, rotation: 0, label: 'Round Table' },
            { type: FurnitureType.BOOKSHELF, variant: 0, rotation: 0, label: 'Bookshelf' },
        ]
    },
    {
        id: 'decor',
        label: 'Decor',
        icon: <Palette size={18} />,
        items: [
            { type: FurnitureType.PLANT, variant: 0, rotation: 0, label: 'Tall Plant' },
            { type: FurnitureType.PLANT, variant: 1, rotation: 0, label: 'Bushy Plant' },
            { type: FurnitureType.LAMP, variant: 0, rotation: 0, label: 'Floor Lamp' },
            { type: FurnitureType.RUG, variant: 0, rotation: 0, label: 'Red Rug' },
            { type: FurnitureType.RUG, variant: 1, rotation: 0, label: 'Blue Rug' },
            { type: FurnitureType.RUG, variant: 2, rotation: 0, label: 'Persian Rug' },
        ]
    },
    {
        id: 'amenities',
        label: 'Amenities',
        icon: <Coffee size={18} />,
        items: [
            { type: FurnitureType.COFFEE_MAKER, variant: 0, rotation: 0, label: 'Coffee Maker' },
            { type: FurnitureType.FOOD, variant: 0, rotation: 0, label: 'Food Plate' },
            { type: FurnitureType.SINK, variant: 0, rotation: 0, label: 'Sink' },
            { type: FurnitureType.TOILET, variant: 0, rotation: 0, label: 'Toilet' },
        ]
    }
];

const BuildMenu: React.FC<BuildMenuProps> = ({ selectedType, selectedVariant, selectedRotation, onSelect }) => {
  const [activeTab, setActiveTab] = useState('structure');

  const currentCategory = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div className="fixed right-0 top-0 h-full w-[30%] min-w-[320px] bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl flex flex-col z-50 animate-fadeIn rounded-l-2xl">
       
       {/* Header / Tools */}
       <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-tl-2xl">
         <h2 className="text-white font-bold text-lg flex items-center gap-3">
            <LayoutGrid size={24} className="text-orange-500"/> Builder Mode
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
                <Trash2 size={16} /> ERASE
            </button>
         </div>
       </div>

       {/* Category Tabs (Scrollable) */}
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

       {/* Grid Content */}
       <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-gray-900/50">
           <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
               {currentCategory?.items.map((item, idx) => {
                   // Strict comparison including rotation to fix selection bug
                   const isSelected = selectedType === item.type && 
                                      selectedVariant === item.variant && 
                                      selectedRotation === item.rotation;
                   
                   return (
                    <button
                        key={`${item.type}-${item.variant}-${item.rotation}-${idx}`}
                        onClick={() => onSelect(item.type, item.variant, item.rotation)}
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
                        
                        {/* Selected Indicator */}
                        {isSelected && (
                            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full shadow-glow"></div>
                        )}
                    </button>
                   );
               })}
           </div>
       </div>

       {/* Footer Hint */}
       <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-800 bg-gray-900">
          Select an item and click on the map to place it.
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
        default: return <Box size={32} />;
    }
};

export default BuildMenu;