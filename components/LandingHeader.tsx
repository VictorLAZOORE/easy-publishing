'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingHeader() {
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 text-white font-semibold">
              EP
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">Easy Publishing</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary text-sm">
                Accéder au dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost text-sm">
                  Se connecter
                </Link>
                <Link href="/signup" className="btn btn-primary text-sm">
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
