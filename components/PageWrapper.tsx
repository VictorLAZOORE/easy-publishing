'use client';

import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    <div
      className={
        isLanding
          ? 'w-full max-w-[min(1400px,96vw)] mx-auto px-4 sm:px-6'
          : 'page p-5 sm:p-8'
      }
    >
      {children}
    </div>
  );
}
