import { motion, useReducedMotion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router';

import { SmartImage } from '@/components/media/SmartImage';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product } from '@/types/catalog';
import { scentedProductTitle } from '@/utils/brand';
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
  const productTitle = scentedProductTitle(product.name);

  return (
    <motion.article
      className="group grid h-full grid-rows-[auto_1fr] overflow-hidden border border-astraya-border bg-white"
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -3,
            }
      }
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <Link className="block" to={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-[#f8f6f1]">
          <SmartImage
            alt={productTitle}
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
          <div className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-astraya-gold transition-transform duration-500 group-hover:scale-x-100" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.is_best_seller && (
              <span className="bg-astraya-navy px-2.5 py-1.5 font-button text-[0.58rem] font-medium uppercase tracking-[0.14em] text-white">
                Bestseller
              </span>
            )}
            {saving && (
              <span className="bg-astraya-gold px-2.5 py-1.5 font-button text-[0.58rem] font-medium uppercase tracking-[0.14em] text-white">
                {saving}% off
              </span>
            )}
          </div>
          <Button
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn('absolute right-4 top-4 rounded-full border-astraya-ink/25 bg-white/90', wished && 'text-astraya-gold')}
            size="icon"
            type="button"
            variant="ghost"
            onClick={(event) => {
              event.preventDefault();
              toggleWishlist(product);
            }}
          >
            <Heart size={18} fill={wished ? 'currentColor' : 'none'} aria-hidden="true" />
          </Button>
        </div>
      </Link>
      <div className="grid h-full grid-rows-[1fr_auto_auto] gap-3 px-4 py-5">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-1 font-button text-[0.68rem] font-medium text-astraya-gold">
            <Star size={14} fill="currentColor" aria-hidden="true" />
            <span>{product.average_rating.toFixed(1)}</span>
            <span className="text-astraya-text/45">({product.review_count})</span>
          </div>
          <Link to={`/products/${product.slug}`}>
            <h3 className="line-clamp-2 font-button text-base font-medium leading-snug text-astraya-ink transition hover:text-astraya-darkGold">
              {productTitle}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-1 font-button text-[0.62rem] font-medium uppercase tracking-[0.12em] text-astraya-gold">
            {product.fragrance ?? product.category.name}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-button text-sm font-semibold text-astraya-navy">
              {formatPrice(activePrice(product))}
            </p>
            {product.discount_price && (
              <p className="text-sm text-astraya-text/45 line-through">
                {formatPrice(product.price)}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button
            aria-label={`Add ${productTitle} to cart`}
            className="w-full px-3 text-xs"
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
