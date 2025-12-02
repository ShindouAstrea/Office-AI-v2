import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Plus, Hash, Lock, X, Check } from 'lucide-react';
import { ChatMessage, ChatRoom, Player } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatWidgetProps {
  currentUser: Player;
  peers: Player[];
  rooms: ChatRoom[];
  activeRoomId: string;
  messages: ChatMessage[];
  onSendMessage: (text: string, roomId: string) => void;
  onCreateRoom: (name: string, participants: string[]) => void;
  onSetActiveRoom: (roomId: string) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
    currentUser,
    peers,
    rooms,
    activeRoomId,
    messages, 
    onSendMessage,
    onCreateRoom,
    onSetActiveRoom
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current room
  const activeMessages = messages.filter(m => m.roomId === activeRoomId);
  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoomId, isCreatingRoom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, activeRoomId);
    setInputText('');
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newRoomName.trim()) return;
      
      const participants = [currentUser.id, ...selectedPeers];
      onCreateRoom(newRoomName, participants);
      
      setIsCreatingRoom(false);
      setNewRoomName('');
      setSelectedPeers([]);
  };

  const togglePeerSelection = (peerId: string) => {
      setSelectedPeers(prev => 
          prev.includes(peerId) 
          ? prev.filter(id => id !== peerId)
          : [...prev, peerId]
      );
  };

  const getRoomName = (room: ChatRoom) => {
      return room.type === 'GLOBAL' ? t('room.global') : room.name;
  };

  return (
    <div className="fixed bottom-4 right-4 w-[500px] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl flex flex-row transition-all duration-300 z-40 h-[400px] overflow-hidden">
      
      {/* Sidebar: Room List */}
      <div className="w-16 bg-gray-800/50 border-r border-gray-700 flex flex-col items-center py-4 gap-3">
          {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => onSetActiveRoom(room.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    activeRoomId === room.id 
                    ? 'bg-indigo-600 text-white shadow-glow ring-2 ring-indigo-400' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                }`}
                title={getRoomName(room)}
              >
                  {room.type === 'GLOBAL' ? <Hash size={18} /> : <Lock size={16} />}
              </button>
          ))}
          
          <div className="w-8 h-px bg-gray-700 my-1"></div>

          <button
            onClick={() => setIsCreatingRoom(true)}
            className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 text-green-400 hover:bg-gray-700 hover:text-green-300 flex items-center justify-center transition-all"
            title={t('chat.new_room')}
          >
              <Plus size={20} />
          </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-900/50">
        
        {isCreatingRoom ? (
            // Room Creation View
            <div className="flex-1 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Plus size={16} className="text-green-400"/> {t('chat.new_room')}
                    </h3>
                    <button onClick={() => setIsCreatingRoom(false)} className="text-gray-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                
                <form onSubmit={handleCreateRoomSubmit} className="flex-1 flex flex-col">
                    <div className="mb-4">
                        <label className="block text-xs text-gray-400 mb-1 uppercase">{t('chat.room_name')}</label>
                        <input 
                            type="text" 
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-500 outline-none text-sm"
                            placeholder={t('chat.placeholder_room')}
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 border border-gray-700 rounded-lg p-2 bg-gray-800/30">
                        <label className="block text-xs text-gray-400 mb-2 uppercase sticky top-0 bg-gray-800/90 py-1">{t('chat.invite')}</label>
                        {peers.length === 0 && <div className="text-gray-500 text-xs text-center py-4">{t('chat.no_peers')}</div>}
                        {peers.map(peer => (
                            <div 
                                key={peer.id} 
                                onClick={() => togglePeerSelection(peer.id)}
                                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                                    selectedPeers.includes(peer.id) ? 'bg-indigo-900/50 border border-indigo-500/30' : 'hover:bg-white/5'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedPeers.includes(peer.id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                                    {selectedPeers.includes(peer.id) && <Check size={10} className="text-white" />}
                                </div>
                                <span className="text-sm text-gray-200">{peer.name}</span>
                            </div>
                        ))}
                    </div>

                    <button 
                        type="submit"
                        disabled={!newRoomName.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                    >
                        {t('chat.btn_create')}
                    </button>
                </form>
            </div>
        ) : (
            // Chat View
            <>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-700 p-3 bg-gray-800/30">
                    <div className="flex items-center gap-2 text-indigo-100 font-bold text-sm">
                        {activeRoom?.type === 'GLOBAL' ? <Hash size={16} className="text-gray-400"/> : <Lock size={16} className="text-orange-400"/>}
                        {getRoomName(activeRoom)}
                    </div>
                    {activeRoom?.type === 'PRIVATE' && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Users size={12} /> {activeRoom.participants.length}
                        </div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {activeMessages.length === 0 && (
                        <div className="text-center text-gray-600 text-xs mt-4">
                            {t('chat.empty')} {getRoomName(activeRoom)}...
                        </div>
                    )}
                    {activeMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col animate-fadeIn ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className={`text-xs font-bold ${msg.senderId === currentUser.id ? 'text-indigo-300' : 'text-orange-300'}`}>
                                {msg.senderName}
                            </span>
                            <span className="text-[10px] text-gray-600">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                            </span>
                        </div>
                        <div className={`
                            py-1.5 px-3 rounded-lg max-w-[85%] text-sm break-words
                            ${msg.senderId === currentUser.id 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-gray-700 text-gray-200 rounded-tl-none'}
                        `}>
                            {msg.text}
                        </div>
                    </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 flex gap-2 bg-gray-800/30">
                    <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`${t('chat.placeholder')} ${getRoomName(activeRoom)}...`}
                    className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                    type="submit"
                    className="p-2 rounded-lg text-white transition-colors bg-indigo-600 hover:bg-indigo-700"
                    >
                    <Send size={18} />
                    </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;