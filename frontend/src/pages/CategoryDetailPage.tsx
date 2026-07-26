import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ProductCard } from '@/components/catalog/ProductCard';
import { SmartImage } from '@/components/media/SmartImage';
import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { useAsyncData } from '@/hooks/useAsyncData';
import { catalogService } from '@/services/catalog-service';

export function CategoryDetailPage() {
  const { slug = '' } = useParams();
  const { data, error, isLoading } = useAsyncData(
    async () => {
      const [category, products] = await Promise.all([
        catalogService.getCategory(slug),
        catalogService.listProducts({ category: slug }),
      ]);
      return { category, products: products.items };
    },
    [slug],
  );

  if (error) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Collection not found"
          text="This Astraya collection may have moved or is no longer active."
          action={
            <Button asChild variant="primary">
              <Link to="/categories">Browse collections</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <section className="relative bg-astraya-navy text-white">
        {data?.category.image_url && (
          <div className="absolute inset-0 opacity-45">
            <SmartImage
              alt={data.category.name}
              className="h-full w-full object-cover"
              loading="eager"
              src={data.category.image_url}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-astraya-navy via-astraya-navy/82 to-transparent" />
        <div className="container relative py-16">
          <Button asChild variant="outline">
            <Link to="/categories">
              <ArrowLeft size={17} aria-hidden="true" />
              Collections
            </Link>
          </Button>
          <h1 className="mt-8 max-w-3xl font-display text-5xl leading-tight md:text-7xl">
            {data?.category.name ?? 'Astraya Collection'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/76">
            {data?.category.description ?? 'A refined edit of handmade candle rituals.'}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <SectionHeading
            title={isLoading ? 'Loading candles' : `${data?.products.length ?? 0} candles`}
            text="Every piece is poured in small batches and packed for a premium unboxing."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(data?.products ?? []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
