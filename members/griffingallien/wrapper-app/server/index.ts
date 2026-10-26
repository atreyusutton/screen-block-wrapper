// The free AI server for the wrapper app. It runs on your PC and the phone talks to it
// over Wi-Fi. The AI model runs in Ollama on this same PC, so it costs nothing and
// screenshots never leave your home network.
//
// Start it from the wrapper-app folder with:  npm run server
//
// What the app calls (see src/lib/agent.ts):
//   GET  /health  is the model ready?
//   POST /decide  should this app open, and for how long?
//   POST /check   is what's on screen still on task?

import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { networkInterfaces } from 'node:os';
import type { Observation } from '../src/lib/agent.ts';
import { checkScreen, decideUnlock } from './judge.ts';
import type { DecideRequest } from './judge.ts';
import { MODEL, status, warmUp } from './ollama.ts';

const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY = 5 * 1024 * 1024; // a 480px screenshot is well under 1 MB

const log = (msg: string) => console.log(`${new Date().toLocaleTimeString()}  ${msg}`);

function readJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Request too large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as T);
      } catch {
        reject(new Error('Request was not valid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function send(res: ServerResponse, code: number, body: unknown) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/health') {
      const s = await status();
      return send(res, 200, { ok: s.ok, model: MODEL, message: s.message });
    }

    if (req.method === 'POST' && req.url === '/decide') {
      const body = await readJson<DecideRequest>(req);
      const { result: d, note } = await decideUnlock(body);
      log(`${body.appName}: "${body.reason}" -> ${d.decision}${d.minutes ? ` for ${d.minutes} min` : ''}`);
      log(`  why: ${note}`);
      log(`  said: ${d.message}`);
      return send(res, 200, d);
    }

    if (req.method === 'POST' && req.url === '/check') {
      const body = await readJson<Observation>(req);
      const { result: c, note } = await checkScreen(body);
      log(`check "${body.goal}" at ${body.url} -> ${c.status}`);
      log(`  ${note}`);
      log(`  told them: ${c.reason}`);
      return send(res, 200, c);
    }

    send(res, 404, { error: 'Not found' });
  } catch (e) {
    // The app falls back to its built-in stand-in rules when it gets an error.
    log(`error: ${e instanceof Error ? e.message : String(e)}`);
    send(res, 502, { error: String(e) });
  }
});

server.listen(PORT, async () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => `http://${n!.address}:${PORT}`);
  console.log('Wrapper AI server is running.');
  console.log('In the app, go to My rules > AI server address and type the one that matches your Wi-Fi (usually 192.168...):');
  for (const a of addresses) console.log(`  ${a}`);

  const s = await status();
  if (!s.ok) return console.log(`Not ready yet: ${s.message}`);
  console.log(`Model ${MODEL} is ready. Loading it into memory...`);
  await warmUp();
  log('Loaded. Waiting for the phone.');
});
