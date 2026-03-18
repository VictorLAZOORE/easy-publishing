'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

function displayName(fullName: string, userId: string): string {
  const prefix = userId + '/';
  let name = fullName.startsWith(prefix) ? fullName.slice(prefix.length) : fullName;
  const slash = name.indexOf('/');
  if (slash !== -1) name = name.slice(slash + 1);
  const dash = name.indexOf('-');
  if (dash !== -1 && /^\d+$/.test(name.slice(0, dash))) name = name.slice(dash + 1);
  return name || fullName;
}

type BucketFileWithUrl = { name: string; size: number; updated: string; url: string };

type PublishFlow = { key: string; step: 1 | 2 | 3 };

export default function BucketPage() {
  const [userId] = useUserId();
  const [files, setFiles] = useState<BucketFileWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<BucketFileWithUrl | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ajouter une vidéo
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Flux publication (cartes enchaînées)
  const [publishFlow, setPublishFlow] = useState<PublishFlow | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [pubTitle, setPubTitle] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubTags, setPubTags] = useState<string[]>([]);
  const [pubVisibility, setPubVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'SCHEDULED'>('PUBLIC');
  const [pubScheduledAt, setPubScheduledAt] = useState('');
  const [pubAccounts, setPubAccounts] = useState<string[]>([]);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/storage/list');
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

  useEffect(() => {
    if (playing) videoRef.current?.play().catch(() => {});
  }, [playing]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlaying(null);
    };
    if (playing) {
      window.addEventListener('keydown', onEsc);
      return () => window.removeEventListener('keydown', onEsc);
    }
  }, [playing]);

  const closeModal = () => {
    videoRef.current?.pause();
    setPlaying(null);
  };

  async function loadAccounts() {
    const res = await fetch('/api/accounts/list');
    const data = await res.json();
    setAccounts(data.accounts || []);
  }

  async function uploadNewVideo() {
    if (!addFile) return;
    setAddLoading(true);
    try {
      const presignRes = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: addFile.name, contentType: addFile.type }),
      }).then((r) => r.json());
      if (presignRes.error) throw new Error(presignRes.error);
      const uploadRes = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'x-key': presignRes.key, 'Content-Type': addFile.type || 'application/octet-stream' },
        body: addFile,
      });
      if (!uploadRes.ok) throw new Error('Upload échoué');
      setAddFile(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setAddLoading(false);
    }
  }

  function startPublishFlow(key: string) {
    setPublishFlow({ key, step: 1 });
    setPubTitle('');
    setPubDesc('');
    setPubTags([]);
    setPubVisibility('PUBLIC');
    setPubScheduledAt('');
    setPubAccounts([]);
    setPublishError(null);
    setPublishSuccess(false);
    loadAccounts();
  }

  function cancelPublishFlow() {
    setPublishFlow(null);
  }

  const youtubeAccounts = accounts.filter((a: any) => a.provider === 'YOUTUBE');

  async function doPublish() {
    if (!publishFlow || !pubAccounts.length) return;
    setPublishLoading(true);
    setPublishError(null);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: pubAccounts,
          s3Key: publishFlow.key,
          title: pubTitle || displayName(publishFlow.key, userId),
          description: pubDesc,
          tags: pubTags,
          visibility: pubVisibility,
          scheduledAt: pubVisibility === 'SCHEDULED' ? pubScheduledAt : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPublishError(data.error || `Erreur ${res.status}`);
        return;
      }
      const videoId = data.videoId ?? data.targets?.[0]?.videoId;
      if (!videoId) {
        setPublishError('Réponse invalide');
        return;
      }
      setPublishSuccess(true);
      setTimeout(() => {
        setPublishFlow(null);
      }, 2000);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : 'Publication échouée');
    } finally {
      setPublishLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Bucket</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Ajoutez vos vidéos, prévisualisez-les, puis publiez-les sur vos chaînes YouTube.
          </p>
        </div>
        <a href="/accounts" className="btn btn-secondary">
          Gérer les comptes
        </a>
      </div>

      {/* Ajouter une vidéo */}
      <section className="card-soft p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Ajouter une vidéo</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Le fichier sera stocké dans GCS sous <code className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">{userId}/…</code>
            </p>
          </div>
          <span className="text-xs rounded-full px-2.5 py-1 bg-brand-500/10 ring-1 ring-brand-500/15 text-slate-700 dark:text-slate-200">
            Stockage
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <label className="btn btn-secondary cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => setAddFile(e.target.files?.[0] || null)}
            />
            {addFile ? addFile.name : 'Choisir un fichier'}
          </label>
          <button
            type="button"
            onClick={uploadNewVideo}
            disabled={!addFile || addLoading}
            className="btn btn-primary"
          >
            {addLoading ? 'Envoi…' : 'Envoyer vers le bucket'}
          </button>
        </div>
      </section>

      {/* Flux publication : overlay blur + une carte centrée à la fois */}
      {publishFlow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && cancelPublishFlow()}
          role="dialog"
          aria-modal="true"
          aria-label="Publier la vidéo"
        >
          <div
            className="w-full max-w-lg card p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={cancelPublishFlow}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl leading-none"
              aria-label="Fermer"
            >
              ×
            </button>

            {publishSuccess ? (
              <div className="py-4">
                <p className="font-medium text-brand-800 dark:text-brand-200 text-lg">✓ Publication réussie</p>
                <p className="text-sm text-brand-700 dark:text-brand-300 mt-2">La vidéo sera visible dans l’historique.</p>
                <button type="button" onClick={cancelPublishFlow} className="btn btn-primary mt-6 w-full">
                  OK
                </button>
              </div>
            ) : publishFlow.step === 1 ? (
              <>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">1. Métadonnées</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{displayName(publishFlow.key, userId)}</p>
                <div className="grid gap-4">
                  <div>
                    <label className="label">Titre</label>
                    <input
                      className="input"
                      placeholder="Titre de la vidéo"
                      value={pubTitle}
                      onChange={(e) => setPubTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      className="input min-h-[80px] resize-y"
                      placeholder="Description"
                      value={pubDesc}
                      onChange={(e) => setPubDesc(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Tags (virgules)</label>
                    <input
                      className="input"
                      placeholder="tag1, tag2"
                      value={pubTags.join(', ')}
                      onChange={(e) => setPubTags(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    />
                  </div>
                  <div>
                    <label className="label">Visibilité</label>
                    <select
                      className="input"
                      value={pubVisibility}
                      onChange={(e) => setPubVisibility(e.target.value as any)}
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Privé</option>
                      <option value="SCHEDULED">Programmé</option>
                    </select>
                  </div>
                  {pubVisibility === 'SCHEDULED' && (
                    <div>
                      <label className="label">Date de publication</label>
                      <input
                        type="datetime-local"
                        className="input"
                        value={pubScheduledAt}
                        onChange={(e) => setPubScheduledAt(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPublishFlow((f) => f && { ...f, step: 2 })}
                  className="btn btn-primary w-full mt-6"
                >
                  Suivant →
                </button>
              </>
            ) : publishFlow.step === 2 ? (
              <>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">2. Chaînes cibles</h3>
                {youtubeAccounts.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Aucun compte YouTube. <a href="/accounts" className="text-brand-600 hover:underline dark:text-brand-400">Connecter un compte</a>.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto">
                    {youtubeAccounts.map((a: any) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50 dark:has-[:checked]:border-brand-500 dark:has-[:checked]:bg-brand-500/20"
                      >
                        <input
                          type="checkbox"
                          checked={pubAccounts.includes(a.id)}
                          onChange={(e) =>
                            setPubAccounts((prev) =>
                              e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)
                            )
                          }
                          className="rounded border-slate-300 text-brand-600 dark:border-slate-500"
                        />
                        <span className="font-medium text-slate-900 dark:text-white text-sm">{a.displayName || a.aliasName || a.externalId}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setPublishFlow((f) => f && { ...f, step: 1 })} className="btn btn-ghost flex-1">
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishFlow((f) => f && { ...f, step: 3 })}
                    disabled={!pubAccounts.length}
                    className="btn btn-primary flex-1"
                  >
                    Suivant →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">3. Publication</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {pubAccounts.length} chaîne(s) sélectionnée(s). Cliquez pour lancer la publication.
                </p>
                {publishError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{publishError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setPublishFlow((f) => f && { ...f, step: 2 })} className="btn btn-ghost flex-1">
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={doPublish}
                    disabled={publishLoading || !pubAccounts.length}
                    className="btn btn-primary flex-1"
                  >
                    {publishLoading ? 'Publication…' : 'Publier'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Liste des vidéos */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Vidéos</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Cliquez sur Publier pour démarrer le flow guidé.</p>
          </div>
          <button type="button" onClick={load} className="btn btn-ghost">
            Rafraîchir
          </button>
        </div>
        {error && (
          <div className="card p-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 text-red-800 dark:text-red-200 mb-4">
            <p>{error}</p>
            <button type="button" onClick={load} className="mt-2 text-sm underline">
              Réessayer
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-slate-500 dark:text-slate-400 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500 dark:border-slate-600" />
              <p className="mt-3">Chargement…</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="card p-12 text-center text-slate-500 dark:text-slate-400">
            Aucun fichier. Ajoutez une vidéo ci-dessus.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {files.map((f) => (
              <div
                key={f.name}
                className="card p-0 overflow-hidden text-left hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-slate-900 relative group">
                  <video
                    src={f.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setPlaying(f)}
                      className="w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform"
                      aria-label="Lire"
                    >
                      ▶
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium text-slate-900 dark:text-white truncate" title={displayName(f.name, userId)}>
                    {displayName(f.name, userId)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {formatSize(f.size)} · {formatDate(f.updated)}
                  </p>
                  <button
                    type="button"
                    onClick={() => startPublishFlow(f.name)}
                    className="mt-4 w-full btn btn-primary"
                  >
                    Publier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal lecture */}
      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Lire la vidéo"
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] overflow-auto flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-0 right-0 z-10 text-white hover:text-slate-300 text-3xl font-bold w-10 h-10 flex items-center justify-center"
              aria-label="Fermer"
            >
              ×
            </button>
            <video
              ref={videoRef}
              src={playing.url}
              controls
              autoPlay
              className="w-full max-h-[85vh] rounded-lg shadow-2xl bg-black object-contain"
            />
            <p className="text-white mt-2 truncate text-sm w-full text-center">
              {displayName(playing.name, userId)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
