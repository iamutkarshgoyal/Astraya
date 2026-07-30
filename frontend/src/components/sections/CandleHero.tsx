import {
  Component,
  lazy,
  Suspense,
  type ErrorInfo,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, Flame, Rotate3D, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { SceneFallback } from '@/components/three/SceneFallback';
import { Button } from '@/components/ui/button';

const CandleScene = lazy(() => import('@/components/three/CandleScene'));

type WebGLCapability = {
  softwareRenderer: boolean;
  supported: boolean;
};

function detectWebGLCapability(): WebGLCapability {
  try {
    const canvas = document.createElement('canvas');
    const context =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    if (!context) {
      return { softwareRenderer: false, supported: false };
    }

    const rendererInfo = context.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(
      rendererInfo
        ? context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)
        : context.getParameter(context.RENDERER),
    );
    const softwareRenderer = /swiftshader|llvmpipe|software|offscreen/i.test(
      renderer,
    );
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return { softwareRenderer, supported: true };
  } catch {
    return { softwareRenderer: false, supported: false };
  }
}

function getMobileScenePreference() {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(max-width: 767px)').matches;
}

type SceneBoundaryProps = PropsWithChildren<{
  fallback: React.ReactNode;
}>;

class SceneBoundary extends Component<
  SceneBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Astraya 3D candle scene could not load.', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function CandleHero() {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [isLit, setIsLit] = useState(true);
  const [webGLCapability] = useState(detectWebGLCapability);
  const [isMobile, setIsMobile] = useState(getMobileScenePreference);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(
    () => document.visibilityState === 'visible',
  );
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateMobileMode = () => setIsMobile(getMobileScenePreference());
    mediaQuery.addEventListener('change', updateMobileMode);
    return () => mediaQuery.removeEventListener('change', updateMobileMode);
  }, []);

  useEffect(() => {
    const updateVisibility = () =>
      setIsPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', updateVisibility);
    return () =>
      document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { rootMargin: '160px 0px', threshold: 0.02 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const toggleCandle = () => setIsLit((current) => !current);
  const interactionLabel = isLit
    ? 'Extinguish the Astraya candle'
    : 'Relight the Astraya candle';
  const fallback = <SceneFallback isLit={isLit} />;
  const limitedCpu =
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4;
  const isCompact =
    isMobile || limitedCpu || webGLCapability.softwareRenderer;
  const canRenderScene =
    webGLCapability.supported &&
    !webGLCapability.softwareRenderer &&
    !sceneFailed;

  return (
    <section
      ref={heroRef}
      className="candle-hero"
      data-candle-hero
      data-lit={isLit ? 'true' : 'false'}
      aria-labelledby="candle-hero-title"
    >
      <div className="candle-hero__scene" aria-hidden="true">
        {canRenderScene ? (
          <SceneBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <CandleScene
                active={isHeroVisible && isPageVisible}
                compact={isCompact}
                isLit={isLit}
                mobile={isMobile}
                onContextLost={() => setSceneFailed(true)}
                onToggle={toggleCandle}
                reducedMotion={prefersReducedMotion}
              />
            </Suspense>
          </SceneBoundary>
        ) : (
          fallback
        )}
      </div>

      <div className="candle-hero__shade" aria-hidden="true" />

      <div className="container candle-hero__content">
        <motion.div
          className="candle-hero__copy"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="candle-hero__brand-lockup">
            <img
              alt="Astraya"
              className="h-14 w-14 rounded-full object-cover"
              height="56"
              src="/assets/astraya/logo/astraya-logo.jpg"
              width="56"
            />
            <div>
              <p className="font-button text-[0.68rem] font-semibold uppercase text-astraya-gold">
                Hand-poured soy candles
              </p>
              <p className="mt-1 text-sm text-white/60">Crafted in India</p>
            </div>
          </div>

          <h1
            id="candle-hero-title"
            className="mt-5 font-display text-5xl font-semibold leading-none text-white sm:mt-7 sm:text-7xl md:text-8xl"
          >
            Astraya
          </h1>
          <p className="mt-3 max-w-2xl font-display text-2xl font-medium leading-tight text-[#f0d59f] sm:mt-4 sm:text-4xl md:text-5xl">
            Light the moment.
            <br />
            Feel the magic.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-7 md:text-lg md:leading-8">
            Handcrafted candles created to transform everyday spaces into warm,
            memorable experiences inspired by the cosmos.
          </p>

          <div className="candle-hero__actions mt-5 flex gap-3 sm:mt-8">
            <Button asChild variant="gold">
              <Link to="/shop">
                Shop now
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              className="border-white/45 bg-white/10 text-white backdrop-blur-md hover:border-white hover:bg-white hover:text-astraya-navy"
              variant="outline"
            >
              <Link to="/categories">Explore candles</Link>
            </Button>
          </div>

          <div
            className="candle-hero__qualities mt-5 flex flex-wrap gap-2 sm:mt-8"
            aria-label="Candle qualities"
          >
            <span className="candle-hero__glass-chip">
              <Sparkles size={14} aria-hidden="true" />
              Soy wax
            </span>
            <span className="candle-hero__glass-chip">
              <Rotate3D size={14} aria-hidden="true" />
              Drag gently to explore
            </span>
          </div>
        </motion.div>
      </div>

      <button
        className="candle-hero__flame-target"
        type="button"
        aria-label={interactionLabel}
        title={interactionLabel}
        onClick={toggleCandle}
      >
        <span aria-hidden="true" />
      </button>

      <div className="candle-hero__interaction">
        <AnimatePresence mode="wait">
          <motion.p
            key={isLit ? 'lit' : 'unlit'}
            className="candle-hero__message"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
            role="status"
            transition={{ duration: 0.35 }}
          >
            {isLit
              ? 'Touch the flame to change the mood.'
              : 'The light may fade, but the fragrance remains.'}
          </motion.p>
        </AnimatePresence>
        <button
          className="candle-hero__toggle"
          type="button"
          aria-label={interactionLabel}
          onClick={toggleCandle}
        >
          <Flame size={16} fill={isLit ? 'currentColor' : 'none'} aria-hidden="true" />
          {isLit ? 'Blow out' : 'Light again'}
        </button>
      </div>

      <a className="candle-hero__scroll" href="#the-pour">
        Discover the ritual
        <ArrowDown size={16} aria-hidden="true" />
      </a>

      <p className="sr-only" aria-live="polite">
        {isLit ? 'The Astraya candle is lit.' : 'The Astraya candle is extinguished.'}
      </p>
    </section>
  );
}
