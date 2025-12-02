import React, { useState } from 'react';
import { User, MapPin, Smile, X, Circle, Clock, Coffee, Briefcase } from 'lucide-react';
import { Player } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ParticipantsMenuProps {
  currentUser: Player;
  peers: Player[];
  onUpdateStatus: (newStatus: string) => void;
  onClose: () => void;
}

const ParticipantsMenu: React.FC<ParticipantsMenuProps> = ({ currentUser, peers, onUpdateStatus, onClose }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [customStatus, setCustomStatus] = useState('');

  const PRESET_STATUSES = [
    { label: t('status.online'), icon: <Circle size={14} className="text-green-500 fill-current" />, value: 'En línea' },
    { label: t('status.busy'), icon: <Briefcase size={14} className="text-red-500" />, value: 'Ocupado' },
    { label: t('status.afk'), icon: <Clock size={14} className="text-yellow-500" />, value: 'AFK' },
    { label: t('status.lunch'), icon: <Coffee size={14} className="text-orange-500" />, value: 'Almorzando' },
  ];

  const getLocationName = (roomId?: string) => {
    switch (roomId) {
      case 'KITCHEN': return t('loc.kitchen');
      case 'BATHROOM': return t('loc.bathroom');
      case 'OFFICE_1': return t('loc.office1');
      case 'OFFICE_2': return t('loc.office2');
      default: return t('loc.open');
    }
  };

  const handleStatusClick = (status: string) => {
    onUpdateStatus(status);
    setIsEditing(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStatus.trim()) {
      onUpdateStatus(customStatus);
      setIsEditing(false);
      setCustomStatus('');
    }
  };

  return (
    <div className="fixed bottom-24 right-4 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn z-50 max-h-[60vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
        <h3 className="text-white font-bold flex items-center gap-2">
          <User size={18} className="text-indigo-400" />
          {t('part.title')} ({peers.length + 1})
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Current User Section */}
      <div className="p-4 bg-gray-800/30 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md flex items-center justify-center text-lg font-bold text-white shadow-inner" style={{ backgroundColor: currentUser.color }}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">{currentUser.name}</div>
            <div className="text-indigo-300 text-xs flex items-center gap-1">
              <MapPin size={10} /> {getLocationName(currentUser.room)}
            </div>
          </div>
        </div>

        {/* Status Selector */}
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="w-full bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <Smile size={16} className="text-gray-400 group-hover:text-indigo-400" />
              <span className="truncate max-w-[180px]">{currentUser.status || t('part.set_status')}</span>
            </div>
            <span className="text-xs text-gray-500">{t('part.edit')}</span>
          </button>
        ) : (
          <div className="space-y-2 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 mb-2">
              {PRESET_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatusClick(s.value)}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded px-2 py-1.5 text-xs text-gray-200 transition-colors"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder={t('part.custom')}
                className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-indigo-500 outline-none"
                autoFocus
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded text-xs font-bold">OK</button>
            </form>
          </div>
        )}
      </div>

      {/* Peer List */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
        {peers.map((peer) => (
          <div key={peer.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group">
            <div className="relative">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: peer.color }}>
                {peer.name.charAt(0)}
              </div>
              {/* Online Indicator Dot */}
               <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                   peer.status === 'Ocupado' ? 'bg-red-500' :
                   peer.status === 'AFK' ? 'bg-yellow-500' :
                   peer.status === 'Almorzando' ? 'bg-orange-500' :
                   'bg-green-500'
               }`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-200 text-sm font-medium truncate">{peer.name}</span>
                <span className="text-[10px] text-gray-500">{getLocationName(peer.room)}</span>
              </div>
              <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                 {peer.status || t('status.online')}
              </div>
            </div>
          </div>
        ))}
        {peers.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs italic">
                {t('part.empty')}
            </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsMenu;