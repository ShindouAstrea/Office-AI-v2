import React, { useState, useEffect, useRef } from 'react';
import { Send, Users } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatWidgetProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isPrivate: boolean, targetId?: string) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
    messages, 
    onSendMessage
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, false);
    setInputText('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl flex flex-col transition-all duration-300 z-40 h-[350px]">
      
      {/* Header */}
      <div className="flex border-b border-gray-700">
        <div className="flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 text-indigo-400 bg-gray-800/50">
          <Users size={16} /> Office Chat
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
        <div key={msg.id} className="flex flex-col animate-fadeIn">
            <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-indigo-400">{msg.senderName}</span>
            <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
            </div>
            <p className="text-sm text-gray-200 break-words">{msg.text}</p>
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message everyone..."
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          className="p-2 rounded-lg text-white transition-colors bg-indigo-600 hover:bg-indigo-700"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;