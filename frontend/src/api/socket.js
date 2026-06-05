import { io } from 'socket.io-client';

// Shared Socket.IO client for admin realtime pages (counter, kds).
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || '/', {
      autoConnect: true,
      // Admin JWT — the server rejects unauthenticated socket connections so
      // order events (with customer phones) stay private.
      auth: { token: localStorage.getItem('pb_token') || '' },
    });
  }
  return socket;
}

// Join a room ("counter" | "kds") and (re)join on reconnect.
export function joinRoom(room) {
  const s = getSocket();
  const join = () => s.emit('join', room);
  if (s.connected) join();
  s.on('connect', join);
  return s;
}
