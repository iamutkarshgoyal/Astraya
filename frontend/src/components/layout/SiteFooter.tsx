import { Instagram, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { BrandMark } from '@/components/brand/BrandMark';
import type { NavigationItem } from '@/types/navigation';

const shopLinks: NavigationItem[] = [
  { label: 'Luxury Collection', href: '/categories/luxury-collection' },
  { label: 'Festive Collection', href: '/categories/festive-collection' },
  { label: 'Wedding Collection', href: '/categories/wedding-collection' },
  { label: 'Gift Boxes', href: '/categories/gift-boxes' },
];

const supportLinks: NavigationItem[] = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-astraya-navy/10 bg-astraya-navy text-white">
      <div className="container grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div className="space-y-5">
          <BrandMark inverse />
          <p className="max-w-sm text-sm leading-7 text-white/72">
            Astraya creates warm, elegant candle rituals with refined fragrances,
            hand-finished details, and gift-ready presentation.
          </p>
          <div className="inline-flex items-center gap-2 rounded-md border border-astraya-gold/40 px-3 py-2 text-sm text-astraya-gold">
            <Sparkles size={16} aria-hidden="true" />
            Handmade in small batches
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-xl text-astraya-gold">Collections</h2>
          <ul className="grid gap-3 text-sm text-white/72">
            {shopLinks.map((item) => (
              <li key={item.href}>
                <Link className="transition-colors hover:text-astraya-gold" to={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-xl text-astraya-gold">Support</h2>
          <ul className="grid gap-3 text-sm text-white/72">
            {supportLinks.map((item) => (
              <li key={item.href}>
                <Link className="transition-colors hover:text-astraya-gold" to={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-xl text-astraya-gold">Contact</h2>
          <ul className="grid gap-3 text-sm text-white/72">
            <li className="flex items-center gap-3">
              <Mail size={17} aria-hidden="true" />
              hello@astraya.in
            </li>
            <li className="flex items-center gap-3">
              <Phone size={17} aria-hidden="true" />
              +91 98765 43210
            </li>
            <li className="flex items-center gap-3">
              <Instagram size={17} aria-hidden="true" />
              @astraya.candles
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5" size={17} aria-hidden="true" />
              India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Astraya. All rights reserved.</p>
          <p>Luxury handmade candles inspired by the cosmos.</p>
        </div>
      </div>
    </footer>
  );
}
