export const SESSION_COOKIE = "ledger_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set. Add it to .env.local.");
  return s;
}

async function hmac(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const sig = await hmac(String(exp));
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmac(expStr);
  return timingSafeEqual(sig, expected);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) throw new Error("SITE_PASSWORD is not set. Add it to .env.local.");
  if (input.length !== expected.length) return false;
  return timingSafeEqual(input, expected);
}

export function checkLogToken(token: string | undefined): boolean {
  const expected = process.env.LOG_TOKEN;
  if (!expected) return false;
  if (!token || token.length !== expected.length) return false;
  return timingSafeEqual(token, expected);
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
