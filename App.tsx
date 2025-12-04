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
import SettingsMenu from './components/SettingsMenu';
import { 
    loadFurnitureMap, 
    saveFurnitureMap, 
    loadChatHistory, 
    saveChatMessage, 
    loadChatRooms, 
    createChatRoom, 
    updateUserSession, 
    removeUserSession, 
    subscribeToActiveUsers 
} from './services/firebase';
import { useLanguage } from './contexts/LanguageContext';
import { X, Circle, RotateCcw, XOctagon } from 'lucide-react';

// ... (TicTacToe component remains unchanged)
interface TicTacToeProps {
  onClose: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (calculateWinner(board) || board[i]) return;
    const nextBoard = board.slice();
    nextBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(Boolean);
  
  let status;
  if (winner) {
    status = `${t('game.winner')}: ${winner}`;
  } else if (isDraw) {
    status = t('game.draw');
  } else {
    status = `${t('game.next_player')}: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border-4 border-indigo-500 rounded-2xl p-6 shadow-2xl max-w-sm w-full relative transform transition-all scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 uppercase tracking-widest shadow-neon">
            {t('game.tictactoe')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <XOctagon size={24} />
          </button>
        </div>
        <div className="text-center text-white mb-6 font-mono text-lg bg-gray-800 py-2 rounded-lg border border-gray-700">
          {status}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {board.map((square, i) => (
            <button
              key={i}
              className={`h-24 w-24 bg-gray-800 rounded-lg text-4xl flex items-center justify-center transition-all duration-200 
                ${!square && !winner ? 'hover:bg-gray-700 cursor-pointer' : ''}
                ${square === 'X' ? 'text-pink-500' : 'text-indigo-400'}
                border-2 border-gray-700
              `}
              onClick={() => handleClick(i)}
            >
              {square === 'X' && <X size={48} strokeWidth={3} />}
              {square === 'O' && <Circle size={40} strokeWidth={3} />}
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button onClick={resetGame} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
            <RotateCcw size={18} /> {t('game.reset')}
          </button>
        </div>
      </div>
    </div>
  );
};


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
  
  // Settings State
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // UI State
  const [chatVisible, setChatVisible] = useState(true);
  const [usersMenuVisible, setUsersMenuVisible] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false); 
  
  // Media State
  const [micOn, setMicOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  
  // Screen Share Management
  const [screenShares, setScreenShares] = useState<{ playerId: string; stream: MediaStream; playerName: string }[]>([]);
  const [maximizedScreenId, setMaximizedScreenId] = useState<string | null>(null);

  // Refs
  const lastRoomRef = useRef<string>('OPEN_SPACE');
  const notificationTimeoutRef = useRef<number | null>(null);
  const localMicStreamRef = useRef<MediaStream | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const peersRef = useRef<Player[]>([]); 

  // --- HELPER: NOTIFICATIONS ---
  const showNotification = (msg: string, type: 'info' | 'error' = 'info') => {
      if (type === 'info' && !notificationsEnabled) return;

      if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
      setNotification(msg);
      setNotificationType(type);
      notificationTimeoutRef.current = window.setTimeout(() => {
          setNotification(null);
      }, 4000);
  };

  // --- UI TOGGLE HANDLERS ---
  const handleToggleChat = () => {
      const newState = !chatVisible;
      if (newState) { setUsersMenuVisible(false); setBuildMode(false); setSettingsVisible(false); setIsGameOpen(false); }
      setChatVisible(newState);
  };
  const handleToggleUsers = () => {
      const newState = !usersMenuVisible;
      if (newState) { setChatVisible(false); setBuildMode(false); setSettingsVisible(false); setIsGameOpen(false); }
      setUsersMenuVisible(newState);
  };
  const handleToggleBuild = () => {
      const newState = !buildMode;
      if (newState) { setChatVisible(false); setUsersMenuVisible(false); setSettingsVisible(false); setIsGameOpen(false); }
      setBuildMode(newState);
  };
  const handleToggleSettings = () => {
      const newState = !settingsVisible;
      if (newState) { setChatVisible(false); setUsersMenuVisible(false); setBuildMode(false); setIsGameOpen(false); }
      setSettingsVisible(newState);
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
        if (localScreenStreamRef.current) {
            localScreenStreamRef.current.getTracks().forEach(track => track.stop());
            localScreenStreamRef.current = null;
        }
        setSharingScreen(false);
        setScreenShares(prev => prev.filter(s => s.playerId !== currentUser.id));
        if (maximizedScreenId === currentUser.id) setMaximizedScreenId(null);
    } else {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            localScreenStreamRef.current = stream;
            setSharingScreen(true);
            setScreenShares(prev => [...prev, { playerId: currentUser.id, stream, playerName: currentUser.name }]);
            stream.getVideoTracks()[0].onended = () => {
                setSharingScreen(false);
                localScreenStreamRef.current = null;
                setScreenShares(prev => prev.filter(s => s.playerId !== currentUser.id));
                if (maximizedScreenId === currentUser.id) setMaximizedScreenId(null);
            };
        } catch (error: any) {
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
              const validFurniture = remoteFurniture.filter(f => f && f.position && typeof f.position.x === 'number' && typeof f.position.y === 'number');
              if (validFurniture.length > 0 || remoteFurniture.length === 0) setFurniture(validFurniture);
          }
          if (remoteChat) setMessages(remoteChat);
          if (remoteRooms && remoteRooms.length > 0) {
              const uniqueRooms = [GLOBAL_ROOM, ...remoteRooms.filter(r => r.id !== 'global')];
              setRooms(uniqueRooms);
          }
      } catch (error) { console.error("Data fetch warning:", error); }
  };

  useEffect(() => {
    const init = async () => { await fetchData(); setIsDataLoaded(true); };
    init();
  }, []);

  useEffect(() => {
      if (!isDataLoaded) return;
      const interval = setInterval(() => { fetchData(); }, 5000); 
      return () => clearInterval(interval);
  }, [isDataLoaded]);

  // --- REALTIME PEER SYNC ---
  useEffect(() => {
      if (!currentUser) return;
      
      const unsubscribe = subscribeToActiveUsers(currentUser.id, (activePeers) => {
          setPeers(prevPeers => {
              const prevMap = new Map(prevPeers.map(p => [p.id, p]));
              
              return activePeers.map(serverPeer => {
                  const localPeer = prevMap.get(serverPeer.id);
                  if (localPeer) {
                      return {
                          ...serverPeer,
                          position: localPeer.position, 
                          targetPosition: serverPeer.position 
                      };
                  }
                  return {
                      ...serverPeer,
                      targetPosition: serverPeer.position
                  };
              });
          });
      });
      
      const cleanup = () => {
          removeUserSession(currentUser.id);
          unsubscribe();
      };
      window.addEventListener('beforeunload', cleanup);
      return () => { cleanup(); window.removeEventListener('beforeunload', cleanup); }
  }, [currentUser]);


  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (buildMode && e.key.toLowerCase() === 'r') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        setSelectedRotation(prev => (prev + 90) % 360);
        if (selectedObjectId) {
            setFurniture(prev => {
                const updated = prev.map(f => (f.id === selectedObjectId ? { ...f, rotation: (f.rotation + 90) % 360 } : f));
                persistMapChange(updated); return updated;
            });
        }
      }
      if (buildMode && (e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
          const newFurn = furniture.filter(f => f.id !== selectedObjectId);
          setFurniture(newFurn); persistMapChange(newFurn); setSelectedObjectId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildMode, selectedObjectId, furniture]);

  // --- PERSISTENCE & LOGIC ---
  const persistMapChange = async (newFurniture: Furniture[]) => {
      try { await saveFurnitureMap(newFurniture); } catch (error) { showNotification(t('conn.temp'), "error"); }
  };
  const persistChatMessage = async (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      try { await saveChatMessage(msg); } catch (error) { showNotification(t('conn.msg_fail'), "error"); }
  };
  const handleResetMap = () => {
      if (window.confirm(t('build.reset_confirm'))) {
          setFurniture(INITIAL_FURNITURE); persistMapChange(INITIAL_FURNITURE); showNotification(t('build.reset_success'), "info");
      }
  };
  const handleCreateRoom = async (name: string, participants: string[]) => {
      if (!currentUser) return;
      const newRoom: ChatRoom = { id: `room-${Date.now()}`, name, type: 'PRIVATE', participants, createdBy: currentUser.id };
      setRooms(prev => [...prev, newRoom]); setActiveRoomId(newRoom.id);
      try { await createChatRoom(newRoom); showNotification(`${t('chat.new_room')}: ${name}`); } catch (error) { showNotification(t('conn.error'), "error"); }
  };
  const handleInteract = (targetId: string | null) => {
      setInteractionTarget(targetId);
      const targetItem = furniture.find(f => f.id === targetId);
      if (targetItem && targetItem.type === FurnitureType.ARCADE) {
          setIsGameOpen(true); setChatVisible(false); setBuildMode(false); setSettingsVisible(false); setUsersMenuVisible(false);
      }
  };

  // --- ZONE LOGIC ---
  useEffect(() => {
    if (!currentUser) return;
    const { x, y } = currentUser.position;
    const gridX = Math.floor(x / TILE_SIZE); const gridY = Math.floor(y / TILE_SIZE);
    let currentRoomId = 'OPEN_SPACE'; let roomName = t('loc.open');
    const inZone = (z: {x:number, y:number, w:number, h:number}) => gridX >= z.x && gridX < z.x + z.w && gridY >= z.y && gridY < z.y + z.h;
    if (inZone(KITCHEN_ZONE)) { currentRoomId = 'KITCHEN'; roomName = t('loc.kitchen'); } 
    else if (inZone(BATHROOM_ZONE)) { currentRoomId = 'BATHROOM'; roomName = t('loc.bathroom'); }
    else if (inZone(OFFICE_1_ZONE)) { currentRoomId = 'OFFICE_1'; roomName = t('loc.office1'); }
    else if (inZone(OFFICE_2_ZONE)) { currentRoomId = 'OFFICE_2'; roomName = t('loc.office2'); }

    let autoStatus = currentUser.status;
    if (currentUser.room !== currentRoomId) {
        if (currentRoomId === 'KITCHEN') autoStatus = 'Almorzando';
        else if (currentRoomId === 'BATHROOM') autoStatus = 'En el baño';
        else if (lastRoomRef.current === 'KITCHEN' || lastRoomRef.current === 'BATHROOM') autoStatus = 'En línea';
        if ((currentRoomId === 'KITCHEN' || currentRoomId === 'BATHROOM') && micOn) handleToggleMic();
        setCurrentUser(prev => prev ? { ...prev, room: currentRoomId, status: autoStatus } : null);
    }
    if (currentRoomId !== lastRoomRef.current) {
        showNotification(`${t('notify.enter')} ${roomName}`, 'info');
        lastRoomRef.current = currentRoomId;
    }
  }, [currentUser?.position, micOn, t]);

  const handleJoin = (playerData: Partial<Player>) => {
      // PERSISTENT ID LOGIC
      let stableUserId = localStorage.getItem('nexus_user_id');
      if (!stableUserId) {
          // Generate and save a new ID if it doesn't exist
          stableUserId = 'user-' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('nexus_user_id', stableUserId);
      }

      const newPlayer = {
        id: stableUserId, // Use consistent ID
        name: playerData.name || 'User',
        color: playerData.color || AVATAR_COLORS[0],
        position: { x: 20 * TILE_SIZE + TILE_SIZE/2, y: 28 * TILE_SIZE + TILE_SIZE/2 }, 
        targetPosition: { x: 20 * TILE_SIZE, y: 28 * TILE_SIZE },
        isTalking: false,
        avatarId: 1,
        room: 'OPEN_SPACE',
        status: 'En línea'
      };
      setCurrentUser(newPlayer);
      updateUserSession(newPlayer);
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (currentUser) {
      const updated = { ...currentUser, status: newStatus };
      setCurrentUser(updated);
      updateUserSession(updated);
    }
  };

  const handleMove = (newPos: Position) => {
    if (currentUser) {
        const updatedUser = { ...currentUser, position: newPos, targetPosition: newPos }; // Local move is instant for self
        setCurrentUser(updatedUser);
        
        const now = Date.now();
        if (now - lastUpdateRef.current > 200) { // Increased throttle to 200ms for better network
            updateUserSession(updatedUser);
            lastUpdateRef.current = now;
        }
    }
  };
  
  // ... (Rest of the code remains identical)
  // Explicitly included to ensure file completeness
  const handleSendMessage = (text: string, roomId: string, attachment?: Attachment) => { if (!currentUser) return; const msg: ChatMessage = { id: Date.now().toString(), roomId, senderId: currentUser.id, senderName: currentUser.name, text, attachment, timestamp: Date.now(), isPrivate: roomId !== 'global' }; persistChatMessage(msg); };
  const handleSelectFurniture = (type: FurnitureType, variant: number, rotation: number) => { setSelectedFurnitureType(type); setSelectedVariant(variant); setSelectedRotation(rotation); if (type !== FurnitureType.SELECT && type !== FurnitureType.DELETE) setSelectedObjectId(null); };
  const handleManualRotate = () => { setSelectedRotation(prev => (prev + 90) % 360); if (selectedObjectId) { setFurniture(prev => { const updated = prev.map(f => (f.id === selectedObjectId ? { ...f, rotation: (f.rotation + 90) % 360 } : f)); persistMapChange(updated); return updated; }); } };
  const getFurnitureLayer = (type: FurnitureType) => { switch(type) { case FurnitureType.FLOOR: return 'FLOOR'; case FurnitureType.RUG: return 'RUG'; case FurnitureType.SCREEN: case FurnitureType.COFFEE_MAKER: case FurnitureType.FOOD: case FurnitureType.LAMP: case FurnitureType.PLANT: case FurnitureType.PRINTER: case FurnitureType.SINK: return 'TOP'; case FurnitureType.ARCADE: return 'BASE'; default: return 'BASE'; } };
  const getSnapPrecision = (type: FurnitureType) => (type === FurnitureType.WALL || type === FurnitureType.FLOOR) ? 1 : 0.5;

  const handlePlaceFurniture = (pixelPos: Position) => {
      if (!buildMode) return;
      const gridPos = { x: pixelPos.x / TILE_SIZE, y: pixelPos.y / TILE_SIZE };

      if (selectedFurnitureType === FurnitureType.DELETE) {
          const newFurniture = furniture.filter(f => !(Math.abs(f.position.x - gridPos.x) < 0.5 && Math.abs(f.position.y - gridPos.y) < 0.5));
          if (newFurniture.length !== furniture.length) { setFurniture(newFurniture); persistMapChange(newFurniture); }
          return;
      }
      if (selectedFurnitureType === FurnitureType.SELECT) {
          const clickedItem = furniture.find(f => Math.abs(f.position.x - gridPos.x) < 0.5 && Math.abs(f.position.y - gridPos.y) < 0.5);
          if (clickedItem) { setSelectedObjectId(clickedItem.id); setSelectedRotation(clickedItem.rotation); }
          else if (selectedObjectId) {
              const selectedItem = furniture.find(f => f.id === selectedObjectId);
              if (selectedItem) {
                  const snap = getSnapPrecision(selectedItem.type);
                  const snappedX = Math.round(gridPos.x / snap) * snap; const snappedY = Math.round(gridPos.y / snap) * snap;
                  const newFurnList = furniture.map(f => (f.id === selectedObjectId ? { ...f, position: { x: snappedX, y: snappedY } } : f));
                  setFurniture(newFurnList); persistMapChange(newFurnList);
              } else setSelectedObjectId(null);
          } else setSelectedObjectId(null);
          return;
      }
      const snap = getSnapPrecision(selectedFurnitureType);
      const snappedX = Math.round(gridPos.x / snap) * snap; const snappedY = Math.round(gridPos.y / snap) * snap;
      const targetLayer = getFurnitureLayer(selectedFurnitureType);
      const filtered = furniture.filter(f => {
          if (Math.abs(f.position.x - snappedX) >= 0.5 || Math.abs(f.position.y - snappedY) >= 0.5) return true;
          const existingLayer = getFurnitureLayer(f.type);
          if (existingLayer === targetLayer) return false;
          return true; 
      });
      const newFurn: Furniture = { id: `f-${Date.now()}`, type: selectedFurnitureType, position: { x: snappedX, y: snappedY }, rotation: selectedRotation, variant: selectedVariant };
      const updatedList = [...filtered, newFurn]; setFurniture(updatedList); persistMapChange(updatedList);
  };

  if (!currentUser) return <AvatarCreator onJoin={handleJoin} />;
  if (!isDataLoaded) return <div className="h-screen bg-gray-900 text-white flex items-center justify-center">{t('loading')}</div>;

  const visibleRooms = rooms.filter(r => r.type === 'GLOBAL' || (r.participants && r.participants.includes(currentUser.id)));
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
        
        <VideoOverlay 
            peers={peers} 
            currentUserPos={currentUser.position} 
            screenShares={screenShares}
            onMaximizeScreen={setMaximizedScreenId}
        />
        
        {showMinimap && <Minimap furniture={furniture} peers={peers} currentUser={currentUser} />}
        
        {buildMode && (
          <BuildMenu 
            selectedType={selectedFurnitureType}
            selectedVariant={selectedVariant}
            selectedRotation={selectedRotation}
            onSelect={handleSelectFurniture}
            onRotate={handleManualRotate}
            onReset={handleResetMap}
          />
        )}

        {settingsVisible && (
            <SettingsMenu 
                onClose={() => setSettingsVisible(false)}
                notificationsEnabled={notificationsEnabled}
                setNotificationsEnabled={setNotificationsEnabled}
                showMinimap={showMinimap}
                setShowMinimap={setShowMinimap}
            />
        )}

        {isGameOpen && <TicTacToe onClose={() => setIsGameOpen(false)} />}

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
            settingsVisible={settingsVisible} 
            onToggleMic={handleToggleMic}
            onToggleScreen={handleToggleScreen}
            onToggleBuild={handleToggleBuild}
            onToggleChat={handleToggleChat}
            onToggleUsers={handleToggleUsers}
            onToggleSettings={handleToggleSettings}
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