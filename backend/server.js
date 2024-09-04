const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const next = require("next");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const games = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinGame", ({ gameCode, playerName }) => {
    socket.join(gameCode);
    console.log(`User ${playerName} joined game: ${gameCode}`);

    if (!games.has(gameCode)) {
      games.set(gameCode, { players: [] });
    }

    const game = games.get(gameCode);

    // Check if player already exists
    const existingPlayer = game.players.find((p) => p.name === playerName);
    if (existingPlayer) {
      existingPlayer.id = socket.id;
    } else {
      const newPlayer = { id: socket.id, name: playerName, balance: 1500 };
      game.players.push(newPlayer);
    }

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

    // Find the game this socket was in
    for (const [gameCode, game] of games.entries()) {
      const playerIndex = game.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        // Remove the player from the game
        game.players.splice(playerIndex, 1);

        if (game.players.length === 0) {
          games.delete(gameCode);
        } else {
          io.to(gameCode).emit("gameUpdate", game);
        }
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

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

module.exports = { io, emitGameUpdate };
