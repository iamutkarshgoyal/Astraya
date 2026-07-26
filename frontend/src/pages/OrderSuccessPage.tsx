import { useEffect, useMemo } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
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

  useEffect(() => {
    if (!stored?.whatsapp_url) {
      return;
    }
    const timer = window.setTimeout(() => {
      window.location.assign(stored.whatsapp_url);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [stored?.whatsapp_url]);

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl rounded-lg border border-astraya-navy/10 bg-white p-8 text-center shadow-luxury">
        <CheckCircle2 className="mx-auto text-astraya-gold" size={42} aria-hidden="true" />
        <h1 className="mt-5 font-display text-5xl text-astraya-navy">Order placed</h1>
        <p className="mt-4 text-base leading-7 text-astraya-text/70">
          {orderNumber} is saved with Astraya. WhatsApp will open for studio confirmation.
        </p>
        {stored?.order && (
          <p className="mt-4 text-2xl font-bold text-astraya-navy">
            {formatPrice(stored.order.grand_total)}
          </p>
        )}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {stored?.whatsapp_url && (
            <Button asChild variant="gold">
              <a href={stored.whatsapp_url}>
                <MessageCircle size={18} aria-hidden="true" />
                Open WhatsApp
              </a>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
