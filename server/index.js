const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// temporary in-memory storage
const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 Player connected:", socket.id);

  // CREATE GAME
  socket.on("createGame", (playerName, cb) => {
    const roomCode = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    rooms[roomCode] = {
      players: [{ id: socket.id, name: playerName }],
    };

    socket.join(roomCode);

    cb({
      roomCode,
      players: rooms[roomCode].players,
    });

    console.log("🎮 Room created:", roomCode);
  });

  // JOIN GAME
  socket.on("joinGame", ({ roomCode, playerName }, cb) => {
    const room = rooms[roomCode];

    if (!room) {
      return cb({ error: "Room not found" });
    }

    if (room.players.length >= 10) {
      return cb({ error: "Room full" });
    }

    room.players.push({ id: socket.id, name: playerName });
    socket.join(roomCode);

    io.to(roomCode).emit("playersUpdated", room.players);

    cb({ players: room.players });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    for (const roomCode in rooms) {
      rooms[roomCode].players = rooms[roomCode].players.filter(
        (p) => p.id !== socket.id
      );

      io.to(roomCode).emit("playersUpdated", rooms[roomCode].players);

      if (rooms[roomCode].players.length === 0) {
        delete rooms[roomCode];
      }
    }

    console.log("🔴 Player disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Socket server running on http://localhost:3001");
});
