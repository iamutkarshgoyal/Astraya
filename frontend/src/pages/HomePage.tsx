import { type FormEvent, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Droplets,
  Flame,
  Gift,
  Instagram,
  Leaf,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  Wind,
} from 'lucide-react';
import { Link } from 'react-router';

import { BrandLoadingScreen } from '@/components/brand/BrandLoadingScreen';
import { CandlePourScene } from '@/components/brand/CandlePourScene';
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
import {
  ASTRAYA_EMAIL,
  ASTRAYA_INSTAGRAM_HANDLE,
  ASTRAYA_INSTAGRAM_URL,
} from '@/utils/brand';
import { getErrorMessage } from '@/utils/errors';

const heroImageUrl = '/images/editorial/candle-pouring.jpg';

const highlights = [
  {
    icon: Leaf,
    title: 'Soy-led wax',
    text: 'Creamy wax blends selected for a calm, even pool and an elegant finish.',
  },
  {
    icon: Wind,
    title: 'Balanced fragrance',
    text: 'Layered scent that settles into the room without overwhelming it.',
  },
  {
    icon: ShieldCheck,
    title: 'Finished by hand',
    text: 'Poured, cured, checked, and packed in small batches with gift-ready care.',
  },
];

const processSteps = [
  {
    icon: Droplets,
    number: '01',
    title: 'Melt slowly',
    text: 'Soy wax is warmed gently until it reaches a clear, even texture.',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'Blend by mood',
    text: 'Fragrance notes are measured in layers so the scent unfolds over time.',
  },
  {
    icon: Flame,
    number: '03',
    title: 'Pour with care',
    text: 'Each vessel is poured by hand around a centered cotton or wooden wick.',
  },
  {
    icon: TimerReset,
    number: '04',
    title: 'Cure in stillness',
    text: 'The candle rests before its final trim, polish, label, and burn check.',
  },
];

const testimonials = [
  [
    'The scent is plush, never loud. It made our dinner table feel instantly warmer.',
    'Meera S.',
  ],
  [
    'Beautifully finished with a slow, even burn. Lunar Bloom is now my night ritual.',
    'Ananya R.',
  ],
  ['The gift box felt thoughtful and premium from the moment it arrived.', 'Kavya M.'],
];

function CatalogCardSkeleton({
  count,
  variant = 'product',
}: {
  count: number;
  variant?: 'category' | 'product';
}) {
  return Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-astraya-border bg-astraya-card"
    >
      <div
        className={`animate-pulse bg-astraya-cream ${
          variant === 'category' ? 'aspect-[5/3]' : 'aspect-[4/3]'
        }`}
      />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded-sm bg-astraya-navy/10" />
        <div className="h-7 w-3/4 animate-pulse rounded-sm bg-astraya-navy/10" />
        <div className="h-3 w-full animate-pulse rounded-sm bg-astraya-navy/10" />
        <div className="h-3 w-2/3 animate-pulse rounded-sm bg-astraya-navy/10" />
      </div>
    </div>
  ));
}

function CatalogUnavailable() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-astraya-border bg-astraya-card px-6 text-center">
      <Flame className="text-astraya-gold" size={24} aria-hidden="true" />
      <p className="mt-4 font-serif text-2xl text-astraya-navy">
        The collection is taking a moment to arrive.
      </p>
      <p className="mt-2 max-w-md text-sm leading-6 text-astraya-text/70">
        Our candles are still here. Open the shop to try the collection again.
      </p>
      <Button asChild className="mt-5" variant="outline">
        <Link to="/shop">
          Visit the shop
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

export function HomePage() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.82], [1, 0]);

  const { data, error, isLoading } = useAsyncData(
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
    return (
      product?.images[imageIndex]?.image_url ??
      product?.primary_image_url ??
      product?.images[0]?.image_url
    );
  };
  const shelfImages = [
    [
      'lunar-bloom-soy-candle',
      'Lunar Bloom soy candle',
      '/images/editorial/botanical-finishing.jpg',
    ],
    [
      'celestial-oud-jar-candle',
      'Celestial Oud amber jar candle',
      '/images/editorial/wick-setting.jpg',
    ],
    [
      'solstice-spice-candle',
      'Solstice Spice soy candle',
      '/images/editorial/soy-wax-preparation.jpg',
    ],
    ['astral-gift-box', 'Astral candle gift set', '/images/editorial/candle-pouring.jpg'],
  ].map(([slug, alt, fallbackSrc], index) => ({
    alt,
    src: imageForProduct(slug, index % 2) ?? fallbackSrc,
  }));

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImageUrl;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

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

      <section
        ref={heroRef}
        className="relative h-[92svh] min-h-[560px] max-h-[860px] overflow-hidden bg-astraya-navy text-white"
      >
        <motion.div
          className="absolute -inset-y-14 inset-x-0"
          style={prefersReducedMotion ? undefined : { y: heroImageY }}
        >
          <SmartImage
            alt="Candle maker pouring warm wax into glass vessels"
            className="h-full w-full object-cover object-[58%_center]"
            loading="eager"
            src={heroImageUrl}
          />
        </motion.div>
        <div className="absolute inset-0 bg-[#071a32]/74" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-[#071a32]/32" />

        <CandlePourScene />

        <motion.div
          className="container relative flex h-full items-center pb-20 pt-28"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  y: heroContentY,
                  opacity: heroContentOpacity,
                }
          }
        >
          <motion.div
            className="max-w-3xl"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-12 bg-astraya-gold" aria-hidden="true" />
              <p className="font-button text-xs font-semibold uppercase text-astraya-gold">
                Hand-poured soy candles
              </p>
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] sm:text-6xl md:text-8xl lg:text-[6.5rem]">
              Astraya
            </h1>
            <p className="mt-5 max-w-xl font-serif text-2xl leading-8 text-white md:text-3xl md:leading-10">
              Light, poured into ritual.
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/75 md:text-lg md:leading-8">
              Soy-led candles shaped in small batches for slow evenings, thoughtful
              gifting, and rooms that deserve a softer kind of glow.
            </p>
            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 1.45, duration: 0.7, ease: 'easeOut' }}
            >
              <Button asChild variant="gold">
                <Link to="/shop">
                  Shop the collection
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                className="border-white/55 bg-transparent text-white hover:border-white hover:bg-white hover:text-astraya-navy"
                variant="outline"
              >
                <Link to="/about">Our studio story</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.a
          className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 font-button text-xs text-white/70"
          href="#the-pour"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ delay: 2, duration: 0.7 }}
        >
          Discover the pour
          <motion.span
            animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={17} aria-hidden="true" />
          </motion.span>
        </motion.a>
      </section>

      <section className="border-b border-astraya-border bg-astraya-cream">
        <div className="container grid sm:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.title}
                className="border-astraya-border py-7 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
                delay={index * 0.08}
              >
                <div className="flex gap-4">
                  <Icon className="mt-1 shrink-0 text-astraya-darkGold" size={22} aria-hidden="true" />
                  <div>
                    <h2 className="font-serif text-xl text-astraya-navy">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-astraya-text/68">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="the-pour" className="bg-[#10233d] py-20 text-white">
        <div className="container grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <Reveal>
            <p className="font-button text-xs font-semibold uppercase text-astraya-gold">
              From flake to flame
            </p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-tight md:text-6xl">
              The slow pour is part of the fragrance.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/70">
              A candle begins long before the wick is lit. Temperature, timing, and stillness
              shape how the wax sets and how every note travels through a room.
            </p>

            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.number}
                    className="border-t border-white/16 pt-4"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: index * 0.08, duration: 0.6, ease: 'easeOut' }}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="text-astraya-gold" size={20} aria-hidden="true" />
                      <span className="font-button text-xs text-white/38">{step.number}</span>
                    </div>
                    <h3 className="mt-4 font-serif text-2xl">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/62">{step.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-[1.08fr_0.92fr]">
            <Reveal className="sm:row-span-2">
              <div className="relative min-h-[360px] overflow-hidden rounded-lg sm:h-full sm:min-h-[520px]">
                <SmartImage
                  alt="Soy wax being prepared in a candle studio"
                  className="object-cover"
                  src="/images/editorial/soy-wax-preparation.jpg"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <SmartImage
                  alt="Candle wicks being centered after pouring"
                  className="object-cover"
                  src="/images/editorial/wick-setting.jpg"
                />
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <SmartImage
                  alt="Botanical candle finishing at the studio table"
                  className="object-cover"
                  src="/images/editorial/botanical-finishing.jpg"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-astraya-card py-20">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Signature edit"
              title="Candles with a celestial pulse"
              text="Real soy-wax textures, layered scent stories, and considered vessels for daily ritual."
              action={
                <Button asChild variant="outline">
                  <Link to="/shop">
                    Shop all
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {error ? (
              <div className="md:col-span-2 lg:col-span-4">
                <CatalogUnavailable />
              </div>
            ) : isLoading || !data ? (
              <CatalogCardSkeleton count={4} />
            ) : (
              data.featuredProducts.map((product, index) => (
                <Reveal key={product.id} delay={index * 0.06}>
                  <ProductCard product={product} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#edf0ea] py-20">
        <div className="container grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="Most loved"
              title="The scents customers return to"
              text="Warm, balanced compositions chosen for hosting, decompressing, and thoughtful gifting."
              className="mb-6"
            />
            <Button asChild variant="primary">
              <Link to="/shop?best_seller=true">
                Shop best sellers
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {error ? (
              <div className="md:col-span-3">
                <CatalogUnavailable />
              </div>
            ) : isLoading || !data ? (
              <CatalogCardSkeleton count={3} />
            ) : (
              data.bestSellers.map((product, index) => (
                <Reveal key={product.id} delay={index * 0.06}>
                  <ProductCard product={product} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Collections"
              title="Choose the atmosphere first"
              text="Explore by mood, occasion, fragrance direction, or gifting intent."
              action={
                <Button asChild variant="outline">
                  <Link to="/categories">
                    View collections
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {error ? (
              <div className="md:col-span-2 lg:col-span-4">
                <CatalogUnavailable />
              </div>
            ) : isLoading || !data ? (
              <CatalogCardSkeleton count={4} variant="category" />
            ) : (
              data.categories.map((category, index) => (
                <Reveal key={category.id} delay={index * 0.06}>
                  <CategoryCard category={category} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="relative min-h-[520px] overflow-hidden bg-astraya-navy text-white">
        <div className="absolute inset-0">
          <SmartImage
            alt=""
            aria-hidden="true"
            className="object-cover object-center"
            src="/images/editorial/wick-setting.jpg"
          />
        </div>
        <div className="absolute inset-0 bg-[#071a32]/76" />
        <div className="container relative flex min-h-[520px] items-center justify-center py-20 text-center">
          <Reveal className="max-w-3xl">
            <Flame className="mx-auto text-astraya-gold" size={30} aria-hidden="true" />
            <p className="mt-5 font-button text-xs font-semibold uppercase text-astraya-gold">
              A quieter kind of luxury
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              Made to change the feeling of a room.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/72">
              Astraya brings Indian gifting warmth together with clean wax, polished
              fragrance, and candlelight that feels at home in modern spaces.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-astraya-cream py-20">
        <div className="container">
          <Reveal>
            <SectionHeading eyebrow="Candle notes" title="What the glow leaves behind" />
          </Reveal>
          <div className="grid md:grid-cols-3">
            {testimonials.map(([quote, name], index) => (
              <Reveal
                key={name}
                className="border-astraya-border py-7 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                delay={index * 0.08}
              >
                <div className="mb-5 flex text-astraya-darkGold">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} size={15} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="font-serif text-xl leading-8 text-astraya-navy">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <p className="mt-5 font-button text-xs font-semibold uppercase text-astraya-rose">
                  {name}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-astraya-card py-20">
        <div className="container">
          <Reveal>
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-button text-xs font-semibold uppercase text-astraya-rose">
                  From our shelf
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-astraya-navy md:text-5xl">
                  Follow the next pour
                </h2>
                <a
                  className="mt-3 inline-flex items-center gap-2 font-button text-sm font-semibold text-astraya-darkGold transition hover:text-astraya-navy"
                  href={ASTRAYA_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram size={18} aria-hidden="true" />
                  {ASTRAYA_INSTAGRAM_HANDLE}
                </a>
              </div>
              <Button asChild variant="outline">
                <a href={ASTRAYA_INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  Visit Instagram
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              </Button>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {shelfImages.map((image, index) => (
              <Reveal key={image.alt} delay={index * 0.05}>
                <a
                  className="group relative block aspect-square overflow-hidden rounded-lg"
                  href={ASTRAYA_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${ASTRAYA_INSTAGRAM_HANDLE} on Instagram`}
                >
                  <SmartImage
                    alt={image.alt}
                    className="object-cover transition duration-700 group-hover:scale-105"
                    src={image.src}
                  />
                  <span className="absolute inset-0 grid place-items-center bg-astraya-navy/0 text-white opacity-0 transition duration-300 group-hover:bg-astraya-navy/45 group-hover:opacity-100">
                    <Instagram size={24} aria-hidden="true" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#a95740] py-16 text-white">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <Reveal>
            <div>
              <Mail className="mb-4 text-[#f4d9a3]" size={28} aria-hidden="true" />
              <h2 className="font-display text-3xl font-semibold leading-tight md:text-5xl">
                Notes on new pours and gift edits
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleNewsletter}>
              <Input
                aria-label="Email address"
                className="border-white/35 bg-white/12 text-white placeholder:text-white/60"
                placeholder={ASTRAYA_EMAIL}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button type="submit" variant="gold">
                Join the list
                <Gift size={17} aria-hidden="true" />
              </Button>
              {newsletterStatus && (
                <p className="text-sm text-white/78 sm:col-span-2">{newsletterStatus}</p>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
