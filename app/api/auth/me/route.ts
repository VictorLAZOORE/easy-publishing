import { NextResponse } from 'next/server';
import { authAdmin } from '../../../../lib/firebase';
import { SESSION_COOKIE_NAME } from '../../../../lib/auth/session';
import { verifySessionToken } from '../../../../lib/auth/jwt';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
  const token = match ? decodeURIComponent(match[1]) : '';

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';
  const session = await verifySessionToken(token, secret);
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  const userRecord = await authAdmin.getUser(session.uid).catch(() => null);
  if (!userRecord) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({
    user: {
      id: userRecord.uid,
      email: userRecord.email ?? null,
      name: userRecord.displayName ?? null,
      image: userRecord.photoURL ?? null,
    },
  }, { status: 200 });
}
