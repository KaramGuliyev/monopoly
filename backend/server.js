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
    origin: ["http://localhost:3000", "http://localhost:3001", /\.ngrok-free\.app$/, "https://monopoly-murex.vercel.app"],
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

    let existingPlayer = game.players.find((p) => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.socketId = socket.id;
    } else {
      const newPlayer = { id: playerId || uuidv4(), socketId: socket.id, name: playerName, balance: 1500 };
      game.players.push(newPlayer);
    }

    io.to(gameCode).emit("gameUpdate", game);
    socket.emit("success", { message: "Joined game successfully!" });
  });

  socket.on("transfer", (data, callback) => {
    const { fromPlayerName, toPlayerName, amount, gameCode } = data;
    const game = games.get(gameCode);
    if (!game) {
      callback({ success: false, message: "Game not found" });
      return;
    }

    const fromPlayer = game.players.find((p) => p.name === fromPlayerName);
    const toPlayer = game.players.find((p) => p.name === toPlayerName);

    if (!fromPlayer || !toPlayer) {
      callback({ success: false, message: "Player not found" });
      return;
    }

    if (fromPlayer.balance < amount) {
      callback({ success: false, message: "Insufficient balance" });
      return;
    }

    fromPlayer.balance -= amount;
    toPlayer.balance += amount;

    game.lastTransfer = {
      from: fromPlayerName,
      to: toPlayerName,
      amount,
    };

    io.to(gameCode).emit("gameUpdate", {
      players: game.players,
      lastTransfer: game.lastTransfer,
    });

    callback({ success: true, message: "Transfer successful!" });
  });

  socket.on("bankTransfer", (data, callback) => {
    const { fromPlayerName, amount, gameCode, flag } = data;
    const game = games.get(gameCode);
    if (!game) {
      callback({ success: false, message: `Game not found for code: ${gameCode}` });
      return;
    }

    const fromPlayer = game.players.find((p) => p.name === fromPlayerName);

    if (!fromPlayer) {
      callback({ success: false, message: `Player not found: ${fromPlayerName}` });
      return;
    }

    if (flag === "pay") {
      if (fromPlayer.balance < amount) {
        callback({ success: false, message: "Insufficient balance" });
        return;
      }
      fromPlayer.balance -= amount;
    } else if (flag === "take") {
      fromPlayer.balance += amount;
    }

    game.lastTransfer = {
      from: flag === "take" ? "Bank" : fromPlayerName,
      to: flag === "take" ? fromPlayerName : "Bank",
      amount,
    };

    io.to(gameCode).emit("gameUpdate", {
      players: game.players,
      lastTransfer: game.lastTransfer,
    });

    callback({ success: true, message: "Bank transfer successful" });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
});

module.exports = { io };
