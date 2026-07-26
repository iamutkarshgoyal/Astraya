import { Flame, Gift, Leaf, MoonStar, Sparkles } from 'lucide-react';

import { SmartImage } from '@/components/media/SmartImage';
import { Reveal } from '@/components/sections/Reveal';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { useAsyncData } from '@/hooks/useAsyncData';
import { catalogService } from '@/services/catalog-service';

const standards = [
  {
    icon: Leaf,
    title: 'Premium soy wax',
    text: 'Soy, coconut soy, and beeswax blends are selected by product profile for a refined candle ritual.',
  },
  {
    icon: Flame,
    title: 'Balanced burn',
    text: 'Cotton and wooden wicks are matched to jar diameter, wax density, and fragrance character.',
  },
  {
    icon: Sparkles,
    title: 'Layered fragrance',
    text: 'Top, heart, and base notes are tuned for a warm room presence without feeling overpowering.',
  },
  {
    icon: Gift,
    title: 'Gifting elegance',
    text: 'Finishing details are composed for celebrations, wedding favors, corporate sets, and personal rituals.',
  },
];

const storyCards = [
  {
    title: 'Handcrafted Warmth',
    text: 'Astraya is shaped around the feeling of candlelight settling into a room: soft glow, gentle fragrance, and details that invite a slower evening.',
  },
  {
    title: 'Considered Materials',
    text: 'Wax blends, vessels, labels, and packaging are treated as part of the full ritual, with material-minded choices guiding each presentation.',
  },
  {
    title: 'Cosmic Inspiration',
    text: 'The brand language draws from night skies, lunar calm, and starlit gifting moments while staying warm, grounded, and tactile.',
  },
];

export function AboutPage() {
  const { data } = useAsyncData(
    async () => catalogService.listProducts({ featured: true }),
    [],
  );
  const productsForImages = data?.items ?? [];
  const imageForProduct = (slug: string, imageIndex = 0) => {
    const product = productsForImages.find((item) => item.slug === slug);
    return product?.images[imageIndex]?.image_url ?? product?.primary_image_url ?? product?.images[0]?.image_url;
  };

  return (
    <div>
      <section className="bg-astraya-card py-16">
        <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal>
            <div>
              <p className="mb-3 font-button text-xs font-bold uppercase tracking-[0.24em] text-astraya-gold">
                About Astraya
              </p>
              <div className="mb-5 h-px w-20 bg-astraya-gold/70" aria-hidden="true" />
              <h1 className="font-display text-5xl font-semibold leading-tight tracking-[0.04em] text-astraya-navy md:text-7xl">
                Handmade candles with a celestial sense of calm
              </h1>
              <p className="mt-6 text-lg leading-8 text-astraya-text/72">
                Astraya is built around the feeling of a room settling into evening: a
                softened light, a balanced fragrance, and a gift-worthy object that earns
                its place on the shelf.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="relative">
              <SmartImage
                alt="Astraya candle studio"
                className="aspect-[4/3] w-full rounded-lg border border-astraya-border object-cover shadow-card"
                src={imageForProduct('lunar-bloom-soy-candle', 1)}
              />
              <div className="absolute -bottom-5 left-5 hidden rounded-lg border border-astraya-gold/40 bg-astraya-navy px-4 py-3 text-astraya-gold shadow-glow sm:flex sm:items-center sm:gap-2">
                <MoonStar size={18} aria-hidden="true" />
                <span className="font-button text-xs font-semibold uppercase tracking-[0.18em]">
                  Inspired by the Cosmos
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <Reveal>
            <SectionHeading
              title="The Astraya standard"
              text="Craft, fragrance balance, and gifting presence guide the way each candle moves from studio table to home ritual."
            />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {standards.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 0.07}>
                  <article className="h-full rounded-lg border border-astraya-border bg-astraya-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-astraya-gold/65 hover:shadow-card">
                    <Icon className="mb-4 text-astraya-gold" size={24} aria-hidden="true" />
                    <h2 className="font-serif text-2xl text-astraya-navy">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-astraya-text/68">{item.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-astraya-cream py-16">
        <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-astraya-border shadow-card">
              <SmartImage
                alt="Astraya handcrafted candle"
                src={imageForProduct('celestial-oud-jar-candle', 1)}
              />
            </div>
          </Reveal>
          <div className="grid gap-5">
            {storyCards.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <article className="rounded-lg border border-astraya-border bg-astraya-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-10 bg-astraya-gold/70" aria-hidden="true" />
                    <h2 className="font-display text-2xl font-semibold tracking-[0.04em] text-astraya-navy">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-sm leading-7 text-astraya-text/72">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
