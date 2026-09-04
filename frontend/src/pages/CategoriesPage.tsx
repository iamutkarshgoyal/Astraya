import { CategoryCard } from '@/components/catalog/CategoryCard';
import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { useAsyncData } from '@/hooks/useAsyncData';
import { catalogService } from '@/services/catalog-service';

export function CategoriesPage() {
  const categories = useAsyncData(() => catalogService.listCategories(), []);

  return (
    <div className="py-12">
      <div className="container">
        <SectionHeading
          eyebrow="Categories"
          title="Shop by collection"
          text="Browse every Astraya piece by candle form, finish, and gifting style."
        />
        {categories.error && (
          <EmptyState
            title="Collections are unavailable"
            text="The category list could not load from the API."
          />
        )}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(categories.data ?? []).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}
