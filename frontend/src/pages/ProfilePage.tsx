import { Link } from 'react-router';

import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/order-service';
import { formatPrice } from '@/utils/money';

export function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const orders = useAsyncData(
    () => (isAuthenticated ? orderService.getMyOrders() : Promise.resolve([])),
    [isAuthenticated],
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Login required"
          text="Sign in to see profile details and order history."
          action={
            <Button asChild variant="primary">
              <Link to="/login">Login</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        <SectionHeading eyebrow="Account" title={`Welcome, ${user.full_name}`} />
        <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
          <aside className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-3xl text-astraya-navy">Profile</h2>
            <dl className="mt-5 grid gap-3 text-sm text-astraya-text/72">
              <div>
                <dt className="font-bold text-astraya-navy">Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt className="font-bold text-astraya-navy">Phone</dt>
                <dd>{user.phone ?? 'Not added'}</dd>
              </div>
              <div>
                <dt className="font-bold text-astraya-navy">Role</dt>
                <dd>{user.role}</dd>
              </div>
            </dl>
            {user.role === 'admin' && (
              <Button asChild className="mt-6 w-full" variant="gold">
                <Link to="/admin">Admin dashboard</Link>
              </Button>
            )}
          </aside>
          <section className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-3xl text-astraya-navy">Orders</h2>
            <div className="mt-5 grid gap-4">
              {(orders.data ?? []).map((order) => (
                <article key={order.id} className="rounded-md border border-astraya-navy/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-astraya-navy">{order.order_number}</h3>
                      <p className="text-sm text-astraya-text/60">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-astraya-navy">{formatPrice(order.grand_total)}</p>
                  </div>
                  <p className="mt-2 text-sm text-astraya-text/68">
                    {order.status.replace(/_/g, ' ')}
                  </p>
                </article>
              ))}
              {!orders.isLoading && orders.data?.length === 0 && (
                <p className="text-sm text-astraya-text/68">No orders yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
