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
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-astraya-border bg-astraya-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-astraya-gold/70 hover:shadow-card"
      to={`/categories/${category.slug}`}
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-astraya-cream">
        <SmartImage
          alt={category.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={category.image_url ?? '/images/categories/signature-collection.jpg'}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl leading-tight text-astraya-navy">
              {category.name}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-astraya-text/68">
              {category.description}
            </p>
          </div>
          <ArrowRight
            className="mt-1 shrink-0 text-astraya-gold transition group-hover:translate-x-1 group-hover:text-astraya-darkGold"
            size={20}
            aria-hidden="true"
          />
        </div>
        <p className="mt-auto pt-4 font-button text-xs font-bold uppercase tracking-[0.18em] text-astraya-gold">
          {category.product_count} pieces
        </p>
      </div>
    </Link>
  );
}
