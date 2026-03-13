import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Easy Publishing — Multi-upload SaaS',
  description: 'Publiez vos vidéos sur plusieurs comptes YouTube en un clic.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
