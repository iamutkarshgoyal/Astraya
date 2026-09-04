import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { HERO_CANDLE_PRODUCTS } from '@/data/candleVisuals';

export function CandleHero() {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const selectedProduct = HERO_CANDLE_PRODUCTS[selectedProductIndex];

  return (
    <section className="candle-hero" aria-labelledby="candle-hero-title">
      <div className="candle-hero__scene" aria-hidden="true">
        <motion.img
          key={selectedProduct.id}
          alt=""
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          className="candle-hero__photo"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.025 }}
          src={selectedProduct.image}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      <div className="candle-hero__shade" aria-hidden="true" />

      <div className="container candle-hero__content">
        <motion.div
          className="candle-hero__copy"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-button text-[0.68rem] font-semibold uppercase text-astraya-gold">
            Hand-poured soy candles · Crafted in India
          </p>

          <h1
            id="candle-hero-title"
            className="mt-4 font-display text-5xl font-semibold leading-none text-white sm:mt-6 sm:text-7xl md:text-8xl"
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
        </motion.div>
      </div>

      <div className="candle-hero__product-rail" aria-label="Choose a product photo">
        {HERO_CANDLE_PRODUCTS.map((product, index) => (
          <button
            key={product.id}
            className="candle-hero__product-thumb"
            data-active={index === selectedProductIndex ? 'true' : 'false'}
            type="button"
            aria-label={`View ${product.name} photo`}
            aria-pressed={index === selectedProductIndex}
            title={product.name}
            onClick={() => setSelectedProductIndex(index)}
          >
            <img alt={product.alt} src={product.image} />
          </button>
        ))}
      </div>

      <a className="candle-hero__scroll" href="#the-pour">
        Discover the ritual
        <ArrowDown size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
