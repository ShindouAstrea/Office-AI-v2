import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { Furniture, ChatMessage, ChatRoom } from '../types';

// Declare process to avoid TS2580 if @types/node is not loaded
declare const process: { env: Record<string, string | undefined> };

// Safe configuration: allows the app to load even if env vars are missing (starts in offline mode)
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
  // Only initialize if we seem to have a valid config (check for API KEY)
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

// --- API ---

export const loadFurnitureMap = async (): Promise<Furniture[] | null> => {
  if (!db) return null; // Graceful fallback, do not throw
  
  try {
    const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.MAIN_MAP);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().furniture as Furniture[];
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
    await setDoc(docRef, { furniture, lastUpdated: Date.now() }, { merge: true });
  } catch (error) {
    console.error("Error saving map:", error);
    throw error;
  }
};

export const loadChatHistory = async (): Promise<ChatMessage[]> => {
    if (!db) return []; // Graceful fallback
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_LOG);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().messages as ChatMessage[];
        }
        return [];
    } catch (error) {
        console.error("Error loading chat:", error);
        return [];
    }
}

export const saveChatMessage = async (message: ChatMessage) => {
    if (!db) throw new Error("Database not connected");
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_LOG);
        await setDoc(docRef, { 
            messages: arrayUnion(message),
            lastUpdated: Date.now()
        }, { merge: true });
    } catch (error) {
        throw error;
    }
}

// --- ROOMS API ---

export const loadChatRooms = async (): Promise<ChatRoom[]> => {
    if (!db) return []; // Graceful fallback
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_ROOMS);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().rooms as ChatRoom[];
        }
        return [];
    } catch (error) {
        console.error("Error loading rooms:", error);
        return [];
    }
};

export const createChatRoom = async (room: ChatRoom) => {
    if (!db) throw new Error("Database not connected");
    try {
        const docRef = doc(db, COLLECTIONS.OFFICE, DOCS.CHAT_ROOMS);
        await setDoc(docRef, { 
            rooms: arrayUnion(room),
            lastUpdated: Date.now()
        }, { merge: true });
    } catch (error) {
        throw error;
    }
};