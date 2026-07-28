import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import { Player, GameCard, GameState, DEFAULT_CARDS, PREDEFINED_PLAYERS, PRIMOS_CARDS, PAPELITO_RANDOM_THEMES } from '../types';
import { db } from '../firebase';

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
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

interface GameSectionProps {
  onPlayerJoin?: (player: { name: string; avatar: string } | null) => void;
}

export default function GameSection({ onPlayerJoin }: GameSectionProps) {
  const ROOM_ID = getRoomId();
  const GAME_ID = ROOM_ID;

  const [gameState, setGameState] = useState<GameState>({
    status: 'HOME',
    players: [],
    cards: [],
    currentCardIndex: 0,
    timer: 90,
    mode: 'PAPELITO',
    currentTurnPlayerId: null,
    readyCount: 0,
    turnOrder: [],
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [selectedNickname, setSelectedNickname] = useState<string>('');
  const [tempNickname, setTempNickname] = useState<string>('');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState<string>('avatar-1');
  const [papelitoInput, setPapelitoInput] = useState<string>('');
  const [showRoundAnimation, setShowRoundAnimation] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showPlayersList, setShowPlayersList] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const soundCacheRef = useRef<Record<string, HTMLAudioElement>>({});
  const lastPlayedSoundRef = useRef<string | null>(null);

  const playSound = (url: string) => {
    try {
      let audio = soundCacheRef.current[url];
      if (!audio) {
        audio = new Audio(url);
        audio.preload = 'auto';
        soundCacheRef.current[url] = audio;
      } else {
        audio.currentTime = 0;
      }
      audio.volume = 0.8;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("[Sound] Playback failed/blocked:", error);
        });
      }
    } catch (error) {
      console.warn("[Sound] Error playing audio:", error);
    }
  };

  // Sound manager listener
  useEffect(() => {
    if (gameState.status === 'GAME') {
      if (gameState.currentCardIndex === 0) {
        const playKey = `start-${gameState.currentRound || 1}`;
        if (lastPlayedSoundRef.current !== playKey) {
          const timer = setTimeout(() => {
            playSound(SOUNDS.START);
          }, 500);
          lastPlayedSoundRef.current = playKey;
          return () => clearTimeout(timer);
        }
      } else {
        const playKey = `card-${gameState.currentCardIndex}`;
        if (lastPlayedSoundRef.current !== playKey) {
          playSound(SOUNDS.NEXT);
          lastPlayedSoundRef.current = playKey;
        }
      }
    } else if (gameState.status === 'RESULTS') {
      const playKey = 'results';
      if (lastPlayedSoundRef.current !== playKey) {
        playSound(SOUNDS.FINISH);
        lastPlayedSoundRef.current = playKey;
      }
    } else {
      lastPlayedSoundRef.current = null;
    }
  }, [gameState.status, gameState.currentCardIndex, gameState.currentRound]);

  // Show winner alerts
  useEffect(() => {
    if (gameState.isShowingWinner && gameState.lastWinnerName) {
      if (gameState.lastWinnerId === 'none') {
        toast.error("Nobody guessed... ❌", {
          description: "Next time!",
          duration: 1500,
        });
      } else {
        toast.success(`Point for ${gameState.lastWinnerName}! 🏆`, {
          description: "+10 points",
          duration: 1500,
        });
        playSound(SOUNDS.WIN);
      }
    }
  }, [gameState.isShowingWinner, gameState.lastWinnerName, gameState.lastWinnerId]);

  // Initialize Client Details
  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    setIsConnected(true);

    const cachedNick = localStorage.getItem(NICKNAME_KEY);
    const cachedAv = localStorage.getItem(AVATAR_KEY);
    if (cachedNick) setTempNickname(cachedNick);
    if (cachedAv) setSelectedAvatarSeed(cachedAv);
  }, []);

  // Listen to Firestore
  useEffect(() => {
    if (!isConnected || !userId) return;

    const gameRef = doc(db, 'games', GAME_ID);
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as GameState;
        setGameState(data);
        
        const me = data.players.find(p => p.id === userId);
        if (me) {
          setSelectedNickname(me.name);
          if (onPlayerJoin) {
            onPlayerJoin({ name: me.name, avatar: me.avatar });
          }
        } else {
          if (onPlayerJoin) {
            onPlayerJoin(null);
          }
        }
      } else {
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
  }, [isConnected, userId, GAME_ID, onPlayerJoin]);

  // Timer Manager (Client-side sync handle)
  useEffect(() => {
    if (gameState.status !== 'GAME' || !userId || gameState.isShowingWinner) return;

    const isHost = gameState.players[0]?.id === userId;
    if (!isHost) return;

    const interval = setInterval(() => {
      if (gameState.timer > 0) {
        updateDoc(doc(db, 'games', GAME_ID), {
          timer: gameState.timer - 1
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
      } else {
        if (gameState.mode === 'PAPELITO') {
          const turnOrder = gameState.turnOrder || gameState.players.map(p => p.id);
          const currentTurnIdx = turnOrder.indexOf(gameState.currentTurnPlayerId || '');
          const nextTurnIdx = (currentTurnIdx + 1) % turnOrder.length;
          
          updateDoc(doc(db, 'games', GAME_ID), {
            currentTurnPlayerId: turnOrder[nextTurnIdx],
            timer: 90
          }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`));
          playSound(SOUNDS.TIMEOUT);
        } else {
          toast.error("Time's up! ⏰");
          playSound(SOUNDS.TIMEOUT);
          voteWinner('none');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status, gameState.timer, gameState.isShowingWinner, gameState.players, gameState.turnOrder, gameState.currentTurnPlayerId, userId, GAME_ID]);

  // Handle Round Animation trigger
  useEffect(() => {
    if (gameState.status === 'GAME' && gameState.mode === 'PAPELITO' && gameState.currentRound) {
      if (gameState.currentCardIndex === 0) {
        setShowRoundAnimation(gameState.currentRound);
        const timer = setTimeout(() => setShowRoundAnimation(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.status, gameState.currentCardIndex, gameState.currentRound, gameState.mode]);

  const joinGame = async () => {
    if (!tempNickname.trim() || !userId) return;

    localStorage.setItem(NICKNAME_KEY, tempNickname.trim());
    localStorage.setItem(AVATAR_KEY, selectedAvatarSeed);

    const gameRef = doc(db, 'games', GAME_ID);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatarSeed}`;

    const newPlayer: Player = {
      id: userId,
      name: tempNickname.trim(),
      avatar: avatarUrl,
      score: 0,
      isReady: false,
      isHost: gameState.players.length === 0,
      papelitos: []
    };

    const updatedPlayers = [...gameState.players];
    const existingIndex = updatedPlayers.findIndex(p => p.id === userId);

    if (existingIndex >= 0) {
      updatedPlayers[existingIndex] = {
        ...updatedPlayers[existingIndex],
        name: tempNickname.trim(),
        avatar: avatarUrl
      };
    } else {
      updatedPlayers.push(newPlayer);
    }

    try {
      await updateDoc(gameRef, {
        players: updatedPlayers,
        status: 'LOBBY'
      });
      setSelectedNickname(tempNickname.trim());
      playSound(SOUNDS.JOIN);
      toast.success(`Welcome ${tempNickname.trim()}! 🎈`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const createPrivateRoom = () => {
    const randomRoomId = `room-${Math.floor(1000 + Math.random() * 9000)}`;
    const url = new URL(window.location.href);
    url.searchParams.set('room', randomRoomId);
    window.history.pushState(null, '', url.toString());
    window.location.reload();
  };

  const updateMode = async (mode: 'PAPELITO' | 'HOLIS' | 'PRIMOS' | 'WHATSAPP') => {
    const updates: Partial<GameState> = { mode };
    if (mode !== 'PAPELITO') {
      updates.cards = shuffleArray(DEFAULT_CARDS);
    } else {
      updates.cards = [];
      updates.currentRound = 1;
      updates.papelitosPerPlayer = 2;
      updates.papelitoTheme = 'free';
      updates.papelitoCustomTheme = '';
    }
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      await updateDoc(gameRef, updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const updatePapelitoSettings = async (settings: Partial<GameState>) => {
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      await updateDoc(gameRef, settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const shufflePapelitoTheme = () => {
    const themes = [
      "Películas de Terror", "Comida Venezolana", "Personajes de Disney", "Cosas que hay en una maleta",
      "Famosos que me caen mal", "Canciones de Reggaeton", "Lugares para ir de vacaciones",
      "Cosas que haces cuando estás borracho", "Superhéroes", "Marcas de Carros", "Animales en peligro de extinción",
      "Cosas que huelen mal", "Profesiones extrañas", "Objetos de oficina", "Frases de mamá"
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    updatePapelitoSettings({ papelitoCustomTheme: randomTheme });
  };

  const addPapelito = async () => {
    if (!papelitoInput.trim() || !userId) return;

    const updatedPlayers = gameState.players.map(p => {
      if (p.id === userId) {
        const peps = p.papelitos || [];
        if (peps.length < (gameState.papelitosPerPlayer || 1)) {
          return { ...p, papelitos: [...peps, papelitoInput.trim()] };
        }
      }
      return p;
    });

    const gameRef = doc(db, 'games', GAME_ID);
    try {
      await updateDoc(gameRef, { players: updatedPlayers });
      setPapelitoInput('');
      toast.success("Concept added! 📝");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const removePapelito = async (index: number) => {
    if (!userId) return;

    const updatedPlayers = gameState.players.map(p => {
      if (p.id === userId) {
        const peps = [...(p.papelitos || [])];
        peps.splice(index, 1);
        return { ...p, papelitos: peps };
      }
      return p;
    });

    const gameRef = doc(db, 'games', GAME_ID);
    try {
      await updateDoc(gameRef, { players: updatedPlayers });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const resetGame = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      await setDoc(gameRef, {
        status: 'HOME',
        players: [],
        cards: shuffleArray(DEFAULT_CARDS),
        currentCardIndex: 0,
        timer: 90,
        mode: 'PAPELITO',
        currentTurnPlayerId: null,
        readyCount: 0,
        turnOrder: [],
      });
      setSelectedNickname('');
      localStorage.removeItem(NICKNAME_KEY);
      toast.success("Room reset successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `games/${GAME_ID}`);
    }
  };

  const startGame = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    
    let gameCards: GameCard[] = [];
    if (gameState.mode === 'PAPELITO') {
      const allPapelitos: string[] = [];
      gameState.players.forEach(p => {
        if (p.papelitos) allPapelitos.push(...p.papelitos);
      });

      if (allPapelitos.length < 2) {
        toast.error("Write more concepts to start!");
        return;
      }

      gameCards = shuffleArray(allPapelitos.map((text, i) => ({
        id: `pap-${Date.now()}-${i}`,
        category: "PAPELITO",
        content: text,
        emoji: "📝"
      })));
    } else {
      gameCards = shuffleArray(gameState.cards.length > 0 ? gameState.cards : DEFAULT_CARDS);
    }

    const order = shuffleArray(gameState.players.map(p => p.id));

    try {
      await updateDoc(gameRef, {
        cards: gameCards,
        currentCardIndex: 0,
        status: 'GAME',
        timer: 90,
        currentTurnPlayerId: order[0],
        turnOrder: order,
        currentRound: gameState.mode === 'PAPELITO' ? 1 : undefined,
        isShowingWinner: false
      });
      playSound(SOUNDS.ROUND_START);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onerror = () => {
      toast.error("Error reading file.");
      setIsUploading(false);
    };

    reader.onload = async (event) => {
      let text = event.target?.result as string;
      if (!text || text.trim().length < 10) {
        toast.error("The file seems empty or too short.");
        setIsUploading(false);
        return;
      }

      if (text.length > 30000) {
        text = text.substring(0, 30000);
      }

      try {
        // Safe, server-side API call
        const res = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Server-side card generation failed.");
        }

        const data = await res.json();
        const cards = data.cards;

        if (!Array.isArray(cards) || cards.length === 0) {
          throw new Error("No cards could be parsed from response.");
        }

        const newCards = shuffleArray(cards.map((c: any, i: number) => ({
          ...c,
          id: `ai-${Date.now()}-${i}`
        })));

        await updateDoc(doc(db, 'games', GAME_ID), { cards: newCards });
        toast.success("Custom deck generated successfully! 🔥");
      } catch (error: any) {
        console.error("Error generating cards:", error);
        toast.error(`Generation error: ${error.message || "Unknown error"}`);
        await updateDoc(doc(db, 'games', GAME_ID), { cards: shuffleArray(DEFAULT_CARDS) });
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  const voteWinner = async (winnerId: string) => {
    if (!userId) return;

    const gameRef = doc(db, 'games', GAME_ID);
    const winnerName = winnerId === 'none' ? 'Nobody' : (gameState.players.find(p => p.id === winnerId)?.name || 'Nobody');

    const updatedPlayers = gameState.players.map(p => {
      if (p.id === winnerId) {
        return { ...p, score: p.score + 10 };
      }
      return p;
    });

    try {
      await updateDoc(gameRef, {
        isShowingWinner: true,
        lastWinnerId: winnerId,
        lastWinnerName: winnerName
      });

      setTimeout(async () => {
        const nextIndex = gameState.currentCardIndex + 1;
        const isEnd = nextIndex >= gameState.cards.length;

        if (isEnd) {
          if (gameState.mode === 'PAPELITO' && gameState.currentRound && gameState.currentRound < 3) {
            const nextRound = gameState.currentRound + 1;
            const shuffledCards = shuffleArray(gameState.cards);
            const turnOrder = shuffleArray(gameState.players.map(p => p.id));
            
            await updateDoc(gameRef, {
              players: updatedPlayers,
              cards: shuffledCards,
              currentCardIndex: 0,
              currentRound: nextRound,
              timer: 90,
              currentTurnPlayerId: turnOrder[0],
              turnOrder,
              isShowingWinner: false
            });
            playSound(SOUNDS.ROUND_START);
          } else {
            await updateDoc(gameRef, {
              players: updatedPlayers,
              status: 'RESULTS',
              isShowingWinner: false
            });
          }
        } else {
          const order = gameState.turnOrder || gameState.players.map(p => p.id);
          const currentTurnIdx = order.indexOf(gameState.currentTurnPlayerId || '');
          const nextTurnIdx = (currentTurnIdx + 1) % order.length;

          await updateDoc(gameRef, {
            players: updatedPlayers,
            currentCardIndex: nextIndex,
            timer: 90,
            currentTurnPlayerId: order[nextTurnIdx],
            isShowingWinner: false
          });
        }
      }, 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const continueWithPoints = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    const order = shuffleArray(gameState.players.map(p => p.id));
    
    let nextCards = shuffleArray(gameState.cards);
    if (gameState.mode === 'PAPELITO') {
      const allPapelitos: string[] = [];
      gameState.players.forEach(p => {
        if (p.papelitos) allPapelitos.push(...p.papelitos);
      });
      nextCards = shuffleArray(allPapelitos.map((text, i) => ({
        id: `pap-${Date.now()}-${i}`,
        category: "PAPELITO",
        content: text,
        emoji: "📝"
      })));
    }

    try {
      await updateDoc(gameRef, {
        status: 'GAME',
        cards: nextCards,
        currentCardIndex: 0,
        timer: 90,
        currentTurnPlayerId: order[0],
        turnOrder: order,
        currentRound: gameState.mode === 'PAPELITO' ? 1 : undefined,
        isShowingWinner: false
      });
      playSound(SOUNDS.ROUND_START);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const restartGame = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    const resetPlayers = gameState.players.map(p => ({ ...p, score: 0 }));
    
    try {
      await updateDoc(gameRef, {
        players: resetPlayers,
        status: 'LOBBY',
        isShowingWinner: false
      });
      toast.success("Scores reset!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const goHome = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    const filteredPlayers = gameState.players.filter(p => p.id !== userId);
    
    try {
      await updateDoc(gameRef, {
        players: filteredPlayers
      });
      setSelectedNickname('');
      if (onPlayerJoin) onPlayerJoin(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full p-2 sm:p-4 text-center"
    >
      <div className="max-w-md mx-auto space-y-4 sm:space-y-5 bg-[#111113] p-5 sm:p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="space-y-2">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-[#3C48C3] ml-2">Your Nickname / Name</label>
          <input 
            type="text" 
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            placeholder="e.g. Party King"
            className="w-full bg-neutral-900 border-2 border-neutral-800 rounded-xl p-3 font-headline font-black uppercase text-white focus:border-[#3C48C3] outline-none transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-left text-[10px] font-black uppercase tracking-widest text-[#3C48C3] ml-2">Choose your Avatar</label>
          <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 scrollbar-hide">
            {Array.from({ length: 20 }).map((_, i) => {
              const seed = `avatar-${i + 1}`;
              const isSelected = selectedAvatarSeed === seed;
              return (
                <button
                  key={seed}
                  onClick={() => setSelectedAvatarSeed(seed)}
                  className={`relative aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                    isSelected ? 'border-[#3C48C3] scale-105 shadow-[0_0_12px_rgba(60,72,195,0.4)]' : 'border-neutral-800 grayscale hover:grayscale-0 hover:border-[#3C48C3]/50'
                  }`}
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#3C48C3]/20 flex items-center justify-center">
                      <Check size={16} className="text-white" />
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
            className={`w-full py-3.5 sm:py-4 rounded-xl font-headline font-black text-base sm:text-lg uppercase tracking-tight shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 px-4 ${
              !tempNickname.trim() || !selectedAvatarSeed
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                : 'bg-[#3C48C3] text-white hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(60,72,195,0.3)]'
            }`}
          >
            <span className="truncate">ENTER ROOM</span>
            <ChevronRight className="shrink-0" size={18} />
          </button>
        ) : (
          <button 
            onClick={createPrivateRoom}
            className="w-full py-3.5 sm:py-4 bg-[#3C48C3] text-white font-headline font-black text-base sm:text-lg uppercase tracking-tight rounded-xl shadow-md hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(60,72,195,0.3)] active:scale-95 flex items-center justify-center gap-2 px-4 transition-all"
          >
            <Users size={18} className="shrink-0" />
            <span className="truncate">CREATE PRIVATE ROOM</span>
          </button>
        )}

        <div className="pt-4 border-t border-neutral-800 space-y-3">
          {GAME_ID !== 'global-party' && (
            <button 
              onClick={createPrivateRoom}
              className="w-full bg-neutral-900 text-white font-headline font-bold py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-850 transition-all px-4"
            >
              <Users size={16} className="shrink-0" />
              <span className="truncate">CREATE ANOTHER ROOM</span>
            </button>
          )}
          
          <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-neutral-900 rounded-full w-fit mx-auto">
            <div className={`w-2 h-2 rounded-full ${GAME_ID === 'global-party' ? 'bg-amber-500' : 'bg-[#3C48C3] animate-pulse'}`}></div>
            <span className="text-[9px] text-neutral-400 uppercase font-black tracking-widest">
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
        <div className="flex justify-between items-center bg-[#111113] p-4 rounded-3xl border border-neutral-800 shadow-xl">
          <div className="flex items-center gap-3">
            <Users className="text-[#3C48C3]" size={24} />
            <h2 className="font-headline text-xl sm:text-2xl font-black uppercase tracking-tighter text-white">Lobby</h2>
          </div>
          <div className="bg-[#3C48C3]/10 px-4 py-1 rounded-full border border-[#3C48C3]/20 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3C48C3]">Waiting for Players</span>
            <button 
              onClick={resetGame}
              className="p-1 hover:bg-[#3C48C3]/20 rounded-full transition-all text-[#3C48C3]"
              title="Reset Room"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-[#111113] p-6 rounded-[2rem] border border-neutral-800 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3C48C3]">Game Mode</h3>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => updateMode('PAPELITO')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'PAPELITO' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}
                >
                  <Star size={20} className={gameState.mode === 'PAPELITO' ? 'text-emerald-500' : 'text-neutral-400'} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Papelito</span>
                </button>
                <button 
                  onClick={() => updateMode('HOLIS')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'HOLIS' ? 'bg-[#3C48C3]/10 border-[#3C48C3] shadow-[0_0_15px_rgba(60,72,195,0.3)]' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}
                >
                  <Flame size={20} className={gameState.mode === 'HOLIS' ? 'text-[#3C48C3]' : 'text-neutral-400'} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Holis</span>
                </button>
                <button 
                  onClick={() => updateMode('PRIMOS')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'PRIMOS' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}
                >
                  <Users size={20} className={gameState.mode === 'PRIMOS' ? 'text-amber-500' : 'text-neutral-400'} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Primos</span>
                </button>
                <button 
                  onClick={() => updateMode('WHATSAPP')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${gameState.mode === 'WHATSAPP' ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-neutral-900 border-neutral-800 opacity-60'}`}
                >
                  <Upload size={20} className={gameState.mode === 'WHATSAPP' ? 'text-red-500' : 'text-neutral-400'} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Custom</span>
                </button>
              </div>
            </div>

            {gameState.mode === 'PAPELITO' && (
              <div className="bg-[#111113] p-4 rounded-[2rem] border border-neutral-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Papelito Settings</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toast.info("Papelito: 3 Rounds. 1: Free Description, 2: Single Word, 3: Charades / Mimicry.")}
                      className="text-emerald-500/50 hover:text-emerald-500 transition-colors"
                    >
                      <Info size={14} />
                    </button>
                    <Settings size={12} className="text-emerald-500/50" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[7px] font-black uppercase tracking-widest text-neutral-400">Papelitos</p>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(num => (
                        <button
                          key={num}
                          onClick={() => updatePapelitoSettings({ papelitosPerPlayer: num })}
                          className={`flex-1 py-1.5 rounded-lg border transition-all font-headline font-black text-xs ${
                            gameState.papelitosPerPlayer === num 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[7px] font-black uppercase tracking-widest text-neutral-400">Theme</p>
                    <div className="flex gap-1">
                      {['free', 'custom'].map(t => (
                        <button
                          key={t}
                          onClick={() => updatePapelitoSettings({ papelitoTheme: t })}
                          className={`flex-1 py-1.5 rounded-lg border transition-all font-headline font-black text-[9px] uppercase ${
                            gameState.papelitoTheme === t 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                      <button
                        onClick={shufflePapelitoTheme}
                        className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
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
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-emerald-500 outline-none transition-all"
                    />
                  </motion.div>
                )}

                <div className="pt-3 border-t border-neutral-800">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Your Phrase ({myPlayer?.papelitos?.length || 0} / {gameState.papelitosPerPlayer || 1})</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={papelitoInput}
                      onChange={(e) => setPapelitoInput(e.target.value)}
                      placeholder={gameState.papelitoTheme === 'free' ? "Write a phrase..." : `Theme: ${gameState.papelitoCustomTheme || '...'}...`}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-emerald-500 outline-none transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && addPapelito()}
                    />
                    <button 
                      onClick={addPapelito}
                      disabled={!papelitoInput.trim() || (myPlayer?.papelitos?.length || 0) >= (gameState.papelitosPerPlayer || 1)}
                      className={`px-4 py-1.5 rounded-lg font-headline font-black text-[10px] uppercase transition-all ${
                        !papelitoInput.trim() || (myPlayer?.papelitos?.length || 0) >= (gameState.papelitosPerPlayer || 1)
                          ? 'bg-neutral-850 text-neutral-600'
                          : 'bg-emerald-500 text-white hover:brightness-110 active:scale-95'
                      }`}
                    >
                      ADD
                    </button>
                  </div>

                  {myPlayer?.papelitos && myPlayer.papelitos.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {myPlayer.papelitos.map((pep, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <span className="text-[9px] font-bold text-emerald-400 max-w-[120px] truncate">{pep}</span>
                          <button 
                            onClick={() => removePapelito(i)}
                            className="text-red-400 hover:text-red-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState.mode === 'WHATSAPP' && (
              <div className="bg-[#111113] p-5 rounded-[2rem] border border-neutral-800 shadow-xl space-y-4">
                <div className="space-y-1">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-red-500">Custom WhatsApp Deck Generator</h3>
                  <p className="text-[10px] text-neutral-400">Upload a exported WhatsApp chat file (.txt) to automatically generate personalized party cards with real jokes, catchphrases, and situations!</p>
                </div>

                <div className="pt-2">
                  <input 
                    type="file" 
                    accept=".txt" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`w-full py-4 rounded-xl border-2 border-dashed font-headline font-black text-xs uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isUploading 
                        ? 'border-red-500/40 bg-red-500/5 text-neutral-500' 
                        : 'border-neutral-800 hover:border-red-500/50 hover:bg-neutral-900 text-neutral-300'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-red-500" />
                        <span>Select WhatsApp .txt File</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="bg-[#111113] p-6 rounded-[2rem] border border-neutral-800 shadow-xl flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3C48C3]">Players in Room ({gameState.players.length})</h3>
                <span className="text-[10px] font-mono text-neutral-500 font-bold uppercase select-text">{GAME_ID}</span>
              </div>
              
              <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-hide pr-1">
                {gameState.players.map((p, idx) => (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full border border-neutral-800" />
                      <div>
                        <span className="font-headline font-black text-xs text-white uppercase truncate max-w-[120px] block">{p.name}</span>
                        {p.isHost && <span className="text-[7px] font-mono font-bold tracking-widest text-[#3C48C3] uppercase">HOST</span>}
                      </div>
                    </div>
                    {gameState.mode === 'PAPELITO' && (
                      <span className={`text-[8px] font-headline font-black px-2.5 py-1 rounded-full ${
                        (p.papelitos?.length || 0) >= (gameState.papelitosPerPlayer || 1)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}>
                        {(p.papelitos?.length || 0)} / {(gameState.papelitosPerPlayer || 1)} READY
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              {myPlayer?.isHost ? (
                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-[#3C48C3] hover:scale-[1.01] hover:brightness-110 active:scale-95 text-white font-headline font-black text-xl uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play size={20} className="fill-white" />
                  START GAME 🚀
                </button>
              ) : (
                <div className="w-full py-5 bg-neutral-900 border border-neutral-800 text-neutral-400 font-headline font-bold text-center text-sm rounded-2xl">
                  WAITING FOR HOST TO START THE ROOM...
                </div>
              )}
              
              <button 
                onClick={goHome}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white font-headline font-bold text-xs uppercase tracking-widest rounded-xl border border-neutral-800 transition-all cursor-pointer"
              >
                BACK TO NICKNAME SELECTOR
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGame = () => {
    const activeCard = gameState.cards[gameState.currentCardIndex];
    const activePlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
    const isMyTurn = gameState.currentTurnPlayerId === userId;
    const isHost = gameState.players[0]?.id === userId;

    if (!activeCard) {
      return (
        <div className="text-center py-12 space-y-4">
          <p className="text-neutral-400 text-sm font-bold">Waiting for deck configuration...</p>
          <button onClick={resetGame} className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-white uppercase">
            Reset Room
          </button>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-xl w-full p-2 sm:p-4 flex flex-col gap-3 sm:gap-4 items-center justify-center relative select-none"
      >
        <div className="w-full flex items-center justify-between gap-3 bg-[#111113] p-3 sm:p-4 rounded-2xl border border-neutral-800 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <Timer className="text-[#3C48C3]" size={18} />
            <span className="font-headline font-black text-xl sm:text-2xl text-white">{gameState.timer}s</span>
          </div>

          {gameState.mode === 'PAPELITO' && (
            <div className="font-headline text-[10px] sm:text-xs font-black uppercase bg-[#3C48C3]/10 border border-[#3C48C3]/20 text-[#3C48C3] px-2.5 py-1 rounded-full">
              ROUND {gameState.currentRound || 1} • {
                gameState.currentRound === 1 ? 'Free Description' : 
                gameState.currentRound === 2 ? 'Single Word' : 
                'Pantomime'
              }
            </div>
          )}

          <div className="text-right">
            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 block">Deck Progress</span>
            <span className="font-headline font-black text-xs sm:text-sm text-[#3C48C3]">{gameState.currentCardIndex + 1} / {gameState.cards.length}</span>
          </div>
        </div>

        <div className="w-full text-center py-2 px-3 bg-[#111113]/60 rounded-xl border border-neutral-850">
          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 block">Current Explainer Turn</span>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            {activePlayer && (
              <>
                <img src={activePlayer.avatar} alt={activePlayer.name} className="w-5 h-5 rounded-full border border-neutral-800" />
                <span className="font-headline font-black text-xs sm:text-sm uppercase text-white tracking-tight">{activePlayer.name}</span>
              </>
            )}
            {isMyTurn && (
              <span className="px-2 py-0.5 bg-[#3C48C3] text-white rounded text-[8px] font-black uppercase tracking-widest animate-pulse">
                YOUR TURN
              </span>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!gameState.isShowingWinner ? (
            <motion.div 
              key={activeCard.id}
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -10, opacity: 0 }}
              className="w-full min-h-[200px] sm:min-h-[250px] rounded-2xl sm:rounded-3xl bg-[#141417] py-8 sm:py-10 px-5 sm:px-8 border-2 sm:border-3 border-neutral-800 flex flex-col justify-between items-center text-center shadow-xl relative overflow-hidden"
              style={{ boxShadow: isMyTurn ? '0 0 40px rgba(60, 72, 195, 0.15)' : 'none' }}
            >
              <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-neutral-500">
                <span>{activeCard.category || 'PARTY CARD'}</span>
                <span className="text-xl">{activeCard.emoji || '🔥'}</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center space-y-3 max-w-md select-text my-4">
                {isMyTurn ? (
                  <>
                    <h2 className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                      {activeCard.content}
                    </h2>
                    {activeCard.context && (
                      <p className="font-sans text-xs text-neutral-400 italic">
                        {activeCard.context}
                      </p>
                    )}
                    {activeCard.answer && (
                      <div className="bg-[#3C48C3]/10 border border-[#3C48C3]/20 px-3 py-1 rounded-lg">
                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 block">Answer:</span>
                        <p className="font-headline font-black text-xs uppercase text-white">{activeCard.answer}</p>
                      </div>
                    )}
                    {activeCard.tabooWords && activeCard.tabooWords.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-500 block">TABOO WORDS (Can't Say):</span>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {activeCard.tabooWords.map(w => (
                            <span key={w} className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full font-headline font-black text-[9px] text-red-400 uppercase">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-4xl text-neutral-600 animate-pulse">lock</span>
                    <p className="font-sans text-xs sm:text-sm text-neutral-400 leading-relaxed">
                      Only the explainer can see this card. Listen carefully and try to guess first!
                    </p>
                  </div>
                )}
              </div>

              <div className="w-full text-center pt-1 border-t border-neutral-900/60">
                <span className="text-[8px] font-black uppercase tracking-widest text-neutral-600">HOLIS PARTY ENGINE</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full min-h-[180px] sm:min-h-[220px] rounded-2xl bg-[#111113] p-6 border-2 border-emerald-500/30 flex flex-col justify-center items-center text-center shadow-xl space-y-4"
            >
              <Trophy size={48} className="text-[#3C48C3] drop-shadow-[0_0_15px_rgba(60,72,195,0.4)]" />
              <div className="space-y-1">
                <h3 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  {gameState.lastWinnerId === 'none' ? 'Nobody Guessed!' : 'Point Scored!'}
                </h3>
                <p className="font-headline text-sm sm:text-base text-neutral-400 uppercase">
                  {gameState.lastWinnerId === 'none' ? 'Better luck next card!' : `Point for ${gameState.lastWinnerName}!`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isHost && !gameState.isShowingWinner && (
          <div className="w-full space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#3C48C3] text-center block mb-2">Host Dashboard • Select Winner to pass card</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gameState.players.map(p => (
                <button
                  key={p.id}
                  onClick={() => voteWinner(p.id)}
                  className="p-3 bg-neutral-900 hover:bg-[#3C48C3]/20 hover:border-[#3C48C3] border border-neutral-800 rounded-xl flex items-center gap-2 transition-all text-left uppercase truncate"
                >
                  <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full" />
                  <span className="font-headline font-black text-[9px] text-white truncate">{p.name}</span>
                </button>
              ))}
              <button
                onClick={() => voteWinner('none')}
                className="p-3 bg-neutral-850 hover:bg-red-500/15 hover:border-red-500 border border-neutral-800 rounded-xl text-center font-headline font-black text-[9px] text-red-400 transition-all uppercase"
              >
                Nobody Guessed ❌
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={resetGame}
          className="py-2.5 px-6 bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white rounded-xl text-[10px] font-headline font-black uppercase tracking-widest transition-all cursor-pointer hover:scale-102"
        >
          Exit Room
        </button>
      </motion.div>
    );
  };

  const renderResults = () => {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full p-6 bg-[#111113] rounded-[2rem] border-2 border-[#3C48C3]/30 shadow-[0_0_80px_rgba(60,72,195,0.15)] text-center space-y-6 sm:space-y-10"
      >
        <div className="space-y-4">
          <Trophy size={64} className="text-[#3C48C3] mx-auto drop-shadow-[0_0_20px_rgba(60,72,195,0.5)]" />
          <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white">Final Scores</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {sortedPlayers.map((player, index) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                index === 0 ? 'bg-[#3C48C3]/10 border-[#3C48C3]' : 'bg-neutral-900 border-neutral-850'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="font-headline font-black text-xl text-neutral-500 w-6">{index + 1}</span>
                <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full border border-neutral-800" />
                <span className="font-headline font-black text-lg text-white uppercase truncate max-w-[120px]">{player.name}</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-black text-2xl text-[#3C48C3]">{player.score}</span>
                <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Points</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={continueWithPoints}
            className="w-full py-5 bg-[#3C48C3] text-white font-headline font-black text-xl rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            CONTINUE WITH POINTS 🏆
          </button>
          <button 
            onClick={restartGame}
            className="w-full py-5 bg-neutral-900 border border-neutral-800 text-white font-headline font-black text-xl rounded-2xl shadow-lg hover:bg-neutral-850 active:scale-95 transition-all"
          >
            NEW GAME (RESET) 🔥
          </button>
          <button 
            onClick={goHome}
            className="w-full py-4 bg-neutral-900/40 text-neutral-400 font-headline font-bold text-lg rounded-2xl border border-neutral-850 hover:bg-neutral-850 hover:text-white transition-all"
          >
            EXIT TO LOBBY
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-4 sm:space-y-5 flex flex-col items-center select-none">
        
        {/* Secondary Info Header */}
        <div className="flex justify-between items-center w-full max-w-md px-4 select-none">
          <button 
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            <HelpCircle size={14} />
            How to Play Papelito
          </button>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#3C48C3]">
            <Gamepad2 size={14} />
            Staging Dev Build 1.0.4
          </div>
        </div>

        <Toaster position="top-center" theme="dark" closeButton />

        <AnimatePresence mode="wait">
          {showRoundAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <Star size={120} className="text-emerald-500 mx-auto drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="font-headline text-6xl sm:text-8xl font-black uppercase tracking-tighter text-emerald-400 italic">
                    ROUND {showRoundAnimation}
                  </h2>
                  <p className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-widest text-white">
                    {showRoundAnimation === 1 ? 'Free Description' : 
                     showRoundAnimation === 2 ? 'Single Word' : 
                     'Pantomime'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            key={gameState.status}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex flex-col items-center justify-center"
          >
            {!selectedNickname || gameState.status === 'HOME' ? (
              renderHome()
            ) : (
              <div className="w-full flex flex-col items-center">
                {gameState.status === 'LOBBY' && renderLobby()}
                {gameState.status === 'GAME' && renderGame()}
                {gameState.status === 'RESULTS' && renderResults()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Instructions Modal Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
            <div className="absolute inset-0" onClick={() => setShowInstructions(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#141414] border border-neutral-800 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl z-10 overflow-hidden text-left"
              style={{ boxShadow: '0 0 50px rgba(60, 72, 195, 0.2)' }}
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3C48C3]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <button 
                onClick={() => setShowInstructions(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close instructions"
              >
                <span className="text-sm font-bold">✕</span>
              </button>

              <div className="space-y-6">
                <div className="space-y-1.5 pr-8">
                  <span className="font-sans text-[10px] font-black tracking-widest text-[#3C48C3] bg-[#3C48C3]/10 px-2.5 py-1 rounded-md uppercase">
                    How to Play Papelito! 📝🎮
                  </span>
                  <h3 className="font-headline text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mt-2">
                    Secret Phrases & Laughter
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-neutral-400">
                    A party match played in 3 hilarious rounds! Every player writes down secret concepts (papelitos) into a shared online pool before facing off.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                    <span className="font-headline font-black text-xs text-[#3C48C3] bg-[#3C48C3]/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Round 1 • Free Description</p>
                      <p className="font-sans text-xs text-neutral-400">
                        Describe the concept using as many words/hints as you want (except translation, spelling, or parts of the secret word).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                    <span className="font-headline font-black text-xs text-[#3C48C3] bg-[#3C48C3]/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Round 2 • Single Word</p>
                      <p className="font-sans text-xs text-neutral-400">
                        Now that your team knows all words in the pool, you are restricted to guiding them with **only one single word**! Choose wisely.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                    <span className="font-headline font-black text-[#3C48C3] bg-[#3C48C3]/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Round 3 • Full Pantomime</p>
                      <p className="font-sans text-xs text-neutral-400">
                        Zero sounds or lip syncing allowed. You must act out the concept using gestures/mime body language under clock pressure!
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-4 bg-gradient-to-r from-[#3C48C3] to-[#2532b2] hover:brightness-110 active:scale-[0.98] transition-all text-white font-headline font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(60,72,195,0.3)] block text-center cursor-pointer"
                >
                  Got it • Let's Play! 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
