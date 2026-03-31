import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { DEFAULT_CARDS } from "./src/types";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  const PORT = 3000;

  const getInitialState = () => ({
    status: 'HOME',
    players: [] as any[],
    cards: DEFAULT_CARDS,
    currentCardIndex: 0,
    timer: 60,
    isChaosMode: true,
    isPenaltyMode: false,
    currentTurnPlayerId: null,
    readyCount: 0,
  });

  // Global game state
  let globalGameState = getInitialState();
  let timerInterval: NodeJS.Timeout | null = null;

  const startTimer = (io: Server, room: string) => {
    if (timerInterval) return;
    
    timerInterval = setInterval(() => {
      if (globalGameState.status === 'GAME') {
        if (globalGameState.timer > 0) {
          globalGameState.timer--;
          io.to(room).emit("game:state", globalGameState);
        } else {
          globalGameState.status = 'RESULTS';
          io.to(room).emit("game:state", globalGameState);
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
        }
      } else {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }
    }, 1000);
  };

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    // Everyone joins the same room
    const currentRoom = 'global';
    socket.join(currentRoom);
    socket.emit("game:state", globalGameState);

    socket.on("player:join", (playerData) => {
      const newPlayer = { ...playerData, id: socket.id, score: 0, isReady: false };
      const existingIdx = globalGameState.players.findIndex((p: any) => p.id === socket.id);
      if (existingIdx === -1) {
        globalGameState.players.push(newPlayer);
      } else {
        globalGameState.players[existingIdx] = newPlayer;
      }
      
      // Auto-advance to lobby if we're at home
      if (globalGameState.status === 'HOME') {
        globalGameState.status = 'LOBBY';
      }
      
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("player:ready", () => {
      const player = globalGameState.players.find((p: any) => p.id === socket.id);
      if (player && !player.isReady) {
        player.isReady = true;
        globalGameState.readyCount++;
        
        // If everyone is ready, start the game
        if (globalGameState.readyCount === globalGameState.players.length && globalGameState.players.length > 0) {
          globalGameState.status = 'GAME';
          globalGameState.currentCardIndex = 0;
          globalGameState.timer = 60;
          globalGameState.currentTurnPlayerId = globalGameState.players[0].id;
          
          // Start timer interval if not already running
          startTimer(io, currentRoom);
        }
        io.to(currentRoom).emit("game:state", globalGameState);
      }
    });

    socket.on("game:update_status", (status, mode) => {
      globalGameState.status = status;
      if (mode) {
        globalGameState.isChaosMode = mode === 'CHAOS';
        globalGameState.isPenaltyMode = mode === 'PENALTY';
      }
      
      if (status === 'LOBBY') {
        // Reset ready status when going to lobby
        globalGameState.players.forEach((p: any) => p.isReady = false);
        globalGameState.readyCount = 0;
      }

      if (status === 'GAME') {
        globalGameState.timer = 60;
        globalGameState.currentCardIndex = 0;
        globalGameState.currentTurnPlayerId = globalGameState.players[0]?.id || null;
      }
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("game:vote", (winnerId) => {
      const winner = globalGameState.players.find((p: any) => p.id === winnerId);
      if (winner) {
        winner.score += 10;
      }
      
      // Move to next card and next turn
      if (globalGameState.currentCardIndex < globalGameState.cards.length - 1) {
        globalGameState.currentCardIndex++;
        
        // Cycle turn
        const currentIdx = globalGameState.players.findIndex((p: any) => p.id === globalGameState.currentTurnPlayerId);
        const nextIdx = (currentIdx + 1) % globalGameState.players.length;
        globalGameState.currentTurnPlayerId = globalGameState.players[nextIdx].id;
      } else {
        globalGameState.status = 'RESULTS';
      }
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("game:update_cards", (cards) => {
      globalGameState.cards = cards;
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("game:next_card", () => {
      if (globalGameState.currentCardIndex < globalGameState.cards.length - 1) {
        globalGameState.currentCardIndex++;
        // Cycle turn
        const currentIdx = globalGameState.players.findIndex((p: any) => p.id === globalGameState.currentTurnPlayerId);
        const nextIdx = (currentIdx + 1) % globalGameState.players.length;
        globalGameState.currentTurnPlayerId = globalGameState.players[nextIdx].id;
      } else {
        globalGameState.status = 'RESULTS';
      }
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("game:update_timer", (timer) => {
      globalGameState.timer = timer;
      if (timer === 0) {
        globalGameState.status = 'RESULTS';
      }
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("game:reset", () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      globalGameState = getInitialState();
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("game:restart", () => {
      globalGameState.status = 'LOBBY';
      globalGameState.players.forEach((p: any) => {
        p.score = 0;
        p.isReady = false;
      });
      globalGameState.readyCount = 0;
      globalGameState.currentCardIndex = 0;
      globalGameState.timer = 60;
      io.to(currentRoom).emit("game:state", globalGameState);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      const player = globalGameState.players.find((p: any) => p.id === socket.id);
      if (player && player.isReady) {
        globalGameState.readyCount--;
      }
      globalGameState.players = globalGameState.players.filter((p: any) => p.id !== socket.id);
      
      // If turn player left, move to next
      if (globalGameState.currentTurnPlayerId === socket.id) {
        if (globalGameState.players.length > 0) {
          globalGameState.currentTurnPlayerId = globalGameState.players[0].id;
        } else {
          globalGameState.currentTurnPlayerId = null;
        }
      }
      
      io.to(currentRoom).emit("game:state", globalGameState);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
