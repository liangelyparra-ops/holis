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
  User,
  Info,
  HelpCircle,
  X,
  Settings,
  Shuffle,
  Type as TypeIcon
} from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { Toaster, toast } from 'sonner';
import { Player, GameCard, GameState, DEFAULT_CARDS, PREDEFINED_PLAYERS, PRIMOS_CARDS, PAPELITO_RANDOM_THEMES, HOLIS_CARDS } from './types';
import { db } from './firebase';

const USER_ID_KEY = 'party-game-user-id-v2';
const NICKNAME_KEY = 'party-game-nickname';
const AVATAR_KEY = 'party-game-avatar';

function getOrCreateUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `guest-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || 'global-party';
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function shuffleAlternating(cards: GameCard[]): GameCard[] {
  const categories = Array.from(new Set(cards.map(c => c.category)));
  const cardsByCategory: Record<string, GameCard[]> = {};
  
  categories.forEach(cat => {
    cardsByCategory[cat] = shuffleArray(cards.filter(c => c.category === cat));
  });

  const result: GameCard[] = [];
  let hasMore = true;
  let index = 0;

  while (hasMore) {
    hasMore = false;
    categories.forEach(cat => {
      if (cardsByCategory[cat][index]) {
        result.push(cardsByCategory[cat][index]);
        hasMore = true;
      }
    });
    index++;
  }

  return result;
}

const GAME_ID = getRoomId();

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
      userId: undefined,
      email: undefined,
      emailVerified: undefined,
      isAnonymous: undefined,
      tenantId: undefined,
      providerInfo: []
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
    timer: 90,
    mode: 'PAPELITO',
    currentTurnPlayerId: null,
    readyCount: 0,
    turnOrder: [],
  });

  const [selectedNickname, setSelectedNickname] = useState<string | null>(localStorage.getItem(NICKNAME_KEY));
  const [tempNickname, setTempNickname] = useState(localStorage.getItem(NICKNAME_KEY) || '');
  const [papelitoInput, setPapelitoInput] = useState('');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string | null>(localStorage.getItem(AVATAR_KEY) || 'avatar-1');
  const [showRoundAnimation, setShowRoundAnimation] = useState<number | null>(null);
  
  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  const SOUNDS = {
    JOIN: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    START: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
    VOTE: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    WIN: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    TICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    NEXT_CARD: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    ROUND_START: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3',
    TIMEOUT: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
    NEXT: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    FINISH: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3',
    GAME_START: 'https://raw.githubusercontent.com/liangely/holis-game/main/estan-listos-chicos.mp3',
  };
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play sound on card change
  useEffect(() => {
    if (gameState.status === 'GAME') {
      playSound(SOUNDS.NEXT);
    }
  }, [gameState.currentCardIndex, gameState.status]);

  // Play intro sound when game starts
  useEffect(() => {
    if (gameState.status === 'GAME' && gameState.currentCardIndex === 0) {
      playSound(SOUNDS.GAME_START);
    }
  }, [gameState.status]);

  // Show winner notification to everyone
  useEffect(() => {
    if (gameState.isShowingWinner && gameState.lastWinnerName) {
      if (gameState.lastWinnerId === 'none') {
        toast.error("Nadie adivinó... ❌", {
          description: "¡A la próxima!",
          duration: 2000,
        });
      } else {
        toast.success(`¡Punto para ${gameState.lastWinnerName}! 🏆`, {
          description: "+10 puntos",
          duration: 2000,
        });
        playSound(SOUNDS.WIN);
      }
    }
  }, [gameState.isShowingWinner, gameState.lastWinnerName, gameState.lastWinnerId]);

  useEffect(() => {
    if (gameState.status === 'GAME' && gameState.currentCardIndex === 0 && (gameState.currentRound === 1 || !gameState.currentRound)) {
      playSound(SOUNDS.START);
    }
    if (gameState.status === 'RESULTS') {
      playSound(SOUNDS.FINISH);
    }
  }, [gameState.status, gameState.currentRound]);

  // Initialize Local User ID
  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setIsConnected(true);
  }, []);

  // Initialize Game State Listener
  useEffect(() => {
    if (!isConnected || !userId) return;

    const gameRef = doc(db, 'games', GAME_ID);
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as GameState;
        setGameState(data);
        
        // If user is already in the players list, they have "joined"
        const me = data.players.find(p => p.id === userId);
        if (me && !selectedNickname) {
          setSelectedNickname(me.name);
        }
      } else {
        // Initialize game if it doesn't exist
        setDoc(gameRef, {
          status: 'HOME',
          players: [],
          cards: shuffleArray(DEFAULT_CARDS),
          currentCardIndex: 0,
          timer: 90,
          mode: 'PAPELITO',
          currentTurnPlayerId: null,
          readyCount: 0,
          turnOrder: [],
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `games/${GAME_ID}`));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `games/${GAME_ID}`);
    });

    return () => unsubscribe();
  }, [isConnected]);

  // Timer Logic (Client-side sync)
  useEffect(() => {
    if (gameState.status !== 'GAME' || !userId || gameState.isShowingWinner) return;

    // Only the first player (host-ish) handles the timer to avoid multiple decrements
    const isHost = gameState.players[0]?.id === userId;
    if (!isHost) return;

    const interval = setInterval(() => {
      if (gameState.timer > 0) {
        updateDoc(doc(db, 'games', GAME_ID), {
          timer: gameState.timer - 1
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
      } else {
        if (gameState.mode === 'PAPELITO') {
          // On timeout in Papelito, we just pass the turn but keep the same card
          // so the next player can try to explain it.
          const turnOrder = gameState.turnOrder || gameState.players.map(p => p.id);
          const currentTurnIdx = turnOrder.indexOf(gameState.currentTurnPlayerId || '');
          const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
          
          updateDoc(doc(db, 'games', GAME_ID), {
            currentTurnPlayerId: turnOrder[nextTurnIdx],
            timer: 90
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
        } else {
          updateDoc(doc(db, 'games', GAME_ID), {
            status: 'RESULTS'
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status, gameState.timer, gameState.players, userId, gameState.mode, gameState.turnOrder, gameState.currentTurnPlayerId, gameState.isShowingWinner]);

  // Round Animation Logic
  useEffect(() => {
    if (gameState.status === 'GAME' && gameState.mode === 'PAPELITO' && gameState.currentRound) {
      setShowRoundAnimation(gameState.currentRound);
      playSound(SOUNDS.ROUND_START);
      const timer = setTimeout(() => setShowRoundAnimation(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentRound, gameState.status, gameState.mode]);

  const joinGame = async () => {
    if (!tempNickname.trim() || !selectedAvatarSeed) return;

    try {
      const currentUserId = userId;
      if (!currentUserId) {
        console.warn("No user ID available yet.");
        return;
      }

      const name = tempNickname.trim();
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatarSeed}`;
      const newPlayer: Player = { id: currentUserId, name, avatar, score: 0, isReady: false, isHost: false, papelitos: [] };
      
      const gameRef = doc(db, 'games', GAME_ID);
      const snapshot = await getDoc(gameRef);
      
      let updatedPlayers: Player[] = [];
      let currentStatus = 'HOME';
      let existingData: any = {};

      if (snapshot.exists()) {
        existingData = snapshot.data();
        updatedPlayers = [...(existingData.players || [])];
        currentStatus = existingData.status || 'HOME';
        
        // Check if player already exists
        const existingIdx = updatedPlayers.findIndex((p: Player) => p.id === currentUserId);
        if (existingIdx === -1) {
          updatedPlayers.push(newPlayer);
        } else {
          updatedPlayers[existingIdx] = { ...updatedPlayers[existingIdx], name, avatar };
        }
      } else {
        updatedPlayers = [newPlayer];
      }

      const nextStatus = (currentStatus === 'HOME' || currentStatus === 'RESULTS' || (currentStatus === 'GAME' && updatedPlayers.length <= 1)) 
        ? 'LOBBY' 
        : currentStatus;

      await setDoc(gameRef, {
        ...existingData,
        players: updatedPlayers,
        status: nextStatus,
        cards: existingData.cards || DEFAULT_CARDS,
        currentCardIndex: existingData.currentCardIndex || 0,
        timer: existingData.timer !== undefined ? existingData.timer : 90,
        mode: existingData.mode || 'PAPELITO',
        currentTurnPlayerId: existingData.currentTurnPlayerId || null,
        readyCount: updatedPlayers.filter(p => p.isReady).length,
        turnOrder: existingData.turnOrder || [],
      });
      
      localStorage.setItem(NICKNAME_KEY, name);
      localStorage.setItem(AVATAR_KEY, selectedAvatarSeed);
      setSelectedNickname(name);
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const goHome = async () => {
    if (!userId) {
      setSelectedNickname(null);
      return;
    }
    
    try {
      const gameRef = doc(db, 'games', GAME_ID);
      const snapshot = await getDoc(gameRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const players = (data.players || []) as Player[];
        const filteredPlayers = players.filter(p => p.id !== userId);
        
        const updates: any = { 
          players: filteredPlayers,
          readyCount: filteredPlayers.filter(p => p.isReady).length
        };
        
        if (filteredPlayers.length <= 1 && data.status === 'GAME') {
          updates.status = 'LOBBY';
        }

        if (filteredPlayers.length === 0) {
          updates.status = 'HOME';
          updates.readyCount = 0;
        }

        await updateDoc(gameRef, updates);
      }
    } catch (error) {
      console.error("Error leaving game:", error);
    } finally {
      setSelectedNickname(null);
      setTempNickname('');
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
    const readyPlayersCount = players.filter(p => p.isReady).length;

    const updates: any = {
      players,
      readyCount: readyPlayersCount
    };

    if (readyPlayersCount === players.length && players.length >= 3) {
      if (snapshot.data().mode === 'PAPELITO') {
        const allPapelitos: GameCard[] = [];
        players.forEach(p => {
          if (p.papelitos) {
            p.papelitos.forEach((text, i) => {
              allPapelitos.push({
                id: `papelito-${p.id}-${i}`,
                category: 'PAPELITO',
                content: text,
                emoji: '📝'
              });
            });
          }
        });
        updates.cards = shuffleArray(allPapelitos);
        updates.currentRound = 1;
      }
      
      updates.status = 'GAME';
      updates.currentCardIndex = 0;
      updates.timer = 90;
      updates.isShowingWinner = false;
      updates.lastWinnerName = null;
      const turnOrder = shuffleArray(players.map(p => p.id));
      updates.turnOrder = turnOrder;
      updates.currentTurnPlayerId = turnOrder[0];
    }

    try {
      await updateDoc(gameRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);
    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      toast.error("Error al leer el archivo.");
      setIsUploading(false);
    };

    reader.onload = async (event) => {
      let text = event.target?.result as string;
      console.log("File read successfully, length:", text.length);
      
      if (!text || text.trim().length < 10) {
        toast.error("El archivo parece estar vacío o es demasiado corto.");
        setIsUploading(false);
        return;
      }

      // Truncate text if it's too long to avoid token limits (approx 30k characters is safe for flash)
      if (text.length > 30000) {
        console.log("Truncating text from", text.length, "to 30000");
        text = text.substring(0, 30000);
      }

      try {
        console.log("Initializing Gemini API...");
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.error("GEMINI_API_KEY is missing from process.env");
          throw new Error("La llave de API (GEMINI_API_KEY) no está configurada. Por favor, revisa los secretos en el menú de configuración.");
        }

        const ai = new GoogleGenAI({ apiKey });
        console.log("Calling generateContent with model gemini-3-flash-preview...");
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Eres un experto en crear juegos de fiesta. Basándote en el siguiente historial de chat de WhatsApp, genera 30 cartas divertidas para el juego "Holis Game".
          
          El chat es: """${text}"""

          Debes generar cartas en estas 3 categorías específicas, extrayendo nombres reales y frases del chat:
          1. "QUIÉN DIJO ESTO": Frases icónicas, divertidas o polémicas dichas por personas en el chat. El 'content' es la frase exacta (sin el nombre) y el 'answer' es el nombre de la persona que la dijo.
          2. "TABÚ": Palabras, temas o "chistes internos" recurrentes en el chat. El 'content' es la palabra principal y 'tabooWords' son 3 palabras relacionadas que NO se pueden decir para describirla.
          3. "ACTUAR": Situaciones, manías o comportamientos típicos de los integrantes del grupo que se mencionen o se deduzcan del chat. El 'content' es la acción corta y el 'context' es una breve descripción de cómo actuarla.

          Devuelve un JSON que cumpla estrictamente con este formato:
          [{ 
            "category": "QUIÉN DIJO ESTO" | "TABÚ" | "ACTUAR", 
            "content": "texto principal", 
            "emoji": "un emoji relacionado",
            "answer": "nombre (solo para QUIÉN DIJO ESTO)",
            "tabooWords": ["palabra1", "palabra2", "palabra3"] (solo para TABÚ),
            "context": "descripción de la actuación" (solo para ACTUAR)
          }]`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "La categoría de la carta: QUIÉN DIJO ESTO, TABÚ o ACTUAR" },
                  content: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  tabooWords: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  context: { type: Type.STRING },
                },
                required: ["category", "content", "emoji"],
              },
            },
          },
        });

        console.log("Gemini response received");
        if (!response.text) {
          throw new Error("La IA no devolvió ninguna respuesta. Intenta con un chat más corto.");
        }

        const generatedData = JSON.parse(response.text);
        console.log("Generated cards count:", generatedData.length);

        if (!Array.isArray(generatedData) || generatedData.length === 0) {
          throw new Error("La IA no pudo generar cartas válidas a partir de este chat.");
        }

        const newCards = shuffleArray(generatedData.map((c: any, i: number) => ({ 
          ...c, 
          id: `ai-${Date.now()}-${i}` 
        })));
        
        await updateDoc(doc(db, 'games', GAME_ID), { cards: newCards });
        toast.success("¡Mazo personalizado generado con éxito! 🔥");
      } catch (error: any) {
        console.error("Error generating cards:", error);
        const errorMessage = error.message || "Error desconocido";
        toast.error(`Error al generar cartas: ${errorMessage}`, {
          description: "Asegúrate de que el archivo sea un .txt de WhatsApp y que la API Key esté configurada.",
          duration: 5000
        });
        // Fallback to default cards if generation fails
        await updateDoc(doc(db, 'games', GAME_ID), { cards: shuffleArray(DEFAULT_CARDS) });
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const useDemoCards = async () => {
    try {
      await updateDoc(doc(db, 'games', GAME_ID), { cards: shuffleArray(DEFAULT_CARDS) });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const updateMode = async (mode: 'PAPELITO' | 'HOLIS' | 'PRIMOS' | 'WHATSAPP') => {
    try {
      const updates: any = {
        mode,
        currentCardIndex: 0
      };
      if (mode === 'PRIMOS') {
        updates.cards = shuffleAlternating(PRIMOS_CARDS);
      } else if (mode === 'HOLIS') {
        updates.cards = shuffleAlternating(HOLIS_CARDS);
      } else if (mode === 'PAPELITO') {
        updates.papelitosPerPlayer = 1; // Default 1 papelito
        updates.papelitoTheme = 'libre'; // Default theme
        updates.papelitoCustomTheme = ''; // Default custom theme
      } else if (mode === 'WHATSAPP') {
        // Default to some cards if none uploaded yet
        updates.cards = shuffleArray(DEFAULT_CARDS);
      }
      await updateDoc(doc(db, 'games', GAME_ID), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const updatePapelitoSettings = async (settings: { papelitosPerPlayer?: number, papelitoTheme?: string, papelitoCustomTheme?: string }) => {
    try {
      await updateDoc(doc(db, 'games', GAME_ID), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const shufflePapelitoTheme = async () => {
    const randomTheme = PAPELITO_RANDOM_THEMES[Math.floor(Math.random() * PAPELITO_RANDOM_THEMES.length)];
    await updatePapelitoSettings({ papelitoTheme: 'custom', papelitoCustomTheme: randomTheme });
  };

  const addPapelito = async () => {
    const word = papelitoInput.trim();
    if (!word || !userId) return;
    
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      const snapshot = await getDoc(gameRef);
      if (!snapshot.exists()) return;
      const players = [...snapshot.data().players] as Player[];
      const playerIdx = players.findIndex(p => p.id === userId);
      if (playerIdx === -1) return;
      
      const currentPapelitos = players[playerIdx].papelitos || [];
      if (currentPapelitos.length >= (snapshot.data().papelitosPerPlayer || 1)) return;

      players[playerIdx].papelitos = [...currentPapelitos, word];
      await updateDoc(gameRef, { players });
      setPapelitoInput('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const removePapelito = async (index: number) => {
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      const snapshot = await getDoc(gameRef);
      if (!snapshot.exists()) return;
      const players = [...snapshot.data().players] as Player[];
      const playerIdx = players.findIndex(p => p.id === userId);
      if (playerIdx === -1) return;
      
      const currentPapelitos = players[playerIdx].papelitos || [];
      const newPapelitos = currentPapelitos.filter((_, i) => i !== index);

      players[playerIdx].papelitos = newPapelitos;
      await updateDoc(gameRef, { players });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const voteWinner = async (winnerId: string) => {
    if (gameState.isShowingWinner) return;
    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
    try {
      snapshot = await getDoc(gameRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }
    if (!snapshot.exists()) return;

    const data = snapshot.data() as GameState;
    const players = [...data.players];
    let winnerName = null;
    
    if (winnerId) {
      const winnerIdx = players.findIndex(p => p.id === winnerId);
      if (winnerIdx !== -1) {
        players[winnerIdx].score += 10;
        winnerName = players[winnerIdx].name;
      }
    }

    // Phase 1: Show winner to everyone
    try {
      await updateDoc(gameRef, {
        isShowingWinner: true,
        lastWinnerId: winnerId || 'none',
        lastWinnerName: winnerName || (winnerId ? 'Alguien' : 'Nadie'),
        players
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
      return;
    }

    // Wait for 2 seconds to let everyone see the notification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Phase 2: Move to next card
    const updates: any = { 
      isShowingWinner: false,
      lastWinnerId: null,
      lastWinnerName: null
    };
    
    playSound(SOUNDS.NEXT_CARD);

    if (data.mode === 'PAPELITO') {
      const isLastCard = data.currentCardIndex >= (data.cards?.length || 0) - 1;
      const isLastRound = (data.currentRound || 1) >= 3;

      if (!isLastCard) {
        // Move to next card and rotate turn
        updates.currentCardIndex = data.currentCardIndex + 1;
        updates.timer = 90;
        
        const turnOrder = data.turnOrder || data.players.map(p => p.id);
        const currentTurnIdx = turnOrder.indexOf(data.currentTurnPlayerId || '');
        const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
        updates.currentTurnPlayerId = turnOrder[nextTurnIdx];
      } else if (!isLastRound) {
        // Transition to next round, reshuffle cards, and rotate turn
        updates.currentRound = (data.currentRound || 1) + 1;
        updates.currentCardIndex = 0;
        updates.cards = shuffleArray(data.cards || []);
        updates.timer = 90;

        const turnOrder = data.turnOrder || data.players.map(p => p.id);
        const currentTurnIdx = turnOrder.indexOf(data.currentTurnPlayerId || '');
        const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
        updates.currentTurnPlayerId = turnOrder[nextTurnIdx];
      } else {
        updates.status = 'RESULTS';
      }
    } else {
      const totalTurns = data.players.length * 3;
      if (data.currentCardIndex < totalTurns - 1 && data.currentCardIndex < data.cards.length - 1) {
        updates.currentCardIndex = data.currentCardIndex + 1;
        
        const turnOrder = data.turnOrder || data.players.map(p => p.id);
        const currentTurnIdx = turnOrder.indexOf(data.currentTurnPlayerId || '');
        const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
        updates.currentTurnPlayerId = turnOrder[nextTurnIdx];
        updates.timer = 90;
      } else {
        updates.status = 'RESULTS';
      }
    }

    try {
      await updateDoc(gameRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const resetGame = async () => {
    try {
      await setDoc(doc(db, 'games', GAME_ID), {
        status: 'HOME',
        players: [],
        cards: shuffleArray(DEFAULT_CARDS),
        currentCardIndex: 0,
        timer: 90,
        mode: 'PAPELITO',
        currentTurnPlayerId: null,
        readyCount: 0,
        turnOrder: [],
        currentRound: 1,
        papelitosPerPlayer: 1,
        lastWinnerId: null,
        lastWinnerName: null,
        isShowingWinner: false,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `games/${GAME_ID}`);
    }
  };

  const restartGame = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
    try {
      snapshot = await getDoc(gameRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }
    if (!snapshot.exists()) return;

    const data = snapshot.data();
    const players = data.players.map((p: Player) => ({ ...p, score: 0, isReady: false, papelitos: [] }));
    
    // Shuffle cards if they are exhausted or for a fresh start
    let shuffledCards = data.cards;
    if (data.currentCardIndex >= data.cards.length - (players.length * 3)) {
      shuffledCards = data.mode === 'PRIMOS' ? shuffleAlternating(PRIMOS_CARDS) : shuffleArray(data.cards);
    }

    try {
      await updateDoc(gameRef, {
        status: 'LOBBY',
        players,
        cards: shuffledCards,
        readyCount: 0,
        currentCardIndex: 0,
        timer: 90,
        lastWinnerId: null,
        lastWinnerName: null,
        isShowingWinner: false,
        currentRound: 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const continueWithPoints = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    let snapshot;
    try {
      snapshot = await getDoc(gameRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `games/${GAME_ID}`);
      return;
    }
    if (!snapshot.exists()) return;

    const data = snapshot.data();
    const players = data.players.map((p: Player) => ({ ...p, isReady: false }));
    
    let shuffledCards = data.cards;
    if (data.currentCardIndex >= data.cards.length - (players.length * 3)) {
      shuffledCards = shuffleArray(data.cards);
    }

    try {
      await updateDoc(gameRef, {
        status: 'LOBBY',
        players,
        cards: shuffledCards,
        readyCount: 0,
        currentCardIndex: 0,
        timer: 90,
        lastWinnerId: null,
        lastWinnerName: null,
        isShowingWinner: false,
        currentRound: 1
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const myPlayer = gameState.players.find(p => p.id === userId);
  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === userId;

  const createPrivateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    window.location.href = `?room=${newRoomId}`;
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full p-8 text-center"
    >
      <div className="max-w-md mx-auto space-y-6 sm:space-y-8 bg-surface-container-high p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border-2 border-primary/20 shadow-2xl">
        <div className="space-y-4">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-primary ml-4">Tu Apodo / Nombre</label>
          <input 
            type="text" 
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            placeholder="Ej: El Rey de la Fiesta"
            className="w-full bg-surface-container-highest border-2 border-outline-variant/30 rounded-2xl p-4 font-headline font-black uppercase text-on-surface focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-primary ml-4">Elige tu Avatar</label>
          <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 scrollbar-hide">
            {Array.from({ length: 20 }).map((_, i) => {
              const seed = `avatar-${i + 1}`;
              const isSelected = selectedAvatarSeed === seed;
              return (
                <button
                  key={seed}
                  onClick={() => setSelectedAvatarSeed(seed)}
                  className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                    isSelected ? 'border-primary scale-110 shadow-[0_0_15px_rgba(255,137,171,0.4)]' : 'border-outline-variant/30 grayscale hover:grayscale-0 hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check size={20} className="text-on-primary-fixed" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {GAME_ID !== 'global-party' ? (
          <button 
            onClick={joinGame}
            disabled={!tempNickname.trim() || !selectedAvatarSeed}
            className={`w-full py-4 sm:py-6 rounded-2xl sm:rounded-3xl font-headline font-black text-xl sm:text-2xl uppercase tracking-tighter shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
              !tempNickname.trim() || !selectedAvatarSeed
                ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                : 'bg-primary text-on-primary-fixed hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,137,171,0.4)]'
            }`}
          >
            <span>ENTRAR A LA SALA</span>
            <ChevronRight />
          </button>
        ) : (
          <button 
            onClick={createPrivateRoom}
            className="w-full py-4 sm:py-6 bg-primary text-on-primary-fixed font-headline font-black text-xl sm:text-2xl uppercase tracking-tighter rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,137,171,0.4)] active:scale-95 flex items-center justify-center gap-3 transition-all"
          >
            <Users size={24} />
            CREAR SALA PRIVADA
          </button>
        )}

        <div className="pt-6 border-t border-outline-variant/20 space-y-4">
          {GAME_ID !== 'global-party' && (
            <button 
              onClick={createPrivateRoom}
              className="w-full bg-surface-container-highest text-on-surface font-headline font-bold py-3 sm:py-4 text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
            >
              <Users size={20} />
              CREAR OTRA SALA
            </button>
          )}
          
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-variant/30 rounded-full w-fit mx-auto">
            <div className={`w-2 h-2 rounded-full ${GAME_ID === 'global-party' ? 'bg-tertiary' : 'bg-primary animate-pulse'}`}></div>
            <span className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest">
              {GAME_ID === 'global-party' ? 'SIN SALA SELECCIONADA' : `SALA: ${GAME_ID}`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderLobby = () => {
    const myPlayer = gameState.players.find(p => p.id === userId);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full p-4 sm:p-8 flex flex-col gap-6"
      >
        <div className="flex justify-between items-center bg-surface-container-high p-4 rounded-3xl border-2 border-primary/20 shadow-xl">
          <div className="flex items-center gap-3">
            <Users className="text-primary" size={24} />
            <h2 className="font-headline text-xl sm:text-2xl font-black uppercase tracking-tighter text-on-surface">Lobby</h2>
          </div>
          <div className="bg-primary/10 px-4 py-1 rounded-full border border-primary/20 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Esperando Jugadores</span>
            <button 
              onClick={resetGame}
              className="p-1 hover:bg-primary/20 rounded-full transition-all text-primary"
              title="Reiniciar Sala"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Modo de Juego</h3>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => updateMode('PAPELITO')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'PAPELITO' ? 'bg-secondary/10 border-secondary shadow-[0_0_15px_rgba(137,255,171,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Star size={20} className={gameState.mode === 'PAPELITO' ? 'text-secondary' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Papelito</span>
                </button>
                <button 
                  onClick={() => updateMode('HOLIS')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'HOLIS' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(255,137,171,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Flame size={20} className={gameState.mode === 'HOLIS' ? 'text-primary' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Holis</span>
                </button>
                <button 
                  onClick={() => updateMode('PRIMOS')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'PRIMOS' ? 'bg-tertiary/10 border-tertiary shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Users size={20} className={gameState.mode === 'PRIMOS' ? 'text-tertiary' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Primos</span>
                </button>
                <button 
                  onClick={() => updateMode('WHATSAPP')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'WHATSAPP' ? 'bg-error/10 border-error shadow-[0_0_15px_rgba(255,84,84,0.3)]' : 'bg-surface-container-low border-outline-variant/30 opacity-60'}`}
                >
                  <Upload size={20} className={gameState.mode === 'WHATSAPP' ? 'text-error' : 'text-on-surface-variant'} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Custom</span>
                </button>
              </div>
            </div>

            {gameState.mode === 'PAPELITO' && (
              <div className="bg-surface-container-high p-4 rounded-[2rem] border-2 border-secondary/20 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-secondary">Configuración Papelito</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toast.info("Papelito: 3 Rondas. 1: Descripción libre, 2: Una sola palabra, 3: Mímica.")}
                      className="text-secondary/50 hover:text-secondary transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <Settings size={12} className="text-secondary/50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant">Papelitos</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(num => (
                        <button
                          key={num}
                          onClick={() => updatePapelitoSettings({ papelitosPerPlayer: num })}
                          className={`flex-1 py-1.5 rounded-lg border transition-all font-headline font-black text-xs ${
                            gameState.papelitosPerPlayer === num 
                              ? 'bg-secondary/10 border-secondary text-secondary' 
                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant">Tema</p>
                    <div className="flex gap-1">
                      {['libre', 'custom'].map(t => (
                        <button
                          key={t}
                          onClick={() => updatePapelitoSettings({ papelitoTheme: t })}
                          className={`flex-1 py-1.5 rounded-lg border transition-all font-headline font-black text-[9px] uppercase ${
                            gameState.papelitoTheme === t 
                              ? 'bg-secondary/10 border-secondary text-secondary' 
                              : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                        onClick={shufflePapelitoTheme}
                        className="p-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:border-secondary hover:text-secondary transition-all"
                      >
                        <Shuffle size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {gameState.papelitoTheme === 'custom' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <input 
                      type="text" 
                      value={gameState.papelitoCustomTheme || ''}
                      onChange={(e) => updatePapelitoSettings({ papelitoCustomTheme: e.target.value })}
                      placeholder="Escribe el tema de la partida..."
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] text-on-surface focus:border-secondary outline-none transition-all"
                    />
                  </motion.div>
                )}

                <div className="pt-3 border-t border-outline-variant/20">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-secondary mb-2">Tu Frase ({myPlayer?.papelitos?.length || 0} / {gameState.papelitosPerPlayer || 1})</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={papelitoInput}
                      onChange={(e) => setPapelitoInput(e.target.value)}
                      placeholder={gameState.papelitoTheme === 'libre' ? "Escribe una frase..." : `Tema: ${gameState.papelitoCustomTheme || '...'}...`}
                      className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] text-on-surface focus:border-secondary outline-none transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && addPapelito()}
                    />
                    <button 
                      onClick={addPapelito}
                      disabled={(myPlayer?.papelitos?.length || 0) >= (gameState.papelitosPerPlayer || 1)}
                      className="p-1.5 bg-secondary text-on-secondary-fixed rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {myPlayer?.papelitos?.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20">
                      <span className="text-[8px] font-black uppercase truncate max-w-[100px]">{p}</span>
                      <button 
                        onClick={() => removePapelito(i)}
                        className="hover:text-error transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState.mode === 'HOLIS' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Mazo Holis</h3>
                  <Flame size={14} className="text-primary/50" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-body">Mazo pre-cargado con los mejores desafíos de Holis Game.</p>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mazo Listo 🔥</span>
                </div>
              </div>
            )}

            {gameState.mode === 'PRIMOS' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-tertiary/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-tertiary">Mazo Primos</h3>
                  <Users size={14} className="text-tertiary/50" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-body">Mazo pre-cargado con chistes internos y desafíos de la familia.</p>
                <div className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Mazo Listo 🔥</span>
                </div>
              </div>
            )}

            {gameState.mode === 'WHATSAPP' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-error/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-error">Mazo WhatsApp (IA)</h3>
                  <Upload size={14} className="text-error/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-on-surface font-black uppercase tracking-widest">¿Cómo funciona?</p>
                  <ol className="text-[9px] text-on-surface-variant font-body list-decimal list-inside space-y-1">
                    <li>Ve a tu grupo de WhatsApp</li>
                    <li>Ajustes {'>'} Exportar chat (sin archivos)</li>
                    <li>Sube el archivo .txt aquí</li>
                    <li>¡Generamos desafíos basados en sus chistes!</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-container-highest rounded-2xl border-2 border-dashed border-outline-variant/50 text-on-surface-variant hover:border-error hover:text-error transition-all disabled:opacity-50"
                  >
                    {isUploading ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" /> : <Upload size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Generando...' : 'Subir Chat (.txt)'}</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".txt,text/plain" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Jugadores ({gameState.players.length})</h3>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                {gameState.players.map((player) => (
                  <div key={player.id} className="relative group">
                    <img src={player.avatar} alt={player.name} className={`w-full aspect-square rounded-2xl border-2 transition-all ${player.isReady ? 'border-primary shadow-[0_0_10px_rgba(255,137,171,0.3)]' : 'border-outline-variant/30 opacity-50'}`} />
                    {player.isReady && (
                      <div className="absolute -top-1 -right-1 bg-primary text-on-primary-fixed p-1 rounded-full shadow-lg">
                        <Check size={10} strokeWidth={4} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase bg-surface-container-highest/90 text-on-surface w-full text-center rounded py-0.5 truncate">{player.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {gameState.players.length < 3 && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle size={20} className="text-error shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-error leading-tight">
                  Se necesitan al menos 3 jugadores para iniciar la partida.
                </p>
              </div>
            )}
            <button 
              onClick={setReady}
              disabled={myPlayer?.isReady || gameState.players.length < 3 || (gameState.mode === 'PAPELITO' && (myPlayer?.papelitos?.length || 0) < (gameState.papelitosPerPlayer || 1))}
              className={`w-full py-6 rounded-3xl font-headline font-black text-2xl uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${
                myPlayer?.isReady || gameState.players.length < 3 || (gameState.mode === 'PAPELITO' && (myPlayer?.papelitos?.length || 0) < (gameState.papelitosPerPlayer || 1))
                  ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                  : 'bg-primary text-on-primary-fixed hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,137,171,0.4)]'
              }`}
            >
              {myPlayer?.isReady ? '¡ESTÁS LISTO! 🔥' : 'ESTOY LISTO'}
            </button>
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {gameState.readyCount} / {gameState.players.length} jugadores listos
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGame = () => {
    const myPlayer = gameState.players.find(p => p.id === userId);
    if (gameState.status === 'GAME' && myPlayer && !myPlayer.isReady) return renderWaiting();
    
    const currentCard = gameState.cards[gameState.currentCardIndex];
    if (!currentCard) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl w-full p-6 flex flex-col items-center gap-8"
      >
        <div className="w-full flex justify-between items-center gap-4">
          <button 
            onClick={goHome}
            className="bg-surface-container-high p-3 rounded-full border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-all shadow-lg"
          >
            <ChevronRight className="rotate-180" size={24} />
          </button>
          
          <div className="flex-1 flex flex-col items-center gap-2">
            {gameState.mode === 'PAPELITO' && (
              <div className="bg-secondary/10 border border-secondary/20 px-4 py-1 rounded-full">
                <p className="text-[8px] font-black uppercase tracking-widest text-secondary text-center">
                  {gameState.currentRound === 1 ? 'Ronda 1: Descripción' : 
                   gameState.currentRound === 2 ? 'Ronda 2: Una palabra' : 
                   'Ronda 3: Mímica'}
                </p>
              </div>
            )}
            <div className="flex justify-center gap-2">
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-full border border-primary/20 shadow-xl">
                <Timer className="text-primary" size={16} />
                <span className="font-headline font-black text-lg text-on-surface">{gameState.timer}s</span>
              </div>
              
              <div className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-full border border-primary/20 shadow-xl">
                {gameState.mode === 'HOLIS' ? <Flame className="text-primary" size={16} /> : 
                 gameState.mode === 'PRIMOS' ? <Users className="text-tertiary" size={16} /> : 
                 gameState.mode === 'WHATSAPP' ? <Upload className="text-error" size={16} /> :
                 <Star className="text-secondary" size={16} />}
                <span className="font-headline font-black text-[10px] uppercase tracking-widest text-on-surface">
                  {gameState.mode === 'HOLIS' ? 'Holis' : 
                   gameState.mode === 'PRIMOS' ? 'Primos' : 
                   gameState.mode === 'WHATSAPP' ? 'Custom' :
                   `Papelito R${gameState.currentRound}`}
                </span>
              </div>
            </div>
          </div>

          <div className="w-12 h-12 hidden sm:block"></div>
        </div>

        <motion.div 
          key={gameState.currentCardIndex}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className={`w-full aspect-[4/3] max-w-2xl bg-surface-container-high rounded-[2rem] border-4 shadow-[0_0_60px_rgba(255,137,171,0.15)] p-6 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden transition-all duration-500 ${
            isMyTurn ? 'border-primary animate-pulse-border' : 'border-primary/30'
          }`}
        >
          {isMyTurn && (
            <div className="absolute top-4 right-4 bg-primary text-on-primary-fixed px-3 py-1 rounded-full flex items-center gap-2 animate-bounce">
              <Star size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest">¡TU TURNO!</span>
            </div>
          )}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary/20">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((gameState.currentCardIndex + 1) / (gameState.mode === 'PAPELITO' ? gameState.cards.length : (gameState.players.length * 3))) * 100}%` }}
            />
          </div>

          {isMyTurn ? (
            <>
              <span className="text-5xl sm:text-7xl">{currentCard.emoji}</span>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 group relative">
                  <h4 className="font-headline text-xs sm:text-lg font-black uppercase tracking-[0.2em] text-primary">{currentCard.category}</h4>
                  <HelpCircle size={14} className="text-primary/50 cursor-help" />
                  
                  <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 bg-surface-container-highest p-3 rounded-xl border border-outline-variant/30 shadow-2xl z-50 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{currentCard.category}</p>
                    <p className="text-[10px] text-on-surface-variant leading-tight normal-case font-body">
                      {currentCard.category === 'ACTING' || currentCard.category === 'ACTUAR' ? 'Actúa la situación sin hablar. ¡Tus amigos deben adivinar!' :
                       currentCard.category === 'WHO SAID THIS' || currentCard.category === 'WHO_SAID' || currentCard.category === 'QUIÉN DIJO ESTO' ? '¿Quién dijo esta frase mítica? El grupo vota al culpable.' :
                       currentCard.category === 'EXPOSE' ? 'Momento de la verdad. Responde con sinceridad o bebe.' :
                       currentCard.category === 'WHO IS MOST LIKELY' ? 'Voten quién es más probable que haga esto.' :
                       currentCard.category === 'TABÚ' || currentCard.category === 'TABU' ? 'Describe la palabra sin usar las prohibidas.' :
                       currentCard.category === 'TRUTH OR BOMB' ? 'Responde la pregunta o explota (castigo del grupo).' :
                       currentCard.category === 'PAPELITO' ? (
                         gameState.currentRound === 1 ? 'Ronda 1: Describe el papelito usando todas las palabras que quieras (sin decir lo que está escrito).' :
                         gameState.currentRound === 2 ? 'Ronda 2: Solo puedes decir UNA palabra para que adivinen.' :
                         'Ronda 3: Solo puedes hacer mímica. ¡Shhh! No se permite hablar.'
                       ) :
                       'Sigue las instrucciones de la carta para ganar puntos.'}
                    </p>
                  </div>
                </div>
                <p className="font-headline text-xl sm:text-3xl md:text-4xl font-black text-on-surface leading-tight tracking-tighter italic">
                  "{currentCard.content}"
                </p>
                {currentCard.category === 'QUIÉN DIJO ESTO' && currentCard.answer && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Dicho por:</p>
                    <p className="text-xl font-headline font-black text-on-surface">
                      {currentCard.answer}
                    </p>
                  </div>
                )}
                {currentCard.category === 'ACTUAR' && currentCard.context && (
                  <div className="mt-2 p-2 bg-surface-container-highest border border-outline-variant/30 rounded-xl max-w-xs mx-auto">
                    <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Cómo actuar:</p>
                    <p className="text-[10px] text-on-surface leading-tight font-body">
                      {currentCard.context}
                    </p>
                  </div>
                )}
                {currentCard.tabooWords && (
                  <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded-xl">
                    <p className="text-[8px] font-black uppercase tracking-widest text-error mb-1">Palabras Prohibidas:</p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {currentCard.tabooWords.map(word => (
                        <span key={word} className="bg-error text-on-error px-2 py-0.5 rounded-full text-[8px] font-bold uppercase">{word}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Skull size={80} className="text-primary/20 mx-auto animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star size={24} className="text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-on-surface">¡ADIVINA!</h2>
                <p className="text-on-surface-variant font-body uppercase tracking-widest text-[10px] font-black">
                  Presta atención a <span className="text-primary">{currentTurnPlayer?.name}</span>
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {gameState.isShowingWinner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/80 backdrop-blur-md"
            >
              <div className="bg-surface-container-highest p-12 rounded-[3rem] border-4 border-primary shadow-[0_0_100px_rgba(255,137,171,0.4)] text-center space-y-6 relative overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
                />
                <Trophy size={80} className="text-primary mx-auto animate-bounce" />
                <div className="space-y-2">
                  <h2 className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-widest text-primary">¡Ganador de la Ronda!</h2>
                  <p className="font-headline text-5xl sm:text-7xl font-black text-on-surface uppercase tracking-tighter italic">
                    {gameState.lastWinnerName || '¡Nadie!'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-on-surface-variant font-black uppercase tracking-widest text-xs">
                  <Star size={16} className="text-primary" />
                  <span>+10 PUNTOS</span>
                  <Star size={16} className="text-primary" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full bg-surface-container-high rounded-[2.5rem] p-6 sm:p-8 border-2 border-primary/20 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={currentTurnPlayer?.avatar} alt={currentTurnPlayer?.name} className="w-12 h-12 rounded-full border-2 border-primary" />
                <div className="absolute -top-1 -right-1 bg-primary text-on-primary-fixed p-1 rounded-full">
                  <Star size={10} fill="currentColor" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Turno de:</p>
                <p className="font-headline font-black text-xl text-on-surface uppercase">{currentTurnPlayer?.name}</p>
              </div>
            </div>
            {isMyTurn && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">¡Es tu turno! No muestres tu pantalla</span>
                </div>
                <button
                  onClick={() => voteWinner('')}
                  disabled={gameState.isShowingWinner}
                  className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-full border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest hover:bg-error/10 hover:text-error hover:border-error/30 transition-all disabled:opacity-50"
                >
                  Nadie adivinó ❌
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {gameState.players.map((player) => (
              <button
                key={player.id}
                disabled={!isMyTurn || gameState.isShowingWinner}
                onClick={() => voteWinner(player.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  isMyTurn && !gameState.isShowingWinner
                    ? 'border-primary/30 bg-surface-container-low hover:border-primary hover:scale-105' 
                    : 'border-outline-variant/20 bg-surface-container-low opacity-80'
                }`}
              >
                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full" />
                <span className="text-[8px] font-black uppercase tracking-tight text-on-surface truncate w-full text-center">{player.name}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderWaiting = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md w-full p-8 bg-surface-container-high rounded-[2.5rem] border-2 border-primary/20 shadow-2xl text-center space-y-8"
    >
      <div className="space-y-4">
        <div className="relative inline-block">
          <Timer size={80} className="text-primary mx-auto animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Star size={32} className="text-on-primary-fixed animate-spin" />
          </div>
        </div>
        <h2 className="font-headline text-3xl font-black uppercase tracking-tighter text-on-surface">Partida en Curso</h2>
        <p className="text-on-surface-variant font-body">
          ¡Llegaste justo a tiempo para el desmadre! Pero espera un toque, la partida ya arrancó.
        </p>
      </div>

      <div className="bg-surface-container-highest p-6 rounded-3xl border border-outline-variant/30">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Estado:</p>
        <p className="font-headline font-black text-xl text-on-surface uppercase">ESTOY LISTO (ESPERANDO)</p>
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        Entrarás automáticamente en la siguiente ronda.
      </p>

      <button 
        onClick={goHome}
        className="w-full py-4 bg-surface-container-low text-on-surface font-headline font-bold text-lg rounded-2xl border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
      >
        VOLVER AL INICIO
      </button>
    </motion.div>
  );

  const renderResults = () => {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full p-6 sm:p-8 bg-surface-container-high rounded-[2rem] sm:rounded-[3rem] border-4 border-primary/30 shadow-[0_0_80px_rgba(255,137,171,0.2)] text-center space-y-6 sm:space-y-10"
      >
        <div className="space-y-4">
          <Trophy size={64} className="text-tertiary mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
          <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-on-surface">Puntuaciones Finales</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {sortedPlayers.map((player, index) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              key={player.id}
              className={`flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 ${
                index === 0 ? 'bg-tertiary/10 border-tertiary' : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="font-headline font-black text-xl sm:text-3xl text-on-surface-variant w-6 sm:w-8">{index + 1}</span>
                <img src={player.avatar} alt={player.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-primary/20" />
                <span className="font-headline font-black text-lg sm:text-2xl text-on-surface uppercase truncate max-w-[100px] sm:max-w-none">{player.name}</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-black text-2xl sm:text-3xl text-primary">{player.score}</span>
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Puntos</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={continueWithPoints}
            className="w-full py-5 bg-tertiary text-on-tertiary-fixed font-headline font-black text-xl sm:text-2xl rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            CONTINUAR CON PUNTOS 🏆
          </button>
          <button 
            onClick={restartGame}
            className="w-full py-5 bg-primary text-on-primary-fixed font-headline font-black text-xl sm:text-2xl rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            NUEVA PARTIDA (RESET) 🔥
          </button>
          <button 
            onClick={goHome}
            className="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-lg rounded-2xl border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
          >
            SALIR AL INICIO
          </button>
        </div>
      </motion.div>
    );
  };

  const isWaiting = gameState.status === 'GAME' && myPlayer && !myPlayer.isReady;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-on-surface font-body selection:bg-primary/30 overflow-x-hidden">
      <Toaster position="top-right" richColors closeButton />
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-full h-full neon-glow-pink animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full neon-glow-cyan animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 h-16 bg-[#0e0e0e]/80 backdrop-blur-xl shadow-[0_0_20px_rgba(255,137,171,0.15)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
          <Gamepad2 className="text-[#ff89ab]" size={20} sm:size={24} />
          <h1 className="text-lg sm:text-xl font-black italic text-[#ff89ab] drop-shadow-[0_0_10px_rgba(255,137,171,0.5)] font-headline tracking-tighter uppercase">
            Holis Game
          </h1>
        </div>
        
        {myPlayer && (
          <div className="relative">
            <button 
              onClick={() => setShowPlayersList(!showPlayersList)}
              className="flex items-center bg-surface-container-highest px-4 py-2 rounded-full gap-3 border border-primary/20 hover:bg-surface-bright transition-all"
            >
              <div className="relative">
                <img src={myPlayer.avatar} alt={myPlayer.name} className="w-6 h-6 rounded-full" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-tertiary rounded-full border-2 border-[#0e0e0e]"></div>
              </div>
              <span className="text-on-surface font-label text-sm font-bold truncate max-w-[100px]">{myPlayer.name}</span>
              <Users size={14} className="text-on-surface-variant" />
            </button>

            <AnimatePresence>
              {showPlayersList && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                >
                  <div className="p-4 border-b border-outline-variant/20 bg-surface-container-highest">
                    <h4 className="font-headline text-xs font-black uppercase tracking-widest text-primary">La Banda Conectada</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                    {gameState.players.map((player: any) => (
                      <div key={player.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-variant/50 transition-colors">
                        <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full border border-outline-variant" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-bold text-sm text-on-surface truncate">
                            {player.name} {player.id === userId && <span className="text-[10px] text-primary">(Tú)</span>}
                          </p>
                          <p className="text-[10px] text-on-surface-variant uppercase font-black">En la sala</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full min-h-screen flex items-center justify-center pt-20">
        <AnimatePresence mode="wait">
          {showRoundAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0e0e0e]/90 backdrop-blur-2xl"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Star size={120} className="text-secondary mx-auto drop-shadow-[0_0_30px_rgba(137,255,171,0.6)]" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="font-headline text-6xl sm:text-8xl font-black uppercase tracking-tighter text-secondary italic">
                    RONDA {showRoundAnimation}
                  </h2>
                  <p className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-widest text-on-surface">
                    {showRoundAnimation === 1 ? 'Descripción' : 
                     showRoundAnimation === 2 ? 'Una Palabra' : 
                     'Mímica'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!selectedNickname || gameState.status === 'HOME' ? (
            renderHome()
          ) : (
            <>
              {gameState.status === 'LOBBY' && renderLobby()}
              {gameState.status === 'GAME' && renderGame()}
              {gameState.status === 'RESULTS' && renderResults()}
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
