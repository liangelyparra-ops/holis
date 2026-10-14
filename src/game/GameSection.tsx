import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Users, 
  Trophy, 
  Timer, 
  Flame, 
  Play, 
  Check, 
  ChevronRight,
  Star,
  AlertCircle,
  Info,
  HelpCircle,
  X,
  Settings,
  Shuffle,
  Eye,
  EyeOff,
  Shield,
  Swords,
  SkipForward,
  Globe,
  Share2
} from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import { Player, GameCard, GameState, DEFAULT_CARDS, CodigoSecretoCell, CodigoSecretoState } from '../types';
import { CS_WORDS_ES_CLEAN, CS_WORDS_EN_CLEAN } from '../data/codigoSecretoWords';
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
  onStatusChange?: (status: string, isInRoom: boolean, roomId: string) => void;
}

export default function GameSection({ onPlayerJoin, onStatusChange }: GameSectionProps) {
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showPlayersList, setShowPlayersList] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  // Código Secreto local state
  const [csClueWord, setCsClueWord] = useState<string>('');
  const [csClueNumber, setCsClueNumber] = useState<number>(2);
  const [csShowSpymasterView, setCsShowSpymasterView] = useState<boolean>(true);

  const soundCacheRef = useRef<Record<string, HTMLAudioElement>>({});
  const lastPlayedSoundRef = useRef<string | null>(null);

  const isInRoom = Boolean(selectedNickname && gameState.status !== 'HOME');

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(gameState.status, isInRoom, GAME_ID);
    }
  }, [gameState.status, isInRoom, GAME_ID, onStatusChange]);

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

  // Timer Manager (Client-side sync handle) — disabled for Código Secreto
  useEffect(() => {
    if (gameState.status !== 'GAME' || !userId || gameState.isShowingWinner) return;
    if (gameState.mode === 'CODIGO_SECRETO') return; // CS manages its own flow

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

  const shareRoom = async () => {
    const url = new URL(window.location.href);
    if (!url.searchParams.get('room') && GAME_ID) {
      url.searchParams.set('room', GAME_ID);
    }
    const shareUrl = url.toString();
    const shareData = {
      title: 'Holis Party Game',
      text: '¡Únete a mi partida en Holis!',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('¡Link copiado al portapapeles!');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const updateMode = async (mode: 'PAPELITO' | 'HOLIS' | 'CODIGO_SECRETO') => {
    const updates: any = { mode };
    if (mode === 'PAPELITO') {
      updates.cards = [];
      updates.currentRound = 1;
      updates.papelitosPerPlayer = 2;
      updates.papelitoTheme = 'free';
      updates.papelitoCustomTheme = '';
      updates.codigoSecreto = deleteField();
    } else if (mode === 'CODIGO_SECRETO') {
      updates.cards = [];
      updates.currentRound = deleteField();
      updates.codigoSecreto = {
        board: [],
        teamRed: [],
        teamBlue: [],
        spymasterRed: null,
        spymasterBlue: null,
        currentTeam: 'RED',
        clueWord: null,
        clueNumber: null,
        guessesLeft: 0,
        winner: null,
        winnerReason: null,
        wordsLeft: { red: 9, blue: 8 },
        phase: 'TEAM_SELECT',
        language: 'es',
      };
    } else {
      updates.cards = shuffleArray(DEFAULT_CARDS);
      updates.currentRound = deleteField();
      updates.codigoSecreto = deleteField();
    }
    const gameRef = doc(db, 'games', GAME_ID);
    try {
      await updateDoc(gameRef, updates);
      toast.success(`Modo cambiado a ${mode}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
  };

  // ─── Código Secreto helpers ───────────────────────────────────────
  function buildCsBoard(lang: 'es' | 'en' = 'es', prevUsedWords: string[] = []): { board: CodigoSecretoCell[]; newUsedWords: string[] } {
    const wordPool = lang === 'en' ? CS_WORDS_EN_CLEAN : CS_WORDS_ES_CLEAN;
    // Filter out words already used in previous games
    const usedSet = new Set(prevUsedWords);
    let available = wordPool.filter(w => !usedSet.has(w));
    let recycled = false;
    // If not enough words left, recycle but exclude last game's words
    // so consecutive games after reset are always different
    if (available.length < 25) {
      recycled = true;
      const lastGameWords = new Set(prevUsedWords.slice(-25));
      available = wordPool.filter(w => !lastGameWords.has(w));
      // Fallback: if still not enough (shouldn't happen with 270+ words), use full pool
      if (available.length < 25) available = [...wordPool];
    }
    const words = shuffleArray([...available]).slice(0, 25);
    const colorPool: Array<CodigoSecretoCell['color']> = [
      ...Array(9).fill('RED' as const),
      ...Array(8).fill('BLUE' as const),
      ...Array(7).fill('NEUTRAL' as const),
      'ASSASSIN' as const,
    ];
    const colors = shuffleArray(colorPool);
    const board = words.map((word, i) => ({ word, color: colors[i], revealed: false }));
    // When recycled, reset usedWords to only the current game's words
    const newUsedWords = recycled ? words : [...prevUsedWords, ...words];
    return { board, newUsedWords };
  }

  const updateCsLanguage = async (language: 'es' | 'en') => {
    if (!gameState.codigoSecreto) return;
    try {
      await updateDoc(doc(db, 'games', GAME_ID), {
        'codigoSecreto.language': language,
      });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  const randomizeCsTeams = async () => {
    if (!gameState.codigoSecreto || gameState.players.length === 0) return;
    const cs = gameState.codigoSecreto;
    const shuffled = shuffleArray([...gameState.players]);
    const teamRed: string[] = [];
    const teamBlue: string[] = [];
    shuffled.forEach((p, idx) => {
      if (idx % 2 === 0) teamRed.push(p.id);
      else teamBlue.push(p.id);
    });
    const spymasterRed = (cs.spymasterRed && teamRed.includes(cs.spymasterRed))
      ? cs.spymasterRed
      : (teamRed[0] || null);
    const spymasterBlue = (cs.spymasterBlue && teamBlue.includes(cs.spymasterBlue))
      ? cs.spymasterBlue
      : (teamBlue[0] || null);

    try {
      await updateDoc(doc(db, 'games', GAME_ID), {
        'codigoSecreto.teamRed': teamRed,
        'codigoSecreto.teamBlue': teamBlue,
        'codigoSecreto.spymasterRed': spymasterRed,
        'codigoSecreto.spymasterBlue': spymasterBlue,
      });
      toast.success("¡Equipos repartidos al azar!");
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  const joinCsTeam = async (team: 'RED' | 'BLUE') => {
    if (!userId || !gameState.codigoSecreto) return;
    const cs = gameState.codigoSecreto;
    const newTeamRed = team === 'RED'
      ? [...new Set([...cs.teamRed, userId])]
      : cs.teamRed.filter(id => id !== userId);
    const newTeamBlue = team === 'BLUE'
      ? [...new Set([...cs.teamBlue, userId])]
      : cs.teamBlue.filter(id => id !== userId);
    const spymasterRed = cs.spymasterRed === userId && team === 'BLUE' ? null : cs.spymasterRed;
    const spymasterBlue = cs.spymasterBlue === userId && team === 'RED' ? null : cs.spymasterBlue;
    try {
      await updateDoc(doc(db, 'games', GAME_ID), {
        codigoSecreto: { ...cs, teamRed: newTeamRed, teamBlue: newTeamBlue, spymasterRed, spymasterBlue },
      });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  const becomeCsSpymaster = async (team: 'RED' | 'BLUE') => {
    if (!userId || !gameState.codigoSecreto) return;
    const cs = gameState.codigoSecreto;
    const myTeam = cs.teamRed.includes(userId) ? 'RED' : cs.teamBlue.includes(userId) ? 'BLUE' : null;
    if (myTeam !== team) { toast.error('Únete al equipo primero'); return; }
    try {
      await updateDoc(doc(db, 'games', GAME_ID), {
        codigoSecreto: {
          ...cs,
          spymasterRed: team === 'RED' ? userId : cs.spymasterRed,
          spymasterBlue: team === 'BLUE' ? userId : cs.spymasterBlue,
        },
      });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  function normalizeWord(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  const submitCsClue = async () => {
    if (!userId || !gameState.codigoSecreto || !csClueWord.trim()) return;
    const cs = gameState.codigoSecreto;
    const isSpymasterRed = cs.spymasterRed === userId && cs.currentTeam === 'RED';
    const isSpymasterBlue = cs.spymasterBlue === userId && cs.currentTeam === 'BLUE';
    if ((!isSpymasterRed && !isSpymasterBlue) || cs.phase !== 'SPYMASTER_CLUE') return;

    const words = csClueWord.trim().split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      toast.error('La pista debe ser una sola palabra');
      return;
    }

    const cleanClue = normalizeWord(words[0]);
    const boardMatch = cs.board.find(c => {
      const bw = normalizeWord(c.word);
      return bw === cleanClue || bw + 's' === cleanClue || bw + 'es' === cleanClue || cleanClue + 's' === bw || cleanClue + 'es' === bw;
    });

    if (boardMatch) {
      toast.error(`"${boardMatch.word}" está en el tablero. No puedes usar palabras del tablero como pista.`);
      return;
    }

    try {
      await updateDoc(doc(db, 'games', GAME_ID), {
        codigoSecreto: {
          ...cs,
          clueWord: words[0].toUpperCase(),
          clueNumber: csClueNumber,
          guessesLeft: csClueNumber + 1,
          phase: 'TEAM_GUESS',
        },
      });
      setCsClueWord('');
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  const revealCsCell = async (cellIndex: number) => {
    if (!userId || !gameState.codigoSecreto) return;
    const cs = gameState.codigoSecreto;
    if (cs.phase !== 'TEAM_GUESS') return;
    if (cs.board[cellIndex].revealed) return;
    const myTeam = cs.teamRed.includes(userId) ? 'RED' : cs.teamBlue.includes(userId) ? 'BLUE' : null;
    const isSpymaster = userId === cs.spymasterRed || userId === cs.spymasterBlue;
    const teamMembers = cs.currentTeam === 'RED' ? cs.teamRed : cs.teamBlue;
    if (myTeam !== cs.currentTeam) return;
    // Spymasters cannot guess if their team has 2+ members; solo players can test/guess
    if (isSpymaster && teamMembers.length > 1) return;

    const newBoard = cs.board.map((c, i) => i === cellIndex ? { ...c, revealed: true } : c);
    const cell = cs.board[cellIndex];
    let phase = cs.phase;
    let currentTeam = cs.currentTeam;
    let wordsLeft = { ...cs.wordsLeft };
    let winner = cs.winner;
    let winnerReason: 'CARDS' | 'ASSASSIN' | null = null;
    let guessesLeft = cs.guessesLeft - 1;

    if (cell.color === 'ASSASSIN') {
      winner = cs.currentTeam === 'RED' ? 'BLUE' : 'RED';
      winnerReason = 'ASSASSIN';
      phase = 'GAME_OVER';
    } else if (cell.color === cs.currentTeam) {
      wordsLeft[cs.currentTeam === 'RED' ? 'red' : 'blue']--;
      if (wordsLeft[cs.currentTeam === 'RED' ? 'red' : 'blue'] <= 0) {
        winner = cs.currentTeam;
        winnerReason = 'CARDS';
        phase = 'GAME_OVER';
      } else if (guessesLeft <= 0) {
        phase = 'SPYMASTER_CLUE';
        currentTeam = cs.currentTeam === 'RED' ? 'BLUE' : 'RED';
      }
      // else stay in TEAM_GUESS with remaining guesses
    } else {
      if (cell.color === 'RED') wordsLeft.red--;
      else if (cell.color === 'BLUE') wordsLeft.blue--;
      const otherTeam = cs.currentTeam === 'RED' ? 'BLUE' : 'RED';
      if ((cell.color === 'RED' && wordsLeft.red <= 0) || (cell.color === 'BLUE' && wordsLeft.blue <= 0)) {
        winner = cell.color as 'RED' | 'BLUE';
        winnerReason = 'CARDS';
        phase = 'GAME_OVER';
      } else {
        phase = 'SPYMASTER_CLUE';
        currentTeam = otherTeam;
      }
    }

    const csUpdate: CodigoSecretoState = {
      ...cs, board: newBoard, phase, currentTeam, wordsLeft, winner, winnerReason, guessesLeft,
      ...(phase !== 'TEAM_GUESS' ? { clueWord: null, clueNumber: null } : {}),
    };

    try {
      await updateDoc(doc(db, 'games', GAME_ID), {
        codigoSecreto: csUpdate,
        ...(phase === 'GAME_OVER' ? { status: 'RESULTS' } : {}),
      });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  const endCsTurn = async () => {
    if (!userId || !gameState.codigoSecreto) return;
    const cs = gameState.codigoSecreto;
    if (cs.phase !== 'TEAM_GUESS') return;
    const myTeam = cs.teamRed.includes(userId) ? 'RED' : cs.teamBlue.includes(userId) ? 'BLUE' : null;
    if (myTeam !== cs.currentTeam) return;
    const nextTeam = cs.currentTeam === 'RED' ? 'BLUE' : 'RED';
    try {
      await updateDoc(doc(db, 'games', GAME_ID), {
        codigoSecreto: {
          ...cs,
          currentTeam: nextTeam,
          phase: 'SPYMASTER_CLUE',
          clueWord: null,
          clueNumber: null,
          guessesLeft: 0,
        },
      });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  const restartCsGame = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    const cs = gameState.codigoSecreto;
    if (!cs) return;
    const lang = cs.language || 'es';
    const prevUsed = cs.usedWords || [];
    const { board, newUsedWords } = buildCsBoard(lang, prevUsed);
    const wordsLeft = {
      red: board.filter(c => c.color === 'RED').length,
      blue: board.filter(c => c.color === 'BLUE').length,
    };
    try {
      await updateDoc(gameRef, {
        status: 'GAME',
        codigoSecreto: {
          ...cs,
          board,
          usedWords: newUsedWords,
          wordsLeft,
          currentTeam: 'RED',
          phase: 'SPYMASTER_CLUE',
          clueWord: null,
          clueNumber: null,
          guessesLeft: 0,
          winner: null,
          winnerReason: null,
        },
      });
      playSound(SOUNDS.START);
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };

  const exitCsToLobby = async () => {
    const gameRef = doc(db, 'games', GAME_ID);
    const cs = gameState.codigoSecreto;
    try {
      await updateDoc(gameRef, {
        status: 'LOBBY',
        codigoSecreto: cs ? {
          ...cs,
          board: [],
          phase: 'TEAM_SELECT',
          clueWord: null,
          clueNumber: null,
          guessesLeft: 0,
          winner: null,
          winnerReason: null,
        } : deleteField(),
      });
    } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
  };
  // ─── End Código Secreto helpers ────────────────────────────────────

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

    // Código Secreto start
    if (gameState.mode === 'CODIGO_SECRETO') {
      const cs = gameState.codigoSecreto;
      if (!cs) return;
      if (cs.teamRed.length < 1 || cs.teamBlue.length < 1) {
        toast.error('¡Ambos equipos necesitan al menos 1 jugador!');
        return;
      }
      const spymasterRed = (cs.spymasterRed && cs.teamRed.includes(cs.spymasterRed))
        ? cs.spymasterRed
        : cs.teamRed[0];
      const spymasterBlue = (cs.spymasterBlue && cs.teamBlue.includes(cs.spymasterBlue))
        ? cs.spymasterBlue
        : cs.teamBlue[0];

      const lang = cs.language || 'es';
      const prevUsed = cs.usedWords || [];
      const { board, newUsedWords } = buildCsBoard(lang, prevUsed);
      const wordsLeft = {
        red: board.filter(c => c.color === 'RED').length,
        blue: board.filter(c => c.color === 'BLUE').length,
      };
      try {
        await updateDoc(gameRef, {
          status: 'GAME',
          codigoSecreto: {
            ...cs,
            spymasterRed,
            spymasterBlue,
            board,
            usedWords: newUsedWords,
            wordsLeft,
            currentTeam: 'RED',
            phase: 'SPYMASTER_CLUE',
            clueWord: null,
            clueNumber: null,
            guessesLeft: 0,
            winner: null,
            winnerReason: null,
          },
        });
        playSound(SOUNDS.START);
      } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`); }
      return;
    }
    
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
        currentRound: gameState.mode === 'PAPELITO' ? 1 : deleteField(),
        isShowingWinner: false
      });
      playSound(SOUNDS.ROUND_START);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `games/${GAME_ID}`);
    }
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
        currentRound: gameState.mode === 'PAPELITO' ? 1 : deleteField(),
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
              onClick={() => setShowInstructions(true)}
              className="p-1 hover:bg-[#3C48C3]/20 rounded-full transition-all text-[#3C48C3]"
              title="Reglas del juego"
            >
              <HelpCircle size={14} />
            </button>
            <button 
              onClick={shareRoom}
              className="p-1 hover:bg-[#3C48C3]/20 rounded-full transition-all text-[#3C48C3]"
              title="Compartir link de la partida"
            >
              <Share2 size={14} />
            </button>
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
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => updateMode('PAPELITO')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer hover:scale-102 active:scale-95 ${gameState.mode === 'PAPELITO' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-neutral-900 border-neutral-800 opacity-60 hover:opacity-100'}`}
                >
                  <Star size={20} className={gameState.mode === 'PAPELITO' ? 'text-emerald-500' : 'text-neutral-400'} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Papelito</span>
                </button>
                <button 
                  onClick={() => updateMode('HOLIS')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer hover:scale-102 active:scale-95 ${gameState.mode === 'HOLIS' ? 'bg-[#3C48C3]/10 border-[#3C48C3] shadow-[0_0_15px_rgba(60,72,195,0.3)]' : 'bg-neutral-900 border-neutral-800 opacity-60 hover:opacity-100'}`}
                >
                  <Flame size={20} className={gameState.mode === 'HOLIS' ? 'text-[#3C48C3]' : 'text-neutral-400'} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Holis</span>
                </button>
                <button 
                  onClick={() => updateMode('CODIGO_SECRETO')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer hover:scale-102 active:scale-95 ${gameState.mode === 'CODIGO_SECRETO' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-neutral-900 border-neutral-800 opacity-60 hover:opacity-100'}`}
                >
                  <Shield size={20} className={gameState.mode === 'CODIGO_SECRETO' ? 'text-amber-500' : 'text-neutral-400'} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Código</span>
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

            {gameState.mode === 'CODIGO_SECRETO' && gameState.codigoSecreto && (
              <div className="space-y-4">
                {/* Language Picker */}
                <div className="bg-[#111113] p-4 rounded-[2rem] border border-neutral-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                      <Globe size={13} /> Idioma de las Palabras
                    </span>
                    <span className="text-[8px] font-mono text-neutral-500 font-bold uppercase">25 cartas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateCsLanguage('es')}
                      className={`py-2 px-3 rounded-xl border text-xs font-headline font-black flex items-center justify-center gap-2 transition-all ${
                        gameState.codigoSecreto.language !== 'en'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>🇪🇸 Español</span>
                    </button>
                    <button
                      onClick={() => updateCsLanguage('en')}
                      className={`py-2 px-3 rounded-xl border text-xs font-headline font-black flex items-center justify-center gap-2 transition-all ${
                        gameState.codigoSecreto.language === 'en'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>🇺🇸 English</span>
                    </button>
                  </div>
                </div>

                {/* Team Selection Panel */}
                <div className="bg-[#111113] p-4 rounded-[2rem] border border-neutral-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                      <Swords size={13} /> Elige tu Equipo
                    </h3>
                    {myPlayer?.isHost && (
                      <button
                        onClick={randomizeCsTeams}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[8px] font-headline font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                        title="Repartir jugadores al azar entre rojo y azul"
                      >
                        <Shuffle size={10} /> Repartir azar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* RED TEAM */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      gameState.codigoSecreto.teamRed.includes(userId || '')
                        ? 'bg-red-500/10 border-red-500'
                        : 'bg-neutral-900/60 border-neutral-800'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-headline font-black text-xs uppercase text-red-400 flex items-center gap-1.5">
                          🔴 Equipo Rojo
                        </span>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                          {gameState.codigoSecreto.teamRed.length} {gameState.codigoSecreto.teamRed.length === 1 ? 'jugador' : 'jugadores'}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => joinCsTeam('RED')}
                          disabled={gameState.codigoSecreto.teamRed.includes(userId || '')}
                          className={`flex-1 py-1.5 rounded-xl font-headline font-black text-[9px] uppercase transition-all ${
                            gameState.codigoSecreto.teamRed.includes(userId || '')
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40 cursor-default'
                              : 'bg-red-600 hover:bg-red-500 text-white active:scale-95 cursor-pointer shadow-md'
                          }`}
                        >
                          {gameState.codigoSecreto.teamRed.includes(userId || '') ? '✓ En el Rojo' : 'Unirme al Rojo'}
                        </button>
                        {gameState.codigoSecreto.teamRed.includes(userId || '') && (
                          <button
                            onClick={() => becomeCsSpymaster('RED')}
                            disabled={gameState.codigoSecreto.spymasterRed === userId}
                            className={`px-3 py-1.5 rounded-xl text-[8px] font-headline font-black uppercase tracking-wider transition-all border ${
                              gameState.codigoSecreto.spymasterRed === userId
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                            }`}
                          >
                            {gameState.codigoSecreto.spymasterRed === userId ? '👑 Eres Jefe' : 'Ser Jefe 🕵️'}
                          </button>
                        )}
                      </div>

                      {/* Red members list */}
                      <div className="flex flex-wrap gap-1.5">
                        {gameState.codigoSecreto.teamRed.map(pid => {
                          const p = gameState.players.find(pl => pl.id === pid);
                          if (!p) return null;
                          const isSpy = gameState.codigoSecreto?.spymasterRed === pid;
                          return (
                            <div key={pid} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[9px]">
                              <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full" />
                              <span className="text-white font-bold truncate max-w-[80px]">{p.name}</span>
                              {isSpy && (
                                <span className="text-[7px] font-black uppercase px-1 rounded bg-amber-500/20 text-amber-400">
                                  JEFE
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* BLUE TEAM */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      gameState.codigoSecreto.teamBlue.includes(userId || '')
                        ? 'bg-blue-500/10 border-blue-500'
                        : 'bg-neutral-900/60 border-neutral-800'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-headline font-black text-xs uppercase text-blue-400 flex items-center gap-1.5">
                          🔵 Equipo Azul
                        </span>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                          {gameState.codigoSecreto.teamBlue.length} {gameState.codigoSecreto.teamBlue.length === 1 ? 'jugador' : 'jugadores'}
                        </span>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => joinCsTeam('BLUE')}
                          disabled={gameState.codigoSecreto.teamBlue.includes(userId || '')}
                          className={`flex-1 py-1.5 rounded-xl font-headline font-black text-[9px] uppercase transition-all ${
                            gameState.codigoSecreto.teamBlue.includes(userId || '')
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95 cursor-pointer shadow-md'
                          }`}
                        >
                          {gameState.codigoSecreto.teamBlue.includes(userId || '') ? '✓ En el Azul' : 'Unirme al Azul'}
                        </button>
                        {gameState.codigoSecreto.teamBlue.includes(userId || '') && (
                          <button
                            onClick={() => becomeCsSpymaster('BLUE')}
                            disabled={gameState.codigoSecreto.spymasterBlue === userId}
                            className={`px-3 py-1.5 rounded-xl text-[8px] font-headline font-black uppercase tracking-wider transition-all border ${
                              gameState.codigoSecreto.spymasterBlue === userId
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                            }`}
                          >
                            {gameState.codigoSecreto.spymasterBlue === userId ? '👑 Eres Jefe' : 'Ser Jefe 🕵️'}
                          </button>
                        )}
                      </div>

                      {/* Blue members list */}
                      <div className="flex flex-wrap gap-1.5">
                        {gameState.codigoSecreto.teamBlue.map(pid => {
                          const p = gameState.players.find(pl => pl.id === pid);
                          if (!p) return null;
                          const isSpy = gameState.codigoSecreto?.spymasterBlue === pid;
                          return (
                            <div key={pid} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[9px]">
                              <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full" />
                              <span className="text-white font-bold truncate max-w-[80px]">{p.name}</span>
                              {isSpy && (
                                <span className="text-[7px] font-black uppercase px-1 rounded bg-amber-500/20 text-amber-400">
                                  JEFE
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Unassigned pill */}
                  {(() => {
                    const unassigned = gameState.players.filter(
                      p => !gameState.codigoSecreto?.teamRed.includes(p.id) && !gameState.codigoSecreto?.teamBlue.includes(p.id)
                    );
                    if (unassigned.length === 0) return null;
                    return (
                      <div className="text-center py-1.5 px-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-[8px] text-neutral-400">
                        Pendientes de equipo: {unassigned.map(u => u.name).join(', ')}
                      </div>
                    );
                  })()}
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

              <button
                onClick={shareRoom}
                className="w-full py-2.5 px-3 rounded-xl bg-[#3C48C3]/15 hover:bg-[#3C48C3]/25 border border-[#3C48C3]/30 text-white text-xs font-headline font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Share2 size={15} className="text-[#3C48C3]" />
                <span>Invitar amigos (Copiar link)</span>
              </button>
              
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
                    {gameState.mode === 'CODIGO_SECRETO' && gameState.codigoSecreto && (
                      <span className={`text-[8px] font-headline font-black px-2.5 py-1 rounded-full border ${
                        gameState.codigoSecreto.teamRed.includes(p.id)
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : gameState.codigoSecreto.teamBlue.includes(p.id)
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                      }`}>
                        {gameState.codigoSecreto.teamRed.includes(p.id) ? '🔴 ROJO' :
                         gameState.codigoSecreto.teamBlue.includes(p.id) ? '🔵 AZUL' : 'SIN EQUIPO'}
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

  // ─── renderCodigoSecreto ────────────────────────────────────────────
  const renderCodigoSecreto = () => {
    const cs = gameState.codigoSecreto;
    if (!cs || !cs.board.length) return null;

    const myTeam = cs.teamRed.includes(userId || '') ? 'RED' : cs.teamBlue.includes(userId || '') ? 'BLUE' : null;
    const isMySpymaster = userId === cs.spymasterRed || userId === cs.spymasterBlue;
    const isMyTurn = myTeam === cs.currentTeam;
    const teamMembers = cs.currentTeam === 'RED' ? cs.teamRed : cs.teamBlue;
    const canReveal = isMyTurn && (teamMembers.length === 1 || !isMySpymaster) && cs.phase === 'TEAM_GUESS';
    const isMySpymasterTurn = isMySpymaster && isMyTurn && cs.phase === 'SPYMASTER_CLUE';
    const canEndTurn = isMyTurn && (teamMembers.length === 1 || !isMySpymaster) && cs.phase === 'TEAM_GUESS';

    const teamColor = { RED: 'text-red-400', BLUE: 'text-blue-400' };
    const teamBg = { RED: 'bg-red-500/10 border-red-500', BLUE: 'bg-blue-500/10 border-blue-500' };
    const teamGlow = { RED: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]', BLUE: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]' };

    const cellColor = (cell: { color: string; revealed: boolean }, showColor: boolean) => {
      const c = cell.color;
      if (cell.revealed) {
        if (c === 'RED') return 'bg-red-600 border-red-500 text-white font-black shadow-lg';
        if (c === 'BLUE') return 'bg-blue-600 border-blue-500 text-white font-black shadow-lg';
        if (c === 'ASSASSIN') return 'bg-black border-red-700 text-red-500 font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]';
        return 'bg-neutral-700 border-neutral-600 text-neutral-300';
      }
      if (showColor) {
        if (c === 'RED') return 'bg-red-950/70 border-red-500/60 text-red-200 hover:border-red-400';
        if (c === 'BLUE') return 'bg-blue-950/70 border-blue-500/60 text-blue-200 hover:border-blue-400';
        if (c === 'ASSASSIN') return 'bg-neutral-950 border-neutral-600 text-neutral-400 hover:border-neutral-500';
        return 'bg-neutral-900/60 border-neutral-700/50 text-neutral-400 hover:border-neutral-600';
      }
      return 'bg-neutral-900 border-neutral-800 hover:border-neutral-600 text-white hover:bg-neutral-850';
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl p-2 sm:p-4 flex flex-col gap-3 items-center select-none"
      >
        {/* Header: teams + words left */}
        <div className={`w-full flex items-center justify-between bg-[#111113] p-3 rounded-2xl border ${isMyTurn ? teamBg[cs.currentTeam] : 'border-neutral-800'} ${isMyTurn ? teamGlow[cs.currentTeam] : ''} transition-all`}>
          <div className="flex items-center gap-2">
            <Swords size={16} className={teamColor[cs.currentTeam]} />
            <span className={`font-headline font-black text-xs uppercase ${teamColor[cs.currentTeam]}`}>
              Turno: {cs.currentTeam === 'RED' ? 'Equipo Rojo' : 'Equipo Azul'}
            </span>
            {isMyTurn && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[8px] font-black uppercase animate-pulse">TU TURNO</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-400 font-headline font-black text-xs">🔴 {cs.wordsLeft.red}</span>
            <span className="text-blue-400 font-headline font-black text-xs">🔵 {cs.wordsLeft.blue}</span>
          </div>
        </div>

        {/* Active clue or spymaster input */}
        {cs.phase === 'SPYMASTER_CLUE' && isMySpymasterTurn && (() => {
          const words = csClueWord.trim().split(/\s+/).filter(Boolean);
          const isMultiWord = words.length > 1;
          const cleanClue = words[0] ? normalizeWord(words[0]) : '';
          const boardMatch = cleanClue ? cs.board.find(c => {
            const bw = normalizeWord(c.word);
            return bw === cleanClue || bw + 's' === cleanClue || bw + 'es' === cleanClue || cleanClue + 's' === bw || cleanClue + 'es' === bw;
          }) : null;
          const isInvalid = isMultiWord || Boolean(boardMatch) || !csClueWord.trim();

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-[#111113] border border-amber-500/30 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                  <Eye size={12} /> Jefe de Espías — Da tu pista
                </p>
                <span className="text-[8px] text-neutral-500 font-mono">1 palabra + cantidad</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={csClueWord}
                  onChange={e => setCsClueWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isInvalid && submitCsClue()}
                  placeholder="Una sola palabra..."
                  className={`flex-1 bg-neutral-900 border rounded-lg px-3 py-2 text-sm font-bold uppercase text-white outline-none transition-all ${
                    boardMatch || isMultiWord ? 'border-red-500 text-red-300' : 'border-neutral-700 focus:border-amber-500'
                  }`}
                />
                <div className="flex gap-1">
                  {[1,2,3,4,5,6].map(n => (
                    <button
                      key={n}
                      onClick={() => setCsClueNumber(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all border ${
                        csClueNumber === n ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                      }`}
                    >{n}</button>
                  ))}
                </div>
                <button
                  onClick={submitCsClue}
                  disabled={isInvalid}
                  className="px-4 py-2 bg-amber-500 hover:brightness-110 active:scale-95 text-black font-headline font-black text-xs uppercase rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Dar pista
                </button>
              </div>

              {boardMatch && (
                <p className="text-[10px] font-bold text-red-400 flex items-center gap-1 animate-pulse">
                  ⚠️ "{boardMatch.word}" está en el tablero. No puedes usar palabras del tablero como pista.
                </p>
              )}
              {isMultiWord && (
                <p className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  ⚠️ La pista debe ser una sola palabra (sin espacios).
                </p>
              )}
            </motion.div>
          );
        })()}

        {cs.phase === 'SPYMASTER_CLUE' && !isMySpymasterTurn && (
          <div className={`w-full text-center py-3 px-4 rounded-2xl bg-[#111113] border border-neutral-800`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Esperando pista del Jefe de Espías {cs.currentTeam === 'RED' ? '🔴' : '🔵'}...
            </p>
          </div>
        )}

        {cs.phase === 'TEAM_GUESS' && cs.clueWord && (
          <div className={`w-full flex items-center justify-between py-3 px-4 rounded-2xl border ${
            cs.currentTeam === 'RED' ? 'bg-red-500/5 border-red-500/30' : 'bg-blue-500/5 border-blue-500/30'
          }`}>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Pista activa</p>
              <p className={`font-headline font-black text-2xl uppercase ${teamColor[cs.currentTeam]}`}>
                {cs.clueWord}
                <span className="ml-2 text-base text-neutral-400">· {cs.clueNumber}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Intentos</p>
              <p className={`font-headline font-black text-xl ${teamColor[cs.currentTeam]}`}>{cs.guessesLeft}</p>
            </div>
          </div>
        )}

        {/* Spymaster toggle */}
        {isMySpymaster && (
          <button
            onClick={() => setCsShowSpymasterView(v => !v)}
            className={`self-end flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${
              csShowSpymasterView ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}
          >
            {csShowSpymasterView ? <Eye size={10} /> : <EyeOff size={10} />}
            Vista Jefe de Espías
          </button>
        )}

        {/* 5x5 Board */}
        <div className="w-full grid grid-cols-5 gap-1.5 sm:gap-2">
          {cs.board.map((cell, idx) => {
            const showColor = isMySpymaster && csShowSpymasterView;
            const revealed = cell.revealed;
            const clickable = canReveal && !revealed;
            return (
              <motion.button
                key={idx}
                onClick={() => clickable && revealCsCell(idx)}
                whileHover={clickable ? { scale: 1.04 } : {}}
                whileTap={clickable ? { scale: 0.97 } : {}}
                disabled={!clickable}
                className={`relative rounded-xl border-2 py-3 sm:py-4 px-1 flex flex-col items-center justify-center gap-1 transition-all ${
                  cellColor(cell, showColor)
                } ${
                  clickable ? 'cursor-pointer shadow-md' : 'cursor-default'
                } ${
                  revealed ? 'opacity-60' : ''
                }`}
              >
                {revealed && cell.color === 'ASSASSIN' && (
                  <span className="text-base">☠️</span>
                )}
                <span className={`font-headline font-black text-center leading-tight ${
                  cell.word.length > 8 ? 'text-[7px] sm:text-[8px]' : 'text-[8px] sm:text-[9px]'
                } uppercase tracking-tight`}>
                  {cell.word}
                </span>
                {showColor && !revealed && (
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    cell.color === 'RED' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' :
                    cell.color === 'BLUE' ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]' :
                    cell.color === 'ASSASSIN' ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]' :
                    'bg-neutral-500'
                  }`} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* End turn button */}
        {canEndTurn && (
          <button
            onClick={endCsTurn}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border font-headline font-black text-xs uppercase transition-all ${
              cs.currentTeam === 'RED'
                ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
                : 'bg-blue-500/10 border-blue-500/40 text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            <SkipForward size={14} /> Pasar turno
          </button>
        )}

        <button
          onClick={resetGame}
          className="py-2 px-5 bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white rounded-xl text-[10px] font-headline font-black uppercase tracking-widest transition-all"
        >
          Salir
        </button>
      </motion.div>
    );
  };
  // ─── End renderCodigoSecreto ───────────────────────────────────────

  const renderGame = () => {
    // Dispatch to CS renderer
    if (gameState.mode === 'CODIGO_SECRETO') return renderCodigoSecreto();

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

  const renderCsResults = () => {
    const cs = gameState.codigoSecreto;
    if (!cs) return null;
    const isRedWinner = cs.winner === 'RED';
    const myPlayer = gameState.players.find(p => p.id === userId);
    const isHost = myPlayer?.isHost;

    const redPlayers = gameState.players.filter(p => cs.teamRed.includes(p.id));
    const bluePlayers = gameState.players.filter(p => cs.teamBlue.includes(p.id));
    const winningPlayers = isRedWinner ? redPlayers : bluePlayers;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full p-6 sm:p-8 bg-[#111113] rounded-[2.5rem] border-2 border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.15)] text-center space-y-6 sm:space-y-8"
      >
        <div className="space-y-3">
          <Trophy size={64} className={`mx-auto drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] ${isRedWinner ? 'text-red-500' : 'text-blue-500'}`} />
          <h2 className="font-headline text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white">
            {isRedWinner ? '🔴 ¡EQUIPO ROJO GANÓ!' : '🔵 ¡EQUIPO AZUL GANÓ!'}
          </h2>
          <div className="inline-block px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-headline font-black uppercase tracking-wider text-neutral-300">
            {cs.winnerReason === 'ASSASSIN'
              ? '☠️ El equipo rival contactó al Asesino Secreto'
              : '🎯 ¡Descubrieron todos los agentes de su equipo!'}
          </div>
        </div>

        {/* Agentes de la victoria */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
            Agentes Victoriosos
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {winningPlayers.map(p => {
              const isSpy = p.id === (isRedWinner ? cs.spymasterRed : cs.spymasterBlue);
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    isRedWinner ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full border border-neutral-700" />
                  <div className="text-left truncate">
                    <p className="font-headline font-black text-xs text-white truncate">{p.name}</p>
                    <p className="text-[8px] font-bold text-amber-400 uppercase tracking-tight">
                      {isSpy ? '🕵️ Jefe de Espías' : 'Agente Operativo'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Words remaining summary */}
        <div className="flex items-center justify-center gap-6 py-3 px-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-red-400 block">Rojo Restantes</span>
            <span className="font-headline font-black text-xl text-white">{cs.wordsLeft.red}</span>
          </div>
          <div className="w-px h-8 bg-neutral-800" />
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block">Azul Restantes</span>
            <span className="font-headline font-black text-xl text-white">{cs.wordsLeft.blue}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pt-2">
          {isHost ? (
            <>
              <button 
                onClick={restartCsGame}
                className="w-full py-4 bg-amber-500 hover:brightness-110 active:scale-95 text-black font-headline font-black text-lg uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                NUEVA PARTIDA 🚀
              </button>
              <button 
                onClick={exitCsToLobby}
                className="w-full py-3.5 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white font-headline font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                VOLVER AL LOBBY
              </button>
            </>
          ) : (
            <div className="w-full py-4 bg-neutral-900 border border-neutral-800 text-neutral-400 font-headline font-bold text-center text-sm rounded-2xl">
              ESPERANDO QUE EL HOST REINICIE O VUELVA AL LOBBY...
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    if (gameState.mode === 'CODIGO_SECRETO' && gameState.codigoSecreto) {
      return renderCsResults();
    }

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
                {gameState.mode === 'CODIGO_SECRETO' ? (
                  <>
                    <div className="space-y-1.5 pr-8">
                      <span className="font-sans text-[10px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md uppercase">
                        ¿Cómo jugar Código Secreto? 🕵️‍♂️
                      </span>
                      <h3 className="font-headline text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mt-2">
                        Espías &amp; Agentes Secretos
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-neutral-400">
                        Dos equipos (🔴 Rojo y 🔵 Azul) compiten por descifrar sus palabras clave en el tablero de 25 cartas antes que el rival.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                        <span className="font-headline font-black text-xs text-amber-400 bg-amber-500/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                          1
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Jefes de Espías • Dan la pista</p>
                          <p className="font-sans text-xs text-neutral-400">
                            Solo el Jefe de Espías ve qué palabras pertenecen a su equipo. En su turno, da una pista de **1 sola palabra y 1 número** (ej. "AGUA · 2").
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-neutral-800/50">
                        <span className="font-headline font-black text-xs text-amber-400 bg-amber-500/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                          2
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-headline text-xs font-bold uppercase tracking-wider text-white">Agentes Operativos • Adivinan</p>
                          <p className="font-sans text-xs text-neutral-400">
                            Los agentes tocan las cartas que creen correctas. Si aciertan, pueden seguir adivinando. Si eligen neutral o del rival, su turno finaliza.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start bg-neutral-900/40 p-3 sm:p-4 rounded-2xl border border-red-500/30 bg-red-500/5">
                        <span className="font-headline font-black text-xs text-red-400 bg-red-500/15 w-6 h-6 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                          ☠️
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-headline text-xs font-bold uppercase tracking-wider text-red-400">¡Cuidado con el Asesino!</p>
                          <p className="font-sans text-xs text-neutral-400">
                            Hay 1 carta negra (el Asesino). Si algún equipo la toca, ¡pierde la partida al instante!
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] transition-all text-black font-headline font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] block text-center cursor-pointer"
                >
                  Entendido • ¡A jugar! 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
