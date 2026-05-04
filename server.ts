import { createServer } from 'http';
import next from 'next';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  server.listen(3000, () => console.log('> Ready on http://localhost:3000'));
});