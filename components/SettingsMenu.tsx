import React from 'react';
import { X, Globe, Bell, Map, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsMenuProps {
  onClose: () => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  showMinimap: boolean;
  setShowMinimap: (show: boolean) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
    onClose, 
    notificationsEnabled, 
    setNotificationsEnabled,
    showMinimap,
    setShowMinimap
}) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
          <h2 className="text-white font-bold flex items-center gap-2">
            <SettingsIcon size={20} className="text-gray-400" />
            {t('settings.title')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            
            {/* Language Setting */}
            <div className="space-y-2">
                <label className="text-sm text-gray-400 uppercase font-bold flex items-center gap-2">
                    <Globe size={16} /> {t('settings.language')}
                </label>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`flex-1 py-2 rounded-lg border transition-all ${
                            language === 'en' 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-glow' 
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => setLanguage('es')}
                        className={`flex-1 py-2 rounded-lg border transition-all ${
                            language === 'es' 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-glow' 
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        Español
                    </button>
                </div>
            </div>

            <div className="h-px bg-gray-800"></div>

            {/* Toggle: Notifications */}
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 font-medium flex items-center gap-3">
                    <Bell size={18} className="text-orange-400" />
                    {t('settings.notifications')}
                </label>
                <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        notificationsEnabled ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                        notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                </button>
            </div>

            {/* Toggle: Minimap */}
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 font-medium flex items-center gap-3">
                    <Map size={18} className="text-blue-400" />
                    {t('settings.minimap')}
                </label>
                <button 
                    onClick={() => setShowMinimap(!showMinimap)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                        showMinimap ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                        showMinimap ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                </button>
            </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-800/30 border-t border-gray-800 text-center">
            <button onClick={onClose} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                {t('game.close')}
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsMenu;