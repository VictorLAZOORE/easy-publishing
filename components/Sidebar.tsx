'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/upload', label: 'Upload', icon: '⬆️' },
  { href: '/accounts', label: 'Comptes', icon: '🔗' },
  { href: '/history', label: 'Historique', icon: '📜' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-slate-200 bg-white shadow-sm sticky top-0">
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
            Easy Publishing
          </span>
        </Link>
        <p className="text-xs text-slate-500 mt-1">Multi-upload vidéo</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">Multi Upload SaaS</p>
      </div>
    </aside>
  );
}
