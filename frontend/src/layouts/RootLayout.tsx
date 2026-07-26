import { Outlet, ScrollRestoration } from 'react-router';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-astraya-ivory text-astraya-text">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  );
}
