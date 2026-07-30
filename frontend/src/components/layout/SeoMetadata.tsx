import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { ASTRAYA_SITE_URL } from '@/utils/brand';

const defaultDescription =
  'Hand-poured Astraya soy candles crafted in India for warm rooms, thoughtful gifts, and everyday rituals.';

const routeMetadata: Record<string, { description: string; title: string }> = {
  '/': {
    title: 'Astraya | Hand-Poured Soy Candles',
    description: defaultDescription,
  },
  '/about': {
    title: 'Our Story | Astraya',
    description:
      'Discover Astraya candles, inspired by the cosmos and hand-poured in India.',
  },
  '/categories': {
    title: 'Candle Collections | Astraya',
    description:
      'Explore Astraya candles by fragrance, mood, celebration, and gifting occasion.',
  },
  '/contact': {
    title: 'Contact Astraya',
    description:
      'Contact the Astraya studio for candle questions, gifting, and WhatsApp orders.',
  },
  '/faq': {
    title: 'Candle Care and FAQ | Astraya',
    description: 'Answers about Astraya candles, ordering, delivery, and candle care.',
  },
  '/login': {
    title: 'Customer Login | Astraya',
    description: 'Sign in to your Astraya customer account.',
  },
  '/privacy': {
    title: 'Privacy Policy | Astraya',
    description: 'Read the Astraya privacy policy.',
  },
  '/shop': {
    title: 'Shop Soy Candles | Astraya',
    description:
      'Shop handmade Astraya soy candles, festive edits, wedding favours, and gift boxes.',
  },
  '/signup': {
    title: 'Create an Account | Astraya',
    description: 'Create an Astraya customer account.',
  },
  '/terms': {
    title: 'Terms and Conditions | Astraya',
    description: 'Read the Astraya store terms and conditions.',
  },
};

function metadataForPath(pathname: string) {
  if (routeMetadata[pathname]) {
    return routeMetadata[pathname];
  }
  if (pathname.startsWith('/products/')) {
    return {
      title: 'Candle Details | Astraya',
      description: 'View fragrance, burn, pricing, and availability for this Astraya candle.',
    };
  }
  if (pathname.startsWith('/categories/')) {
    return {
      title: 'Candle Collection | Astraya',
      description: 'Explore this handcrafted Astraya candle collection.',
    };
  }
  return {
    title: 'Astraya | Hand-Poured Soy Candles',
    description: defaultDescription,
  };
}

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

export function SeoMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = `${ASTRAYA_SITE_URL}${normalizedPath}`;
    const metadata = metadataForPath(normalizedPath);

    document.title = metadata.title;
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute('href', canonicalUrl);
    setMetaContent('meta[name="description"]', metadata.description);
    setMetaContent('meta[property="og:title"]', metadata.title);
    setMetaContent('meta[property="og:description"]', metadata.description);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[name="twitter:title"]', metadata.title);
    setMetaContent('meta[name="twitter:description"]', metadata.description);
  }, [pathname]);

  return null;
}
