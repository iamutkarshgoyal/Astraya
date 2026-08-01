import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductPurchaseExperience } from '@/components/catalog/ProductPurchaseExperience';
import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { catalogService } from '@/services/catalog-service';
import { getErrorMessage } from '@/utils/errors';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  const productData = useAsyncData(
    async () => {
      const product = await catalogService.getProduct(slug);
      const [reviews, related] = await Promise.all([
        catalogService.listReviews(product.id),
        catalogService.listProducts({ category: product.category.slug }),
      ]);
      return {
        product,
        reviews,
        related: related.items.filter((item) => item.id !== product.id).slice(0, 3),
      };
    },
    [slug],
  );

  const product = productData.data?.product ?? null;
  const images = useMemo(
    () => [...(product?.images ?? [])].sort((a, b) => a.display_order - b.display_order),
    [product],
  );

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) {
      return;
    }
    setReviewStatus(null);
    try {
      await catalogService.createReview({
        product_id: product.id,
        rating,
        title: reviewTitle || null,
        comment: reviewComment,
      });
      setReviewTitle('');
      setReviewComment('');
      setReviewStatus('Review received and awaiting approval.');
    } catch (error) {
      setReviewStatus(getErrorMessage(error, 'Review could not be submitted'));
    }
  }

  if (productData.error) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Candle not found"
          text="This product may be unavailable or retired from the current edit."
          action={
            <Button asChild variant="primary">
              <Link to="/shop">Return to shop</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!product) {
    return <div className="container py-16 text-astraya-navy">Loading candle details...</div>;
  }

  return (
    <div className="py-10">
      <div className="container">
        <Button asChild variant="ghost">
          <Link to="/shop">
            <ArrowLeft size={17} aria-hidden="true" />
            Shop
          </Link>
        </Button>

        <ProductPurchaseExperience images={images} product={product} />

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="Reviews"
              title="Customer notes"
              text="Approved Astraya reviews from candle buyers."
              className="mb-0"
            />
          </div>
          <div className="grid gap-4">
            {(productData.data?.reviews ?? []).map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-astraya-navy/10 bg-white p-5"
              >
                <div className="mb-2 flex text-astraya-gold">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                {review.title && (
                  <h3 className="font-semibold text-astraya-navy">{review.title}</h3>
                )}
                <p className="mt-2 text-sm leading-6 text-astraya-text/72">{review.comment}</p>
              </article>
            ))}
            {isAuthenticated ? (
              <form
                className="rounded-lg border border-astraya-navy/10 bg-white p-5"
                onSubmit={submitReview}
              >
                <h3 className="font-serif text-2xl text-astraya-navy">Leave a review</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-[8rem_1fr]">
                  <Input
                    aria-label="Rating"
                    max={5}
                    min={1}
                    type="number"
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                  />
                  <Input
                    aria-label="Review title"
                    placeholder="Review title"
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                  />
                </div>
                <Textarea
                  className="mt-3"
                  aria-label="Review comment"
                  placeholder="Share your candle experience"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  required
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button type="submit" variant="primary">
                    Submit review
                  </Button>
                  {reviewStatus && <p className="text-sm text-astraya-text/68">{reviewStatus}</p>}
                </div>
              </form>
            ) : (
              <div className="rounded-lg border border-astraya-navy/10 bg-white p-5">
                <p className="text-sm text-astraya-text/70">Sign in to leave a review.</p>
                <Button asChild className="mt-4" variant="primary">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {productData.data?.related.length ? (
          <section className="mt-16">
            <SectionHeading title="Complete the ritual" text="More candles from this collection." />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {productData.data.related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
