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
      <h1 className="page-header">Paramètres</h1>

      <section className="card p-6">
        <h2 className="section-title">Apparence</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Choisissez le thème de l’application. Le thème « Système » suit les préférences de votre appareil.
        </p>
        <div className="flex flex-wrap gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`
                flex flex-col items-start rounded-xl border-2 px-5 py-4 text-left transition-all
                ${theme === opt.value
                  ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                }
              `}
            >
              <span className="font-medium text-slate-900 dark:text-white">{opt.label}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Thème actuel : <strong>{resolved === 'dark' ? 'Sombre' : 'Clair'}</strong>
          {theme === 'system' && ' (système)'}
        </p>
      </section>
    </div>
  );
}
