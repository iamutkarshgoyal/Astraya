import { Flame, Gift, Leaf, Sparkles } from 'lucide-react';

import { SectionHeading } from '@/components/sections/SectionHeading';

const standards = [
  {
    icon: Leaf,
    title: 'Clean wax blends',
    text: 'Soy, coconut soy, and beeswax blends selected by product profile.',
  },
  {
    icon: Flame,
    title: 'Balanced burn',
    text: 'Cotton and wooden wicks matched to jar diameter and wax density.',
  },
  {
    icon: Sparkles,
    title: 'Layered fragrance',
    text: 'Top, heart, and base notes tuned for a refined room throw.',
  },
  {
    icon: Gift,
    title: 'Premium packing',
    text: 'Gift-ready finishes for celebrations, wedding favors, and personal rituals.',
  },
];

export function AboutPage() {
  return (
    <div>
      <section className="bg-white py-14">
        <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-astraya-gold">
              About Astraya
            </p>
            <h1 className="font-display text-5xl leading-tight text-astraya-navy md:text-7xl">
              Handmade candles with a celestial sense of calm
            </h1>
            <p className="mt-6 text-lg leading-8 text-astraya-text/72">
              Astraya is built around the feeling of a room settling into evening: a
              softened light, a balanced fragrance, and a gift-worthy object that earns
              its place on the shelf.
            </p>
          </div>
          <img
            alt="Astraya candle studio"
            className="aspect-[4/3] w-full rounded-lg object-cover"
            src="/images/products/lunar-bloom-soy-candle-detail.png"
          />
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <SectionHeading
            title="The Astraya standard"
            text="Material choices and finishing details are chosen for warmth, durability, and gifting presence."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {standards.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-lg border border-astraya-navy/10 bg-white p-5"
                >
                  <Icon className="mb-4 text-astraya-gold" size={24} aria-hidden="true" />
                  <h2 className="font-serif text-2xl text-astraya-navy">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-astraya-text/68">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
