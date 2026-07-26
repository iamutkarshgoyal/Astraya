import { FormEvent, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { ProductCard } from '@/components/catalog/ProductCard';
import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAsyncData } from '@/hooks/useAsyncData';
import { catalogService } from '@/services/catalog-service';
import type { ProductFilters } from '@/types/catalog';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? undefined;
  const bestSeller = searchParams.get('best_seller') === 'true';
  const search = searchParams.get('search') ?? undefined;
  const [searchInput, setSearchInput] = useState(search ?? '');

  const filters = useMemo<ProductFilters>(
    () => ({
      category,
      search,
      best_seller: bestSeller || undefined,
    }),
    [bestSeller, category, search],
  );

  const categories = useAsyncData(() => catalogService.listCategories(), []);
  const products = useAsyncData(() => catalogService.listProducts(filters), [
    category ?? '',
    search ?? '',
    String(bestSeller),
  ]);

  function updateFilter(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilter({ search: searchInput.trim() || null });
  }

  return (
    <div className="py-12">
      <div className="container">
        <SectionHeading
          eyebrow="Shop"
          title="Candles for considered rituals"
          text="Browse by collection, scent profile, gifting intent, and best-selling favorites."
        />

        <div className="mb-8 grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
          <form className="flex gap-2" onSubmit={submitSearch}>
            <Input
              aria-label="Search candles"
              placeholder="Search fragrance, name, or note"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Button aria-label="Search" size="icon" type="submit" variant="primary">
              <Search size={18} aria-hidden="true" />
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant={bestSeller ? 'gold' : 'outline'}
              onClick={() => updateFilter({ best_seller: bestSeller ? null : 'true' })}
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              Best sellers
            </Button>
            {(category || search || bestSeller) && (
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchInput('');
                  setSearchParams({});
                }}
              >
                <X size={15} aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <Button
            className="shrink-0"
            size="sm"
            type="button"
            variant={!category ? 'gold' : 'outline'}
            onClick={() => updateFilter({ category: null })}
          >
            All
          </Button>
          {(categories.data ?? []).map((item) => (
            <Button
              key={item.id}
              className="shrink-0"
              size="sm"
              type="button"
              variant={category === item.slug ? 'gold' : 'outline'}
              onClick={() => updateFilter({ category: item.slug })}
            >
              {item.name}
            </Button>
          ))}
        </div>

        {products.error && (
          <EmptyState
            title="Catalog is unavailable"
            text="The shop could not load from the API. Start the backend and refresh this page."
          />
        )}

        {!products.error && products.isLoading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-lg border border-astraya-navy/10 bg-white"
              />
            ))}
          </div>
        )}

        {!products.isLoading && products.data?.items.length === 0 && (
          <EmptyState
            title="No candles matched"
            text="Try a different scent, collection, or best-seller filter."
            action={
              <Button asChild variant="primary">
                <Link to="/shop">Reset shop</Link>
              </Button>
            }
          />
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(products.data?.items ?? []).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
