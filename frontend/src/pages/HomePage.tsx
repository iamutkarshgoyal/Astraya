import { type FormEvent, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Droplets,
  Flame,
  Gift,
  Instagram,
  Leaf,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  Wind,
} from 'lucide-react';
import { Link } from 'react-router';

import { BrandLoadingScreen } from '@/components/brand/BrandLoadingScreen';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ProductCard } from '@/components/catalog/ProductCard';
import { SmartImage } from '@/components/media/SmartImage';
import { CandleHero } from '@/components/sections/CandleHero';
import { Reveal } from '@/components/sections/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useLenisScroll } from '@/hooks/useLenisScroll';
import { catalogService } from '@/services/catalog-service';
import { engagementService } from '@/services/engagement-service';
import {
  ASTRAYA_EMAIL,
  ASTRAYA_INSTAGRAM_HANDLE,
  ASTRAYA_INSTAGRAM_URL,
  ASTRAYA_WHATSAPP_URL,
} from '@/utils/brand';
import { getErrorMessage } from '@/utils/errors';

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

const instagramGallery = [
  {
    alt: 'Pastel Astraya daisy candles in clear glass vessels',
    baseName: '01-daisy-pastel',
    postUrl: 'https://www.instagram.com/p/DbTTrbJyGDc/',
  },
  {
    alt: 'Pink, sage, and blue Astraya star candles',
    baseName: '02-star-candles',
    postUrl: 'https://www.instagram.com/p/DbONuJOylA9/',
  },
  {
    alt: 'Astraya glass candles decorated with colourful wax hearts',
    baseName: '03-heart-candles',
    postUrl: 'https://www.instagram.com/p/DbGiS20y5Wo/',
  },
  {
    alt: 'Handcrafted Astraya daisy candle favours',
    baseName: '04-daisy-closeup',
    postUrl: 'https://www.instagram.com/p/DbBcQVOSnPg/',
  },
  {
    alt: 'Pink Astraya heart tealight candle collection',
    baseName: '05-tealights',
    postUrl: 'https://www.instagram.com/p/Da-1wlkyv8R/',
  },
  {
    alt: 'Astraya celestial floral tealight gift collection',
    baseName: '06-cosmos-candle',
    postUrl: 'https://www.instagram.com/p/Da-xsBnS9p7/',
  },
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
  const prefersReducedMotion = useReducedMotion();
  useLenisScroll();

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

      <CandleHero />

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
          <picture>
            <source
              srcSet="/assets/astraya/instagram/03-heart-candles.avif"
              type="image/avif"
            />
            <img
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
              decoding="async"
              loading="lazy"
              src="/assets/astraya/instagram/03-heart-candles.jpg"
            />
          </picture>
        </div>
        <div className="absolute inset-0 bg-[#071a32]/82" />
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
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="gold">
                <Link to="/shop">
                  Shop candles
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                className="border-white/45 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-astraya-navy"
                variant="outline"
              >
                <a href={ASTRAYA_WHATSAPP_URL} target="_blank" rel="noreferrer">
                  Order on WhatsApp
                  <MessageCircle size={17} aria-hidden="true" />
                </a>
              </Button>
            </div>
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {instagramGallery.map((image, index) => (
              <Reveal key={image.alt} delay={index * 0.05}>
                <a
                  className="group relative block aspect-square overflow-hidden rounded-lg bg-astraya-cream"
                  href={image.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${ASTRAYA_INSTAGRAM_HANDLE} on Instagram`}
                >
                  <picture>
                    <source
                      srcSet={`/assets/astraya/instagram/${image.baseName}.avif`}
                      type="image/avif"
                    />
                    <img
                      alt={image.alt}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      decoding="async"
                      loading="lazy"
                      sizes="(min-width: 768px) 33vw, 50vw"
                      src={`/assets/astraya/instagram/${image.baseName}.jpg`}
                    />
                  </picture>
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
