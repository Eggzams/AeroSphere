import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function Lobby({ mode, name, room, setRoom, setScreen }) {
  const [players, setPlayers] = useState({});

  useEffect(() => {
    if (mode === "create") socket.emit("createRoom", name);
    if (mode === "join") socket.emit("joinRoom", { code: room, name });

    socket.on("roomCreated", code => setRoom(code));
    socket.on("updateLobby", data => setPlayers(data.players));
    socket.on("gameStarted", () => setScreen("game"));

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Room: {room}</h2>
      <h3>Players:</h3>
      {Object.values(players).map(p => <p key={p.name}>{p.name}</p>)}
      {mode === "create" && <button onClick={() => socket.emit("startGame", room)}>Start Game</button>}
    </div>
  );
}
