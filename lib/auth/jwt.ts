const textEncoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array) {
  let b64: string;
  if (typeof Buffer !== 'undefined') b64 = Buffer.from(bytes).toString('base64');
  else b64 = btoa(String.fromCharCode(...bytes));
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecodeToBytes(b64url: string) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=');
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export type SessionTokenPayload = {
  uid: string;
  email: string;
  exp: number; // unix seconds
};

async function importHmacKey(secret: string) {
  if (!secret) throw new Error('Missing AUTH_SECRET');
  const raw = textEncoder.encode(secret);
  return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signSessionToken(payload: SessionTokenPayload, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' as const };
  const headerBytes = textEncoder.encode(JSON.stringify(header));
  const payloadBytes = textEncoder.encode(JSON.stringify(payload));
  const signingInput = `${base64UrlEncode(headerBytes)}.${base64UrlEncode(payloadBytes)}`;
  const key = await importHmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(signingInput)));
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionTokenPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  try {
    const key = await importHmacKey(secret);
    const ok = await crypto.subtle.verify('HMAC', key, base64UrlDecodeToBytes(s), textEncoder.encode(`${h}.${p}`));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecodeToBytes(p))) as SessionTokenPayload;
    if (!payload?.uid || !payload?.email || !payload?.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

