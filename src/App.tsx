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
import { io } from 'socket.io-client';
import { GoogleGenAI, Type } from "@google/genai";
import { Player, GameCard, GameState, DEFAULT_CARDS, PREDEFINED_PLAYERS } from './types';

const socket = io();

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    status: 'HOME',
    players: [],
    cards: [],
    currentCardIndex: 0,
    timer: 60,
    isChaosMode: true,
    isPenaltyMode: false,
    currentTurnPlayerId: null,
    readyCount: 0,
  });

  const [selectedNickname, setSelectedNickname] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("game:state", (state: GameState) => setGameState(state));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("game:state");
    };
  }, []);

  const joinGame = (name: string) => {
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;
    socket.emit("player:join", { name, avatar });
    setSelectedNickname(name);
  };

  const setReady = () => {
    socket.emit("player:ready");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Genera una lista de 20 cartas para un juego de fiesta basado en este texto: "${text}". 
          Devuelve un JSON con este formato: [{ "category": "TITULO", "content": "DESCRIPCION", "emoji": "EMOJI" }]`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  content: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                },
                required: ["category", "content", "emoji"],
              },
            },
          },
        });

        const newCards = JSON.parse(response.text).map((c: any, i: number) => ({ ...c, id: `ai-${i}` }));
        socket.emit("game:update_cards", newCards);
      } catch (error) {
        console.error("Error generating cards:", error);
        alert("Error al generar cartas con IA. Usando mazo por defecto.");
        socket.emit("game:update_cards", DEFAULT_CARDS);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const useDemoCards = () => {
    socket.emit("game:update_cards", DEFAULT_CARDS);
  };

  const updateMode = (mode: 'CHAOS' | 'PENALTY') => {
    socket.emit("game:update_status", 'LOBBY', mode);
  };

  const voteWinner = (winnerId: string) => {
    socket.emit("game:vote", winnerId);
  };

  const myPlayer = gameState.players.find(p => p.id === socket.id);
  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  const isMyTurn = gameState.currentTurnPlayerId === socket.id;

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl w-full p-8 space-y-12 text-center"
    >
      <div className="space-y-4">
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-block"
        >
          <Gamepad2 size={80} className="text-[#ff89ab] mx-auto drop-shadow-[0_0_15px_rgba(255,137,171,0.5)]" />
        </motion.div>
        <h1 className="text-7xl font-black italic text-[#ff89ab] font-headline tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,137,171,0.4)]">
          Holis fun party 🔥
        </h1>
        <p className="text-xl text-on-surface-variant font-body max-w-lg mx-auto">
          ¿Quién eres hoy? Elige tu personaje para entrar al desmadre.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {PREDEFINED_PLAYERS.map((name) => {
          const isTaken = gameState.players.some(p => p.name === name);
          return (
            <button
              key={name}
              disabled={isTaken}
              onClick={() => joinGame(name)}
              className={`group relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                isTaken 
                  ? 'opacity-50 grayscale cursor-not-allowed border-outline-variant bg-surface-container-low' 
                  : 'border-primary/30 bg-surface-container-high hover:border-primary hover:scale-105 hover:shadow-[0_0_20px_rgba(255,137,171,0.2)]'
              }`}
            >
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
                alt={name}
                className="w-16 h-16 rounded-full bg-surface-variant"
              />
              <span className="font-headline font-black uppercase text-sm tracking-tight text-on-surface">{name}</span>
              {isTaken && <span className="absolute top-2 right-2 text-[10px] bg-outline-variant text-on-surface-variant px-2 py-0.5 rounded-full font-black uppercase">Ocupado</span>}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderLobby = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6"
    >
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-surface-container-high rounded-[2.5rem] p-8 border-2 border-primary/20 shadow-2xl space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-on-surface">
              La Banda <span className="text-primary">Conectada</span>
            </h2>
            <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-full border border-outline-variant/30">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-tertiary animate-pulse' : 'bg-error'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gameState.players.map((player) => (
              <motion.div 
                layout
                key={player.id}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  player.isReady ? 'bg-tertiary/10 border-tertiary' : 'bg-surface-container-highest border-outline-variant/30'
                }`}
              >
                <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full border-2 border-primary/20" />
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-black text-on-surface truncate uppercase text-sm">{player.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${player.isReady ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                    {player.isReady ? 'LISTO 🔥' : 'ESPERANDO...'}
                  </p>
                </div>
                {player.isReady && <Check size={16} className="text-tertiary" />}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-3 p-6 bg-surface-container-low border-2 border-dashed border-primary/30 rounded-3xl hover:border-primary hover:bg-surface-container-highest transition-all group"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                <Upload className="text-primary group-hover:scale-110 transition-transform" />
              )}
              <div className="text-left">
                <p className="font-headline font-black uppercase text-sm text-on-surface">Subir Archivo .txt</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-black">Generar cartas con IA</p>
              </div>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt" className="hidden" />

            <button 
              onClick={useDemoCards}
              className="flex items-center justify-center gap-3 p-6 bg-surface-container-low border-2 border-dashed border-tertiary/30 rounded-3xl hover:border-tertiary hover:bg-surface-container-highest transition-all group"
            >
              <Star className="text-tertiary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-headline font-black uppercase text-sm text-on-surface">Usar Demo</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-black">Mazo predefinido</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-surface-container-high rounded-[2.5rem] p-8 border-2 border-primary/20 shadow-2xl flex flex-col gap-6">
          <h3 className="font-headline text-2xl font-black uppercase tracking-tighter text-on-surface">Configuración</h3>
          
          <div className="space-y-4">
            <button 
              onClick={() => updateMode('CHAOS')}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                gameState.isChaosMode ? 'bg-primary/10 border-primary' : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className={gameState.isChaosMode ? 'text-primary' : 'text-on-surface-variant'} />
                <span className="font-headline font-black uppercase text-sm">Modo Caos</span>
              </div>
              {gameState.isChaosMode && <Check size={16} className="text-primary" />}
            </button>

            <button 
              onClick={() => updateMode('PENALTY')}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                gameState.isPenaltyMode ? 'bg-error/10 border-error' : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Skull className={gameState.isPenaltyMode ? 'text-error' : 'text-on-surface-variant'} />
                <span className="font-headline font-black uppercase text-sm">Modo Penalty</span>
              </div>
              {gameState.isPenaltyMode && <Check size={16} className="text-error" />}
            </button>
          </div>

          <div className="mt-auto pt-6">
            <button 
              onClick={setReady}
              disabled={myPlayer?.isReady}
              className={`w-full py-6 rounded-3xl font-headline font-black text-2xl uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${
                myPlayer?.isReady 
                  ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed' 
                  : 'bg-primary text-on-primary-fixed hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,137,171,0.4)]'
              }`}
            >
              {myPlayer?.isReady ? '¡ESTÁS LISTO! 🔥' : 'ESTOY LISTO'}
            </button>
            <p className="text-center mt-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {gameState.readyCount} / {gameState.players.length} jugadores listos
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderGame = () => {
    const currentCard = gameState.cards[gameState.currentCardIndex];
    if (!currentCard) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl w-full p-6 flex flex-col items-center gap-8"
      >
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3 bg-surface-container-high px-6 py-3 rounded-full border border-primary/20 shadow-xl">
            <Timer className="text-primary" size={20} />
            <span className="font-headline font-black text-2xl text-on-surface">{gameState.timer}s</span>
          </div>
          
          <div className="flex items-center gap-3 bg-surface-container-high px-6 py-3 rounded-full border border-primary/20 shadow-xl">
            {gameState.isChaosMode ? <Flame className="text-primary" size={20} /> : <Skull className="text-error" size={20} />}
            <span className="font-headline font-black text-sm uppercase tracking-widest text-on-surface">
              {gameState.isChaosMode ? 'Modo Caos 🔥' : 'Modo Penalty 💀'}
            </span>
          </div>
        </div>

        <motion.div 
          key={gameState.currentCardIndex}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className="w-full aspect-[4/3] max-w-2xl bg-surface-container-high rounded-[3rem] border-4 border-primary/30 shadow-[0_0_60px_rgba(255,137,171,0.15)] p-12 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-primary/20">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((gameState.currentCardIndex + 1) / gameState.cards.length) * 100}%` }}
            />
          </div>

          <span className="text-8xl">{currentCard.emoji}</span>
          <div className="space-y-4">
            <h4 className="font-headline text-xl font-black uppercase tracking-[0.2em] text-primary">{currentCard.category}</h4>
            <p className="font-headline text-4xl md:text-5xl font-black text-on-surface leading-tight tracking-tighter italic">
              "{currentCard.content}"
            </p>
            {currentCard.tabooWords && (
              <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-error mb-2">Palabras Prohibidas:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentCard.tabooWords.map(word => (
                    <span key={word} className="bg-error text-on-error px-3 py-1 rounded-full text-xs font-bold uppercase">{word}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="w-full bg-surface-container-high rounded-[2.5rem] p-8 border-2 border-primary/20 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
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
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">¡Es tu turno de elegir ganador!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {gameState.players.map((player) => (
              <button
                key={player.id}
                disabled={!isMyTurn}
                onClick={() => voteWinner(player.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                  isMyTurn 
                    ? 'border-primary/30 bg-surface-container-low hover:border-primary hover:scale-105' 
                    : 'border-outline-variant/20 bg-surface-container-low opacity-80'
                }`}
              >
                <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-tight text-on-surface truncate w-full text-center">{player.name}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full p-8 bg-surface-container-high rounded-[3rem] border-4 border-primary/30 shadow-[0_0_80px_rgba(255,137,171,0.2)] text-center space-y-10"
      >
        <div className="space-y-4">
          <Trophy size={80} className="text-tertiary mx-auto drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
          <h2 className="font-headline text-5xl font-black uppercase tracking-tighter text-on-surface">Puntuaciones Finales</h2>
        </div>

        <div className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              key={player.id}
              className={`flex items-center justify-between p-6 rounded-3xl border-2 ${
                index === 0 ? 'bg-tertiary/10 border-tertiary' : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <div className="flex items-center gap-6">
                <span className="font-headline font-black text-3xl text-on-surface-variant w-8">{index + 1}</span>
                <img src={player.avatar} alt={player.name} className="w-16 h-16 rounded-full border-2 border-primary/20" />
                <span className="font-headline font-black text-2xl text-on-surface uppercase">{player.name}</span>
              </div>
              <div className="text-right">
                <span className="font-headline font-black text-3xl text-primary">{player.score}</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Puntos</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => socket.emit("game:restart")}
          className="w-full py-6 bg-primary text-on-primary-fixed font-headline font-black text-2xl rounded-3xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          VOLVER AL LOBBY 🔥
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-on-surface font-body selection:bg-primary/30 overflow-x-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-full h-full neon-glow-pink animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full neon-glow-cyan animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-[#0e0e0e]/80 backdrop-blur-xl shadow-[0_0_20px_rgba(255,137,171,0.15)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => socket.emit("game:update_status", 'HOME')}>
          <Gamepad2 className="text-[#ff89ab]" size={24} />
          <h1 className="text-xl font-black italic text-[#ff89ab] drop-shadow-[0_0_10px_rgba(255,137,171,0.5)] font-headline tracking-tighter uppercase">
            Holis fun party 🔥
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
                            {player.name} {player.id === socket.id && <span className="text-[10px] text-primary">(Tú)</span>}
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
          {gameState.status === 'HOME' && renderHome()}
          {gameState.status === 'LOBBY' && renderLobby()}
          {gameState.status === 'GAME' && renderGame()}
          {gameState.status === 'RESULTS' && renderResults()}
        </AnimatePresence>
      </main>
    </div>
  );
}
