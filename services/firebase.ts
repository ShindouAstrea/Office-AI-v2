import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { Furniture, ChatMessage, ChatRoom } from '../types';

// Declare process to avoid TS2580 if @types/node is not loaded
declare const process: { env: Record<string, string | undefined> };

// Safe configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let db: any = null;

try {
  if (process.env.FIREBASE_API_KEY) {
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
  } else {
      console.warn("Firebase credentials missing. App running in Offline/Memory Mode.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  db = null;
}

const COLLECTIONS = {
  OFFICE: 'virtual_office',
};

const DOCS = {
  MAIN_MAP: 'main_map_v1',
  CHAT_LOG: 'global_chat_v1',
  CHAT_ROOMS: 'chat_rooms_v1'
};

// --- HELPER: Remove undefined fields (Firestore rejects them) ---
const cleanObject = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
};

// --- API ---

export const loadFurnitureMap = async (): Promise<Furniture[] | null> => {
  if (!db) return null;
  
  try {
    const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.MAIN_MAP);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return Array.isArray(data.furniture) ? data.furniture : [];
    } else {
      return null; 
    }
  } catch (error) {
    console.error("Error loading map:", error);
    return null;
  }
};

export const saveFurnitureMap = async (furniture: Furniture[]) => {
  if (!db) throw new Error("Database not connected");
  
  try {
    const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.MAIN_MAP);
    // Clean the array to ensure no undefined values sneak in
    const cleanFurniture = cleanObject(furniture);
    await setDoc(docRef, { furniture: cleanFurniture, lastUpdated: Date.now() }, { merge: true });
  } catch (error) {
    console.error("Error saving map:", error);
    throw error;
  }
};

export const loadChatHistory = async (): Promise<ChatMessage[] | null> => {
    if (!db) return null; // Return null (not empty array) to prevent clearing state on connection fail
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_LOG);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return Array.isArray(data.messages) ? data.messages : [];
        }
        return []; // Doc exists but is empty or new
    } catch (error) {
        console.error("Error loading chat:", error);
        return null; // Prevent overwrite
    }
}

export const saveChatMessage = async (message: ChatMessage) => {
    if (!db) throw new Error("Database not connected");
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_LOG);
        // IMPORTANT: Clean object removes 'undefined' fields like optional attachment
        const cleanMessage = cleanObject(message);
        
        await setDoc(docRef, { 
            messages: arrayUnion(cleanMessage),
            lastUpdated: Date.now()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
}

// --- ROOMS API ---

export const loadChatRooms = async (): Promise<ChatRoom[] | null> => {
    if (!db) return null;
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_ROOMS);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return Array.isArray(data.rooms) ? data.rooms : [];
        }
        return [];
    } catch (error) {
        console.error("Error loading rooms:", error);
        return null;
    }
};

export const createChatRoom = async (room: ChatRoom) => {
    if (!db) throw new Error("Database not connected");
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_ROOMS);
        const cleanRoom = cleanObject(room);
        await setDoc(docRef, { 
            rooms: arrayUnion(cleanRoom),
            lastUpdated: Date.now()
        }, { merge: true });
    } catch (error) {
        throw error;
    }
};