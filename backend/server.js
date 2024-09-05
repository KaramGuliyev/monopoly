const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");

dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", /\.ngrok-free\.app$/],

    methods: ["GET", "POST"],
    credentials: true,
  },
});

const games = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinGame", ({ gameCode, playerName, playerId }) => {
    socket.join(gameCode);
    console.log(`User ${playerName} joined game: ${gameCode}`);

    if (!games.has(gameCode)) {
      games.set(gameCode, { players: [] });
    }

    const game = games.get(gameCode);

    // Check if player already exists
    let existingPlayer = game.players.find((p) => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.socketId = socket.id;
    } else {
      const newPlayer = { id: playerId || uuidv4(), socketId: socket.id, name: playerName, balance: 1500 };
      game.players.push(newPlayer);
    }

    io.to(gameCode).emit("gameUpdate", game);
  });

  socket.on("bankTransfer", (data) => {
    console.log(`Received transfer event from ${socket.id}:`, JSON.stringify(data));
    const { fromPlayerName, flag, amount, gameCode } = data;

    const game = games.get(gameCode);
    if (!game) {
      console.error(`Game not found for code: ${gameCode}`);
      return;
    }

    const fromPlayer = game.players.find((p) => p.name === fromPlayerName);

    if (!fromPlayer) {
      console.error(`Player not found: ${fromPlayerName}`);
      return;
    }

    if (fromPlayer.balance < amount) {
      console.error(`Insufficient balance for ${fromPlayerName}`);
      return;
    }

    if (flag === "pay") {
      fromPlayer.balance -= amount;
    } else if (flag === "take") {
      fromPlayer.balance += amount;
    }

    console.log(`Transfer successful: ${fromPlayerName}, Amount: ${amount}`);
    io.to(gameCode).emit("gameUpdate", game);
  });
  socket.on("transfer", (data) => {
    console.log(`Received transfer event from ${socket.id}:`, JSON.stringify(data));
    const { fromPlayerName, toPlayerName, amount, gameCode } = data;

    const game = games.get(gameCode);
    if (!game) {
      console.error(`Game not found for code: ${gameCode}`);
      return;
    }

    const fromPlayer = game.players.find((p) => p.name === fromPlayerName);
    const toPlayer = game.players.find((p) => p.name === toPlayerName);

    if (!fromPlayer || !toPlayer) {
      console.error(`Players not found: ${fromPlayerName}, ${toPlayerName}`);
      return;
    }

    if (fromPlayer.balance < amount) {
      console.error(`Insufficient balance for ${fromPlayerName}`);
      return;
    }

    fromPlayer.balance -= amount;
    toPlayer.balance += amount;

    console.log(`Transfer successful: ${fromPlayerName} -> ${toPlayerName}, Amount: ${amount}`);
    io.to(gameCode).emit("gameUpdate", game);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Don't remove the player from the game, just update their socket ID
    for (const [gameCode, game] of games.entries()) {
      const player = game.players.find((p) => p.socketId === socket.id);
      if (player) {
        player.socketId = null;
        io.to(gameCode).emit("gameUpdate", game);
        break;
      }
    }
  });
});

function emitGameUpdate(gameCode, gameData) {
  console.log("Emitting game update");
  io.to(gameCode).emit("gameUpdate", gameData);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
});

module.exports = { io, emitGameUpdate };
