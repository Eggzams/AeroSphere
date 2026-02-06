import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { zones } from "./zones";
import { problems } from "./problems";

const socket = io("http://localhost:4000");

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function Game({ room }) {
  const [zoneIndex, setZoneIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [levelProblems, setLevelProblems] = useState([]);

  useEffect(() => {
    setLevelProblems(shuffle(problems).slice(0, 3));
    const start = Date.now();
    const timer = setInterval(() => setTime(Math.floor((Date.now() - start)/1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  function nextZone() {
    if (!currentProblem && levelProblems.length > 0) {
      setCurrentProblem(levelProblems[0]);
      setLevelProblems(p => p.slice(1));
      return;
    }

    setCurrentProblem(null);
    if (zoneIndex < zones.length - 1) setZoneIndex(zoneIndex + 1);
    else {
      socket.emit("finish", { code: room, time });
      alert(`Finished in ${time} sec`);
    }
  }

  function solveProblem() { nextZone(); }

  return (
    <div style={{ padding: 40 }}>
      <h2>Zone: {zones[zoneIndex]}</h2>
      <h3>Time: {time}s</h3>
      {!currentProblem ? (
        <button onClick={nextZone}>Move Forward</button>
      ) : (
        <div style={{ background: "#f3f4f6", padding: 20, borderRadius: 12 }}>
          <p>{currentProblem.text}</p>
          {currentProblem.options ? currentProblem.options.map(opt => (
            <button key={opt} onClick={solveProblem}>{opt}</button>
          )) : <button onClick={solveProblem}>Solve</button>}
        </div>
      )}
    </div>
  );
}
