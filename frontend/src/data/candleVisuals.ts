export type HeroCandleProduct = {
  alt: string;
  id: string;
  image: string;
  name: string;
};

export const HERO_CANDLE_PRODUCTS: HeroCandleProduct[] = [
  {
    alt: 'Pink and orange HeartGlow gel-soy mini jar candles on a studio table',
    id: 'heartglow-mini-jars',
    image: '/assets/astraya/products/real/heartglow-mini-jars.jpg',
    name: 'HeartGlow mini jars',
  },
  {
    alt: 'Hand-poured gold glitter gel candle with a warm flame',
    id: 'glitter-gel-jar',
    image: '/assets/astraya/products/real/glitter-gel-jar.jpg',
    name: 'Glitter gel jar',
  },
  {
    alt: 'Rose pink layered gel-soy candle in a clear glass jar',
    id: 'layered-gel-rose',
    image: '/assets/astraya/products/real/layered-gel-rose.jpg',
    name: 'Layered gel-soy jar',
  },
  {
    alt: 'Blue star t-light candles with a hand-finished gold shimmer',
    id: 'star-tealights-blue',
    image: '/assets/astraya/products/real/star-tealights-blue.jpg',
    name: 'Star t-lights',
  },
  {
    alt: 'Pastel bubble cube candles arranged with delicate white flowers',
    id: 'pastel-bubble-cubes',
    image: '/assets/astraya/products/real/pastel-bubble-cubes.jpg',
    name: 'Pastel bubble cubes',
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
