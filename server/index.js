const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const rooms = {};

function makeCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

io.on("connection", socket => {

  socket.on("createRoom", name => {
    const code = makeCode();
    rooms[code] = { players: {}, started: false };
    rooms[code].players[socket.id] = { name, time: 0, finished: false };
    socket.join(code);
    io.to(code).emit("updateLobby", rooms[code]);
    socket.emit("roomCreated", code);
  });

  socket.on("joinRoom", ({ code, name }) => {
    if (!rooms[code] || rooms[code].started) return;
    rooms[code].players[socket.id] = { name, time: 0, finished: false };
    socket.join(code);
    io.to(code).emit("updateLobby", rooms[code]);
  });

  socket.on("startGame", code => {
    if (!rooms[code]) return;
    rooms[code].started = true;
    io.to(code).emit("gameStarted");
  });

  socket.on("finish", ({ code, time }) => {
    if (!rooms[code]) return;
    rooms[code].players[socket.id].time = time;
    rooms[code].players[socket.id].finished = true;
    io.to(code).emit("updateResults", rooms[code]);
  });

  socket.on("disconnect", () => {
    for (let code in rooms) {
      if (rooms[code].players[socket.id]) {
        delete rooms[code].players[socket.id];
        io.to(code).emit("updateLobby", rooms[code]);
      }
    }
  });

});

server.listen(process.env.PORT || 4000, () => console.log("Server running on port 4000"));
