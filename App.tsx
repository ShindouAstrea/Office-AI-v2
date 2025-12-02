import React, { useState, useEffect, useRef } from 'react';
import { Player, Furniture, ChatMessage, Position, FurnitureType } from './types';
import { 
  INITIAL_FURNITURE, TILE_SIZE, AVATAR_COLORS, 
  KITCHEN_ZONE, BATHROOM_ZONE, OFFICE_1_ZONE, OFFICE_2_ZONE 
} from './constants';
import GameCanvas from './components/GameCanvas';
import AvatarCreator from './components/AvatarCreator';
import ChatWidget from './components/ChatWidget';
import ControlBar from './components/ControlBar';
import VideoOverlay from './components/VideoOverlay';
import ZoneNotification from './components/ZoneNotification';
import ParticipantsMenu from './components/ParticipantsMenu';
import BuildMenu from './components/BuildMenu';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [peers, setPeers] = useState<Player[]>([]);
  const [furniture, setFurniture] = useState<Furniture[]>(INITIAL_FURNITURE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [buildMode, setBuildMode] = useState(false);
  
  // Construction State
  const [selectedFurnitureType, setSelectedFurnitureType] = useState<FurnitureType>(FurnitureType.DESK);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedRotation, setSelectedRotation] = useState<number>(0);

  const [interactionTarget, setInteractionTarget] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  // UI State
  const [chatVisible, setChatVisible] = useState(true);
  const [usersMenuVisible, setUsersMenuVisible] = useState(false);
  
  // Media State
  const [micOn, setMicOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);

  // Refs for tracking changes
  const lastRoomRef = useRef<string>('OPEN_SPACE');
  const notificationTimeoutRef = useRef<number | null>(null);

  // Media Streams (Refs to hold stream objects without re-renders)
  const localMicStreamRef = useRef<MediaStream | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);

  // Simulate peers moving
  useEffect(() => {
    if (!currentUser) return;

    // Create some fake peers initially
    const fakePeers: Player[] = [
        { id: 'p2', name: 'David', color: AVATAR_COLORS[1], position: { x: 400, y: 300 }, targetPosition: { x: 400, y: 300 }, isTalking: false, avatarId: 1, room: 'OPEN_SPACE', status: 'En línea' },
        { id: 'p3', name: 'Sarah', color: AVATAR_COLORS[2], position: { x: 600, y: 500 }, targetPosition: { x: 600, y: 500 }, isTalking: true, avatarId: 1, room: 'OPEN_SPACE', status: 'Ocupado' },
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
  }, [currentUser?.id]); // Only run once on mount/user creation


  // --- ZONE LOGIC & NOTIFICATIONS ---
  useEffect(() => {
    if (!currentUser) return;

    const { x, y } = currentUser.position;
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    let currentRoomId = 'OPEN_SPACE';
    let roomName = 'Espacio Común';
    
    // Check Zones
    const inZone = (z: {x:number, y:number, w:number, h:number}) => 
        gridX >= z.x && gridX < z.x + z.w && gridY >= z.y && gridY < z.y + z.h;

    if (inZone(KITCHEN_ZONE)) {
        currentRoomId = 'KITCHEN';
        roomName = 'Cafetería';
    } else if (inZone(BATHROOM_ZONE)) {
        currentRoomId = 'BATHROOM';
        roomName = 'Baños';
    } else if (inZone(OFFICE_1_ZONE)) {
        currentRoomId = 'OFFICE_1';
        roomName = 'Oficina Privada 1';
    } else if (inZone(OFFICE_2_ZONE)) {
        currentRoomId = 'OFFICE_2';
        roomName = 'Oficina de Desarrollo';
    }

    // Auto-status logic ONLY if moving into specific functional rooms
    let autoStatus = currentUser.status;
    if (currentUser.room !== currentRoomId) {
        if (currentRoomId === 'KITCHEN') autoStatus = 'Almorzando';
        else if (currentRoomId === 'BATHROOM') autoStatus = 'En el baño';
        else if (lastRoomRef.current === 'KITCHEN' || lastRoomRef.current === 'BATHROOM') autoStatus = 'En línea';
        
        // Auto-mute check
        if ((currentRoomId === 'KITCHEN' || currentRoomId === 'BATHROOM') && micOn) {
           handleToggleMic();
        }
        
        setCurrentUser(prev => prev ? { ...prev, room: currentRoomId, status: autoStatus } : null);
    }


    // Notifications logic
    if (currentRoomId !== lastRoomRef.current) {
        if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
        
        const text = currentRoomId === 'OPEN_SPACE' 
            ? `Has ingresado al ${roomName}` 
            : `Has ingresado a: ${roomName}`;
            
        setNotification(text);
        
        notificationTimeoutRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 3000);

        lastRoomRef.current = currentRoomId;
    }

  }, [currentUser?.position, micOn]); // Depend on position and mic status


  const handleJoin = (playerData: Partial<Player>) => {
    setCurrentUser({
      id: 'me',
      name: playerData.name || 'User',
      color: playerData.color || AVATAR_COLORS[0],
      position: { x: 20 * TILE_SIZE + TILE_SIZE/2, y: 28 * TILE_SIZE + TILE_SIZE/2 }, 
      targetPosition: { x: 20 * TILE_SIZE, y: 28 * TILE_SIZE },
      isTalking: false,
      avatarId: 1,
      room: 'OPEN_SPACE',
      status: 'En línea'
    });
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, status: newStatus });
    }
  };

  const handleMove = (newPos: Position) => {
    if (currentUser) {
        setCurrentUser(prev => prev ? { ...prev, position: newPos } : null);
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
  };

  const handleSelectFurniture = (type: FurnitureType, variant: number, rotation: number) => {
      setSelectedFurnitureType(type);
      setSelectedVariant(variant);
      setSelectedRotation(rotation);
  };

  const handlePlaceFurniture = (pos: Position) => {
      if (!buildMode) return;

      if (selectedFurnitureType === FurnitureType.DELETE) {
          // Remove furniture at this position
          setFurniture(prev => prev.filter(f => f.position.x !== pos.x || f.position.y !== pos.y));
      } else {
          // Place new furniture (optional: replace existing)
          // First remove any item at same spot to prevent stacking if it's NOT a floor
          // Floors can be underneath stuff, but let's simplify: replace anything at this grid
          // Actually, we probably want floors to co-exist with furniture, but let's keep it simple
          
          // Refined Logic: 
          // If placing Floor: Remove other Floors at pos.
          // If placing Object: Remove other Objects at pos (Keep Floor).
          
          setFurniture(prev => {
              let filtered = prev;
              if (selectedFurnitureType === FurnitureType.FLOOR) {
                   filtered = prev.filter(f => !(f.position.x === pos.x && f.position.y === pos.y && f.type === FurnitureType.FLOOR));
              } else {
                   filtered = prev.filter(f => !(f.position.x === pos.x && f.position.y === pos.y && f.type !== FurnitureType.FLOOR));
              }

              const newFurn: Furniture = {
                  id: `f-${Date.now()}`,
                  type: selectedFurnitureType, 
                  position: pos,
                  rotation: selectedRotation,
                  variant: selectedVariant
              };
              return [...filtered, newFurn];
          });
      }
  };

  const handleToggleMic = async () => {
    if (micOn) {
        if (localMicStreamRef.current) {
            localMicStreamRef.current.getTracks().forEach(track => track.stop());
            localMicStreamRef.current = null;
        }
        setMicOn(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localMicStreamRef.current = stream;
            setMicOn(true);
        } catch (error) {
            console.error("Microphone access denied:", error);
        }
    }
  };

  const handleToggleScreen = async () => {
    if (sharingScreen) {
        if (localScreenStreamRef.current) {
            localScreenStreamRef.current.getTracks().forEach(track => track.stop());
            localScreenStreamRef.current = null;
        }
        setSharingScreen(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            localScreenStreamRef.current = stream;
            setSharingScreen(true);
            stream.getVideoTracks()[0].onended = () => {
                setSharingScreen(false);
                localScreenStreamRef.current = null;
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

        {/* Notifications */}
        <ZoneNotification message={notification} />

        {/* HUD Elements */}
        <VideoOverlay peers={peers} currentUserPos={currentUser.position} />
        
        {buildMode && (
          <BuildMenu 
            selectedType={selectedFurnitureType}
            selectedVariant={selectedVariant}
            selectedRotation={selectedRotation}
            onSelect={handleSelectFurniture}
          />
        )}

        <ControlBar 
            micOn={micOn} sharingScreen={sharingScreen} buildMode={buildMode}
            chatVisible={chatVisible}
            usersMenuVisible={usersMenuVisible}
            onToggleMic={handleToggleMic}
            onToggleScreen={handleToggleScreen}
            onToggleBuild={() => setBuildMode(!buildMode)}
            onToggleChat={() => setChatVisible(!chatVisible)}
            onToggleUsers={() => setUsersMenuVisible(!usersMenuVisible)}
        />

        {/* Side Panels */}
        <div className={chatVisible ? '' : 'hidden'}>
            <ChatWidget 
                messages={messages}
                onSendMessage={handleSendMessage}
            />
        </div>

        {usersMenuVisible && (
          <ParticipantsMenu 
            currentUser={currentUser}
            peers={peers}
            onUpdateStatus={handleUpdateStatus}
            onClose={() => setUsersMenuVisible(false)}
          />
        )}
    </div>
  );
};

export default App;