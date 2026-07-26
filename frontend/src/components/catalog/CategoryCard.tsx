import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import type { Category } from '@/types/catalog';

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      className="group block overflow-hidden rounded-lg border border-astraya-navy/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-luxury"
      to={`/categories/${category.slug}`}
    >
      <div className="aspect-[5/3] overflow-hidden bg-astraya-ivory">
        <img
          alt={category.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={category.image_url ?? '/images/categories/signature-collection.png'}
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl leading-tight text-astraya-navy">
              {category.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-astraya-text/68">{category.description}</p>
          </div>
          <ArrowRight
            className="mt-1 shrink-0 text-astraya-gold transition group-hover:translate-x-1"
            size={20}
            aria-hidden="true"
          />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-astraya-gold">
          {category.product_count} pieces
        </p>
      </div>
    </Link>
  );
}
