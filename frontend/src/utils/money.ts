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

const priorityShippingStates = new Set([
  'assam',
  'delhi',
  'jammu and kashmir',
  'jammu & kashmir',
  'jammu kashmir',
  'jammu-kashmir',
  'j&k',
  'nct of delhi',
  'new delhi',
  'u.p.',
  'up',
  'uttar pradesh',
]);

export function shippingChargeForState(state?: string): number {
  const normalizedState = state?.trim().toLocaleLowerCase().replace(/\s+/g, ' ') ?? '';
  return priorityShippingStates.has(normalizedState) ? 100 : 160;
}

export function calculateClientTotals(
  items: CartLine[],
  couponCode?: string,
  state?: string,
  paymentMethod: 'cod' | 'online' = 'cod',
) {
  const subtotal = calculateCartSubtotal(items);
  const discount = couponCode?.trim().toUpperCase() === 'ASTRAYA10' ? subtotal * 0.1 : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const shipping = taxable === 0 ? 0 : shippingChargeForState(state);
  const codCharge = paymentMethod === 'cod' ? 29 : 0;
  const tax = taxable * 0.05;
  const grandTotal = taxable + shipping + codCharge + tax;

  return {
    subtotal,
    discount,
    shipping,
    codCharge,
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
