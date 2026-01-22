import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectUserSocket = (token: string) => {
  if (socket) return socket;

  // Ideally this comes from env, but for now we hardcode or use a safe fallback
  const url = "https://padoshi-kitchen-b.onrender.com";

  if (!url) {
    console.log("Socket URL missing");
    return null;
  }

  socket = io(url, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    timeout: 20000,
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("👤 User socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("User socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("Socket error:", err.message);
  });

  socket.connect();
  return socket;
};

export const disconnectUserSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
// Alias for consistency if used elsewhere
export const getUserSocket = getSocket;
