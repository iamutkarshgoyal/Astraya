import { type FormEvent, useState } from 'react';
import { Globe2, Instagram, Mail, MapPin, MessageCircle, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { engagementService } from '@/services/engagement-service';
import type { NavigationItem } from '@/types/navigation';
import {
  ASTRAYA_EMAIL,
  ASTRAYA_INSTAGRAM_HANDLE,
  ASTRAYA_INSTAGRAM_URL,
  ASTRAYA_SITE_HOST,
  ASTRAYA_SITE_URL,
  ASTRAYA_WHATSAPP_URL,
} from '@/utils/brand';
import { getErrorMessage } from '@/utils/errors';

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
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

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
    <footer className="border-t border-astraya-gold/20 bg-astraya-navy text-white">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.85fr_1.05fr]">
        <div className="space-y-5">
          <BrandMark inverse />
          <p className="max-w-sm text-sm leading-7 text-white/72">
            Warm, handcrafted candle rituals shaped for refined rooms, thoughtful gifting,
            and evenings that feel quietly luminous.
          </p>
          <div className="inline-flex items-center gap-2 rounded-md border border-astraya-gold/40 px-3 py-2 text-sm text-astraya-gold">
            <Sparkles size={16} aria-hidden="true" />
            Inspired by the Cosmos
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
            <li>
              <a
                className="flex items-center gap-3 transition-colors hover:text-astraya-gold"
                href={ASTRAYA_SITE_URL}
              >
                <Globe2 size={17} aria-hidden="true" />
                {ASTRAYA_SITE_HOST}
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 transition-colors hover:text-astraya-gold"
                href={`mailto:${ASTRAYA_EMAIL}`}
              >
                <Mail size={17} aria-hidden="true" />
                {ASTRAYA_EMAIL}
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 transition-colors hover:text-astraya-gold"
                href={ASTRAYA_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} aria-hidden="true" />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 transition-colors hover:text-astraya-gold"
                href={ASTRAYA_INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Instagram size={17} aria-hidden="true" />
                {ASTRAYA_INSTAGRAM_HANDLE}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5" size={17} aria-hidden="true" />
              India
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-xl text-astraya-gold">Newsletter</h2>
          <p className="mb-4 text-sm leading-7 text-white/68">
            New pours, gifting edits, and notes from the Astraya studio.
          </p>
          <form className="grid gap-3" onSubmit={handleNewsletter}>
            <Input
              aria-label="Email address"
              className="border-white/15 bg-white/10 text-white placeholder:text-white/45"
              placeholder={ASTRAYA_EMAIL}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" variant="gold">
              Join list
              <Send size={16} aria-hidden="true" />
            </Button>
            {newsletterStatus && <p className="text-sm text-white/68">{newsletterStatus}</p>}
          </form>
        </div>
      </div>

      <div className="border-t border-astraya-gold/20">
        <div className="container flex flex-col gap-3 py-5 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} Astraya. All rights reserved.</p>
          <p>Inspired by the Cosmos</p>
        </div>
      </div>
    </footer>
  );
}
