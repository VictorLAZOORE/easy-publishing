'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserId } from '../../lib/useUserId';

export default function UploadPage() {
  const [userId] = useUserId();
  const [file, setFile] = useState<File | null>(null);
  const [presigned, setPresigned] = useState<{ url: string; key: string } | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'SCHEDULED'>('PUBLIC');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAccounts();
  }, [userId]);

  async function loadAccounts() {
    const res = await fetch('/api/accounts/list', { headers: { 'x-user-id': userId } });
    const data = await res.json();
    setAccounts(data.accounts || []);
  }

  async function step1Presign() {
    if (!file) return alert('Sélectionnez un fichier');
    setLoading(true);
    try {
      const presignRes = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      }).then((r) => r.json());
      if (presignRes.error) throw new Error(presignRes.error);
      const uploadRes = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'x-user-id': userId, 'x-key': presignRes.key, 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }
      setPresigned(presignRes);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors de l’envoi du fichier');
    } finally {
      setLoading(false);
    }
  }

  async function startMultiUpload() {
    if (!presigned) return alert('Effectuez d’abord l’envoi du fichier.');
    if (!selectedAccounts.length) return alert('Sélectionnez au moins un compte.');
    setLoading(true);
    setCreatedVideoId(null);
    setPublishError(null);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          accounts: selectedAccounts,
          s3Key: presigned.key,
          title,
          description: desc,
          tags,
          visibility,
          scheduledAt: visibility === 'SCHEDULED' ? scheduledAt : null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.error || `Erreur ${response.status}`;
        setPublishError(msg);
        return;
      }
      const videoId = data.videoId ?? data.targets?.[0]?.videoId;
      if (!videoId) {
        setPublishError('Réponse invalide du serveur (pas de videoId)');
        return;
      }
      setCreatedVideoId(videoId);
      setPublishError(null);
      // Scroll après que React ait rendu le bloc succès
      setTimeout(() => successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Publication échouée';
      setPublishError(msg);
    } finally {
      setLoading(false);
    }
  }

  const youtubeAccounts = accounts.filter((a: any) => a.provider === 'YOUTUBE');

  return (
    <div className="space-y-8">
      <h1 className="page-header">Upload vidéo</h1>

      {/* Step 1 — S3 */}
      <section className="card p-6">
        <h2 className="section-title">1. Fichier vidéo (S3)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="btn-secondary cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? file.name : 'Choisir un fichier'}
          </label>
          <button
            type="button"
            onClick={step1Presign}
            disabled={!file || loading}
            className="btn-primary"
          >
            {loading ? 'Envoi…' : 'Envoyer vers S3'}
          </button>
        </div>
        {presigned && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            ✓ Envoyé sous la clé : <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700 dark:text-slate-300">{presigned.key}</code>
          </p>
        )}
      </section>

      {/* Step 2 — Metadata */}
      <section className="card p-6">
        <h2 className="section-title">2. Métadonnées</h2>
        <div className="grid gap-4 max-w-xl">
          <div>
            <label className="label">Titre</label>
            <input
              className="input"
              placeholder="Titre de la vidéo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Tags (séparés par des virgules)</label>
            <input
              className="input"
              placeholder="tag1, tag2, tag3"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="label">Visibilité</label>
              <select
                className="input"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Privé</option>
                <option value="SCHEDULED">Programmé</option>
              </select>
            </div>
            {visibility === 'SCHEDULED' && (
              <div>
                <label className="label">Date de publication</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Step 3 — Accounts */}
      <section className="card p-6">
        <h2 className="section-title">3. Comptes cibles</h2>
        {youtubeAccounts.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Aucun compte YouTube connecté. <a href="/accounts" className="text-brand-600 hover:underline dark:text-brand-400">Connecter un compte</a>.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {youtubeAccounts.map((a: any) => (
              <label
                key={a.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50 dark:border-slate-600 dark:hover:bg-slate-700 dark:has-[:checked]:border-brand-500 dark:has-[:checked]:bg-brand-500/20"
              >
                <input
                  type="checkbox"
                  checked={selectedAccounts.includes(a.id)}
                  onChange={(e) => {
                    setSelectedAccounts((prev) =>
                      e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)
                    );
                  }}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-500"
                />
                <span className="font-medium text-slate-900 dark:text-white">{a.displayName || a.aliasName || a.externalId}</span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Step 4 — Launch */}
      <section className="card p-6">
        <h2 className="section-title">4. Publication</h2>
        <button
          type="button"
          onClick={startMultiUpload}
          disabled={!presigned || !selectedAccounts.length || loading}
          className="btn-primary"
        >
          {loading ? 'Publication…' : 'Publier sur les comptes sélectionnés'}
        </button>
        {loading && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Publication en cours, ne quittez pas la page…</p>
        )}
      </section>

      {publishError && (
        <div className="card p-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 text-red-800 dark:text-red-200">
          <p className="font-medium">Erreur de publication</p>
          <p className="text-sm mt-1">{publishError}</p>
        </div>
      )}
      {createdVideoId && (
        <div ref={successRef} id="upload-success" className="card p-6 border-brand-200 bg-brand-50 dark:border-brand-700 dark:bg-brand-500/10">
          <p className="font-medium text-brand-800 dark:text-brand-200">
            Vidéo créée : <code className="rounded bg-brand-100 px-1.5 py-0.5 dark:bg-brand-500/30 dark:text-brand-100">{createdVideoId}</code>
          </p>
          <p className="text-sm text-brand-700 dark:text-brand-300 mt-1">Suivez le statut dans l’onglet Historique.</p>
        </div>
      )}
    </div>
  );
}
