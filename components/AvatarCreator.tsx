import React, { useState } from 'react';
import { User, Check, Palette } from 'lucide-react';
import { AVATAR_COLORS } from '../constants';
import { Player } from '../types';

interface AvatarCreatorProps {
  onJoin: (player: Partial<Player>) => void;
}

const AvatarCreator: React.FC<AvatarCreatorProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onJoin({
      name,
      color: selectedColor,
      avatarId: 1, // Placeholder for sprite selection
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-mono">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border-4 border-gray-700">
        <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-[#eaddcf] border-4 border-gray-600 flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* RPG Character Preview */}
                 <div className="relative w-16 h-16 flex items-center justify-center scale-150 mt-2">
                    <div className="relative flex flex-col items-center animate-bounce">
                         {/* Hair Top */}
                         <div className="absolute -top-1 w-12 h-4 bg-[#634228] z-20 rounded-t-sm shadow-sm"></div>
                         {/* Side Hair */}
                         <div className="absolute top-0 -left-1 w-3 h-8 bg-[#634228] z-20"></div>
                         <div className="absolute top-0 -right-1 w-3 h-8 bg-[#634228] z-20"></div>

                         {/* Head */}
                         <div className="w-10 h-9 bg-[#ffccaa] relative z-10 flex justify-center shadow-md">
                             {/* Eyes */}
                             <div className="absolute top-3 left-2 w-2 h-3 bg-black">
                                 <div className="w-1 h-1 bg-white ml-1"></div>
                             </div>
                             <div className="absolute top-3 right-2 w-2 h-3 bg-black">
                                  <div className="w-1 h-1 bg-white ml-1"></div>
                             </div>
                         </div>

                         {/* Body (Tunic) */}
                         <div className="w-9 h-9 relative mt-[-1px] z-10 flex justify-center" style={{ backgroundColor: selectedColor }}>
                             {/* Arms */}
                             <div className="absolute -left-2 top-0 w-2 h-6 rounded-l-sm" style={{ backgroundColor: selectedColor }}>
                                <div className="absolute bottom-0 w-full h-2 bg-[#ffccaa]"></div>
                             </div>
                             <div className="absolute -right-2 top-0 w-2 h-6 rounded-r-sm" style={{ backgroundColor: selectedColor }}>
                                <div className="absolute bottom-0 w-full h-2 bg-[#ffccaa]"></div>
                             </div>
                             {/* Belt */}
                             <div className="absolute bottom-3 w-full h-2 bg-[#2d3436] flex justify-center items-center">
                                 <div className="w-2 h-2 bg-[#f1c40f]"></div>
                             </div>
                         </div>

                         {/* Legs */}
                         <div className="flex gap-1 mt-[-2px] z-0">
                             <div className="w-3 h-5 bg-[#2d3436]"></div>
                             <div className="w-3 h-5 bg-[#2d3436]"></div>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tighter text-indigo-400">NEXUS OFFICE</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">INITIALIZE_AVATAR...</p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">NickName</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-none bg-gray-700 border-2 border-gray-600 focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500 transition-all font-mono"
              placeholder="HERO_NAME"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-2">
                <Palette size={16} /> Tunic Color
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 border-4 transition-all transform hover:scale-110 ${
                    selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-gray-800 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={20} />
              Unirse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvatarCreator;