'use client';

import { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

export default function VideoTable() {
  const [userId, setUserId] = useState<string>('USER_123');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/history/list', { headers: { 'x-user-id': userId } });
      const data = await res.json();
      setVideos(data.videos || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = localStorage.getItem('uid');
    if (id) setUserId(id);
    load();
  }, []);

  const rows = videos.flatMap((v) =>
    v.uploadTargets?.map((t: any) => ({ video: v, target: t })) ?? []
  );

  return (
    <div className="space-y-4">
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
        <button type="button" onClick={load} disabled={loading} className="btn-secondary">
          {loading ? 'Chargement…' : 'Rafraîchir'}
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading && !videos.length ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
            <p className="mt-3">Chargement de l’historique…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Aucune vidéo dans l’historique.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left font-semibold text-slate-700 px-6 py-4">Vidéo</th>
                  <th className="text-left font-semibold text-slate-700 px-6 py-4">Plateforme</th>
                  <th className="text-left font-semibold text-slate-700 px-6 py-4">Statut</th>
                  <th className="text-left font-semibold text-slate-700 px-6 py-4">Progression</th>
                  <th className="text-left font-semibold text-slate-700 px-6 py-4">Lien</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ video, target }) => (
                  <tr key={target.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">{video.title}</td>
                    <td className="px-6 py-4 text-slate-600">{target.provider}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          target.status === 'DONE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : target.status === 'ERROR'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
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
                          className="text-brand-600 hover:underline"
                        >
                          Ouvrir →
                        </a>
                      ) : (
                        <span className="text-slate-400">–</span>
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
