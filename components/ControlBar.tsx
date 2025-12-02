import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, LayoutGrid, Settings, MessageSquare, MessageSquareOff } from 'lucide-react';

interface ControlBarProps {
  micOn: boolean;
  camOn: boolean;
  sharingScreen: boolean;
  buildMode: boolean;
  chatVisible: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreen: () => void;
  onToggleBuild: () => void;
  onToggleChat: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  micOn, camOn, sharingScreen, buildMode, chatVisible,
  onToggleMic, onToggleCam, onToggleScreen, onToggleBuild, onToggleChat
}) => {
  const btnClass = "p-3 rounded-full backdrop-blur-md transition-all duration-200 flex items-center justify-center shadow-lg active:scale-95";
  const activeClass = "bg-indigo-600 text-white hover:bg-indigo-700";
  const inactiveClass = "bg-gray-800/80 text-red-400 hover:bg-gray-700 border border-red-500/30";
  const neutralClass = "bg-gray-800/80 text-gray-200 hover:bg-gray-700 border border-gray-600/50";

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-50">
      
      <button onClick={onToggleMic} className={`${btnClass} ${micOn ? neutralClass : inactiveClass}`}>
        {micOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <button onClick={onToggleCam} className={`${btnClass} ${camOn ? neutralClass : inactiveClass}`}>
        {camOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      <button onClick={onToggleScreen} className={`${btnClass} ${sharingScreen ? activeClass : neutralClass}`}>
        <Monitor size={20} />
      </button>

      <div className="w-px h-8 bg-gray-600 mx-2"></div>

      <button 
        onClick={onToggleChat} 
        className={`${btnClass} ${chatVisible ? activeClass : neutralClass}`}
        title={chatVisible ? "Hide Chat" : "Show Chat"}
      >
        {chatVisible ? <MessageSquare size={20} /> : <MessageSquareOff size={20} />}
      </button>

      <button 
        onClick={onToggleBuild} 
        className={`${btnClass} ${buildMode ? 'bg-orange-500 text-white ring-2 ring-orange-300' : neutralClass}`}
        title="Edit Map Mode"
      >
        <LayoutGrid size={20} />
      </button>

      <button className={`${btnClass} ${neutralClass}`}>
        <Settings size={20} />
      </button>
    </div>
  );
};

export default ControlBar;