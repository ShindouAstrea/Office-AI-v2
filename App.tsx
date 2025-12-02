import React, { useState, useEffect, useRef } from 'react';
import { Player, Furniture, ChatMessage, Position, FurnitureType } from './types';
import { INITIAL_FURNITURE, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, AVATAR_COLORS } from './constants';
import GameCanvas from './components/GameCanvas';
import AvatarCreator from './components/AvatarCreator';
import ChatWidget from './components/ChatWidget';
import ControlBar from './components/ControlBar';
import VideoOverlay from './components/VideoOverlay';
import { getGeminiChat } from './services/gemini';
import { Chat } from "@google/genai";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [peers, setPeers] = useState<Player[]>([]);
  const [furniture, setFurniture] = useState<Furniture[]>(INITIAL_FURNITURE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [buildMode, setBuildMode] = useState(false);
  const [interactionTarget, setInteractionTarget] = useState<string | null>(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  
  // Media State
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);

  // AI State
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  // Simulate peers moving
  useEffect(() => {
    if (!currentUser) return;

    // Create some fake peers initially
    const fakePeers: Player[] = [
        { id: 'p2', name: 'David', color: AVATAR_COLORS[1], position: { x: 400, y: 300 }, targetPosition: { x: 400, y: 300 }, isTalking: false, avatarId: 1 },
        { id: 'p3', name: 'Sarah', color: AVATAR_COLORS[2], position: { x: 600, y: 500 }, targetPosition: { x: 600, y: 500 }, isTalking: true, avatarId: 1 },
    ];
    setPeers(fakePeers);

    const interval = setInterval(() => {
        setPeers(prev => prev.map(p => ({
            ...p,
            position: {
                x: p.position.x + (Math.random() - 0.5) * 5,
                y: p.position.y + (Math.random() - 0.5) * 5
            }
        })));
    }, 100);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Initialize Chat Session
  useEffect(() => {
      if (currentUser && !chatSessionRef.current) {
          try {
              chatSessionRef.current = getGeminiChat();
          } catch (e) {
              console.error("Gemini init failed", e);
          }
      }
  }, [currentUser]);


  const handleJoin = (playerData: Partial<Player>) => {
    setCurrentUser({
      id: 'me',
      name: playerData.name || 'User',
      color: playerData.color || AVATAR_COLORS[0],
      position: { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE }, // Start pos
      targetPosition: { x: 10 * TILE_SIZE, y: 10 * TILE_SIZE },
      isTalking: false,
      avatarId: 1
    });
  };

  const handleMove = (newPos: Position) => {
    if (currentUser) {
        setCurrentUser({ ...currentUser, position: newPos });
    }
  };

  const handleSendMessage = (text: string, isPrivate: boolean) => {
      if (!currentUser) return;
      const msg: ChatMessage = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          text,
          timestamp: Date.now(),
          isPrivate
      };
      setMessages(prev => [...prev, msg]);
  };

  const handleInteract = (targetId: string | null) => {
      setInteractionTarget(targetId);
      if (targetId === 'npc-gemini' && !aiChatOpen) {
          // Show tooltip or auto open? 
          // For now we assume a manual toggle or keypress logic in canvas, 
          // but let's just use a UI prompt
      } else if (targetId === null && aiChatOpen) {
           setAiChatOpen(false);
      }
  };

  const handlePlaceFurniture = (pos: Position) => {
      if (!buildMode) return;
      const newFurn: Furniture = {
          id: `f-${Date.now()}`,
          type: FurnitureType.PLANT, // Default to plant for demo
          position: pos,
          rotation: 0
      };
      setFurniture(prev => [...prev, newFurn]);
  };

  const handleSendAI = async (text: string) => {
      if (!chatSessionRef.current) return;
      setIsAiThinking(true);
      setAiResponse(''); // Clear previous response context visually if needed, or append.
      
      // Add user message to local chat mainly for UI feedback, 
      // though typically we'd separate AI chat history from global chat.
      
      try {
          const result = await chatSessionRef.current.sendMessageStream({ message: text });
          for await (const chunk of result) {
              setAiResponse(prev => prev + chunk.text);
          }
      } catch (e) {
          setAiResponse("I'm having trouble connecting to the office servers right now.");
      } finally {
          setIsAiThinking(false);
      }
  };

  const handleToggleScreen = async () => {
    if (sharingScreen) {
        setSharingScreen(false);
        // Logic to stop tracks would go here in a full WebRTC implementation
    } else {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setSharingScreen(true);
            
            // Handle user stopping share from browser UI
            stream.getVideoTracks()[0].onended = () => {
                setSharingScreen(false);
            };
        } catch (error) {
            console.error("Screen share cancelled or failed:", error);
            setSharingScreen(false);
        }
    }
  };

  if (!currentUser) {
    return <AvatarCreator onJoin={handleJoin} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
        <GameCanvas 
            currentUser={currentUser}
            peers={peers}
            furniture={furniture}
            onMove={handleMove}
            onInteract={handleInteract}
            buildMode={buildMode}
            onPlaceFurniture={handlePlaceFurniture}
        />

        {/* Interaction Prompt */}
        {interactionTarget === 'npc-gemini' && !aiChatOpen && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16 bg-white text-black px-4 py-2 rounded-full shadow-lg font-bold animate-bounce z-50">
                Press E to talk to Receptionist
            </div>
        )}

        {/* HUD Elements */}
        <VideoOverlay peers={peers} currentUserPos={currentUser.position} camOn={camOn} />
        
        <ControlBar 
            micOn={micOn} camOn={camOn} sharingScreen={sharingScreen} buildMode={buildMode}
            onToggleMic={() => setMicOn(!micOn)}
            onToggleCam={() => setCamOn(!camOn)}
            onToggleScreen={handleToggleScreen}
            onToggleBuild={() => setBuildMode(!buildMode)}
        />

        <ChatWidget 
            messages={messages}
            onSendMessage={handleSendMessage}
            aiActive={aiChatOpen}
            onCloseAI={() => setAiChatOpen(false)}
            onSendAI={handleSendAI}
            aiResponse={aiResponse}
            isAiThinking={isAiThinking}
        />

        {/* Key Listener for Interaction */}
        <KeyListener 
            target={interactionTarget} 
            onInteract={() => {
                if (interactionTarget === 'npc-gemini') setAiChatOpen(true);
            }} 
        />
    </div>
  );
};

// Helper for key interaction
const KeyListener: React.FC<{ target: string | null, onInteract: () => void }> = ({ target, onInteract }) => {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'e' || e.key === 'E') {
                if (target) onInteract();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [target, onInteract]);
    return null;
}

export default App;