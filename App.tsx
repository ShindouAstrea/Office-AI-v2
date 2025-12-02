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
import ScreenShareViewer from './components/ScreenShareViewer';
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
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null); 

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
  
  // NEW: Screen Share Management
  const [screenShares, setScreenShares] = useState<{ playerId: string; stream: MediaStream; playerName: string }[]>([]);
  const [maximizedScreenId, setMaximizedScreenId] = useState<string | null>(null);

  // Refs for tracking changes
  const lastRoomRef = useRef<string>('OPEN_SPACE');
  const notificationTimeoutRef = useRef<number | null>(null);

  // Media Streams
  const localMicStreamRef = useRef<MediaStream | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);

  // --- HELPER: NOTIFICATIONS ---
  const showNotification = (msg: string, type: 'info' | 'error' = 'info') => {
      if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
      setNotification(msg);
      setNotificationType(type);
      notificationTimeoutRef.current = window.setTimeout(() => {
          setNotification(null);
      }, 4000);
  };

  // --- MEDIA HANDLERS ---
  
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
        } catch (error: any) {
            console.error("Mic access denied:", error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                 showNotification("Acceso al micrófono denegado", "error");
            } else {
                 showNotification("Error al acceder al micrófono", "error");
            }
        }
    }
  };

  const handleToggleScreen = async () => {
    if (!currentUser) return;

    if (sharingScreen) {
        // STOP SHARING
        if (localScreenStreamRef.current) {
            localScreenStreamRef.current.getTracks().forEach(track => track.stop());
            localScreenStreamRef.current = null;
        }
        setSharingScreen(false);
        // Remove from list
        setScreenShares(prev => prev.filter(s => s.playerId !== currentUser.id));
        if (maximizedScreenId === currentUser.id) setMaximizedScreenId(null);

    } else {
        // START SHARING
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            localScreenStreamRef.current = stream;
            setSharingScreen(true);
            
            // Add to active shares list
            setScreenShares(prev => [
                ...prev, 
                { playerId: currentUser.id, stream, playerName: currentUser.name }
            ]);

            // Handle browser-level stop button
            stream.getVideoTracks()[0].onended = () => {
                setSharingScreen(false);
                localScreenStreamRef.current = null;
                setScreenShares(prev => prev.filter(s => s.playerId !== currentUser.id));
                if (maximizedScreenId === currentUser.id) setMaximizedScreenId(null);
            };
        } catch (error: any) {
            console.error("Screen share failed:", error);
            setSharingScreen(false);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                showNotification("Compartir pantalla cancelado", "info");
            } else {
                showNotification("Error al compartir pantalla", "error");
            }
        }
    }
  };

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

  // --- KEYBOARD SHORTCUTS FOR BUILD MODE ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Rotate object with 'R' if in build mode
      if (buildMode && e.key.toLowerCase() === 'r') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        setSelectedRotation(prev => (prev + 90) % 360);

        if (selectedObjectId) {
            setFurniture(prev => {
                const updated = prev.map(f => {
                    if (f.id === selectedObjectId) {
                        return { ...f, rotation: (f.rotation + 90) % 360 };
                    }
                    return f;
                });
                persistMapChange(updated);
                return updated;
            });
        }
      }
      // Delete selected object
      if (buildMode && (e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
          
          const newFurn = furniture.filter(f => f.id !== selectedObjectId);
          setFurniture(newFurn);
          persistMapChange(newFurn);
          setSelectedObjectId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildMode, selectedObjectId, furniture]);


  // --- PERSISTENCE HANDLERS ---
  
  const persistMapChange = async (newFurniture: Furniture[]) => {
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
    // ... (Peers simulation removed for now)
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
      
      if (type !== FurnitureType.SELECT && type !== FurnitureType.DELETE) {
          setSelectedObjectId(null);
      }
  };

  const handleManualRotate = () => {
      setSelectedRotation(prev => (prev + 90) % 360);
      
      if (selectedObjectId) {
          setFurniture(prev => {
              const updated = prev.map(f => {
                  if (f.id === selectedObjectId) {
                      return { ...f, rotation: (f.rotation + 90) % 360 };
                  }
                  return f;
              });
              persistMapChange(updated);
              return updated;
          });
      }
  };

  // Helper to determine furniture layer
  const getFurnitureLayer = (type: FurnitureType): 'FLOOR' | 'RUG' | 'BASE' | 'TOP' => {
      switch(type) {
          case FurnitureType.FLOOR: return 'FLOOR';
          case FurnitureType.RUG: return 'RUG';
          case FurnitureType.SCREEN:
          case FurnitureType.COFFEE_MAKER:
          case FurnitureType.FOOD:
          case FurnitureType.LAMP:
          case FurnitureType.PLANT:
          case FurnitureType.PRINTER:
          case FurnitureType.SINK:
              return 'TOP';
          default: return 'BASE';
      }
  };

  // Determine snap precision based on type
  const getSnapPrecision = (type: FurnitureType): number => {
      if (type === FurnitureType.WALL || type === FurnitureType.FLOOR) return 1; 
      return 0.5; 
  };

  const handlePlaceFurniture = (pos: Position) => {
      if (!buildMode) return;

      if (selectedFurnitureType === FurnitureType.DELETE) {
          const newFurniture = furniture.filter(f => 
              Math.abs(f.position.x - pos.x) < 0.5 && Math.abs(f.position.y - pos.y) < 0.5
          );
          
          if (newFurniture.length !== furniture.length) {
              setFurniture(newFurniture);
              persistMapChange(newFurniture);
          }
          return;
      }

      if (selectedFurnitureType === FurnitureType.SELECT) {
          const clickedItem = furniture.find(f => 
              Math.abs(f.position.x - pos.x) < 0.5 && Math.abs(f.position.y - pos.y) < 0.5
          );

          if (clickedItem) {
              setSelectedObjectId(clickedItem.id);
              setSelectedRotation(clickedItem.rotation);
          } else if (selectedObjectId) {
              const selectedItem = furniture.find(f => f.id === selectedObjectId);
              if (selectedItem) {
                  const snap = getSnapPrecision(selectedItem.type);
                  const snappedX = Math.round(pos.x / snap) * snap;
                  const snappedY = Math.round(pos.y / snap) * snap;

                  const newFurnList = furniture.map(f => {
                      if (f.id === selectedObjectId) {
                          return { ...f, position: { x: snappedX, y: snappedY } };
                      }
                      return f;
                  });
                  setFurniture(newFurnList);
                  persistMapChange(newFurnList);
              } else {
                  setSelectedObjectId(null); 
              }
          } else {
              setSelectedObjectId(null);
          }
          return;
      }

      const snap = getSnapPrecision(selectedFurnitureType);
      const snappedX = Math.round(pos.x / snap) * snap;
      const snappedY = Math.round(pos.y / snap) * snap;
      
      const targetLayer = getFurnitureLayer(selectedFurnitureType);
      
      const filtered = furniture.filter(f => {
          if (Math.abs(f.position.x - snappedX) >= 0.5 || Math.abs(f.position.y - snappedY) >= 0.5) return true;
          
          const existingLayer = getFurnitureLayer(f.type);
          if (existingLayer === targetLayer) return false;
          return true; 
      });

      const newFurn: Furniture = {
          id: `f-${Date.now()}`,
          type: selectedFurnitureType, 
          position: { x: snappedX, y: snappedY },
          rotation: selectedRotation,
          variant: selectedVariant
      };
      
      const updatedList = [...filtered, newFurn];
      setFurniture(updatedList);
      persistMapChange(updatedList);
  };
  
  if (!currentUser) return <AvatarCreator onJoin={handleJoin} />;
  if (!isDataLoaded) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">{t('loading')}</div>;

  const visibleRooms = rooms.filter(r => r.type === 'GLOBAL' || (r.participants && r.participants.includes(currentUser.id)));

  // Identify maximizing stream
  const maximizedStream = maximizedScreenId ? screenShares.find(s => s.playerId === maximizedScreenId) : null;

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
            
            selectedFurnitureType={selectedFurnitureType}
            selectedVariant={selectedVariant}
            selectedRotation={selectedRotation}
            selectedObjectId={selectedObjectId}
        />

        <ZoneNotification message={notification} type={notificationType} />
        
        {/* Pass screenShares to VideoOverlay for thumbnails */}
        <VideoOverlay 
            peers={peers} 
            currentUserPos={currentUser.position} 
            screenShares={screenShares}
            onMaximizeScreen={setMaximizedScreenId}
        />
        
        <Minimap furniture={furniture} peers={peers} currentUser={currentUser} />
        
        {buildMode && (
          <BuildMenu 
            selectedType={selectedFurnitureType}
            selectedVariant={selectedVariant}
            selectedRotation={selectedRotation}
            onSelect={handleSelectFurniture}
            onRotate={handleManualRotate} 
          />
        )}

        {/* Maximized Screen Viewer */}
        {maximizedStream && (
            <ScreenShareViewer 
                stream={maximizedStream.stream} 
                sharerName={maximizedStream.playerName}
                onClose={() => setMaximizedScreenId(null)}
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