import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
const clients = new Map<string, Set<WebSocket>>();
export function setupWSS(server: Server) {
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '', 'http://localhost');
    if (url.pathname === '/api/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const userId = url.searchParams.get('userId');
        if (!userId) return ws.close();
        if (!clients.has(userId)) clients.set(userId, new Set());
        const userClients = clients.get(userId)!;
        userClients.add(ws);
        ws.on('close', () => clients.get(userId)?.delete(ws));
      });
    }
  });
}
export function broadcastMessage(userId: string, message: unknown) {
  clients.get(userId)?.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  });
}