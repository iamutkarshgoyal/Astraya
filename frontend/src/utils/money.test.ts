import { describe, expect, it } from 'vitest';

import type { CartLine } from '@/types/commerce';
import type { Product } from '@/types/catalog';
import { calculateClientTotals, formatPrice, savingPercent } from '@/utils/money';

const baseProduct = {
  id: 1,
  category_id: 1,
  name: 'Lunar Bloom Soy Candle',
  slug: 'lunar-bloom-soy-candle',
  sku: 'AST-LUNAR-BLOOM',
  short_description: 'Soft jasmine and sandalwood.',
  description: 'A refined candle for evening rituals.',
  price: '1299.00',
  discount_price: '1099.00',
  stock_quantity: 12,
  is_featured: true,
  is_best_seller: true,
  is_active: true,
  category: {
    id: 1,
    name: 'Signature Collection',
    slug: 'signature-collection',
    display_order: 1,
    is_active: true,
    product_count: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  images: [],
  average_rating: 5,
  review_count: 1,
  created_at: '2026-01-01T00:00:00Z',
} satisfies Product;

describe('money utilities', () => {
  it('formats prices for Indian rupees', () => {
    expect(formatPrice('1299.00')).toContain('1,299');
  });

  it('calculates coupon, shipping, tax, and grand total', () => {
    const items: CartLine[] = [{ product: baseProduct, quantity: 2 }];
    const totals = calculateClientTotals(items, 'ASTRAYA10');

    expect(totals.subtotal).toBe(2198);
    expect(totals.discount).toBe(219.8);
    expect(totals.shipping).toBe(99);
    expect(totals.tax).toBeCloseTo(98.91);
    expect(totals.grandTotal).toBeCloseTo(2176.11);
  });

  it('calculates discount percentage', () => {
    expect(savingPercent(baseProduct)).toBe(15);
  });
});
