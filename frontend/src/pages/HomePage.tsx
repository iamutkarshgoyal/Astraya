import { type FormEvent, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Flame, Gift, Mail, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router';

import { BrandLoadingScreen } from '@/components/brand/BrandLoadingScreen';
import { BrandMark } from '@/components/brand/BrandMark';
import { CelestialParticles } from '@/components/brand/CelestialParticles';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ProductCard } from '@/components/catalog/ProductCard';
import { SmartImage } from '@/components/media/SmartImage';
import { Reveal } from '@/components/sections/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAsyncData } from '@/hooks/useAsyncData';
import { catalogService } from '@/services/catalog-service';
import { engagementService } from '@/services/engagement-service';
import { ASTRAYA_EMAIL } from '@/utils/brand';
import { getErrorMessage } from '@/utils/errors';

const highlights = [
  {
    icon: Sparkles,
    title: 'Small-batch finish',
    text: 'Each candle is poured, cured, labeled, and packed with a slower studio rhythm.',
  },
  {
    icon: Flame,
    title: 'Refined burn',
    text: 'Clean wax blends, balanced wicks, and elegant fragrance throws for evening rituals.',
  },
  {
    icon: ShieldCheck,
    title: 'Gift-ready care',
    text: 'Protective packaging and premium presentation for birthdays, weddings, and festivals.',
  },
];

export function HomePage() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { data } = useAsyncData(
    async () => {
      const [categories, featuredProducts, bestSellers] = await Promise.all([
        catalogService.listCategories(),
        catalogService.listProducts({ featured: true }),
        catalogService.listProducts({ best_seller: true }),
      ]);
      return {
        categories: categories.slice(0, 4),
        featuredProducts: featuredProducts.items.slice(0, 4),
        bestSellers: bestSellers.items.slice(0, 3),
      };
    },
    [],
  );
  const productsForImages = [...(data?.featuredProducts ?? []), ...(data?.bestSellers ?? [])];
  const imageForProduct = (slug: string, imageIndex = 0) => {
    const product = productsForImages.find((item) => item.slug === slug);
    return product?.images[imageIndex]?.image_url ?? product?.primary_image_url ?? product?.images[0]?.image_url;
  };
  const heroImageUrl =
    imageForProduct('celestial-oud-jar-candle', 1) ??
    data?.featuredProducts[0]?.primary_image_url ??
    data?.featuredProducts[0]?.images[0]?.image_url;
  const studioImageUrl =
    imageForProduct('astral-gift-box', 1) ??
    data?.featuredProducts[0]?.primary_image_url ??
    data?.featuredProducts[0]?.images[0]?.image_url;
  const shelfImages = [
    ['lunar-bloom-soy-candle', 'Astraya floral candle'],
    ['solstice-spice-candle', 'Astraya warm spice candle'],
    ['quiet-nebula-aromatherapy-candle', 'Astraya aromatherapy candle'],
    ['astral-gift-box', 'Astraya gift box candles'],
  ].map(([slug, alt]) => ({
    alt,
    src: imageForProduct(slug),
  }));

  useEffect(() => {
    if (!heroImageUrl) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImageUrl;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, [heroImageUrl]);

  async function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterStatus(null);
    try {
      await engagementService.subscribeNewsletter({ email });
      setEmail('');
      setNewsletterStatus('You are on the Astraya list.');
    } catch (error) {
      setNewsletterStatus(getErrorMessage(error, 'Newsletter signup failed'));
    }
  }

  return (
    <div className="overflow-hidden">
      <BrandLoadingScreen />

      <section className="relative bg-astraya-navy text-white">
        <motion.div
          className="absolute inset-0"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 0.55 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <SmartImage
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="eager"
            src={heroImageUrl}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-astraya-navy via-astraya-navy/88 to-astraya-navy/30" />
        <CelestialParticles />
        <div className="container relative grid min-h-[650px] gap-10 pb-20 pt-32 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-28">
          <motion.div
            className="max-w-2xl"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.18, ease: 'easeOut' }}
            >
              <BrandMark inverse />
            </motion.div>
            <p className="mb-4 mt-10 font-button text-xs font-bold uppercase tracking-[0.26em] text-astraya-gold">
              Luxury handmade candles
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[0.06em] md:text-8xl">
              Astraya
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
              Celestial candle rituals poured for calm evenings, refined gifting, and
              beautiful rooms that feel quietly luminous.
            </p>
            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.42, ease: 'easeOut' }}
            >
              <Button asChild variant="gold">
                <Link to="/shop">
                  Shop candles
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/categories/gift-boxes">Explore gifting</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-astraya-cream py-12">
        <div className="container grid gap-4 sm:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.08}>
                <article className="h-full rounded-lg border border-astraya-border bg-astraya-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-astraya-gold/65 hover:shadow-card">
                  <Icon className="mb-4 text-astraya-gold" size={24} aria-hidden="true" />
                  <h2 className="font-serif text-2xl text-astraya-navy">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-astraya-text/68">{item.text}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Collections"
              title="Fragrance families for every ritual"
              text="Choose by mood, occasion, finish, or gift intent."
              action={
                <Button asChild variant="outline">
                  <Link to="/categories">
                    View all
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(data?.categories ?? []).map((category, index) => (
              <Reveal key={category.id} delay={index * 0.06}>
                <CategoryCard category={category} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-astraya-card py-16">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Featured"
              title="Signature candles"
              text="Astraya favorites with clean wax blends, layered fragrance notes, and gift-ready details."
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(data?.featuredProducts ?? []).map((product, index) => (
              <Reveal key={product.id} delay={index * 0.06}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div>
              <SectionHeading
                eyebrow="Best sellers"
                title="Most gifted by Astraya customers"
                text="Warm, balanced scents selected for hosting, celebration, and calm night rituals."
                className="mb-6"
              />
              <Button asChild variant="primary">
                <Link to="/shop?best_seller=true">
                  Shop best sellers
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {(data?.bestSellers ?? []).map((product, index) => (
              <Reveal key={product.id} delay={index * 0.06}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-astraya-navy py-16 text-white">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="mb-3 font-button text-xs font-bold uppercase tracking-[0.24em] text-astraya-gold">
                Studio note
              </p>
              <div className="mb-5 h-px w-20 bg-astraya-gold/70" aria-hidden="true" />
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-[0.04em] md:text-6xl">
                Candlelight with a quiet celestial pulse
              </h2>
              <p className="mt-5 text-base leading-8 text-white/72">
                Astraya pairs Indian gifting warmth with restrained luxury: polished jars,
                soft labels, balanced fragrance, and a glow designed to sit naturally in
                modern homes.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-astraya-gold/25 shadow-luxury">
              <SmartImage alt="Astraya gift box candle set" src={studioImageUrl} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-astraya-cream py-16">
        <div className="container grid gap-6 lg:grid-cols-3">
          {[
            ['The scent is plush, not loud. It made our dinner table feel instantly warmer.', 'Meera S.'],
            ['Beautiful packaging and a slow, even burn. Lunar Bloom has become my nightly ritual.', 'Ananya R.'],
            ['The gift box felt thoughtful and premium from the first look.', 'Kavya M.'],
          ].map(([quote, name], index) => (
            <Reveal key={name} delay={index * 0.08}>
              <article className="h-full rounded-lg border border-astraya-border bg-astraya-card p-6 shadow-sm">
                <div className="mb-4 flex text-astraya-gold">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} size={16} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-base leading-7 text-astraya-text/76">{quote}</p>
                <p className="mt-5 font-button text-sm font-semibold uppercase tracking-[0.14em] text-astraya-navy">
                  {name}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="From the studio"
              title="A glimpse of the Astraya shelf"
              text="Layered jar finishes, warm wax tones, and considered gifting details."
            />
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shelfImages.map((image, index) => (
              <Reveal key={image.alt} delay={index * 0.05}>
                <div className="relative aspect-square overflow-hidden rounded-lg border border-astraya-border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-card">
                  <SmartImage alt={image.alt} src={image.src} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-astraya-card py-16">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <div>
              <Mail className="mb-4 text-astraya-gold" size={28} aria-hidden="true" />
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-[0.04em] text-astraya-navy">
                Notes on new pours and gift edits
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleNewsletter}>
              <Input
                aria-label="Email address"
                placeholder={ASTRAYA_EMAIL}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button type="submit" variant="gold">
                Join list
                <Gift size={17} aria-hidden="true" />
              </Button>
              {newsletterStatus && (
                <p className="text-sm text-astraya-text/68 sm:col-span-2">{newsletterStatus}</p>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
