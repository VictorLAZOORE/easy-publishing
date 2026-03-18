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
      const res = await fetch('/api/uploads/status');
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Vue rapide de vos comptes, publications et statuts.
          </p>
        </div>
        <a href="/bucket" className="btn btn-primary">
          Publier une vidéo
          <span aria-hidden>→</span>
        </a>
      </div>

      {loading && !stats ? (
        <div className="card-soft p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-300/70 border-t-brand-500 dark:border-slate-600/70" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Chargement des statistiques…</p>
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
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Activité récente</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Dernières publications</p>
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
              <div className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                Aucune activité pour l’instant. Ajoutez une vidéo dans le bucket pour publier.
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">{value ?? '–'}</p>
        </div>
        <span className="text-2xl opacity-70" aria-hidden>{icon}</span>
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-brand-500/60" />
      </div>
    </div>
  );
}
