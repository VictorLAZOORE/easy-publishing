'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserId } from '../lib/useUserId';

export default function AccountsList() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useUserId();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const error = searchParams.get('error');
  const connected = searchParams.get('connected');
  const userIdFromUrl = searchParams.get('userId');

  const load = useCallback(async (overrideUserId?: string) => {
    const id = overrideUserId ?? userId;
    setLoading(true);
    try {
      const res = await fetch('/api/accounts/list', { headers: { 'x-user-id': id } });
      const data = await res.json();
      setAccounts(data.accounts || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Au retour OAuth : prendre le userId de l’URL et charger la liste tout de suite avec
  useEffect(() => {
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
      load(userIdFromUrl);
    } else {
      load();
    }
  }, [userIdFromUrl, setUserId, load]);

  const connectUrl = `/api/oauth/youtube/start?userId=${encodeURIComponent(userId)}`;

  return (
    <div className="space-y-6">
      {error === 'backend_unavailable' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Le backend Go n’est pas démarré. Lancez <code className="rounded bg-amber-100 px-1">npm run backend</code> dans un terminal, puis réessayez de connecter YouTube.
        </div>
      )}
      {error === 'save_failed' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          La sauvegarde du compte a échoué. Vérifiez que le backend tourne et que Firestore est configuré.
        </div>
      )}
      {connected === 'youtube' && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Compte YouTube connecté avec succès.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <a href={connectUrl} className="btn-primary">
          Ajouter un compte YouTube
        </a>
      </div>

      <div className="card overflow-hidden">
        {loading && !accounts.length ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
            <p className="mt-3">Chargement des comptes…</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">Aucun compte connecté.</p>
            <a href={connectUrl} className="btn-primary mt-4 inline-block">
              Connecter un compte YouTube
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {accounts.map((a) => (
              <li key={a.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                <div className="flex items-center gap-3">
                  {a.provider === 'YOUTUBE' ? (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff0000] text-white">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-600 dark:text-slate-300">•</span>
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {a.displayName || a.aliasName || a.externalId}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {a.externalId}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-600 dark:text-slate-300">
                  {a.provider}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
