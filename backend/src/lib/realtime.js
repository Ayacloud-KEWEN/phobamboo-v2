// Thin wrapper around the Socket.IO instance so any route can emit events
// without importing the http server. Set once at startup in server.js.
let io = null;

export function setIO(instance) {
  io = instance;
}

// Rooms: "counter" (counter + dashboard), "kds" (kitchen). Frontend joins on connect.
export function emitOrderNew(order) {
  if (!io) return;
  io.to('counter').to('kds').emit('order:new', order);
}

export function emitOrderUpdate(order) {
  if (!io) return;
  io.to('counter').to('kds').emit('order:update', order);
}

export function emitMemberUpdate(member) {
  if (!io) return;
  io.to('counter').emit('member:update', member);
}
