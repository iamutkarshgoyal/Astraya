import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';

export function CandleHero() {
  const prefersReducedMotion = Boolean(useReducedMotion());
  return (
    <section className="candle-hero" aria-labelledby="candle-hero-title">
      <img
        alt="Astraya festive candle gift box with handcrafted mithai, modak and butterfly candles"
        className="candle-hero__photo"
        src="/assets/astraya/campaign-hero-v2.png"
      />
      <div className="candle-hero__shade" aria-hidden="true" />

      <div className="container candle-hero__content">
        <motion.div
          className="candle-hero__copy"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-button text-[0.68rem] font-medium uppercase tracking-[0.24em] text-astraya-gold">
            Astraya festive edit
          </p>

          <h1
            id="candle-hero-title"
            className="mt-5 max-w-lg font-display text-5xl font-medium leading-[0.96] text-astraya-navy sm:text-6xl lg:text-[4.9rem]"
          >
            A celebration<br />in every flame.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-astraya-text/75 sm:text-base sm:leading-8">
            Handcrafted candle collections inspired by Indian celebrations,
            thoughtful gifting and the beauty of gathering.
          </p>

          <div className="candle-hero__actions mt-5 flex gap-3 sm:mt-8">
            <Button asChild variant="primary">
              <Link to="/shop">
                Shop the festive edit
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
            >
              <Link to="/categories">Shop by collection</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
