import { type FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Gift, Mail, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router';

import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ProductCard } from '@/components/catalog/ProductCard';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAsyncData } from '@/hooks/useAsyncData';
import { catalogService } from '@/services/catalog-service';
import { engagementService } from '@/services/engagement-service';
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
      <section className="relative bg-astraya-navy text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url('/images/products/celestial-oud-jar-candle-detail.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-astraya-navy via-astraya-navy/86 to-astraya-navy/34" />
        <div className="container relative grid min-h-[590px] gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-astraya-gold">
              Luxury handmade candles
            </p>
            <h1 className="font-display text-6xl leading-[0.95] md:text-8xl">Astraya</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/78">
              Celestial candle rituals poured for calm evenings, refined gifting, and
              beautiful rooms that feel quietly luminous.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold">
                <Link to="/shop">
                  Shop candles
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/categories/gift-boxes">Explore gifting</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-astraya-navy/10 p-5">
                <Icon className="mb-4 text-astraya-gold" size={24} aria-hidden="true" />
                <h2 className="font-serif text-2xl text-astraya-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-astraya-text/68">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-14">
        <div className="container">
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
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(data?.categories ?? []).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container">
          <SectionHeading
            eyebrow="Featured"
            title="Signature candles"
            text="Astraya favorites with clean wax blends, layered fragrance notes, and gift-ready details."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(data?.featuredProducts ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
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
          <div className="grid gap-5 md:grid-cols-3">
            {(data?.bestSellers ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-astraya-navy py-14 text-white">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-astraya-gold">
              Studio note
            </p>
            <h2 className="font-display text-4xl leading-tight md:text-6xl">
              Candlelight with a quiet celestial pulse
            </h2>
            <p className="mt-5 text-base leading-8 text-white/72">
              Astraya pairs Indian gifting warmth with restrained luxury: polished jars,
              soft labels, balanced fragrance, and a glow designed to sit naturally in
              modern homes.
            </p>
          </div>
          <img
            alt="Astraya gift box candle set"
            className="aspect-[4/3] w-full rounded-lg object-cover"
            src="/images/products/astral-gift-box-detail.png"
          />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container grid gap-6 lg:grid-cols-3">
          {[
            ['The scent is plush, not loud. It made our dinner table feel instantly warmer.', 'Meera S.'],
            ['Beautiful packaging and a slow, even burn. Lunar Bloom has become my nightly ritual.', 'Ananya R.'],
            ['The gift box felt thoughtful and premium from the first look.', 'Kavya M.'],
          ].map(([quote, name]) => (
            <article key={name} className="rounded-lg border border-astraya-navy/10 p-6">
              <div className="mb-4 flex text-astraya-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" aria-hidden="true" />
                ))}
              </div>
              <p className="text-base leading-7 text-astraya-text/76">{quote}</p>
              <p className="mt-5 font-semibold text-astraya-navy">{name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <SectionHeading
            eyebrow="From the studio"
            title="A glimpse of the Astraya shelf"
            text="Layered jar finishes, warm wax tones, and considered gifting details."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              '/images/products/lunar-bloom-soy-candle.png',
              '/images/products/solstice-spice-candle.png',
              '/images/products/quiet-nebula-aromatherapy-candle.png',
              '/images/products/astral-gift-box.png',
            ].map((image) => (
              <img
                key={image}
                alt="Astraya candle shelf"
                className="aspect-square rounded-lg object-cover"
                src={image}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Mail className="mb-4 text-astraya-gold" size={28} aria-hidden="true" />
            <h2 className="font-display text-4xl leading-tight text-astraya-navy">
              Notes on new pours and gift edits
            </h2>
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleNewsletter}>
            <Input
              aria-label="Email address"
              placeholder="you@example.com"
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
        </div>
      </section>
    </div>
  );
}
