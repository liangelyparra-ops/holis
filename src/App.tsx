import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
Gamepad2, 
Users, 
Trophy, 
Timer, 
Flame, 
Skull, 
Upload, 
Play, 
Check, 
ChevronRight,
Star,
AlertCircle,
User
} from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { GoogleGenAI, Type } from "@google/genai";
import { Player, GameCard, GameState, DEFAULT_CARDS, PREDEFINED_PLAYERS } from './types';
import { db, auth, loginAnonymously } from './firebase';

const GAME_ID = 'global-party'; // Using a global ID for simplicity in this version

enum OperationType {
CREATE = 'create',
UPDATE = 'update',
DELETE = 'delete',
LIST = 'list',
GET = 'get',
WRITE = 'write',
}

interface FirestoreErrorInfo {
error: string;
operationType: OperationType;
path: string | null;
authInfo: {
userId: string | undefined;
email: string | null | undefined;
emailVerified: boolean | undefined;
isAnonymous: boolean | undefined;
tenantId: string | null | undefined;
providerInfo: {
providerId: string;
displayName: string | null;
email: string | null;
photoUrl: string | null;
}[];
}
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
const errInfo: FirestoreErrorInfo = {
error: error instanceof Error ? error.message : String(error),
authInfo: {
userId: auth.currentUser?.uid,
email: auth.currentUser?.email,
emailVerified: auth.currentUser?.emailVerified,
isAnonymous: auth.currentUser?.isAnonymous,
tenantId: auth.currentUser?.tenantId,
providerInfo: auth.currentUser?.providerData.map(provider => ({
providerId: provider.providerId,
displayName: provider.displayName,
email: provider.email,
photoUrl: provider.photoURL
})) || []
},
operationType,
path
}
console.error('Firestore Error: ', JSON.stringify(errInfo));
throw new Error(JSON.stringify(errInfo));
}

export default function App() {
const [firestoreError, setFirestoreError] = useState<string | null>(null);
const [gameState, setGameState] = useState<GameState>({
status: 'HOME',
players: [],
cards: DEFAULT_CARDS,
currentCardIndex: 0,
timer: 60,
isChaosMode: true,
isPenaltyMode: false,
currentTurnPlayerId: null,
readyCount: 0,
});

const [selectedNickname, setSelectedNickname] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
const [isConnected, setIsConnected] = useState(false);
const [showPlayersList, setShowPlayersList] = useState(false);
const [userId, setUserId] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

// Initialize Auth
useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, (user) => {
if (user) {
setUserId(user.uid);
setIsConnected(true);
} else {
setUserId(null);
setIsConnected(false);
}
});
return () => unsubscribe();
}, []);

// Ensure anonymous auth on startup so joinGame can rely on auth.currentUser
useEffect(() => {
loginAnonymously().catch((e) => {
console.warn('Anonymous login failed', e);
});
}, []);

// Initialize Game State Listener
useEffect(() => {
if (!isConnected) return;

const gameRef = doc(db, 'games', GAME_ID);
const unsubscribe = onSnapshot(gameRef, (snapshot) => {
if (snapshot.exists()) {
setGameState(snapshot.data() as GameState);
} else {
// Initialize game if it doesn't exist
setDoc(gameRef, {
status: 'HOME',
players: [],
cards: DEFAULT_CARDS,
currentCardIndex: 0,
timer: 60,
isChaosMode: true,
isPenaltyMode: false,
currentTurnPlayerId: null,
readyCount: 0,
}).catch(err => handleFirestoreError(err, OperationType.WRITE, `games/${GAME_ID}`));
}
}, (error) => {
handleFirestoreError(error, OperationType.GET, `games/${GAME_ID}`);
});

return () => unsubscribe();
}, [isConnected]);

// Timer Logic (Client-side sync)
useEffect(() => {
if (gameState.status !== 'GAME' || !userId) return;

// Only the first player (host-ish) handles the timer to avoid multiple decrements
const isHost = gameState.players[0]?.id === userId;
if (!isHost) return;

const interval = setInterval(() => {
if (gameState.timer > 0) {
updateDoc(doc(db, 'games', GAME_ID), {
timer: gameState.timer - 1
}).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
} else {
updateDoc(doc(db, 'games', GAME_ID), {
status: 'RESULTS'
}).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
}
}, 1000);

return () => clearInterval(interval);
}, [gameState.status, gameState.timer, gameState.players, userId]);

// Instrumented joinGame with console logging + local fallback
  const joinGame = async (name: string) => {
    console.log('[joinGame] start', { name, userId, authUid: auth.currentUser?.uid });
  // Replace your existing joinGame with this debug version
const joinGame = async (name: string) => {
  alert(`[joinGame] clicked: ${name}`);
  console.log('[joinGame] start', { name, userId, authUid: auth.currentUser?.uid });

  try {
    let currentUserId = userId;

    if (!currentUserId) {
      // Try anonymous sign-in
      await loginAnonymously();
      currentUserId = auth.currentUser?.uid || null;
      console.log('[joinGame] after loginAnonymously, uid=', currentUserId);
      alert(`[joinGame] after anonymous login, uid=${currentUserId}`);
    }

    if (!currentUserId) {
      alert('[joinGame] No user id available after login.');
      console.warn('[joinGame] no user id after login');
      return;
    }

    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    const newPlayer: Player = { id: currentUserId, name, avatar, score: 0, isReady: false };

    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
try {
      let currentUserId = userId;
      
      if (!currentUserId) {
        // Use anonymous sign-in (no popup) so userId will be available
        await loginAnonymously();
        currentUserId = auth.currentUser?.uid || null;
        console.log('[joinGame] anonymous login, uid=', currentUserId);
      }
      snapshot = await getDoc(gameRef);
      console.log('[joinGame] getDoc snapshot.exists=', snapshot.exists());
      alert(`[joinGame] getDoc success, exists=${snapshot.exists()}`);
    } catch (err) {
      console.error('[joinGame] getDoc error', err);
      alert('[joinGame] getDoc failed (see console)');
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }

      if (!currentUserId) {
        console.warn('[joinGame] no user id after login');
        return;
      }
    const currentPlayers = snapshot.exists() ? (snapshot.data().players || []) : [];

      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
      const newPlayer: Player = { id: currentUserId, name, avatar, score: 0, isReady: false };
      
      const gameRef = doc(db, 'games', GAME_ID);
      let snapshot;
      try {
        snapshot = await getDoc(gameRef);
        console.log('[joinGame] got snapshot', snapshot.exists(), snapshot?.data && snapshot.data());
      } catch (err) {
        console.error('[joinGame] getDoc error', err);
        handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
        return;
      }
    // Check if player already exists
    const existingIdx = currentPlayers.findIndex((p: Player) => p.id === currentUserId);
    let updatedPlayers = [...currentPlayers];

      const currentPlayers = snapshot.exists() ? (snapshot.data().players || []) : [];
      
      // Check if player already exists
      const existingIdx = currentPlayers.findIndex((p: Player) => p.id === currentUserId);
      let updatedPlayers = [...currentPlayers];
      
      if (existingIdx === -1) {
        updatedPlayers.push(newPlayer);
      } else {
        updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx], name, avatar };
      }
    if (existingIdx === -1) {
      updatedPlayers.push(newPlayer);
    } else {
      updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx], name, avatar };
    }

      try {
        const newStatus = snapshot.data()?.status === 'HOME' ? 'LOBBY' : snapshot.data()?.status;
        await updateDoc(gameRef, {
          players: updatedPlayers,
          status: newStatus
        });
        console.log('[joinGame] updateDoc succeeded', { newStatus, updatedPlayers });
    // Determine new status locally
    const newStatus = snapshot.data()?.status === 'HOME' ? 'LOBBY' : snapshot.data()?.status || 'LOBBY';

        // Local fallback to immediately update UI while we wait for Firestore snapshot propagation
        setGameState(prev => ({ ...prev, players: updatedPlayers, status: newStatus }));
      } catch (err) {
        console.error('[joinGame] updateDoc error', err);
        handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
      }
      
      setSelectedNickname(name);
    } catch (error) {
      console.error("Error joining game:", error);
    // TRY updating Firestore but always apply a local fallback so UI moves immediately
    try {
      await updateDoc(gameRef, {
        players: updatedPlayers,
        status: newStatus
      });
      console.log('[joinGame] updateDoc succeeded', { newStatus, updatedPlayers });
      alert('[joinGame] updateDoc succeeded');
    } catch (err) {
      console.error('[joinGame] updateDoc error', err);
      alert('[joinGame] updateDoc failed (see console). Falling back to local UI update.');
      // Do not rethrow — continue to local fallback so user sees the Lobby
}
  };

    // LOCAL FALLBACK: immediately set UI so the client proceeds even if Firestore is slow/blocked
    setGameState(prev => ({ ...prev, players: updatedPlayers, status: newStatus }));
    setSelectedNickname(name);
    console.log('[joinGame] local UI fallback applied. status=', newStatus);
    alert(`[joinGame] joined locally as ${name}. Status: ${newStatus}`);
  } catch (error) {
    console.error("Error joining game:", error);
    alert('[joinGame] Exception: see console');
  }
};

const setReady = async () => {
if (!userId) return;
const gameRef = doc(db, 'games', GAME_ID);
let snapshot;
try {
snapshot = await getDoc(gameRef);
} catch (err) {
handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
return;
}
if (!snapshot.exists()) return;

const players = snapshot.data().players as Player[];
const playerIdx = players.findIndex(p => p.id === userId);
if (playerIdx === -1 || players[playerIdx].isReady) return;

players[playerIdx].isReady = true;
const newReadyCount = (snapshot.data().readyCount || 0) + 1;

const updates: any = {
players,
readyCount: newReadyCount
};
