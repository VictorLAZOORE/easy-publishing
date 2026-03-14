'use client';

import { useEffect, useState } from 'react';
import { useUserId } from '../../lib/useUserId';

export default function DashboardPage() {
  const [userId] = useUserId();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/uploads/status', { headers: { 'x-user-id': userId } });
      const data = await res.json();
      setStats(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [userId]);

  return (
    <div className="space-y-8">
      <h1 className="page-header">Dashboard</h1>

      {loading && !stats ? (
        <div className="card p-12 text-center text-slate-500 dark:text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
          <p className="mt-3">Chargement des statistiques…</p>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Comptes connectés" value={stats.counts?.accounts} icon="🔗" />
            <StatCard title="Vidéos" value={stats.counts?.videos} icon="🎬" />
            <StatCard title="Uploads en cours" value={stats.counts?.running} icon="⏳" />
            <StatCard title="Erreurs" value={stats.counts?.errors} icon="⚠️" />
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Uploads récents</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Dernières publications</p>
            </div>
            {stats?.recentTargets?.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {stats.recentTargets.map((t: any) => (
                  <li key={t.id} className="px-6 py-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium text-slate-900 dark:text-white">{t.provider}</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.status === 'DONE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' :
                      t.status === 'ERROR' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{t.progress}%</span>
                    {t.remoteUrl && (
                      <a href={t.remoteUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline dark:text-brand-400">
                        Voir la vidéo →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                Aucun upload récent.
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value ?? '–'}</p>
        </div>
        <span className="text-2xl opacity-80" aria-hidden>{icon}</span>
      </div>
    </div>
  );
}
