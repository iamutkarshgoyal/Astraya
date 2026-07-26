import type { CartLine } from '@/types/commerce';
import type { PriceValue, Product } from '@/types/catalog';

export function priceToNumber(value: PriceValue | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number.parseFloat(String(value));
}

export function activePrice(product: Product): number {
  return priceToNumber(product.discount_price ?? product.price);
}

export function formatPrice(value: PriceValue | null | undefined): string {
  const amount = priceToNumber(value);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateCartSubtotal(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + activePrice(item.product) * item.quantity, 0);
}

export function calculateClientTotals(items: CartLine[], couponCode?: string) {
  const subtotal = calculateCartSubtotal(items);
  const discount = couponCode?.trim().toUpperCase() === 'ASTRAYA10' ? subtotal * 0.1 : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const shipping = taxable >= 2500 || taxable === 0 ? 0 : 99;
  const tax = taxable * 0.05;
  const grandTotal = taxable + shipping + tax;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    grandTotal,
  };
}

export function savingPercent(product: Product): number | null {
  if (!product.discount_price) {
    return null;
  }
  const price = priceToNumber(product.price);
  const discount = priceToNumber(product.discount_price);
  if (!price || discount >= price) {
    return null;
  }
  return Math.round(((price - discount) / price) * 100);
}
