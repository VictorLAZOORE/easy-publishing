'use client';

import { useCallback, useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

export default function VideoTable() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history/list');
      const data = await res.json();
      setVideos(data.videos || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = videos.flatMap((v) =>
    v.uploadTargets?.map((t: any) => ({ video: v, target: t })) ?? []
  );

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        {loading && !videos.length ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-slate-600" />
            <p className="mt-3">Chargement de l’historique…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Aucune vidéo dans l’historique.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-700/50">
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Vidéo</th>
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Plateforme</th>
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Statut</th>
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Progression</th>
                  <th className="text-left font-semibold text-slate-700 dark:text-slate-300 px-6 py-4">Lien</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ video, target }) => (
                  <tr key={target.id} className="border-b border-slate-100 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{video.title}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{target.provider}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          target.status === 'DONE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                            : target.status === 'ERROR'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                        }`}
                      >
                        {target.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar value={target.progress} />
                    </td>
                    <td className="px-6 py-4">
                      {target.remoteUrl ? (
                        <a
                          href={target.remoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline dark:text-brand-400"
                        >
                          Ouvrir →
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">–</span>
                      )}
                    </td>
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
