'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/bucket', label: 'Bucket', icon: '🪣' },
  { href: '/accounts', label: 'Comptes', icon: '🔗' },
  { href: '/history', label: 'Historique', icon: '📜' },
  { href: '/settings', label: 'Paramètres', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/' || pathname === '/login' || pathname === '/signup') return null;

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/login');
  }

  return (
    <aside className="w-[280px] hidden md:flex min-h-screen flex-col sticky top-0">
      <div className="p-5">
        <div className="card-soft p-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-300 shadow-lg shadow-brand-500/20 flex items-center justify-center text-white font-semibold">
              EP
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white leading-tight">Easy Publishing</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Upload & publish YouTube (multi-compte)</p>
            </div>
          </Link>
        </div>
      </div>

      <nav className="flex-1 px-5 pb-5">
        <div className="card-soft p-2">
          <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-brand-500/10 text-slate-900 dark:text-white ring-1 ring-brand-500/20'
                      : 'text-slate-600 hover:bg-black/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                    }
                  `}
                >
                  <span className={`text-lg ${isActive ? '' : 'opacity-80'}`} aria-hidden>{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>
      </nav>

      <div className="px-5 pb-6">
        <div className="card-soft p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Astuce</p>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 leading-snug">
            Ajoute tes vidéos dans <span className="font-medium">Bucket</span>, puis publie-les via le flow guidé.
          </p>
          <button type="button" onClick={logout} className="btn btn-secondary w-full mt-4">
            Se déconnecter
          </button>
        </div>
      </div>
    </aside>
  );
}
