import type { NextApiRequest } from 'next';
import { verifySessionToken } from './jwt';

export const SESSION_COOKIE_NAME = 'ep_session';

function parseCookieHeader(header: string | undefined | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

export async function getSessionFromApiRequest(req: NextApiRequest) {
  const cookies = parseCookieHeader(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];
  const secret = process.env.AUTH_SECRET || '';
  return verifySessionToken(token, secret);
}

