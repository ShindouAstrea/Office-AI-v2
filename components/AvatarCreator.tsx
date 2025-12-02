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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-500/50">
                <User size={32} />
            </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Welcome to Nexus</h1>
        <p className="text-gray-400 text-center mb-8">Create your virtual identity</p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500 transition-all"
              placeholder="e.g. Alice Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Palette size={16} /> Avatar Color
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-all transform hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-center mb-6">
                 {/* Preview */}
                <div 
                    className="w-24 h-24 rounded-lg flex items-center justify-center shadow-inner border-2 border-gray-600 transition-colors duration-300"
                    style={{ backgroundColor: '#1f2937' }}
                >
                    <div 
                        className="w-12 h-12 rounded-full shadow-lg transition-colors duration-300"
                        style={{ backgroundColor: selectedColor }}
                    />
                </div>
            </div>
          
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
              <Check size={20} />
              Join Office
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvatarCreator;
