import { authAdmin } from '../../../../lib/firebase';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '../../../../lib/auth/session';
import { signSessionToken } from '../../../../lib/auth/jwt';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as null | { idToken?: string };
    const idToken = body?.idToken?.trim();
    if (!idToken) return NextResponse.json({ error: 'Token manquant' }, { status: 400 });

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';
    if (!secret) return NextResponse.json({ error: 'AUTH_SECRET manquant' }, { status: 500 });

    const decoded = await authAdmin.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || '';

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const token = await signSessionToken({ uid, email, exp }, secret);

    const userRecord = await authAdmin.getUser(uid).catch(() => null);
    const name = userRecord?.displayName ?? null;

    const res = NextResponse.json({ user: { id: uid, email, name } });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    console.error('Session error:', e);
    if (e?.code === 'auth/id-token-expired' || e?.code === 'auth/argument-error') return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
    return NextResponse.json({ error: e?.message || 'Erreur d\'authentification' }, { status: 500 });
  }
}
