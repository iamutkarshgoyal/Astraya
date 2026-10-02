import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { SmartImage } from '@/components/media/SmartImage';
import type { Category } from '@/types/catalog';

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      className="group flex h-full flex-col border-r border-t border-astraya-border bg-white first:border-l"
      to={`/categories/${category.slug}`}
    >
      <div className="relative aspect-square overflow-hidden bg-astraya-cream p-2.5 pb-0">
        <SmartImage
          alt={category.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          src={category.image_url ?? '/assets/astraya/products/daisy-fragrance-candle/colour-detail.jpg'}
        />
      </div>
      <div className="flex flex-1 items-end justify-between gap-4 border-b border-astraya-border p-4 pt-5">
        <div>
          <h3 className="font-button text-lg font-medium leading-tight text-astraya-ink">{category.name}</h3>
          <span className="mt-2 inline-flex items-center gap-2 border-b border-astraya-ink pb-0.5 font-button text-xs text-astraya-ink">
            Shop Now
          </span>
        </div>
        <ArrowRight className="mb-1 shrink-0 text-astraya-gold transition group-hover:translate-x-1" size={19} aria-hidden="true" />
      </div>
    </Link>
  );
}
