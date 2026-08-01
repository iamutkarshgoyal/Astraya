import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { orderService } from '@/services/order-service';
import type { OrderCreateResponse } from '@/types/commerce';
import { getErrorMessage } from '@/utils/errors';
import { activePrice, calculateClientTotals, formatPrice } from '@/utils/money';

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return /^\+?[0-9][0-9 ()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
    }, 'Enter a valid mobile number'),
  address: z.string().trim().min(8, 'Complete address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'),
  coupon_code: z.string().optional(),
  special_instructions: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponPreview, setCouponPreview] = useState('');
  const totals = calculateClientTotals(items, couponPreview);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: user?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      coupon_code: '',
      special_instructions: '',
    },
  });

  async function onSubmit(values: CheckoutFormValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await orderService.createOrder({
        ...values,
        coupon_code: values.coupon_code || null,
        special_instructions: values.special_instructions || null,
        items: items.map((item) => ({
          customization: item.customization ?? null,
          preview_image: item.previewImage ?? null,
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      });
      sessionStorage.setItem(
        `astraya-order-${response.order.order_number}`,
        JSON.stringify(response satisfies OrderCreateResponse),
      );
      clearCart();
      navigate(`/order-success/${response.order.order_number}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Checkout failed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          title="No items for checkout"
          text="Add candles to your cart before placing an order."
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
        <SectionHeading
          eyebrow="Checkout"
          title="Delivery details"
          text="Orders are created in Astraya and then confirmed with the studio through WhatsApp."
        />
        <form className="grid gap-8 lg:grid-cols-[1fr_23rem]" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Full name
                <Input autoComplete="name" required {...register('customer_name')} />
                {errors.customer_name && (
                  <span className="text-xs text-red-600">{errors.customer_name.message}</span>
                )}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Email
                <Input autoComplete="email" required type="email" {...register('email')} />
                {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Phone
                <Input
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  type="tel"
                  {...register('phone')}
                />
                {errors.phone && <span className="text-xs text-red-600">{errors.phone.message}</span>}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                City
                <Input autoComplete="address-level2" required {...register('city')} />
                {errors.city && <span className="text-xs text-red-600">{errors.city.message}</span>}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                State
                <Input autoComplete="address-level1" required {...register('state')} />
                {errors.state && <span className="text-xs text-red-600">{errors.state.message}</span>}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                Pincode
                <Input
                  autoComplete="postal-code"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[1-9][0-9]{5}"
                  required
                  {...register('pincode')}
                />
                {errors.pincode && (
                  <span className="text-xs text-red-600">{errors.pincode.message}</span>
                )}
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
              Address
              <Textarea autoComplete="street-address" required {...register('address')} />
              {errors.address && (
                <span className="text-xs text-red-600">{errors.address.message}</span>
              )}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
              Notes
              <Textarea {...register('special_instructions')} />
            </label>
          </div>

          <aside className="h-fit rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-3xl text-astraya-navy">Order summary</h2>
            <div className="mt-5 grid gap-3">
              {items.map((item) => (
                <div key={item.lineId} className="flex justify-between gap-4 text-sm">
                  <span>
                    {item.product.name}
                    {item.customization ? ' · Custom' : ''} x {item.quantity}
                  </span>
                  <span>{formatPrice(item.quantity * activePrice(item.product))}</span>
                </div>
              ))}
            </div>
            <label className="mt-5 grid gap-2 text-sm font-semibold text-astraya-navy">
              Coupon
              <Input
                {...register('coupon_code')}
                placeholder="ASTRAYA10"
                onChange={(event) => {
                  register('coupon_code').onChange(event);
                  setCouponPreview(event.target.value);
                }}
              />
            </label>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Discount</dt>
                <dd>{formatPrice(totals.discount)}</dd>
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
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <Button className="mt-6 w-full" disabled={isSubmitting} type="submit" variant="gold">
              <MessageCircle size={18} aria-hidden="true" />
              Place order
            </Button>
          </aside>
        </form>
      </div>
    </div>
  );
}
