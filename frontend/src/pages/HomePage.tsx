import { type FormEvent, useState } from 'react';
import {
  ArrowRight,
  Gift,
  Instagram,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
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
  ASTRAYA_INSTAGRAM_HANDLE,
  ASTRAYA_INSTAGRAM_URL,
  ASTRAYA_WHATSAPP_URL,
} from '@/utils/brand';
import { getErrorMessage } from '@/utils/errors';

const highlights = [
  { icon: Leaf, title: 'Thoughtful wax blends', text: 'Clean, even and beautifully finished.' },
  { icon: Wind, title: 'Balanced fragrance', text: 'Made to settle softly into your space.' },
  { icon: ShieldCheck, title: 'Hand-finished in India', text: 'Poured and packed in considered batches.' },
];

const instagramGallery = [
  ['01-daisy-pastel', 'Pastel Astraya daisy candles in clear glass vessels', 'https://www.instagram.com/p/DbTTrbJyGDc/'],
  ['02-star-candles', 'Pink, sage, and blue Astraya star candles', 'https://www.instagram.com/p/DbONuJOylA9/'],
  ['03-heart-candles', 'Astraya glass candles decorated with colourful wax hearts', 'https://www.instagram.com/p/DbGiS20y5Wo/'],
  ['04-daisy-closeup', 'Handcrafted Astraya daisy candle favours', 'https://www.instagram.com/p/DbBcQVOSnPg/'],
  ['05-tealights', 'Pink Astraya heart tealight candle collection', 'https://www.instagram.com/p/Da-1wlkyv8R/'],
  ['06-cosmos-candle', 'Astraya celestial floral tealight collection', 'https://www.instagram.com/p/Da-xsBnS9p7/'],
] as const;

function CatalogCardSkeleton({ count }: { count: number }) {
  return Array.from({ length: count }).map((_, index) => (
    <div key={index} aria-hidden="true" className="overflow-hidden bg-astraya-card">
      <div className="aspect-[4/5] animate-pulse bg-astraya-cream" />
      <div className="space-y-3 py-5">
        <div className="h-3 w-20 animate-pulse bg-astraya-navy/10" />
        <div className="h-6 w-3/4 animate-pulse bg-astraya-navy/10" />
        <div className="h-3 w-1/2 animate-pulse bg-astraya-navy/10" />
      </div>
    </div>
  ));
}

function CatalogUnavailable() {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center border border-astraya-border bg-astraya-card px-6 text-center">
      <Sparkles className="text-astraya-gold" size={23} aria-hidden="true" />
      <p className="mt-4 font-display text-3xl text-astraya-navy">Our collection is taking a moment.</p>
      <p className="mt-2 max-w-md text-sm leading-6 text-astraya-text/65">Open the shop to try the collection again.</p>
      <Button asChild className="mt-5" variant="outline"><Link to="/shop">Visit the shop</Link></Button>
    </div>
  );
}

function EditorialTile({
  name,
  slug,
  imageUrl,
}: {
  name: string;
  slug: string;
  imageUrl?: string;
}) {
  return (
    <Link className="group flex h-full flex-col border-r border-t border-astraya-border bg-white first:border-l" to={`/products/${slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-astraya-cream p-2.5 pb-0">
        <SmartImage
          alt={name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          src={imageUrl}
        />
      </div>
      <div className="flex flex-1 items-end justify-between gap-4 border-b border-astraya-border p-4 pt-5">
        <div>
          <h3 className="line-clamp-2 font-button text-lg font-medium leading-snug text-astraya-ink">{name}</h3>
          <span className="mt-2 inline-block border-b border-astraya-ink pb-0.5 font-button text-xs">Shop Now</span>
        </div>
        <ArrowRight className="mb-1 shrink-0 text-astraya-gold transition group-hover:translate-x-1" size={19} aria-hidden="true" />
      </div>
    </Link>
  );
}

export function HomePage() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  useLenisScroll();

  const { data, error, isLoading } = useAsyncData(async () => {
    const [categories, featuredProducts, bestSellers] = await Promise.all([
      catalogService.listCategories(),
      catalogService.listProducts({ featured: true }),
      catalogService.listProducts({ best_seller: true }),
    ]);
    return {
      categories: categories.slice(0, 4),
      featuredProducts: featuredProducts.items.slice(0, 4),
      bestSellers: bestSellers.items.slice(0, 4),
    };
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
      <CandleHero />

      <section className="border-b border-astraya-border bg-astraya-ivory">
        <div className="container grid sm:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} className="border-astraya-border py-6 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0" delay={index * 0.06}>
                <div className="flex items-center gap-4">
                  <Icon className="shrink-0 text-astraya-gold" size={20} strokeWidth={1.5} aria-hidden="true" />
                  <div>
                    <h2 className="font-display text-xl font-medium text-astraya-navy">{item.title}</h2>
                    <p className="mt-0.5 text-xs leading-5 text-astraya-text/60">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading title="Shop by collection" text="A candle for every table, celebration and quiet corner." action={<Button asChild variant="outline"><Link to="/categories">View all collections <ArrowRight size={16} aria-hidden="true" /></Link></Button>} />
          </Reveal>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {error ? <div className="sm:col-span-2 lg:col-span-4"><CatalogUnavailable /></div> : isLoading || !data ? <CatalogCardSkeleton count={4} /> : data.categories.map((category, index) => (
              <Reveal key={category.id} className="h-full" delay={index * 0.05}><CategoryCard category={category} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading title="New & noteworthy" text="Freshly poured pieces designed to bring a little ceremony to the everyday." action={<Button asChild variant="outline"><Link to="/shop">Shop all <ArrowRight size={16} aria-hidden="true" /></Link></Button>} />
          </Reveal>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {error ? <div className="sm:col-span-2 lg:col-span-4"><CatalogUnavailable /></div> : isLoading || !data ? <CatalogCardSkeleton count={4} /> : data.featuredProducts.map((product, index) => (
              <Reveal key={product.id} className="h-full" delay={index * 0.05}>
                <EditorialTile
                  name={product.name}
                  slug={product.slug}
                  imageUrl={
                    product.name.toLowerCase().includes('butterfly')
                      ? '/assets/astraya/products/peach-glow-butterfly-t-light-candle-box/styled.jpg'
                      : product.primary_image_url ?? product.images[0]?.image_url
                  }
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e9dfd2]">
        <div className="grid lg:grid-cols-2">
          <Reveal className="min-h-[440px] lg:min-h-[650px]">
            <img className="h-full w-full object-cover" src="/images/editorial/candle-pouring.jpg" alt="Candle maker hand-pouring wax into glass vessels" loading="lazy" />
          </Reveal>
          <div className="flex items-center px-6 py-16 sm:px-12 lg:px-[10%] lg:py-24">
            <Reveal>
              <p className="font-button text-[0.68rem] font-medium uppercase tracking-[0.24em] text-astraya-gold">The Astraya way</p>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-medium leading-[1.05] text-astraya-navy md:text-6xl">Small rituals.<br />Beautifully made.</h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-astraya-text/70 md:text-base md:leading-8">Every Astraya candle is shaped by hand with considered wax, balanced fragrance and a love for details. The result is a warm, modern object made to be lit, gifted and remembered.</p>
              <div className="mt-9 grid max-w-lg grid-cols-3 border-y border-astraya-navy/15 py-6 text-center">
                <div><strong className="block font-display text-3xl font-medium text-astraya-navy">100%</strong><span className="text-[0.6rem] uppercase tracking-[0.1em] text-astraya-text/55">Hand finished</span></div>
                <div className="border-x border-astraya-navy/15"><strong className="block font-display text-3xl font-medium text-astraya-navy">India</strong><span className="text-[0.6rem] uppercase tracking-[0.1em] text-astraya-text/55">Made locally</span></div>
                <div><strong className="block font-display text-3xl font-medium text-astraya-navy">Slow</strong><span className="text-[0.6rem] uppercase tracking-[0.1em] text-astraya-text/55">Poured with care</span></div>
              </div>
              <Button asChild className="mt-9" variant="primary"><Link to="/about">Discover our story <ArrowRight size={16} aria-hidden="true" /></Link></Button>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="container">
          <Reveal>
            <SectionHeading title="Most loved" text="The pieces our customers return to—made for hosting, unwinding and thoughtful gifting." action={<Button asChild variant="outline"><Link to="/shop?best_seller=true">Shop bestsellers <ArrowRight size={16} aria-hidden="true" /></Link></Button>} />
          </Reveal>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
            {error ? <div className="sm:col-span-2 lg:col-span-4"><CatalogUnavailable /></div> : isLoading || !data ? <CatalogCardSkeleton count={4} /> : data.bestSellers.map((product, index) => (
              <Reveal key={product.id} className="h-full" delay={index * 0.05}><ProductCard product={product} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[570px] overflow-hidden bg-[#2f271f] text-white">
        <img className="absolute inset-0 h-full w-full object-cover" src="/assets/astraya/products/modak-glow-candle-box/collection-collage.jpg" alt="" aria-hidden="true" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2f271f]/95 via-[#2f271f]/70 to-transparent" />
        <div className="container relative flex min-h-[570px] items-center py-20">
          <Reveal className="max-w-xl">
            <Gift className="text-[#dec89f]" size={26} strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-5 font-button text-[0.68rem] uppercase tracking-[0.24em] text-[#dec89f]">Gifts with a glow</p>
            <h2 className="mt-4 font-display text-5xl font-medium leading-none md:text-7xl">Made to be<br />remembered.</h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/75 md:text-base">Celebrate festivals, weddings and every lovely in-between with candles that feel personal from the first glance.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold"><Link to="/categories/gift-boxes">Explore gifting <ArrowRight size={16} aria-hidden="true" /></Link></Button>
              <Button asChild className="border-white/45 bg-transparent text-white hover:border-white hover:bg-white hover:text-astraya-navy" variant="outline"><a href={ASTRAYA_WHATSAPP_URL} target="_blank" rel="noreferrer">Order on WhatsApp <MessageCircle size={16} aria-hidden="true" /></a></Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-astraya-ivory py-20 lg:py-28">
        <div className="container">
          <Reveal>
            <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div><p className="font-button text-[0.68rem] uppercase tracking-[0.24em] text-astraya-gold">From our studio</p><h2 className="mt-3 font-display text-4xl font-medium text-astraya-navy md:text-6xl">Get social with us</h2><a className="mt-3 inline-flex items-center gap-2 text-sm text-astraya-text/65 transition hover:text-astraya-gold" href={ASTRAYA_INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram size={17} aria-hidden="true" />{ASTRAYA_INSTAGRAM_HANDLE}</a></div>
              <Button asChild variant="outline"><a href={ASTRAYA_INSTAGRAM_URL} target="_blank" rel="noreferrer">Visit Instagram <ArrowRight size={16} aria-hidden="true" /></a></Button>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {instagramGallery.map(([baseName, alt, postUrl], index) => (
              <Reveal key={baseName} delay={index * 0.04}>
                <a className="group relative block aspect-square overflow-hidden bg-astraya-cream" href={postUrl} target="_blank" rel="noreferrer" aria-label={`View ${ASTRAYA_INSTAGRAM_HANDLE} on Instagram`}>
                  <picture><source srcSet={`/assets/astraya/instagram/${baseName}.avif`} type="image/avif" /><img alt={alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" src={`/assets/astraya/instagram/${baseName}.jpg`} /></picture>
                  <span className="absolute inset-0 grid place-items-center bg-astraya-navy/0 text-white opacity-0 transition duration-300 group-hover:bg-astraya-navy/35 group-hover:opacity-100"><Instagram size={24} aria-hidden="true" /></span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-astraya-border bg-[#ded0c0] py-16 lg:py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal><Star className="mb-4 text-astraya-gold" size={22} strokeWidth={1.5} aria-hidden="true" /><h2 className="font-display text-4xl font-medium leading-tight text-astraya-navy md:text-5xl">A little light, delivered.</h2><p className="mt-3 text-sm leading-7 text-astraya-text/65">New pours, gifting edits and notes from the Astraya studio.</p></Reveal>
          <Reveal delay={0.06}>
            <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleNewsletter}>
              <Input aria-label="Email address" className="h-14 border-astraya-navy/20 bg-astraya-ivory/80" placeholder="Your email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <Button className="h-14" type="submit" variant="primary">Join the list <ArrowRight size={16} aria-hidden="true" /></Button>
              {newsletterStatus && <p className="text-sm text-astraya-text/70 sm:col-span-2">{newsletterStatus}</p>}
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
