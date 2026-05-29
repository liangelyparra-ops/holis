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

const INITIAL_GAME_ID = getRoomId();

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
  const [roomId, setRoomId] = useState<string>(INITIAL_GAME_ID);
  // Shadow the global GAME_ID so that all inside functions refer to our reactive roomId state!
  const GAME_ID = roomId;

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
  const lastPlayedSoundRef = useRef<string | null>(null);

  // Portfolio Navigation & Contact Form State
  const [activeTab, setActiveTab] = useState<'IMPACT' | 'PROCESS' | 'VISION' | 'GAMES' | 'CONTACT'>('IMPACT');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Consultoría UX');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error("Por favor completa todos los campos requeridos.", { duration: 3000 });
      return;
    }
    setContactSubmitting(true);
    try {
      const submissionId = `submission-${Date.now()}`;
      await setDoc(doc(db, 'contacts', submissionId), {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
        createdAt: new Date().toISOString()
      });
      setContactSubmitted(true);
      toast.success("¡Mensaje enviado con éxito! ✉️", {
        description: "Lia responderá a tu solicitud de inmediato.",
        duration: 4000
      });
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar el mensaje. Por favor intenta de nuevo.");
    } finally {
      setContactSubmitting(false);
    }
  };
  
  const playSound = (url: string) => {
    console.log(`[Sound] Attempting to play: ${url}`);
    const audio = new Audio(url);
    audio.volume = 0.8;
    
    // Preload to improve start time
    audio.preload = 'auto';
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("[Sound] Playback failed/blocked:", error);
      });
    }
  };

  const SOUNDS = {
    JOIN: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    START: 'https://raw.githubusercontent.com/liangely/holis-game/main/estan-listos-chicos.mp3',
    VOTE: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    WIN: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    TICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    NEXT_CARD: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    ROUND_START: 'https://raw.githubusercontent.com/liangely/holis-game/main/estan-listos-chicos.mp3',
    TIMEOUT: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
    NEXT: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
    FINISH: 'https://assets.mixkit.co/active_storage/sfx/1433/1433-preview.mp3',
  };
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Consolidated Sound Manager
  useEffect(() => {
    if (gameState.status === 'GAME') {
      if (gameState.currentCardIndex === 0) {
        // Start of game or round
        const playKey = `start-${gameState.currentRound || 1}`;
        if (lastPlayedSoundRef.current !== playKey) {
          // Small delay to ensure state is settled and UI has transitioned
          const timer = setTimeout(() => {
            console.log("[Sound] Triggering START sound now...");
            playSound(SOUNDS.START);
          }, 500);
          lastPlayedSoundRef.current = playKey;
          return () => clearTimeout(timer);
        }
      } else {
        // Card change
        const playKey = `card-${gameState.currentCardIndex}`;
        if (lastPlayedSoundRef.current !== playKey) {
          console.log(`[Sound] Triggering NEXT sound for card ${gameState.currentCardIndex}...`);
          playSound(SOUNDS.NEXT);
          lastPlayedSoundRef.current = playKey;
        }
      }
    } else if (gameState.status === 'RESULTS') {
      const playKey = 'results';
      if (lastPlayedSoundRef.current !== playKey) {
        console.log("[Sound] Triggering FINISH sound...");
        playSound(SOUNDS.FINISH);
        lastPlayedSoundRef.current = playKey;
      }
    } else {
      // Reset when back to HOME or LOBBY
      lastPlayedSoundRef.current = null;
    }
  }, [gameState.status, gameState.currentCardIndex, gameState.currentRound]);

  // Show winner notification to everyone
  useEffect(() => {
    if (gameState.isShowingWinner && gameState.lastWinnerName) {
      if (gameState.lastWinnerId === 'none') {
        toast.error("Nadie adivinó... ❌", {
          description: "¡A la próxima!",
          duration: 1500,
        });
      } else {
        toast.success(`¡Punto para ${gameState.lastWinnerName}! 🏆`, {
          description: "+10 puntos",
          duration: 1500,
        });
        playSound(SOUNDS.WIN);
      }
    }
  }, [gameState.isShowingWinner, gameState.lastWinnerName, gameState.lastWinnerId]);

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
  }, [isConnected, userId, roomId]);

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

  // Round Animation Logic (Visual only, sound handled by manager)
  useEffect(() => {
    if (gameState.status === 'GAME' && gameState.mode === 'PAPELITO' && gameState.currentRound) {
      setShowRoundAnimation(gameState.currentRound);
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
    
    // Unlock audio on user interaction
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    silentAudio.play().catch(() => {});

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

    // Wait for 1 second to let everyone see the notification
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    // Dynamic smooth URL change without breaking iframe sandbox origins or reloading
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${newRoomId}`;
    try {
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (e) {
      console.warn("Iframe history push restricted, relying on local state transition");
    }
    setRoomId(newRoomId);
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full p-8 text-center"
    >
      <div className="max-w-md mx-auto space-y-6 sm:space-y-8 bg-surface-container-high p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border-2 border-primary/20 shadow-2xl">
        <div className="space-y-4">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-primary ml-4">Your Nickname / Name</label>
          <input 
            type="text" 
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            placeholder="e.g. Party King"
            className="w-full bg-surface-container-highest border-2 border-outline-variant/30 rounded-2xl p-4 font-headline font-black uppercase text-on-surface focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-primary ml-4">Choose your Avatar</label>
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
            <span>ENTER ROOM</span>
            <ChevronRight />
          </button>
        ) : (
          <button 
            onClick={createPrivateRoom}
            className="w-full py-4 sm:py-6 bg-primary text-on-primary-fixed font-headline font-black text-xl sm:text-2xl uppercase tracking-tighter rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,137,171,0.4)] active:scale-95 flex items-center justify-center gap-3 transition-all"
          >
            <Users size={24} />
            CREATE PRIVATE ROOM
          </button>
        )}

        <div className="pt-6 border-t border-outline-variant/20 space-y-4">
          {GAME_ID !== 'global-party' && (
            <button 
              onClick={createPrivateRoom}
              className="w-full bg-surface-container-highest text-on-surface font-headline font-bold py-3 sm:py-4 text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
            >
              <Users size={20} />
              CREATE ANOTHER ROOM
            </button>
          )}
          
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-variant/30 rounded-full w-fit mx-auto">
            <div className={`w-2 h-2 rounded-full ${GAME_ID === 'global-party' ? 'bg-tertiary' : 'bg-primary animate-pulse'}`}></div>
            <span className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest">
              {GAME_ID === 'global-party' ? 'NO ROOM SELECTED' : `ROOM: ${GAME_ID}`}
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
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Waiting for Players</span>
            <button 
              onClick={resetGame}
              className="p-1 hover:bg-primary/20 rounded-full transition-all text-primary"
              title="Reset Room"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Game Mode</h3>
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
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-secondary">Papelito Settings</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toast.info("Papelito: 3 Rounds. 1: Free Description, 2: Single Word, 3: Charades / Mimicry.")}
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
                    <p className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant">Theme</p>
                    <div className="flex gap-1">
                      {['free', 'custom'].map(t => (
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
                      placeholder="Write the round theme..."
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[10px] text-on-surface focus:border-secondary outline-none transition-all"
                    />
                  </motion.div>
                )}

                <div className="pt-3 border-t border-outline-variant/20">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-secondary mb-2">Your Phrase ({myPlayer?.papelitos?.length || 0} / {gameState.papelitosPerPlayer || 1})</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={papelitoInput}
                      onChange={(e) => setPapelitoInput(e.target.value)}
                      placeholder={gameState.papelitoTheme === 'free' ? "Write a phrase..." : `Theme: ${gameState.papelitoCustomTheme || '...'}...`}
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
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Holis Deck</h3>
                  <Flame size={14} className="text-primary/50" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-body">Pre-loaded deck with the best Holis Game challenges.</p>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Deck Ready 🔥</span>
                </div>
              </div>
            )}

            {gameState.mode === 'PRIMOS' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-tertiary/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-tertiary">Primos Deck</h3>
                  <Users size={14} className="text-tertiary/50" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-body">Pre-loaded deck with family jokes and customized challenges.</p>
                <div className="p-4 bg-tertiary/5 rounded-2xl border border-tertiary/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">Deck Ready 🔥</span>
                </div>
              </div>
            )}

            {gameState.mode === 'WHATSAPP' && (
              <div className="bg-surface-container-high p-6 rounded-[2rem] border-2 border-error/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-error">WhatsApp Deck (AI)</h3>
                  <Upload size={14} className="text-error/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-on-surface font-black uppercase tracking-widest">How it works?</p>
                  <ol className="text-[9px] text-on-surface-variant font-body list-decimal list-inside space-y-1">
                    <li>Go to your WhatsApp group</li>
                    <li>Settings {'>'} Export chat (without media)</li>
                    <li>Upload the .txt Chat file here</li>
                    <li>We generate custom challenges from your jokes!</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-container-highest rounded-2xl border-2 border-dashed border-outline-variant/50 text-on-surface-variant hover:border-error hover:text-error transition-all disabled:opacity-50"
                  >
                    {isUploading ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" /> : <Upload size={18} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? 'Generating...' : 'Upload Chat (.txt)'}</span>
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
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Players ({gameState.players.length})</h3>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                {gameState.players.map((player) => (
                  <div key={player.id} className="flex flex-col items-center gap-1.5">
                    <div className="relative w-full">
                      <img src={player.avatar} alt={player.name} className={`w-full aspect-square rounded-2xl border-2 transition-all ${player.isReady ? 'border-primary shadow-[0_0_10px_rgba(255,137,171,0.3)]' : 'border-outline-variant/30 opacity-50'}`} />
                      {player.isReady && (
                        <div className="absolute -top-1 -right-1 bg-primary text-on-primary-fixed p-1 rounded-full shadow-lg">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-on-surface text-center truncate w-full px-0.5">
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {gameState.players.length < 3 && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle size={20} className="text-error shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest text-error leading-tight">
                  You need at least 3 players to start the game.
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
              {myPlayer?.isReady ? 'YOU ARE READY! 🔥' : 'I AM READY'}
            </button>
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {gameState.readyCount} / {gameState.players.length} players ready
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
                  {gameState.currentRound === 1 ? 'Round 1: Description' : 
                   gameState.currentRound === 2 ? 'Round 2: One Word' : 
                   'Round 3: Mimicry'}
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
              <span className="text-[10px] font-black uppercase tracking-widest">YOUR TURN!</span>
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
                      {currentCard.category === 'ACTING' || currentCard.category === 'ACTUAR' ? 'Act out the situation without speaking. Your friends must guess!' :
                       currentCard.category === 'WHO SAID THIS' || currentCard.category === 'WHO_SAID' || currentCard.category === 'QUIÉN DIJO ESTO' ? 'Who said this iconic quote? The group votes for the culprit.' :
                       currentCard.category === 'EXPOSE' ? 'Moment of truth. Answer with absolute honesty or drink.' :
                       currentCard.category === 'WHO IS MOST LIKELY' ? 'Vote on who is most likely to do this.' :
                       currentCard.category === 'TABÚ' || currentCard.category === 'TABU' ? 'Describe the word without using the forbidden words.' :
                       currentCard.category === 'TRUTH OR BOMB' ? 'Answer the question or explode (group punishment).' :
                       currentCard.category === 'PAPELITO' ? (
                         gameState.currentRound === 1 ? 'Round 1: Describe the paper slip using as many words as you want (without saying what is written).' :
                         gameState.currentRound === 2 ? 'Round 2: You can only say ONE word for the guess.' :
                         'Round 3: You can only do mimicry. Shhh! No talking allowed.'
                       ) :
                       'Follow the card instructions to win points.'}
                    </p>
                  </div>
                </div>
                <p className="font-headline text-xl sm:text-3xl md:text-4xl font-black text-on-surface leading-tight tracking-tighter italic">
                  "{currentCard.content}"
                </p>
                {currentCard.category === 'QUIÉN DIJO ESTO' && currentCard.answer && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Said by:</p>
                    <p className="text-xl font-headline font-black text-on-surface">
                      {currentCard.answer}
                    </p>
                  </div>
                )}
                {currentCard.category === 'ACTUAR' && currentCard.context && (
                  <div className="mt-2 p-2 bg-surface-container-highest border border-outline-variant/30 rounded-xl max-w-xs mx-auto">
                    <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">How to act:</p>
                    <p className="text-[10px] text-on-surface leading-tight font-body">
                      {currentCard.context}
                    </p>
                  </div>
                )}
                {currentCard.tabooWords && (
                  <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded-xl">
                    <p className="text-[8px] font-black uppercase tracking-widest text-error mb-1">Forbidden Words:</p>
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
                <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-on-surface">GUESS!</h2>
                <p className="text-on-surface-variant font-body uppercase tracking-widest text-[10px] font-black">
                  Pay attention to <span className="text-primary">{currentTurnPlayer?.name}</span>
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
                  <h2 className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-widest text-primary">Round Winner!</h2>
                  <p className="font-headline text-5xl sm:text-7xl font-black text-on-surface uppercase tracking-tighter italic">
                    {gameState.lastWinnerName || 'Nobody!'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-on-surface-variant font-black uppercase tracking-widest text-xs">
                  <Star size={16} className="text-primary" />
                  <span>+10 POINTS</span>
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
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Turn of:</p>
                <p className="font-headline font-black text-xl text-on-surface uppercase">{currentTurnPlayer?.name}</p>
              </div>
            </div>
            {isMyTurn && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">IT'S YOUR TURN! DON'T SHOW YOUR SCREEN</span>
                </div>
                <button
                  onClick={() => voteWinner('')}
                  disabled={gameState.isShowingWinner}
                  className="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-full border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest hover:bg-error/10 hover:text-error hover:border-error/30 transition-all disabled:opacity-50"
                >
                  Nobody Guessed ❌
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
        <h2 className="font-headline text-3xl font-black uppercase tracking-tighter text-on-surface">Game in Progress</h2>
        <p className="text-on-surface-variant font-body">
          You arrived just in time for the fun! However, the match has already started.
        </p>
      </div>

      <div className="bg-surface-container-highest p-6 rounded-3xl border border-outline-variant/30">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Status:</p>
        <p className="font-headline font-black text-xl text-on-surface uppercase">I AM READY (WAITING)</p>
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        You will automatically enter on the next round.
      </p>

      <button 
        onClick={goHome}
        className="w-full py-4 bg-surface-container-low text-on-surface font-headline font-bold text-lg rounded-2xl border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
      >
        BACK TO HOME
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
          <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-on-surface">Final Scores</h2>
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
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Points</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={continueWithPoints}
            className="w-full py-5 bg-tertiary text-on-tertiary-fixed font-headline font-black text-xl sm:text-2xl rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            CONTINUE WITH POINTS 🏆
          </button>
          <button 
            onClick={restartGame}
            className="w-full py-5 bg-primary text-on-primary-fixed font-headline font-black text-xl sm:text-2xl rounded-2xl sm:rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            NEW GAME (RESET) 🔥
          </button>
          <button 
            onClick={goHome}
            className="w-full py-4 bg-surface-container-high text-on-surface font-headline font-bold text-lg rounded-2xl border-2 border-outline-variant/30 hover:bg-surface-bright transition-all"
          >
            EXIT TO LOBBY
          </button>
        </div>
      </motion.div>
    );
  };

  const [selectedProcessStep, setSelectedProcessStep] = useState(0);
  const [expandedProject, setExpandedProject] = useState<'none' | 'illow_start' | 'illow_evolution' | 'bigid_cookie' | 'bojana'>('none');

  const renderImpact = () => {
    return (
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 space-y-20 py-12 text-left">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="font-sans font-semibold text-xs text-outline tracking-[0.25em] uppercase block">
            Case Studies
          </span>
          <h2 className="font-headline text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-tighter">
            User Experience <br />As a Growth Engine
          </h2>
          <p className="font-sans text-base sm:text-lg text-neutral-500 max-w-2xl leading-relaxed">
            A curated portfolio matching strategic visual narratives to empirical outcomes. Every design decision serves to translate complex technical workflows into frictionless business assets.
          </p>
        </div>

        {/* Featured Case Studies Grid (Apple-style Bento Minimalist Grid) */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Case 1: Illow from the Beginning */}
          <motion.article 
            layout="position"
            className={`custom-glass border rounded-[2rem] p-6 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:shadow-xl ${
              expandedProject === 'illow_start' 
                ? 'md:col-span-2 border-neutral-900 shadow-2xl bg-white ring-1 ring-neutral-950/5' 
                : 'md:col-span-1 border-neutral-200/40 hover:border-neutral-900/10 hover:bg-white'
            }`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="bg-neutral-100 text-neutral-800 px-3 py-1 font-sans text-[10px] font-bold tracking-wider uppercase rounded-full">
                  UX Strategy • Brand Origin
                </span>
                <span className="material-symbols-outlined text-neutral-400">rocket_launch</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  Illow from the Beginning
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  <strong>Challenge:</strong> Designing the initial brand identity, visual systems, high-converting checkout funnels, and initial UX wireframes for an early-stage privacy tech startup from zero to one.
                </p>
              </div>

              {/* Inline Expanded Deep-dive Content */}
              {expandedProject === 'illow_start' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6 mt-6 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-neutral-800"
                >
                  <div className="space-y-4">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">The Startup Spark</p>
                    <p>
                      Lia designed the startup's brand DNA, choosing color tokens, typography systems, and web architecture to resonate with developers and compliance officers alike. By controlling the complete zero-to-one design pipeline, she framed privacy compliance as a beautiful interactive asset.
                    </p>
                    <p>
                      This aesthetic control laid a profound groundwork, allowing her to establish the company's internal UX department comfortably before scaling processes.
                    </p>
                  </div>
                  <div className="space-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">Methodology & Launch Actions</p>
                    <ul className="space-y-2 list-disc pl-4 text-xs text-neutral-600">
                      <li>Designed high-converting interactive landing pages for developer signups.</li>
                      <li>Built user experience blueprints for the original modal cookie sliders to maximize consent collection.</li>
                      <li>Attracted capital and early-stage trials by presenting interactive clickable high-contrast prototypes representing a mature product.</li>
                    </ul>
                    <div className="bg-black text-white p-4 rounded-xl font-headline font-black text-xs text-center uppercase tracking-widest mt-4">
                      Zero-To-One Blueprint • Cohesive Privacy Identity
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-8 space-y-4 font-sans">
              {expandedProject !== 'illow_start' && (
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 italic text-xs text-neutral-600">
                  <strong>Impact:</strong> Secured early market traction under a cohesive product aesthetic, with the visual identity and user interface driving robust early-stage signups.
                </div>
              )}
              <button
                onClick={() => setExpandedProject(expandedProject === 'illow_start' ? 'none' : 'illow_start')}
                className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {expandedProject === 'illow_start' ? 'Close case details' : 'Explore Case Study'}
                <span className="material-symbols-outlined text-xs">
                  {expandedProject === 'illow_start' ? 'expand_less' : 'east'}
                </span>
              </button>
            </div>
          </motion.article>
          
          {/* Case 2: Illow to BIGID Evolution */}
          <motion.article 
            layout="position"
            className={`custom-glass border rounded-[2rem] p-6 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:shadow-xl ${
              expandedProject === 'illow_evolution' 
                ? 'md:col-span-2 border-neutral-900 shadow-2xl bg-white ring-1 ring-neutral-950/5' 
                : 'md:col-span-1 border-neutral-200/40 hover:border-neutral-900/10 hover:bg-white'
            }`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="bg-neutral-100 text-neutral-800 px-3 py-1 font-sans text-[10px] font-bold tracking-wider uppercase rounded-full">
                  Design Systems • M&A Integration
                </span>
                <span className="material-symbols-outlined text-neutral-400">trending_up</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  Illow to BIGID Evolution
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  <strong>Challenge:</strong> Leading the branding, visual system, and user experience strategy from early-stage startup through its eventual, high-profile acquisition by enterprise titan BigID.
                </p>
              </div>

              {/* Inline Expanded Deep-dive Content */}
              {expandedProject === 'illow_evolution' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6 mt-6 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-neutral-800"
                >
                  <div className="space-y-4">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">Acquisition & Enterprise Scale</p>
                    <p>
                      Ensuring brand consistency through corporate transitions is a severe friction risk. Lia led the transition from Illow's lightweight visual language to BigID's global compliance system, structuring UX patterns to support massive algorithmic volume without losing sensory clarity.
                    </p>
                    <p>
                      This absolute control over aesthetics laid a profound groundwork, allowing her to comfortably establish the company's internal UX department from the ground up prior to acquisition.
                    </p>
                  </div>
                  <div className="space-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">Methodology & Adaptations</p>
                    <ul className="space-y-2 list-disc pl-4 text-xs text-neutral-600">
                      <li>Developed a streamlined Design System (UI Kit) translating marketing brand elements into reusable component code.</li>
                      <li>Reduced engineering visual debt by 40%, aligning product development with marketing brand consistency.</li>
                      <li>Redesigned complex data-consent tables and user dashboards for BigID's global compliance standards post-acquisition.</li>
                    </ul>
                    <div className="bg-black text-white p-4 rounded-xl font-headline font-black text-xs text-center uppercase tracking-widest mt-4">
                      Acquisition Catalyst • 10x Data Processing Volume Ready
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-8 space-y-4 font-sans">
              {expandedProject !== 'illow_evolution' && (
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 italic text-xs text-neutral-600">
                  <strong>Impact:</strong> Unified the marketing and product workflows under a robust design system, allowing seamless enterprise transition to process 10x more data.
                </div>
              )}
              <button
                onClick={() => setExpandedProject(expandedProject === 'illow_evolution' ? 'none' : 'illow_evolution')}
                className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {expandedProject === 'illow_evolution' ? 'Close case details' : 'Explore Case Study'}
                <span className="material-symbols-outlined text-xs">
                  {expandedProject === 'illow_evolution' ? 'expand_less' : 'east'}
                </span>
              </button>
            </div>
          </motion.article>
          
          {/* Case 3: BigID Cookie Classification */}
          <motion.article 
            layout="position"
            className={`custom-glass border rounded-[2rem] p-6 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:shadow-xl ${
              expandedProject === 'bigid_cookie' 
                ? 'md:col-span-2 border-neutral-900 shadow-2xl bg-white ring-1 ring-neutral-950/5' 
                : 'md:col-span-1 border-neutral-200/40 hover:border-neutral-900/10 hover:bg-white'
            }`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="bg-neutral-100 text-neutral-800 px-3 py-1 font-sans text-[10px] font-bold tracking-wider uppercase rounded-full">
                  Information Architecture • Data Scale
                </span>
                <span className="material-symbols-outlined text-neutral-400">grid_view</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  BigID Cookie Classification
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  <strong>Challenge:</strong> Streamlining nested compliance tabs, massive cookies datasets, and classification settings schemas containing heavily dense enterprise governance logic arrays into frictionless interactive interfaces.
                </p>
              </div>

              {/* Inline Expanded Deep-dive Content */}
              {expandedProject === 'bigid_cookie' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6 mt-6 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-neutral-800"
                >
                  <div className="space-y-4">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">Overcoming Density Fatigue</p>
                    <p>
                      Enterprise compliance auditors face huge cognitive overload when cataloging raw tracking cookies. By grouping massive cookie lists into logical categories and clean grids, the raw configurations became digestible and highly actionable.
                    </p>
                    <p>
                      This re-architecture stripped away secondary visual noise, resulting in a clean grid system designed after strict interactive Fitts's and Hick's Laws.
                    </p>
                  </div>
                  <div className="space-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">Auditing & Control Milestones</p>
                    <ul className="space-y-2 list-disc pl-4 text-xs text-neutral-600">
                      <li>Designed clear classification and tagging status indicators for corporate tracking data blocks.</li>
                      <li>Built easy pagination, smart quick-filtering, and drag-and-drop bucket systems.</li>
                      <li>Successfully decreased auditor page travel durations and human identification errors.</li>
                    </ul>
                    <div className="bg-black text-white p-4 rounded-xl font-headline font-black text-xs text-center uppercase tracking-widest mt-4">
                      45% Task Navigation Speed Increase
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-8 space-y-4 font-sans">
              {expandedProject !== 'bigid_cookie' && (
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 italic text-xs text-neutral-600">
                  <strong>Impact:</strong> Decreased overall system task navigation durations by 45% through strict layout alignment and non-fatiguing data hierarchies.
                </div>
              )}
              <button
                onClick={() => setExpandedProject(expandedProject === 'bigid_cookie' ? 'none' : 'bigid_cookie')}
                className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {expandedProject === 'bigid_cookie' ? 'Close case details' : 'Explore Case Study'}
                <span className="material-symbols-outlined text-xs">
                  {expandedProject === 'bigid_cookie' ? 'expand_less' : 'east'}
                </span>
              </button>
            </div>
          </motion.article>
          
          {/* Case 4: Bojana Estudio Redesign */}
          <motion.article 
            layout="position"
            className={`custom-glass border rounded-[2rem] p-6 sm:p-10 flex flex-col justify-between transition-all duration-500 hover:shadow-xl ${
              expandedProject === 'bojana' 
                ? 'md:col-span-2 border-neutral-900 shadow-2xl bg-white ring-1 ring-neutral-950/5' 
                : 'md:col-span-1 border-neutral-200/40 hover:border-neutral-900/10 hover:bg-white'
            }`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="bg-neutral-100 text-neutral-800 px-3 py-1 font-sans text-[10px] font-bold tracking-wider uppercase rounded-full">
                  Luxury Branding • Portfolio Architecture
                </span>
                <span className="material-symbols-outlined text-neutral-400">palette</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                  Bojana Estudio Redesign
                </h3>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  <strong>Challenge:</strong> Directing the physical-to-digital high-end storefront, structural visual grid architecture, and luxury branding framework for a premium architectural studio.
                </p>
              </div>

              {/* Inline Expanded Deep-dive Content */}
              {expandedProject === 'bojana' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-6 mt-6 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-neutral-800"
                >
                  <div className="space-y-4">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">Digitalizing Physical Craft</p>
                    <p>
                      Architecture is about the dialogue of empty spaces, materials, and light. Lia designed the studio's digital storefront as an extension of their buildings—crafted around extensive empty margins, stunning high-contrast typography, and seamless transitions.
                    </p>
                    <p>
                      The minimal interface preserves and amplifies the high-value physical catalog, transforming digital viewers into design consult clients.
                    </p>
                  </div>
                  <div className="space-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100">
                    <p className="font-bold text-neutral-900 text-xs tracking-wider uppercase font-sans">Spatial Interactive Elements</p>
                    <ul className="space-y-2 list-disc pl-4 text-xs text-neutral-600">
                      <li>Designed an editorial masonry grid aligning blueprints and photographs symmetrically.</li>
                      <li>Paired high-impact display fonts with Fira Code for technical metric captions.</li>
                      <li>Optimized high-resolution graphic rendering for immediate loading without visual stutter.</li>
                    </ul>
                    <div className="bg-black text-white p-4 rounded-xl font-headline font-black text-xs text-center uppercase tracking-widest mt-4">
                      Luxury Preservation • 50% High-Ticket Lead Surge
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="mt-8 space-y-4 font-sans">
              {expandedProject !== 'bojana' && (
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 italic text-xs text-neutral-600">
                  <strong>Impact:</strong> Generated a 50% increase in qualified inquiries by framing structural portfolios inside an eye-catching luxury museum aesthetic.
                </div>
              )}
              <button
                onClick={() => setExpandedProject(expandedProject === 'bojana' ? 'none' : 'bojana')}
                className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {expandedProject === 'bojana' ? 'Close case details' : 'Explore Case Study'}
                <span className="material-symbols-outlined text-xs">
                  {expandedProject === 'bojana' ? 'expand_less' : 'east'}
                </span>
              </button>
            </div>
          </motion.article>

        </motion.div>



        {/* Flagship Technical Showcase Element: Holis Game Suite */}
        <div className="custom-glass border border-neutral-200/40 rounded-[2.5rem] p-6 sm:p-12 space-y-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="bg-primary/5 border border-primary/25 text-primary px-3 py-1 font-sans text-[10px] font-extrabold uppercase tracking-widest rounded-full w-fit block">
                Technical Mastery Showcase
              </span>
              <h3 className="font-headline text-2xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Flagship Project: Holis Social Party Game Suite
              </h3>
              <p className="font-sans text-sm sm:text-base text-neutral-500 leading-relaxed max-w-xl">
                An immersive, real-time multiplayer application designed as a rigorous demonstration of interactive system design. Showcases low-latency state synchronizations and multimodal audio feedback loops.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider text-neutral-600">
                <span className="bg-neutral-100 px-3 py-1 rounded-full">Firebase Firestore</span>
                <span className="bg-neutral-100 px-3 py-1 rounded-full">Web Audio API</span>
                <span className="bg-neutral-100 px-3 py-1 rounded-full">State Machine Orchestration</span>
              </div>
            </div>
            
            <div className="lg:col-span-4 flex flex-col justify-center h-full">
              <button
                onClick={() => {
                  setActiveTab('GAMES');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-5 px-8 bg-black hover:bg-neutral-800 text-white font-sans text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-3"
              >
                Launch Live Game Experience Test
                <span className="material-symbols-outlined text-sm">sports_esports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Business Analytics Milestones Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 border-y border-neutral-200/45">
          <div className="text-center space-y-1">
            <div className="font-headline text-5xl sm:text-6xl font-black text-neutral-900 tracking-tight">10x</div>
            <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Data Pipeline Scale Capability (BigID)
            </div>
          </div>
          <div className="text-center border-y md:border-y-0 md:border-x border-neutral-200/45 py-6 md:py-0 space-y-1">
            <div className="font-headline text-5xl sm:text-6xl font-black text-neutral-900 tracking-tight">40%</div>
            <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Visual Debt Reduction (Illow Design System)
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="font-headline text-5xl sm:text-6xl font-black text-neutral-900 tracking-tight">45%</div>
            <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Navigation Velocity Gain
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVision = () => {
    const steps = [
      {
        title: "Discover",
        icon: "search",
        sub: "Research & Audit",
        desc: "Immersion into corporate environments, behavioral log studies, empathy mappings, and stakeholder interviews to explicitly catalog inefficiencies."
      },
      {
        title: "Define",
        icon: "fact_check",
        sub: "Taxonomy & Flow",
        desc: "Constructing system information hierarchies, drafting interactive logic wires, and modeling user states to alleviate friction bottlenecks."
      },
      {
        title: "Design",
        icon: "palette",
        sub: "Hi-Fi & Sound Systems",
        desc: "Assembling beautiful high-contrast wireframes coupled with micro-animations, layout motions, and auditory confirmations that elevate task completion rates."
      },
      {
        title: "Deliver",
        icon: "terminal",
        sub: "Rigorous Dev Handoff",
        desc: "Partnering strictly with front-end engineers, packaging structured design tokens, writing code audit parameters, and verifying smooth production-ready rendering."
      }
    ];

    return (
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 space-y-24 py-12 text-left">
        {/* Main Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="font-sans font-semibold text-xs text-outline tracking-[0.25em] uppercase block">
            My Vision
          </span>
          <h2 className="font-headline text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-tighter">
            Methodology Meets <br />Philosophy
          </h2>
          <p className="font-sans text-base sm:text-lg text-neutral-500 max-w-2xl leading-relaxed">
            Beautiful visual systems without actual high-stakes utility represents raw luxury noise. Designing with craft is about reducing the obscure frictional thresholds of sophisticated everyday systems.
          </p>
        </div>

        {/* 1. Core Methodology Section */}
        <div className="space-y-10 border-t border-neutral-100 pt-12">
          <div className="space-y-2">
            <span className="font-sans text-[10px] font-black uppercase tracking-widest text-[#ff89ab] bg-[#ff89ab]/10 px-3 py-1 rounded-full w-fit block">
              01 • Core Methodology
            </span>
            <h3 className="font-headline text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              The Double-Diamond Cycle
            </h3>
            <p className="font-sans text-sm text-neutral-500 max-w-xl leading-relaxed">
              Every product journey is subjected to rigorous, repeatable iterative feedback loops. Visual quality is measured directly against core performance parameters.
            </p>
          </div>

          {/* Unified Progress Timeline Stepper */}
          <div className="relative py-4">
            {/* Timeline background connectors */}
            <div className="absolute top-[36px] left-[6%] right-[6%] h-[2px] bg-neutral-150 hidden md:block z-0" />
            <div 
              className="absolute top-[36px] left-[6%] h-[2px] bg-black hidden md:block transition-all duration-500 z-0" 
              style={{ width: `${(selectedProcessStep / 3) * 88}%` }}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
              {steps.map((st, idx) => {
                const isSelected = selectedProcessStep === idx;
                const isCompleted = idx < selectedProcessStep;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedProcessStep(idx)}
                    id={`proc-step-${idx}`}
                    className="flex flex-row md:flex-col items-center gap-3 md:gap-2.5 text-left md:text-center focus:outline-none group"
                  >
                    {/* Stepper Dot & Icon Indicator */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${
                      isSelected 
                        ? 'bg-black text-white border-black ring-4 ring-neutral-100 shadow-sm scale-110' 
                        : isCompleted
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-400 border-neutral-200 group-hover:border-neutral-400 group-hover:text-neutral-700'
                    }`}>
                      <span className="material-symbols-outlined text-sm">
                        {isCompleted ? 'check' : st.icon}
                      </span>
                    </div>
                    
                    <div className="flex flex-col md:items-center min-w-0">
                      <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">
                        Step 0{idx + 1}
                      </span>
                      <span className={`font-headline text-sm font-extrabold truncate ${isSelected ? 'text-black' : 'text-neutral-600 group-hover:text-black'}`}>
                        {st.title}
                      </span>
                      <span className="hidden md:block font-sans text-[10px] text-neutral-400 truncate mt-0.5 max-w-[120px]">
                        {st.sub}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consolidated Active Stage Description */}
          <div className="bg-neutral-50/50 border border-neutral-200/40 p-6 md:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start custom-glass">
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[10px] font-bold tracking-wider uppercase rounded-full">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                Active Phase: {steps[selectedProcessStep].title}
              </div>
              <div className="space-y-2">
                <h4 className="font-headline text-lg sm:text-xl font-bold text-neutral-900 uppercase tracking-tight">
                  {steps[selectedProcessStep].sub}
                </h4>
                <p className="font-sans text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  {steps[selectedProcessStep].desc}
                </p>
              </div>
            </div>

            <div className="md:col-span-5 bg-white border border-neutral-150 p-5 rounded-2xl space-y-3 shadow-2xs">
              <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">
                Core Deliverables & Outcomes
              </span>
              <div className="font-sans text-xs font-semibold text-neutral-800 space-y-1.5">
                {selectedProcessStep === 0 && (
                  <>
                    <p>• Deep user/stakeholder logs analysis</p>
                    <p>• Current bottleneck friction map matrices</p>
                    <p>• Detailed customer travel map tracking</p>
                  </>
                )}
                {selectedProcessStep === 1 && (
                  <>
                    <p>• Wireframes & UX interaction flows</p>
                    <p>• Content taxonomy schemas & indexes</p>
                    <p>• Core logic path state outline tables</p>
                  </>
                )}
                {selectedProcessStep === 2 && (
                  <>
                    <p>• Fully responsive high-contrast layouts</p>
                    <p>• Dynamic interactive micro-interactions</p>
                    <p>• Standard Design System typography tokens</p>
                  </>
                )}
                {selectedProcessStep === 3 && (
                  <>
                    <p>• Coded design component tokens and JSONs</p>
                    <p>• Rigid dev visual quality checking parameters</p>
                    <p>• Interactive prototype specifications</p>
                  </>
                )}
              </div>
              <div className="bg-neutral-100 text-[9px] font-sans font-bold text-neutral-700 uppercase tracking-wider text-center py-2 rounded-lg">
                Validated & Handoff Standard Ready
              </div>
            </div>
          </div>
        </div>

        {/* 2. Design Philosophy Section */}
        <div className="space-y-10 border-t border-neutral-100 pt-12">
          <div className="space-y-2">
            <span className="font-sans text-[10px] font-black uppercase tracking-widest text-[#ff89ab] bg-[#ff89ab]/10 px-3 py-1 rounded-full w-fit block">
              02 • Design Philosophy
            </span>
            <h3 className="font-headline text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
              Empathy Over Vanity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            {/* Quote Panel */}
            <div className="bg-black text-white p-8 sm:p-12 rounded-[2.5rem] flex flex-col justify-between border border-neutral-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <span className="material-symbols-outlined text-4xl text-neutral-700 select-none">
                format_quote
              </span>
              <p className="font-sans text-lg sm:text-xl font-medium tracking-tight italic leading-relaxed my-8 text-neutral-200">
                "Interaction design is not static artwork; it is akin to melody. It requires pauses, purposeful accents, and visual hierarchy coordinates to effortlessly guide attention."
              </p>
              <div className="pt-6 border-t border-neutral-800 space-y-1">
                <p className="font-sans font-black uppercase text-xs tracking-widest text-[#ff89ab]">
                  Lia Parra
                </p>
                <p className="font-sans text-[10px] uppercase text-neutral-400">
                  Senior UX & Interaction Designer
                </p>
              </div>
            </div>

            {/* Pillars List */}
            <div className="space-y-8 flex flex-col justify-center">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined p-2.5 bg-neutral-100 rounded-2xl text-neutral-900">
                  architecture
                </span>
                <div className="space-y-1">
                  <h3 className="font-headline text-base font-bold text-neutral-900 tracking-tight">Functional Brutalism</h3>
                  <p className="font-sans text-sm text-neutral-500 leading-relaxed">
                    We eliminate excessive graphic clutter and redundancies to assert focus on the strategic primary interactions of your digital ecosystem.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined p-2.5 bg-[#ff89ab]/10 text-[#ff89ab] rounded-2xl">
                  volume_up
                </span>
                <div className="space-y-1">
                  <h3 className="font-headline text-base font-bold text-neutral-900 tracking-tight">Multimodal Sensory Systems</h3>
                  <p className="font-sans text-sm text-neutral-500 leading-relaxed">
                    Subtle, well-timed auditory checkpoints prevent error states. As verified within our live **Holis Social Suite** demonstration, integrated audio feedback drives user action retention.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined p-2.5 bg-neutral-100 rounded-2xl text-neutral-900">
                  speed
                </span>
                <div className="space-y-1">
                  <h3 className="font-headline text-base font-bold text-neutral-900 tracking-tight">Velocity is a Metric</h3>
                  <p className="font-sans text-sm text-neutral-500 leading-relaxed">
                    Friction is born from lag. We build and design layouts to render smooth animations at high target frames per second benchmarks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    return (
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-12 space-y-16 py-12 text-left">
        <div className="space-y-4">
          <span className="font-sans font-semibold text-xs text-outline tracking-[0.25em] uppercase block">
            Partner with Lia
          </span>
          <h2 className="font-headline text-4xl sm:text-6xl font-black text-neutral-900 tracking-tight leading-tighter">
            Consultancy & Action
          </h2>
          <p className="font-sans text-base sm:text-lg text-neutral-500 max-w-2xl leading-relaxed">
            Need to solve immediate conversions boundaries, improve retention rates, or build clean corporate design languages? Leave a message or connect directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Information block */}
          <div className="custom-glass border border-neutral-200/40 p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-headline text-2xl font-bold text-neutral-900 tracking-tight">Lia Parra</h3>
              <p className="font-sans text-sm text-neutral-500 leading-relaxed">
                Senior product designer and experience strategist driving conversion, interactive interfaces, and cross-platform UX structures.
              </p>
              <div className="space-y-4 pt-6 border-t border-neutral-100 text-sm font-sans">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45474b]">mail</span>
                  <span className="text-neutral-700 select-all font-medium">liangelyparra@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#45474b]">location_on</span>
                  <span className="text-neutral-700 font-medium">Remote • Global / Digital Sync</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-6 border-t border-neutral-100">
              <a 
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-900 hover:opacity-75 transition-opacity"
              >
                LinkedIn
              </a>
              <span className="text-neutral-300">•</span>
              <a 
                href="https://dribbble.com"
                target="_blank"
                rel="noreferrer"
                className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-900 hover:opacity-75 transition-opacity"
              >
                Dribbble
              </a>
            </div>
          </div>

          {/* Contact form block */}
          <div className="lg:col-span-2 bg-white/80 border border-neutral-200/50 p-8 sm:p-10 rounded-3xl shadow-sm custom-glass">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Alex Smith"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-email" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. alex@company.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                  Area of Collaboration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['UX Consultancy', 'Product Design', 'Game UX'].map((sub) => {
                    const isSelected = contactSubject === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        id={`subject-${sub.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => setContactSubject(sub)}
                        className={`py-2.5 px-3 rounded-xl text-[10px] font-sans font-bold uppercase border tracking-wider transition-all ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-black'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-500">
                  Tell me about your product challenge *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your design objectives, timelines or parameters..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm font-sans focus:bg-white focus:border-black outline-none transition-all text-neutral-900"
                />
              </div>

              <button
                type="submit"
                id="contact-form-submit-btn"
                disabled={contactSubmitting}
                className="w-full py-4 bg-black text-white font-sans text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-all rounded-xl shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {contactSubmitting ? 'Sending inquiry...' : 'Send Message'}
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen font-body transition-colors duration-500 overflow-x-hidden ${
      activeTab === 'GAMES' ? 'bg-[#0e0e0e] text-on-surface' : 'bg-[#f8f9ff] text-on-surface'
    }`}>
      <Toaster position="top-right" richColors closeButton />

      {/* Dynamic Backgrounds */}
      {activeTab === 'GAMES' ? (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-full h-full neon-glow-pink animate-pulse"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-full h-full neon-glow-cyan animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#f8f9ff]">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#dce9ff]/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#eff4ff]/40 rounded-full blur-[150px]"></div>
        </div>
      )}

      {/* Top Custom Navigation Bar */}
      <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-12 h-20 transition-all border-b ${
        activeTab === 'GAMES' 
          ? 'bg-[#0e0e0e]/90 text-white border-outline-variant/10 backdrop-blur-md' 
          : 'bg-[#f8f9ff]/90 text-on-surface border-outline-variant/30 backdrop-blur-md'
      }`}>
        <div 
          onClick={() => { 
            if (activeTab === 'GAMES') {
              goHome();
            } else {
              setActiveTab('IMPACT'); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
          }}
          className="flex items-center gap-1.5 cursor-pointer select-none"
        >
          <h1 className={`font-cursive text-3.5xl font-bold tracking-wide leading-none lowercase ${
            activeTab === 'GAMES' ? 'text-[#ff89ab]' : 'text-neutral-955 font-medium'
          }`}>
            lia
          </h1>
          {activeTab === 'GAMES' ? (
            <span className="font-sans text-[11px] font-black text-neutral-300 tracking-wider">
              - Papelito Game
            </span>
          ) : (
            <span className="font-sans text-[11px] font-black text-[#ff89ab] tracking-wider">
              ♡
            </span>
          )}
        </div>

        {/* Desktop Navigation Link Tabs (Hidden when in Game View) */}
        {activeTab !== 'GAMES' && (
          <nav className="hidden md:flex items-center gap-8 font-headline text-xs font-bold uppercase tracking-widest">
            {[
              { id: 'IMPACT', label: 'Use Cases' },
              { id: 'VISION', label: 'My Vision' },
              { id: 'GAMES', label: 'Papelito' },
              { id: 'CONTACT', label: 'Contact' }
            ].map((tab) => {
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`py-2 border-b-2 transition-all cursor-pointer ${
                    isTabActive 
                      ? 'border-primary text-primary font-black' 
                      : 'border-transparent text-on-surface-variant hover:text-primary hover:border-primary/30'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Top Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full shadow-xs border transition-colors ${
            activeTab === 'GAMES'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-green-50/60 border-green-200/40 text-green-700 font-sans'
          }`}>
            <span className="text-[8px] font-extrabold uppercase tracking-widest leading-none">
              available
            </span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0"></span>
          </div>

          {activeTab === 'GAMES' && myPlayer && (
            <div className="hidden sm:flex items-center gap-2 bg-[#201f1f] border border-[#ff89ab]/30 px-3 py-1 bg-opacity-65 rounded-full">
              <img src={myPlayer.avatar} alt={myPlayer.name} className="w-4 h-4 rounded-full" />
              <span className="font-sans text-[11px] font-bold text-white truncate max-w-[80px]">
                {myPlayer.name}
              </span>
            </div>
          )}

          {/* Mobile landscape & Burger menu toggle buttons */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${activeTab === 'GAMES' ? 'block' : 'md:hidden'} p-2 rounded-lg hover:bg-surface-container-high/50 transition-colors z-[100]`}
          >
            <span className="material-symbols-outlined text-primary text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile/Burger Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 p-6 pt-24 flex flex-col justify-center items-center gap-6 shadow-lg backdrop-blur-2xl ${
              activeTab === 'GAMES' ? 'block bg-[#0e0e0e]/98 text-white' : 'md:hidden bg-[#f8f9ff]/95 text-on-surface'
            }`}
          >
            {[
              { id: 'IMPACT', label: 'Use Cases' },
              { id: 'VISION', label: 'My Vision' },
              { id: 'GAMES', label: 'Papelito' },
              { id: 'CONTACT', label: 'Contact' }
            ].map((tab) => {
              const isTabActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`py-3 text-2xl font-headline font-black uppercase tracking-widest text-center ${
                    activeTab === 'GAMES' 
                      ? isTabActive ? 'text-[#ff89ab] font-black scale-105' : 'text-neutral-400 hover:text-white'
                      : isTabActive ? 'text-primary font-black scale-105' : 'text-on-surface-variant'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Content Container */}
      <main className="relative z-10 w-full min-h-screen flex flex-col pt-24 pb-12">
        <AnimatePresence mode="wait">
          {showRoundAnimation && activeTab === 'GAMES' && (
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
                  <p className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-widest text-white">
                    {showRoundAnimation === 1 ? 'Descripción' : 
                     showRoundAnimation === 2 ? 'Una Palabra' : 
                     'Mímica'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex flex-col items-center justify-center"
          >
            {activeTab === 'IMPACT' && renderImpact()}
            {activeTab === 'VISION' && renderVision()}
            {activeTab === 'CONTACT' && renderContact()}
            
            {activeTab === 'GAMES' && (
              <div className="game-theme text-on-surface bg-background select-none min-h-screen relative w-full flex items-center justify-center p-0">
                <div className="w-full max-w-4xl py-6 px-4">
                  {!selectedNickname || gameState.status === 'HOME' ? (
                    renderHome()
                  ) : (
                    <>
                      {gameState.status === 'LOBBY' && renderLobby()}
                      {gameState.status === 'GAME' && renderGame()}
                      {gameState.status === 'RESULTS' && renderResults()}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Interactive Portfolio Footer */}
      {activeTab !== 'GAMES' && (
        <footer className="relative z-10 w-full border-t border-outline-variant/30 py-8 text-center bg-[#f8f9ff] text-on-surface-variant font-sans text-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-headline text-[10px] font-black uppercase tracking-widest text-primary">Lia Parra © 2026</p>
              <p className="text-[10px] text-outline mt-0.5">Sénior Interaction Designer & Product Strategist</p>
            </div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-outline">verified_user</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Empirical Evidence & Quality UX</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
