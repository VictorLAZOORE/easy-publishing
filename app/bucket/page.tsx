'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserId } from '../../lib/useUserId';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(iso: string): string {
  if (!iso) return '–';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function BucketPage() {
  const [userId] = useUserId();
  const [files, setFiles] = useState<{ name: string; size: number; updated: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/storage/list', { headers: { 'x-user-id': userId } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setFiles(data.files || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger la liste');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <h1 className="page-header">Vidéos sur le bucket</h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-xl">
        Fichiers présents dans le bucket GCS pour votre utilisateur (préfixe <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm dark:bg-slate-700 dark:text-slate-300">{userId}/</code>).
      </p>

      {error && (
        <div className="card p-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 text-red-800 dark:text-red-200">
          <p>{error}</p>
          <button type="button" onClick={load} className="mt-2 text-sm underline">
            Réessayer
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-slate-600" />
            <p className="mt-3">Chargement…</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Aucun fichier dans le bucket pour cet utilisateur.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-700/50">
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Fichier</th>
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Taille</th>
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Modifié le</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr
                    key={f.name}
                    className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white break-all">{f.name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatSize(f.size)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(f.updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
