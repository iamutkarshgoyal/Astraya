import { FormEvent, useState } from 'react';
import { ExternalLink, PackageCheck, Search } from 'lucide-react';

import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { orderService } from '@/services/order-service';
import type { OrderTracking } from '@/types/commerce';
import { getErrorMessage } from '@/utils/errors';

function labelForStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TrackOrderPage() {
  const [result, setResult] = useState<OrderTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const tracking = await orderService.trackOrder({
        order_number: String(form.get('order_number') ?? ''),
        phone: String(form.get('phone') ?? ''),
      });
      setResult(tracking);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We could not find that order.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="py-12">
      <div className="container max-w-3xl">
        <SectionHeading
          eyebrow="Order tracking"
          title="Find your delivery"
          text="Enter the order number and the phone number used at checkout. This keeps your delivery details private without requiring an account."
        />
        <form className="grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Order number
            <Input name="order_number" placeholder="AST-000001" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
            Phone number
            <Input inputMode="tel" name="phone" placeholder="9876543210" required type="tel" />
          </label>
          <Button disabled={isSubmitting} type="submit" variant="gold">
            <Search size={17} aria-hidden="true" />
            {isSubmitting ? 'Checking…' : 'Track'}
          </Button>
        </form>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {result && (
          <article className="mt-6 rounded-lg border border-astraya-navy/10 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-astraya-gold">Order</p>
                <h2 className="mt-1 font-serif text-3xl text-astraya-navy">{result.order_number}</h2>
              </div>
              <span className="rounded-full bg-astraya-ivory px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-astraya-navy">
                {labelForStatus(result.status)}
              </span>
            </div>
            <div className="mt-5 grid gap-3 border-y border-astraya-navy/10 py-4 text-sm text-astraya-text/72">
              {result.items.map((item) => (
                <p key={item.product_name}>{item.product_name} × {item.quantity}</p>
              ))}
            </div>
            {result.tracking_number && result.tracking_url ? (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-3">
                  <PackageCheck className="mt-0.5 text-astraya-gold" size={20} aria-hidden="true" />
                  <p className="text-sm text-astraya-text/72">
                    <strong className="text-astraya-navy">{labelForStatus(result.tracking_carrier ?? 'delivery partner')}</strong><br />
                    Tracking number: {result.tracking_number}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <a href={result.tracking_url} rel="noreferrer" target="_blank">
                    Open carrier tracking
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                </Button>
              </div>
            ) : (
              <EmptyState
                title="Preparing your shipment"
                text="Your order is confirmed. We will add the carrier and tracking number as soon as it ships."
              />
            )}
          </article>
        )}
      </div>
    </div>
  );
}
