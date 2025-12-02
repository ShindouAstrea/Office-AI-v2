import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

interface ZoneNotificationProps {
  message: string | null;
}

const ZoneNotification: React.FC<ZoneNotificationProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  return (
    <div 
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-gray-900/60 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-3">
        <MapPin size={18} className="text-indigo-400" />
        <span className="font-medium tracking-wide text-sm">{displayMessage}</span>
      </div>
    </div>
  );
};

export default ZoneNotification;