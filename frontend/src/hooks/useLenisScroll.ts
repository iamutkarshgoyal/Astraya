import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';

export function useLenisScroll() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.05,
      wheelMultiplier: 0.88,
    });
    let animationFrame = 0;

    const animate = (time: number) => {
      if (document.visibilityState === 'visible') {
        lenis.raf(time);
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);
}
