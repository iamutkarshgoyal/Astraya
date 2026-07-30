import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SeoMetadata } from '@/components/layout/SeoMetadata';
import { cn } from '@/utils/cn';

export function RootLayout() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col bg-astraya-ivory text-astraya-text">
      <SeoMetadata />
      <SiteHeader />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className={cn('flex-1', location.pathname !== '/' && 'pt-20')}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  );
}
