import { useMemo } from 'react';
import { CheckCircle2, Truck } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import type { OrderCreateResponse } from '@/types/commerce';
import { formatPrice } from '@/utils/money';

export function OrderSuccessPage() {
  const { orderNumber = '' } = useParams();
  const stored = useMemo(() => {
    const raw = sessionStorage.getItem(`astraya-order-${orderNumber}`);
    return raw ? (JSON.parse(raw) as OrderCreateResponse) : null;
  }, [orderNumber]);

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl rounded-lg border border-astraya-navy/10 bg-white p-8 text-center shadow-luxury">
        <CheckCircle2 className="mx-auto text-astraya-gold" size={42} aria-hidden="true" />
        <h1 className="mt-5 font-display text-5xl text-astraya-navy">Order placed</h1>
        <p className="mt-4 text-base leading-7 text-astraya-text/70">
          {orderNumber} is confirmed with Astraya. We will send order and tracking updates to the contact details entered at checkout.
        </p>
        {stored?.order && (
          <p className="mt-4 text-2xl font-bold text-astraya-navy">
            {formatPrice(stored.order.grand_total)}
          </p>
        )}
        <p className="mt-4 text-sm leading-6 text-astraya-text/64">
          Please record an unboxing video immediately on delivery. Soft handmade items are not returnable; exchanges are limited to clear colour differences or an incorrect product.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild variant="gold">
            <Link to="/track-order">
              <Truck size={18} aria-hidden="true" />
              Track order
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
