'use client';

import { useEffect, useState } from 'react';

export default function AccountsList() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('USER_123');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/accounts/list', { headers: { 'x-user-id': userId } });
      const data = await res.json();
      setAccounts(data.accounts || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = localStorage.getItem('uid');
    if (id) setUserId(id);
    load();
  }, []);

  const connectUrl = `/api/oauth/youtube/start?userId=${encodeURIComponent(userId)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only">User ID</label>
        <input
          className="input max-w-[180px]"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onBlur={() => {
            localStorage.setItem('uid', userId);
            load();
          }}
        />
        <a href={connectUrl} className="btn-primary">
          Connecter YouTube
        </a>
      </div>

      <div className="card overflow-hidden">
        {loading && !accounts.length ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
            <p className="mt-3">Chargement des comptes…</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600">Aucun compte connecté.</p>
            <a href={connectUrl} className="btn-primary mt-4 inline-block">
              Connecter un compte YouTube
            </a>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {accounts.map((a) => (
              <li key={a.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                    {a.provider === 'YOUTUBE' ? '▶' : '•'}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">
                      {a.displayName || a.aliasName || a.externalId}
                    </p>
                    <p className="text-xs text-slate-500">ID: {a.externalId}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
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
