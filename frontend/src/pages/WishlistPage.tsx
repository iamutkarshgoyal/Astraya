import { Link } from 'react-router';

import { ProductCard } from '@/components/catalog/ProductCard';
import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';

export function WishlistPage() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Your wishlist is quiet"
          text="Save candles while browsing and return to them when you are ready."
          action={
            <Button asChild variant="primary">
              <Link to="/shop">Browse shop</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        <SectionHeading eyebrow="Wishlist" title="Saved candles" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
