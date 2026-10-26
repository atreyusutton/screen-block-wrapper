// Talks to Ollama, the free program that runs AI models on this PC.
// API docs: https://docs.ollama.com/api

export const OLLAMA_URL = (process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434').replace(/\/+$/, '');
/**
 * A free model that can read screenshots. The "instruct" version answers directly; the plain
 * `qwen3-vl:8b` tag is the "thinking" version, which writes ~500 words first and is too slow.
 * Change it with the MODEL environment variable.
 */
export const MODEL = process.env.MODEL ?? 'qwen3-vl:8b-instruct';

export type ChatMessage = { role: 'system' | 'user'; content: string; images?: string[] };

const post = (path: string, body: unknown, timeoutMs: number) =>
  fetch(`${OLLAMA_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  }).catch((e: Error) => {
    throw new Error(e.name === 'TimeoutError' ? 'The model took too long to answer' : `Can't reach Ollama at ${OLLAMA_URL}. Is it running?`);
  });

/** Ask the model, and get back JSON shaped like `schema`. */
export async function askJson<T>(messages: ChatMessage[], schema: object, timeoutMs: number): Promise<T> {
  // "Thinking" mode makes answers several times slower and isn't needed for short verdicts.
  const chat = (thinkOff: boolean) =>
    post('/api/chat', { model: MODEL, messages, format: schema, stream: false, keep_alive: '30m', options: { temperature: 0 }, ...(thinkOff && { think: false }) }, timeoutMs);

  let res = await chat(true);
  // Models that have no thinking mode reject the option, so try once more without it.
  if (res.status === 400 && /think/i.test(await res.clone().text())) res = await chat(false);
  if (!res.ok) throw new Error(`Ollama replied ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const data = (await res.json()) as { message?: { content?: string } };
  return JSON.parse(data.message?.content ?? '') as T;
}

/** Is Ollama running, and is the model downloaded? */
export async function status(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    const { models = [] } = (await res.json()) as { models?: { name: string }[] };
    const names = models.map((m) => m.name);
    if (!names.includes(MODEL) && !names.includes(`${MODEL}:latest`)) {
      return { ok: false, message: `The model isn't downloaded yet. On the PC, run: ollama pull ${MODEL}` };
    }
    return { ok: true, message: 'Ready' };
  } catch {
    return { ok: false, message: "Ollama isn't running on the PC. Open Ollama from the Start menu." };
  }
}

/** Load the model into memory now, so the first real check isn't slow. */
export const warmUp = () => post('/api/generate', { model: MODEL, keep_alive: '30m' }, 180000).catch(() => undefined);
