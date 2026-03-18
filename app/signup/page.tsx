'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getAuthClient } from '../../lib/firebase-client';

function firebaseErrorToMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/invalid-email': 'Email invalide',
    'auth/weak-password': 'Mot de passe trop court (6 caractères minimum)',
    'auth/operation-not-allowed': 'Authentification email désactivée. Activez-la dans Firebase Console.',
  };
  return map[code] || 'Erreur lors de la création du compte';
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams?.get('next') || '/dashboard', [searchParams]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== password2) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuthClient();
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) {
        await updateProfile(userCred.user, { displayName: name.trim() });
      }
      const idToken = await userCred.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Erreur lors de la création de la session');
        return;
      }
      router.replace(nextPath);
    } catch (e: any) {
      setError(firebaseErrorToMessage(e?.code || '') || e?.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Créer un compte</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Créez un compte avec email et mot de passe (Firebase Auth).
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Nom</label>
            <input
              className="input"
              placeholder="ex: Victor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
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
              placeholder="6+ caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="input"
              placeholder="Confirmez"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" className="btn btn-primary w-full">
            {loading ? 'Création…' : 'Créer et continuer'}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Déjà un compte ?{' '}
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="text-brand-700 dark:text-brand-300 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="card p-6 w-full max-w-md animate-pulse">Chargement…</div></div>}>
      <SignupForm />
    </Suspense>
  );
}
