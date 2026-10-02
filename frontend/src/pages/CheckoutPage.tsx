import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, ShieldCheck, Truck } from 'lucide-react';
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
import type { OrderCreateResponse, RazorpayCheckout } from '@/types/commerce';
import { scentedProductTitle } from '@/utils/brand';
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
  payment_method: z.enum(['cod', 'online']),
  policy_accepted: z.boolean().refine((value) => value, {
    message: 'Please accept the no-return and exchange policy',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
}) => RazorpayInstance;

let razorpayScript: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (razorpayScript) {
    return razorpayScript;
  }
  razorpayScript = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('#razorpay-checkout-js');
    if (existingScript) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Secure payment could not be loaded. Please try again.'));
    document.head.appendChild(script);
  });
  return razorpayScript;
}

async function completeOnlinePayment(
  checkout: RazorpayCheckout,
  orderNumber: string,
  customer: Pick<CheckoutFormValues, 'customer_name' | 'email' | 'phone'>,
): Promise<OrderCreateResponse> {
  await loadRazorpayScript();
  const Razorpay = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
  if (!Razorpay) {
    throw new Error('Secure payment could not be started. Please try again.');
  }

  return new Promise((resolve, reject) => {
    let completed = false;
    const payment = new Razorpay({
      key: checkout.key_id,
      amount: checkout.amount,
      currency: checkout.currency,
      name: 'Astraya',
      description: `Order ${orderNumber}`,
      order_id: checkout.order_id,
      prefill: {
        name: customer.customer_name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: '#a77b2d' },
      handler: (response) => {
        void orderService
          .verifyOnlinePayment({
            order_number: orderNumber,
            ...response,
          })
          .then((verifiedOrder) => {
            completed = true;
            resolve(verifiedOrder);
          })
          .catch(reject);
      },
      modal: {
        ondismiss: () => {
          if (!completed) {
            reject(new Error('Payment was not completed. Your items are held for 15 minutes.'));
          }
        },
      },
    });
    payment.open();
  });
}

export function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponPreview, setCouponPreview] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
      payment_method: 'cod',
      policy_accepted: false,
    },
  });
  const selectedState = watch('state');
  const paymentMethod = watch('payment_method');
  const totals = calculateClientTotals(items, couponPreview, selectedState, paymentMethod);

  async function onSubmit(values: CheckoutFormValues) {
    setError(null);
    setIsSubmitting(true);
    try {
      let response = await orderService.createOrder({
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
      if (response.requires_payment) {
        if (!response.razorpay_checkout) {
          throw new Error('Secure payment could not be initiated. Please try again.');
        }
        response = await completeOnlinePayment(
          response.razorpay_checkout,
          response.order.order_number,
          values,
        );
      }
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
          text="Checkout without an account. Your confirmed order receives delivery updates by email, WhatsApp, and SMS when those services are available."
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
            <label className="flex gap-3 rounded-md border border-astraya-gold/30 bg-astraya-ivory p-4 text-sm leading-6 text-astraya-text/78">
              <input
                className="mt-1 h-4 w-4 shrink-0 accent-astraya-gold"
                type="checkbox"
                {...register('policy_accepted')}
              />
              <span>
                <strong className="text-astraya-navy">No-return policy.</strong> Because these are soft, handmade items, returns are not accepted. Please record an unboxing video immediately on delivery. We will arrange an exchange only for a clear colour difference or a wrong product received.
              </span>
            </label>
            {errors.policy_accepted && (
              <p className="text-xs text-red-600">{errors.policy_accepted.message}</p>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-3xl text-astraya-navy">Order summary</h2>
            <div className="mt-5 grid gap-3">
              {items.map((item) => (
                <div key={item.lineId} className="flex justify-between gap-4 text-sm">
                  <span>
                    {scentedProductTitle(item.product.name)}
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
            <fieldset className="mt-5 grid gap-3">
              <legend className="text-sm font-semibold text-astraya-navy">Payment method</legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-astraya-navy/12 p-3 has-[:checked]:border-astraya-gold has-[:checked]:bg-astraya-ivory">
                <input className="mt-1 accent-astraya-gold" type="radio" value="cod" {...register('payment_method')} />
                <span className="grid gap-1">
                  <span className="font-semibold text-astraya-navy">Cash on delivery</span>
                  <span className="text-xs leading-5 text-astraya-text/66">Pay when delivered. A ₹29 COD handling charge applies.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-astraya-navy/12 p-3 has-[:checked]:border-astraya-gold has-[:checked]:bg-astraya-ivory">
                <input className="mt-1 accent-astraya-gold" type="radio" value="online" {...register('payment_method')} />
                <span className="grid gap-1">
                  <span className="flex items-center gap-2 font-semibold text-astraya-navy"><CreditCard size={16} aria-hidden="true" /> Secure UPI, credit or debit card</span>
                  <span className="text-xs leading-5 text-astraya-text/66">Payment is completed through our PCI-compliant payment provider.</span>
                </span>
              </label>
            </fieldset>
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
                <dt>COD handling</dt>
                <dd>{formatPrice(totals.codCharge)}</dd>
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
            <p className="mt-4 flex gap-2 text-xs leading-5 text-astraya-text/62">
              <Truck className="mt-0.5 shrink-0 text-astraya-gold" size={15} aria-hidden="true" />
              Shipping is ₹100 for Uttar Pradesh, Delhi, Assam, and Jammu & Kashmir; ₹160 for other states.
            </p>
            <p className="mt-2 flex gap-2 text-xs leading-5 text-astraya-text/62">
              <ShieldCheck className="mt-0.5 shrink-0 text-astraya-gold" size={15} aria-hidden="true" />
              We never handle or store card, UPI, or bank credentials.
            </p>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <Button className="mt-6 w-full" disabled={isSubmitting} type="submit" variant="gold">
              {paymentMethod === 'online' ? <CreditCard size={18} aria-hidden="true" /> : <Truck size={18} aria-hidden="true" />}
              {isSubmitting
                ? 'Processing order…'
                : paymentMethod === 'online'
                  ? 'Proceed to secure payment'
                  : 'Place COD order'}
            </Button>
          </aside>
        </form>
      </div>
    </div>
  );
}
