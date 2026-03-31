import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Users, Trophy, Timer, Flame, Skull, Upload, Star, Check } from 'lucide-react';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Player, GameState, DEFAULT_CARDS, PREDEFINED_PLAYERS } from './types';
import { db, auth, loginAnonymously } from './firebase';

const GAME_ID = 'global-party';

export default function App() {

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

  const [userId, setUserId] = useState<string | null>(null);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loginAnonymously();
  }, []);

  // LISTENER
  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, 'games', GAME_ID);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setGameState(snap.data() as GameState);
      } else {
        setDoc(ref, {
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
      }
    });

    return () => unsub();
  }, [userId]);

  // TIMER FIXED
  useEffect(() => {
    if (gameState.status !== 'GAME' || !userId) return;

    const isHost = gameState.players[0]?.id === userId;
    if (!isHost) return;

    const interval = setInterval(() => {
      updateDoc(doc(db, 'games', GAME_ID), {
        timer: gameState.timer > 0 ? gameState.timer - 1 : 0
      });

      if (gameState.timer <= 1) {
        updateDoc(doc(db, 'games', GAME_ID), {
          status: 'RESULTS'
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status, userId]);

  // JOIN GAME FIXED
  const joinGame = async (name: string) => {
    if (!auth.currentUser) await loginAnonymously();

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(db, 'games', GAME_ID);
    const snap = await getDoc(ref);

    const players = snap.exists() ? snap.data().players || [] : [];

    const newPlayer: Player = {
      id: uid,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      score: 0,
      isReady: false,
    };

    const updated = [...players.filter((p: Player) => p.id !== uid), newPlayer];

    await setDoc(ref, {
      ...snap.data(),
      players: updated,
      status: 'LOBBY'
    });

    setGameState(prev => ({
      ...prev,
      players: updated,
      status: 'LOBBY'
    }));
  };

  // READY FIXED
  const setReady = async () => {
    if (!userId) return;

    const ref = doc(db, 'games', GAME_ID);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const players = snap.data().players;
    const updated = players.map((p: Player) =>
      p.id === userId ? { ...p, isReady: true } : p
    );

    await updateDoc(ref, {
      players: updated,
      readyCount: updated.filter((p: Player) => p.isReady).length,
      status: 'GAME', // 🔥 FORZADO
      currentCardIndex: 0,
      timer: 60,
      currentTurnPlayerId: updated[0]?.id
    });
  };

  const currentCard = gameState.cards[gameState.currentCardIndex];
  const myPlayer = gameState.players.find(p => p.id === userId);

  // UI

  if (gameState.status === 'HOME') {
    return (
      <div className="p-10 text-center">
        <h1 className="text-4xl mb-6">Holis Fun Party 🔥</h1>
        <div className="grid grid-cols-3 gap-4">
          {PREDEFINED_PLAYERS.map(name => (
            <button key={name} onClick={() => joinGame(name)}>
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState.status === 'LOBBY') {
    return (
      <div className="p-10 text-center space-y-6">
        <h2>Lobby</h2>

        {gameState.players.map(p => (
          <div key={p.id}>
            {p.name} {p.isReady ? '✅' : ''}
          </div>
        ))}

        <button onClick={setReady}>
          ESTOY LISTO 🔥
        </button>

        <button
          onClick={async () => {
            await updateDoc(doc(db, 'games', GAME_ID), {
              status: 'GAME',
              currentCardIndex: 0,
              timer: 60,
              currentTurnPlayerId: gameState.players[0]?.id
            });
          }}
        >
          START GAME
        </button>
      </div>
    );
  }

  if (gameState.status === 'GAME') {
    return (
      <div className="p-10 text-center">
        <h2>{currentCard?.category}</h2>
        <h1>{currentCard?.content}</h1>
        <p>⏱ {gameState.timer}</p>
      </div>
    );
  }

  if (gameState.status === 'RESULTS') {
    return (
      <div className="p-10 text-center">
        <h2>Resultados</h2>
        {gameState.players.map(p => (
          <div key={p.id}>{p.name} - {p.score}</div>
        ))}
      </div>
    );
  }

  return null;
}
