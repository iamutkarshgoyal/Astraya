import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router';

import { SmartImage } from '@/components/media/SmartImage';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product } from '@/types/catalog';
import { activePrice, formatPrice, savingPercent } from '@/utils/money';
import { cn } from '@/utils/cn';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wished = isWishlisted(product.id);
  const saving = savingPercent(product);
  const imageUrl = product.primary_image_url ?? product.images[0]?.image_url;

  return (
    <article className="group overflow-hidden rounded-lg border border-astraya-border bg-astraya-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-astraya-gold/70 hover:shadow-card">
      <Link className="block" to={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-astraya-cream">
          <SmartImage
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={imageUrl}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.is_best_seller && (
              <span className="rounded-sm bg-astraya-navy px-2 py-1 font-button text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white">
                Bestseller
              </span>
            )}
            {saving && (
              <span className="rounded-sm bg-astraya-gold px-2 py-1 font-button text-[0.62rem] font-bold uppercase tracking-[0.12em] text-astraya-ink">
                {saving}% off
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="grid gap-4 p-5">
        <div>
          <div className="mb-2 flex items-center gap-1 font-button text-xs font-semibold text-astraya-gold">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            <span>{product.average_rating.toFixed(1)}</span>
            <span className="text-astraya-text/45">({product.review_count})</span>
          </div>
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-serif text-2xl leading-tight text-astraya-navy transition hover:text-astraya-darkGold">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-astraya-text/68">
            {product.short_description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-button text-lg font-bold text-astraya-navy">
              {formatPrice(activePrice(product))}
            </p>
            {product.discount_price && (
              <p className="text-sm text-astraya-text/45 line-through">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(wished && 'bg-astraya-ivory text-astraya-gold')}
              size="icon"
              type="button"
              variant="outline"
              onClick={() => toggleWishlist(product)}
            >
              <Heart size={17} fill={wished ? 'currentColor' : 'none'} aria-hidden="true" />
            </Button>
            <Button
              aria-label="Add to cart"
              disabled={product.stock_quantity < 1}
              size="icon"
              type="button"
              variant="primary"
              onClick={() => addItem(product)}
            >
              <ShoppingBag size={17} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
