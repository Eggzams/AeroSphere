import { io } from "socket.io-client";

// LOCAL ke liye
// const SOCKET_URL = "http://localhost:3001";

// DEPLOYED ke baad yahin URL change karenge
const SOCKET_URL = "http://localhost:3001";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});
