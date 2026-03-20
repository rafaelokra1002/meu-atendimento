'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/loja';

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[270px] p-4 md:p-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
