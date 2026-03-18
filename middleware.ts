import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './lib/auth/jwt';
import { SESSION_COOKIE_NAME } from './lib/auth/session';

const PUBLIC_PATHS = new Set(['/', '/login', '/signup']);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/api')) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname === '/favicon.ico') return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value || '';
  const secret = process.env.AUTH_SECRET || '';
  const session = await verifySessionToken(token, secret);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*).*)'],
};

