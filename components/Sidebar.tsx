'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/upload', label: 'Upload', icon: '⬆️' },
  { href: '/bucket', label: 'Bucket', icon: '🪣' },
  { href: '/accounts', label: 'Comptes', icon: '🔗' },
  { href: '/history', label: 'Historique', icon: '📜' },
  { href: '/settings', label: 'Paramètres', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-slate-200 bg-white shadow-sm sticky top-0 dark:border-slate-700 dark:bg-slate-800">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
            Easy Publishing
          </span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Multi-upload vidéo</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:ring-brand-500/40'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg" aria-hidden>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-400 dark:text-slate-500">Multi Upload SaaS</p>
      </div>
    </aside>
  );
}
