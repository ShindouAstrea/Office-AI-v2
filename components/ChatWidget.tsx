import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, MessageSquare, Users } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatWidgetProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isPrivate: boolean, targetId?: string) => void;
  aiActive: boolean;
  onCloseAI: () => void;
  onSendAI: (text: string) => void;
  aiResponse: string;
  isAiThinking: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
    messages, 
    onSendMessage, 
    aiActive, 
    onCloseAI, 
    onSendAI,
    aiResponse,
    isAiThinking
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'AI'>('GLOBAL');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiActive) setActiveTab('AI');
  }, [aiActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiResponse, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeTab === 'GLOBAL') {
        onSendMessage(inputText, false);
    } else {
        onSendAI(inputText);
    }
    setInputText('');
  };

  return (
    <div className={`fixed bottom-4 left-4 w-96 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl flex flex-col transition-all duration-300 ${aiActive ? 'h-[500px]' : 'h-[350px]'}`}>
      
      {/* Header */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('GLOBAL')}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'GLOBAL' ? 'text-indigo-400 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}
        >
          <Users size={16} /> Office Chat
        </button>
        <button
          onClick={() => setActiveTab('AI')}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'AI' ? 'text-purple-400 bg-gray-800/50' : 'text-gray-400 hover:text-white'}`}
        >
          <Bot size={16} /> Receptionist
        </button>
        {aiActive && (
            <button onClick={onCloseAI} className="px-3 text-gray-400 hover:text-white">
                <X size={16} />
            </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {activeTab === 'GLOBAL' ? (
            messages.map((msg) => (
            <div key={msg.id} className="flex flex-col animate-fadeIn">
                <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-indigo-400">{msg.senderName}</span>
                <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                </div>
                <p className="text-sm text-gray-200 break-words">{msg.text}</p>
            </div>
            ))
        ) : (
            <div className="space-y-4">
                 <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                     <div className="flex items-center gap-2 mb-1">
                         <Bot size={14} className="text-purple-400" />
                         <span className="text-xs font-bold text-purple-400">Nova (AI)</span>
                     </div>
                     <p className="text-sm text-gray-200">
                         Hello! How can I help you today?
                     </p>
                 </div>
                 {aiResponse && (
                      <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-1">
                            <Bot size={14} className="text-purple-400" />
                            <span className="text-xs font-bold text-purple-400">Nova (AI)</span>
                        </div>
                        <p className="text-sm text-gray-200 whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                 )}
                 {isAiThinking && <p className="text-xs text-purple-400 italic animate-pulse">Nova is thinking...</p>}
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={activeTab === 'GLOBAL' ? "Message everyone..." : "Ask Nova..."}
          className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          className={`p-2 rounded-lg text-white transition-colors ${activeTab === 'GLOBAL' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;
