'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthClient } from '../../lib/firebase-client';

function firebaseErrorToMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'Identifiants invalides',
    'auth/wrong-password': 'Identifiants invalides',
    'auth/invalid-email': 'Email invalide',
    'auth/invalid-credential': 'Identifiants invalides',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
    'auth/operation-not-allowed': 'Authentification email désactivée.',
  };
  return map[code] || 'Connexion impossible';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams?.get('next') || '/dashboard', [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = getAuthClient();
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const idToken = await userCred.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Erreur de connexion');
        return;
      }
      router.replace(nextPath);
    } catch (e: any) {
      setError(firebaseErrorToMessage(e?.code || '') || e?.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Connexion</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Connectez-vous avec votre email et mot de passe (Firebase Auth).
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              placeholder="ex: victor@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" className="btn btn-primary w-full">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Pas encore de compte ?{' '}
          <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="text-brand-700 dark:text-brand-300 hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="card p-6 w-full max-w-md animate-pulse">Chargement…</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
