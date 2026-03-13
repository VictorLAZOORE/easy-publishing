'use client';

import { useEffect, useState } from 'react';

export default function UploadPage() {
  const [userId, setUserId] = useState<string>('USER_123');
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

  useEffect(() => {
    const id = localStorage.getItem('uid');
    if (id) setUserId(id);
    loadAccounts();
  }, []);

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
      await fetch(presignRes.url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setPresigned(presignRes);
    } finally {
      setLoading(false);
    }
  }

  async function startMultiUpload() {
    if (!presigned) return alert('Effectuez d’abord l’upload S3');
    if (!selectedAccounts.length) return alert('Sélectionnez au moins un compte');
    setLoading(true);
    try {
      const res = await fetch('/api/upload', {
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
      }).then((r) => r.json());
      setCreatedVideoId(res.videoId);
    } finally {
      setLoading(false);
    }
  }

  const youtubeAccounts = accounts.filter((a: any) => a.provider === 'YOUTUBE');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-header">Upload vidéo</h1>
        <div className="flex items-center gap-2">
          <label className="sr-only">User ID</label>
          <input
            className="input max-w-[180px]"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onBlur={() => localStorage.setItem('uid', userId)}
          />
        </div>
      </div>

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
          <p className="mt-3 text-sm text-slate-600">
            ✓ Envoyé sous la clé : <code className="rounded bg-slate-100 px-1.5 py-0.5">{presigned.key}</code>
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
          <p className="text-slate-500 text-sm">
            Aucun compte YouTube connecté. <a href="/accounts" className="text-brand-600 hover:underline">Connecter un compte</a>.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {youtubeAccounts.map((a: any) => (
              <label
                key={a.id}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50"
              >
                <input
                  type="checkbox"
                  checked={selectedAccounts.includes(a.id)}
                  onChange={(e) => {
                    setSelectedAccounts((prev) =>
                      e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)
                    );
                  }}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium text-slate-900">{a.displayName || a.aliasName || a.externalId}</span>
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
      </section>

      {createdVideoId && (
        <div className="card p-6 border-brand-200 bg-brand-50">
          <p className="font-medium text-brand-800">
            Vidéo créée : <code className="rounded bg-brand-100 px-1.5 py-0.5">{createdVideoId}</code>
          </p>
          <p className="text-sm text-brand-700 mt-1">Suivez le statut dans l’onglet Historique.</p>
        </div>
      )}
    </div>
  );
}
