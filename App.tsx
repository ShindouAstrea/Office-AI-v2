import React, { useState, useEffect, useRef } from 'react';
import { Player, Furniture, ChatMessage, Position, FurnitureType, ChatRoom, Attachment } from './types';
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
import Minimap from './components/Minimap';
import { loadFurnitureMap, saveFurnitureMap, loadChatHistory, saveChatMessage, loadChatRooms, createChatRoom } from './services/firebase';
import { useLanguage } from './contexts/LanguageContext';

// Initial Global Room
const GLOBAL_ROOM: ChatRoom = {
    id: 'global',
    name: 'General',
    type: 'GLOBAL',
    participants: [],
    createdBy: 'system'
};

const App: React.FC = () => {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [peers, setPeers] = useState<Player[]>([]);
  
  // Data State
  const [furniture, setFurniture] = useState<Furniture[]>(INITIAL_FURNITURE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([GLOBAL_ROOM]);
  const [activeRoomId, setActiveRoomId] = useState<string>('global');
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [buildMode, setBuildMode] = useState(false);
  
  // Construction State
  const [selectedFurnitureType, setSelectedFurnitureType] = useState<FurnitureType>(FurnitureType.DESK);
  const [selectedVariant, setSelectedVariant] = useState<number>(0);
  const [selectedRotation, setSelectedRotation] = useState<number>(0);

  const [interactionTarget, setInteractionTarget] = useState<string | null>(null);
  
  // Notification System
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'info' | 'error'>('info');

  // UI State
  const [chatVisible, setChatVisible] = useState(true);
  const [usersMenuVisible, setUsersMenuVisible] = useState(false);
  
  // Media State
  const [micOn, setMicOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);

  // Refs for tracking changes
  const lastRoomRef = useRef<string>('OPEN_SPACE');
  const notificationTimeoutRef = useRef<number | null>(null);

  // Media Streams
  const localMicStreamRef = useRef<MediaStream | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);

  // --- DATA SYNC ---
  
  const fetchData = async () => {
      try {
          const [remoteFurniture, remoteChat, remoteRooms] = await Promise.all([
              loadFurnitureMap(),
              loadChatHistory(),
              loadChatRooms()
          ]);

          if (remoteFurniture && Array.isArray(remoteFurniture)) {
              const validFurniture = remoteFurniture.filter(f => 
                  f && f.position && typeof f.position.x === 'number' && typeof f.position.y === 'number'
              );
              if (validFurniture.length > 0 || remoteFurniture.length === 0) {
                  setFurniture(validFurniture);
              }
          }
          
          if (remoteChat) setMessages(remoteChat);
          
          if (remoteRooms && remoteRooms.length > 0) {
              const uniqueRooms = [GLOBAL_ROOM, ...remoteRooms.filter(r => r.id !== 'global')];
              setRooms(uniqueRooms);
          }
      } catch (error) {
          console.error("Data fetch warning:", error);
      }
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
        await fetchData();
        setIsDataLoaded(true);
    };
    init();
  }, []);

  // Polling
  useEffect(() => {
      if (!isDataLoaded) return;
      const interval = setInterval(() => {
          fetchData(); 
      }, 5000); 
      return () => clearInterval(interval);
  }, [isDataLoaded]);


  const showNotification = (msg: string, type: 'info' | 'error' = 'info') => {
      if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
      setNotification(msg);
      setNotificationType(type);
      notificationTimeoutRef.current = window.setTimeout(() => {
          setNotification(null);
      }, 4000);
  };

  // --- PERSISTENCE HANDLERS ---
  
  const persistMapChange = async (newFurniture: Furniture[]) => {
      setFurniture(newFurniture);
      try {
          await saveFurnitureMap(newFurniture);
      } catch (error) {
          showNotification(t('conn.temp'), "error");
      }
  };

  const persistChatMessage = async (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      try {
          await saveChatMessage(msg);
      } catch (error) {
          showNotification(t('conn.msg_fail'), "error");
      }
  };

  const handleCreateRoom = async (name: string, participants: string[]) => {
      if (!currentUser) return;
      
      const newRoom: ChatRoom = {
          id: `room-${Date.now()}`,
          name,
          type: 'PRIVATE',
          participants,
          createdBy: currentUser.id
      };

      setRooms(prev => [...prev, newRoom]);
      setActiveRoomId(newRoom.id);
      
      try {
          await createChatRoom(newRoom);
          showNotification(`${t('chat.new_room')}: ${name}`);
      } catch (error) {
          showNotification(t('conn.error'), "error");
      }
  };


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
  }, [currentUser?.id]);


  // --- ZONE LOGIC & NOTIFICATIONS ---
  useEffect(() => {
    if (!currentUser) return;

    const { x, y } = currentUser.position;
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    let currentRoomId = 'OPEN_SPACE';
    let roomName = t('loc.open');
    
    // Check Zones
    const inZone = (z: {x:number, y:number, w:number, h:number}) => 
        gridX >= z.x && gridX < z.x + z.w && gridY >= z.y && gridY < z.y + z.h;

    if (inZone(KITCHEN_ZONE)) {
        currentRoomId = 'KITCHEN';
        roomName = t('loc.kitchen');
    } else if (inZone(BATHROOM_ZONE)) {
        currentRoomId = 'BATHROOM';
        roomName = t('loc.bathroom');
    } else if (inZone(OFFICE_1_ZONE)) {
        currentRoomId = 'OFFICE_1';
        roomName = t('loc.office1');
    } else if (inZone(OFFICE_2_ZONE)) {
        currentRoomId = 'OFFICE_2';
        roomName = t('loc.office2');
    }

    // Auto-status logic
    let autoStatus = currentUser.status;
    if (currentUser.room !== currentRoomId) {
        if (currentRoomId === 'KITCHEN') autoStatus = 'Almorzando';
        else if (currentRoomId === 'BATHROOM') autoStatus = 'En el baño';
        else if (lastRoomRef.current === 'KITCHEN' || lastRoomRef.current === 'BATHROOM') autoStatus = 'En línea';
        
        if ((currentRoomId === 'KITCHEN' || currentRoomId === 'BATHROOM') && micOn) {
           handleToggleMic();
        }
        
        setCurrentUser(prev => prev ? { ...prev, room: currentRoomId, status: autoStatus } : null);
    }

    // Room Notifications
    if (currentRoomId !== lastRoomRef.current) {
        const text = currentRoomId === 'OPEN_SPACE' 
            ? `${t('notify.enter')} ${roomName}` 
            : `${t('notify.enter')}: ${roomName}`;
            
        showNotification(text, 'info');
        lastRoomRef.current = currentRoomId;
    }

  }, [currentUser?.position, micOn, t]);


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

  const handleSendMessage = (text: string, roomId: string, attachment?: Attachment) => {
      if (!currentUser) return;
      const msg: ChatMessage = {
          id: Date.now().toString(),
          roomId: roomId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text,
          attachment,
          timestamp: Date.now(),
          isPrivate: roomId !== 'global'
      };
      persistChatMessage(msg);
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
          const newFurniture = furniture.filter(f => f.position.x !== pos.x || f.position.y !== pos.y);
          persistMapChange(newFurniture);
      } else {
          const filtered = selectedFurnitureType === FurnitureType.FLOOR
            ? furniture.filter(f => !(f.position.x === pos.x && f.position.y === pos.y && f.type === FurnitureType.FLOOR))
            : furniture.filter(f => !(f.position.x === pos.x && f.position.y === pos.y && f.type !== FurnitureType.FLOOR));

          const newFurn: Furniture = {
              id: `f-${Date.now()}`,
              type: selectedFurnitureType, 
              position: pos,
              rotation: selectedRotation,
              variant: selectedVariant
          };
          persistMapChange([...filtered, newFurn]);
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
            console.error("Mic access denied:", error);
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
            console.error("Screen share failed:", error);
            setSharingScreen(false);
        }
    }
  };

  if (!currentUser) {
    return <AvatarCreator onJoin={handleJoin} />;
  }

  // Loading Screen
  if (!isDataLoaded) {
      return (
        <div className="h-screen w-full bg-gray-900 flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>{t('loading')}</p>
        </div>
      );
  }

  const visibleRooms = rooms.filter(r => 
      r.type === 'GLOBAL' || (r.participants && r.participants.includes(currentUser.id))
  );

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
        <ZoneNotification message={notification} type={notificationType} />

        {/* HUD Elements */}
        <VideoOverlay peers={peers} currentUserPos={currentUser.position} />
        
        {/* NEW MINIMAP COMPONENT */}
        <Minimap 
            furniture={furniture}
            peers={peers}
            currentUser={currentUser}
        />
        
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
                currentUser={currentUser}
                peers={peers}
                rooms={visibleRooms}
                activeRoomId={activeRoomId}
                messages={messages}
                onSendMessage={handleSendMessage}
                onCreateRoom={handleCreateRoom}
                onSetActiveRoom={setActiveRoomId}
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