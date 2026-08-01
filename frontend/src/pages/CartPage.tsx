import { Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { QuantityStepper } from '@/components/commerce/QuantityStepper';
import { SmartImage } from '@/components/media/SmartImage';
import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { activePrice, calculateClientTotals, formatPrice } from '@/utils/money';
import { customizationSummary } from '@/utils/customization';

export function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();
  const totals = calculateClientTotals(items);

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Your cart is empty"
          text="Add a candle, gift box, or festive edit before checkout."
          action={
            <Button asChild variant="primary">
              <Link to="/shop">Shop candles</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        <SectionHeading eyebrow="Cart" title="Review your order" />
        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div className="grid gap-4">
            {items.map((item) => (
              <article
                key={item.lineId}
                className="grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-4 shadow-sm sm:grid-cols-[9rem_1fr_auto]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-astraya-cream">
                  <SmartImage
                    alt={item.product.name}
                    src={
                      item.previewImage ??
                      item.product.primary_image_url ??
                      item.product.images[0]?.image_url
                    }
                  />
                </div>
                <div>
                  <Link to={`/products/${item.product.slug}`}>
                    <h2 className="font-serif text-2xl text-astraya-navy">{item.product.name}</h2>
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-astraya-text/68">
                    {item.product.short_description}
                  </p>
                  {item.customization && (
                    <ul className="mt-3 flex flex-wrap gap-2 text-xs text-astraya-text/66">
                      {customizationSummary(item.customization).map((detail) => (
                        <li
                          key={detail}
                          className="rounded-sm bg-astraya-cream px-2 py-1"
                        >
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 font-bold text-astraya-navy">
                    {formatPrice(activePrice(item.product))}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <QuantityStepper
                    max={Math.max(1, item.product.stock_quantity)}
                    value={item.quantity}
                    onChange={(value) => updateQuantity(item.lineId, value)}
                  />
                  <Button
                    aria-label="Remove item"
                    size="icon"
                    type="button"
                    variant="ghost"
                    onClick={() => removeItem(item.lineId)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-3xl text-astraya-navy">Order summary</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{formatPrice(totals.shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd>{formatPrice(totals.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-astraya-navy/10 pt-3 text-base font-bold text-astraya-navy">
                <dt>Total</dt>
                <dd>{formatPrice(totals.grandTotal)}</dd>
              </div>
            </dl>
            <Button asChild className="mt-6 w-full" variant="gold">
              <Link to="/checkout">Checkout</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
