'use client';

import { useTheme } from '../../components/ThemeProvider';

type Theme = 'light' | 'dark' | 'system';

const options: { value: Theme; label: string; desc: string }[] = [
  { value: 'light', label: 'Clair', desc: 'Thème clair' },
  { value: 'dark', label: 'Sombre', desc: 'Thème sombre' },
  { value: 'system', label: 'Système', desc: 'Suivre les préférences du système' },
];

export default function SettingsPage() {
  const { theme, setTheme, resolved } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-header">Paramètres</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Personnalisez l’apparence et le comportement de l’application.
        </p>
      </div>

      <section className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Apparence</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choisissez le thème. « Système » suit les préférences de votre appareil.
            </p>
          </div>
          <span className="text-xs rounded-full px-2.5 py-1 bg-brand-500/10 text-slate-700 dark:text-slate-200 ring-1 ring-brand-500/15">
            Actuel : <strong>{resolved === 'dark' ? 'Sombre' : 'Clair'}</strong>
            {theme === 'system' && ' (système)'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`
                flex flex-col items-start rounded-2xl border px-5 py-4 text-left transition-all
                ${theme === opt.value
                  ? 'border-brand-500/40 bg-brand-500/10 ring-1 ring-brand-500/20'
                  : 'border-slate-200/80 bg-white/60 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'
                }
              `}
            >
              <span className="font-medium text-slate-900 dark:text-white">{opt.label}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
