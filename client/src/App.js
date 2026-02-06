import { useState } from "react";
import Lobby from "./Lobby";
import Game from "./Game";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  return (
    <>
      {screen === "home" && (
        <div style={{ padding: 40 }}>
          <h1>✈️ Airport Rush Multiplayer</h1>
          <input placeholder="Your Name" onChange={e => setName(e.target.value)} />
          <br/><br/>
          <button onClick={() => setScreen("create")}>Create Game</button>
          <br/><br/>
          <input placeholder="Room Code" onChange={e => setRoom(e.target.value)} />
          <button onClick={() => setScreen("join")}>Join Game</button>
        </div>
      )}
      {(screen === "create" || screen === "join") && 
        <Lobby mode={screen} name={name} room={room} setRoom={setRoom} setScreen={setScreen} />}
      {screen === "game" && <Game room={room} />}
    </>
  );
}
