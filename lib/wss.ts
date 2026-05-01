import { WebSocketServer, WebSocket } from 'ws';
const clients = new Map<string, Set<WebSocket>>();
export function setupWSS(server: any) {
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (req: any, socket: any, head: any) => {
    if (new URL(req.url, 'http://localhost').pathname === '/api/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const userId = new URL(req.url, 'http://localhost').searchParams.get('userId');
        if (!userId) return ws.close();
        if (!clients.has(userId)) clients.set(userId, new Set());
        clients.get(userId)!.add(ws);
        ws.on('close', () => clients.get(userId)?.delete(ws));
      });
    }
  });
}
export function broadcastMessage(userId: string, message: any) {
  clients.get(userId)?.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  });
}
