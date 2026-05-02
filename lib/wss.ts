import { WebSocketServer, WebSocket } from 'ws';
const clients = new Map();
export function setupWSS(server) {
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '', 'http://localhost');
    if (url.pathname === '/api/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const userId = url.searchParams.get('userId');
        if (!userId) return ws.close();
        if (!clients.has(userId)) clients.set(userId, new Set());
        clients.get(userId).add(ws);
        ws.on('close', () => clients.get(userId)?.delete(ws));
      });
    }
  });
}
export function broadcastMessage(userId, message) {
  clients.get(userId)?.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  });
}