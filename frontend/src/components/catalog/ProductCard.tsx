import { motion, useReducedMotion } from 'framer-motion';
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
  const prefersReducedMotion = useReducedMotion();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wished = isWishlisted(product.id);
  const saving = savingPercent(product);
  const imageUrl = product.primary_image_url ?? product.images[0]?.image_url;
  const secondaryImageUrl = product.images.find((image) => image.image_url !== imageUrl)?.image_url;

  return (
    <motion.article
      className="group overflow-hidden rounded-lg border border-astraya-border bg-astraya-card shadow-sm transition-colors duration-300 hover:border-astraya-gold/70 hover:shadow-card"
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -6,
              rotateX: 1.2,
              rotateY: -1.2,
            }
      }
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <Link className="block" to={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-astraya-cream">
          <SmartImage
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-0"
            src={imageUrl}
          />
          {secondaryImageUrl && (
            <SmartImage
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100"
              src={secondaryImageUrl}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-astraya-gold transition-transform duration-500 group-hover:scale-x-100" />
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
            <h3 className="font-display text-2xl font-semibold leading-tight text-astraya-navy transition hover:text-astraya-darkGold">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-1 font-button text-[0.68rem] font-semibold uppercase text-astraya-rose">
            {product.fragrance ?? product.category.name}
          </p>
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
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild className="px-3 text-xs" variant="outline">
            <Link to={`/products/${product.slug}`}>View details</Link>
          </Button>
          <Button
            aria-label={`Add ${product.name} to cart`}
            className="px-3 text-xs"
            disabled={product.stock_quantity < 1}
            type="button"
            variant="primary"
            onClick={() => addItem(product)}
          >
            <ShoppingBag size={16} aria-hidden="true" />
            Add to cart
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
