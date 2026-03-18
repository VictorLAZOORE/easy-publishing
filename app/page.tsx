import Link from 'next/link';
import LandingHeader from '../components/LandingHeader';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-[500px] h-[500px] opacity-80"
            style={{
              background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(45, 212, 191, 0.25) 0%, rgba(45, 212, 191, 0.08) 40%, transparent 70%)',
            }}
          />
          <div
            className="absolute top-1/2 -left-24 w-[400px] h-[400px] opacity-80"
            style={{
              background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 70%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Gérez votre contenu.
            <br />
            <span className="bg-gradient-to-r from-teal-500 to-cyan-400 bg-clip-text text-transparent">
              Publiez partout.
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Une seule vidéo, toutes vos plateformes. Créez, organisez et publiez sur YouTube, TikTok,
            Instagram et Facebook en un clic.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            <Link href="/signup" className="btn btn-primary text-base px-8 py-3">
              Créer un compte gratuit
            </Link>
            <Link href="/login" className="btn btn-secondary text-base px-8 py-3">
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100/0 via-slate-100/50 to-slate-100/0 dark:from-slate-800/0 dark:via-slate-800/40 dark:to-slate-800/0">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-10">
            Publiez sur toutes vos plateformes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF0000] text-white shadow-lg">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">YouTube</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#000000] text-white shadow-lg">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">TikTok</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743] text-white shadow-lg">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948 2.697 4.477 6.992 6.228 11.548 6.228 4.558 0 8.852-1.751 11.548-6.228 1.32-2.187 1.947-4.64 1.947-7.028 0-3.259-.014-3.668-.072-4.948-.196-4.354-2.617-6.78-6.98-6.98C20.332.014 19.923 0 19.659 0H12z" />
                </svg>
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Instagram</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877F2] text-white shadow-lg">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facebook</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-center mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Une seule interface pour gérer et publier votre contenu sur toutes vos chaînes.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/50">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-2xl">📁</span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">Gestion centralisée</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Stockez vos vidéos dans un seul endroit. Organisez, prévisualisez et préparez vos publications avant de les diffuser.
              </p>
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/50">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-2xl">🚀</span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">Publication multi-plateforme</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Publiez sur YouTube, TikTok, Instagram et Facebook en une seule action. Plus besoin de répéter manuellement sur chaque plateforme.
              </p>
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/50">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-2xl">📊</span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">Suivi et historique</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Suivez vos publications en temps réel. Consultez l&apos;historique et les statuts de vos vidéos sur toutes les plateformes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(20, 184, 166, 0.04) 30%, rgba(20, 184, 166, 0.08) 50%, rgba(20, 184, 166, 0.04) 70%, transparent 100%)',
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Prêt à simplifier votre publication ?
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Créez un compte gratuit et commencez à publier sur toutes vos plateformes en quelques minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
            <Link href="/signup" className="btn btn-primary text-base px-8 py-3">
              Créer mon compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-4 py-8 bg-gradient-to-t from-slate-100/80 via-slate-50/50 to-transparent dark:from-slate-800/60 dark:via-slate-900/30 dark:to-transparent">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 text-white text-sm font-semibold">
              EP
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Easy Publishing</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
