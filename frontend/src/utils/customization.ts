import type { Product } from '@/types/catalog';
import type {
  CandleCustomization,
  CandleDecoration,
  CandleVisual,
} from '@/types/customization';

const categoryDefaults: Record<
  string,
  Pick<CandleCustomization, 'decoration' | 'decoration_color' | 'decoration_label'>
> = {
  aromatherapy: {
    decoration: 'petals',
    decoration_color: '#b49ac8',
    decoration_label: 'Botanical petals',
  },
  'festive-collection': {
    decoration: 'rose',
    decoration_color: '#c94a55',
    decoration_label: 'Rose',
  },
  'gift-boxes': {
    decoration: 'hearts',
    decoration_color: '#d88aa0',
    decoration_label: 'Hearts',
  },
  'luxury-collection': {
    decoration: 'hearts',
    decoration_color: '#b98b45',
    decoration_label: 'Hearts',
  },
  'signature-collection': {
    decoration: 'daisy',
    decoration_color: '#f4ead4',
    decoration_label: 'Daisy',
  },
  'wedding-collection': {
    decoration: 'rose',
    decoration_color: '#df9eac',
    decoration_label: 'Rose',
  },
};

export function defaultCustomizationForProduct(product: Product): CandleCustomization {
  const category = categoryDefaults[product.category.slug] ?? categoryDefaults['signature-collection'];
  const isHeartGlow = product.slug.includes('heartglow');

  return {
    wax_color: isHeartGlow ? '#f0d8c9' : '#efe3c9',
    wax_color_name: isHeartGlow ? 'Warm ivory' : 'Ivory',
    decoration: isHeartGlow ? 'hearts' : category.decoration,
    decoration_label: isHeartGlow ? 'Hearts' : category.decoration_label,
    decoration_color: isHeartGlow ? '#ef7f98' : category.decoration_color,
    glitter: false,
  };
}

export function candleVisualFromCustomization(
  product: Product,
  customization: CandleCustomization,
): CandleVisual {
  return {
    id: `${product.slug}-${createCustomizationKey(customization)}`,
    label: product.name.toUpperCase().slice(0, 24),
    waxColor: customization.wax_color,
    decoration: customization.decoration,
    decorationColor: customization.decoration_color,
    glitter: customization.glitter,
    vesselColor:
      product.category.slug === 'luxury-collection' ? '#b8c8c8' : '#d9e8e3',
  };
}

export function createCustomizationKey(customization: CandleCustomization): string {
  const stableValue = [
    customization.wax_color,
    customization.wax_color_name,
    customization.decoration,
    customization.decoration_label,
    customization.decoration_color,
    customization.glitter ? '1' : '0',
  ].join('|');

  let hash = 2166136261;
  for (let index = 0; index < stableValue.length; index += 1) {
    hash ^= stableValue.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `custom-${(hash >>> 0).toString(36)}`;
}

export function decorationLabel(decoration: CandleDecoration): string {
  return {
    daisy: 'Daisy',
    hearts: 'Hearts',
    none: 'None',
    petals: 'Botanical petals',
    rose: 'Rose',
  }[decoration];
}

export function customizationSummary(customization: CandleCustomization): string[] {
  return [
    `${customization.wax_color_name} wax`,
    customization.decoration === 'none'
      ? 'No wax add-on'
      : `${customization.decoration_label} add-on`,
    customization.glitter ? 'Fine glitter' : 'No glitter',
  ];
}
