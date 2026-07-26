import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { BrandMark } from '@/components/brand/BrandMark';

export function BrandLoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(false), prefersReducedMotion ? 260 : 1050);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-astraya-ivory"
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.55, ease: 'easeOut' }}
          aria-label="Loading Astraya"
        >
          <motion.div
            className="relative grid justify-items-center gap-5"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <BrandMark />
            <div className="h-px w-48 overflow-hidden bg-astraya-border">
              <motion.div
                className="h-full w-24 bg-gradient-to-r from-transparent via-astraya-gold to-transparent"
                initial={{ x: '-6rem' }}
                animate={prefersReducedMotion ? undefined : { x: '12rem' }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <p className="font-button text-xs font-semibold uppercase tracking-[0.28em] text-astraya-gold">
              Inspired by the Cosmos
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
