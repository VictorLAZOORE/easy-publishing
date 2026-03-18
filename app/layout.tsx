import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import PageWrapper from '../components/PageWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Easy Publishing — Multi-upload SaaS',
  description: 'Publiez vos vidéos sur plusieurs comptes YouTube en un clic.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&d))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <ThemeProvider>
          <div className="min-h-screen">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute -top-24 -left-24 w-[400px] h-[400px]"
                style={{
                  background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(45, 212, 191, 0.12) 0%, rgba(45, 212, 191, 0.04) 45%, transparent 70%)',
                }}
              />
              <div
                className="absolute top-24 right-0 w-[450px] h-[450px]"
                style={{
                  background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.02) 45%, transparent 70%)',
                }}
              />
              <div
                className="absolute bottom-0 left-1/3 w-[500px] h-[500px]"
                style={{
                  background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(14, 165, 233, 0.06) 0%, rgba(14, 165, 233, 0.02) 45%, transparent 70%)',
                }}
              />
            </div>

            <div className="relative flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <PageWrapper>{children}</PageWrapper>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
