import type { CandleVisual } from '@/types/customization';

export type HeroCandleProduct = {
  id: string;
  image: string;
  name: string;
  slug: string;
  visual: CandleVisual;
};

export const HERO_CANDLE_PRODUCTS: HeroCandleProduct[] = [
  {
    id: 'lunar-bloom',
    image: '/assets/astraya/products/hero/lunar-bloom.jpg',
    name: 'Lunar Bloom',
    slug: 'lunar-bloom-soy-candle',
    visual: {
      id: 'lunar-bloom',
      label: 'LUNAR BLOOM',
      waxColor: '#e9c6d0',
      decoration: 'daisy',
      decorationColor: '#f7efdc',
      glitter: false,
      vesselColor: '#dbe8e2',
    },
  },
  {
    id: 'celestial-hearts',
    image: '/assets/astraya/products/hero/celestial-hearts.jpg',
    name: 'Celestial Hearts',
    slug: 'celestial-oud-jar-candle',
    visual: {
      id: 'celestial-hearts',
      label: 'CELESTIAL HEARTS',
      waxColor: '#eee2ca',
      decoration: 'hearts',
      decorationColor: '#c8607e',
      glitter: false,
      vesselColor: '#c8dad8',
    },
  },
  {
    id: 'solstice-spice',
    image: '/assets/astraya/products/hero/solstice-spice.jpg',
    name: 'Solstice Spice',
    slug: 'solstice-spice-candle',
    visual: {
      id: 'solstice-spice',
      label: 'SOLSTICE SPICE',
      waxColor: '#d8a16c',
      decoration: 'petals',
      decorationColor: '#f1d2a5',
      glitter: true,
      vesselColor: '#d6c3ab',
    },
  },
  {
    id: 'heartglow',
    image: '/assets/astraya/products/hero/heartglow.jpg',
    name: 'HeartGlow',
    slug: 'heartglow-gel-soy-mini-jar-candle',
    visual: {
      id: 'heartglow',
      label: 'HEARTGLOW',
      waxColor: '#f0d8c9',
      decoration: 'hearts',
      decorationColor: '#ef7f98',
      glitter: true,
      vesselColor: '#d7e8e4',
    },
  },
];

export const WAX_COLOR_OPTIONS = [
  { color: '#efe3c9', label: 'Ivory' },
  { color: '#e9b9c4', label: 'Blush' },
  { color: '#c94a55', label: 'Ruby' },
  { color: '#9a78c8', label: 'Lavender' },
  { color: '#52c7c5', label: 'Turquoise' },
  { color: '#93ae83', label: 'Sage' },
  { color: '#263e56', label: 'Midnight' },
] as const;

export const DECORATION_OPTIONS = [
  { color: '#c7bbb0', id: 'none', label: 'None' },
  { color: '#ef7f98', id: 'hearts', label: 'Hearts' },
  { color: '#f4ead4', id: 'daisy', label: 'Daisy' },
  { color: '#c94a55', id: 'rose', label: 'Rose' },
  { color: '#b49ac8', id: 'petals', label: 'Petals' },
] as const;
