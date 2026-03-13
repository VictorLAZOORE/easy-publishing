import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-2xl">
      <h1 className="page-header mb-2">Bienvenue sur Easy Publishing</h1>
      <p className="text-slate-600 mb-8">
        Publiez vos vidéos sur plusieurs comptes YouTube en quelques étapes.
      </p>

      <div className="card p-6 space-y-6">
        <h2 className="section-title">Démarrage rapide</h2>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
              1
            </span>
            <div>
              <p className="font-medium text-slate-900">Connecter un compte YouTube</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Allez dans <Link href="/accounts" className="text-brand-600 hover:underline">Comptes</Link> et cliquez sur « Connecter YouTube ». Ou appelez{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">GET /api/oauth/youtube/start?userId=USER_ID</code>
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
              2
            </span>
            <div>
              <p className="font-medium text-slate-900">Obtenir une URL de pré-signature S3</p>
              <p className="text-sm text-slate-500 mt-0.5">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/storage/presign</code> avec header{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">x-user-id: USER_ID</code>
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
              3
            </span>
            <div>
              <p className="font-medium text-slate-900">Lancer l’upload</p>
              <p className="text-sm text-slate-500 mt-0.5">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">POST /api/youtube/start-upload</code> avec header{' '}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">x-user-id: USER_ID</code>
              </p>
            </div>
          </li>
        </ol>
        <div className="pt-4 flex flex-wrap gap-3">
          <Link href="/upload" className="btn-primary">
            Créer un upload
          </Link>
          <Link href="/accounts" className="btn-secondary">
            Gérer les comptes
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            Voir le dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
