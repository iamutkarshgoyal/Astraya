import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, ShoppingBag, Star } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ProductCard } from '@/components/catalog/ProductCard';
import { QuantityStepper } from '@/components/commerce/QuantityStepper';
import { SmartImage } from '@/components/media/SmartImage';
import { EmptyState } from '@/components/sections/EmptyState';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { catalogService } from '@/services/catalog-service';
import { getErrorMessage } from '@/utils/errors';
import { activePrice, formatPrice } from '@/utils/money';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
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

  useEffect(() => {
    setActiveImage(product?.primary_image_url ?? images[0]?.image_url ?? null);
    setQuantity(1);
  }, [images, product]);

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

  const wished = isWishlisted(product.id);

  return (
    <div className="py-10">
      <div className="container">
        <Button asChild variant="ghost">
          <Link to="/shop">
            <ArrowLeft size={17} aria-hidden="true" />
            Shop
          </Link>
        </Button>

        <section className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-astraya-navy/10 bg-white">
              <SmartImage
                alt={product.name}
                className="h-full w-full object-cover"
                src={activeImage ?? product.primary_image_url ?? undefined}
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((image) => (
                <button
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-md border border-astraya-navy/10 bg-white"
                  type="button"
                  onClick={() => setActiveImage(image.image_url)}
                >
                  <SmartImage
                    alt={image.alt_text}
                    className="h-full w-full object-cover"
                    src={image.image_url}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-astraya-gold">
              {product.category.name}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-astraya-navy md:text-7xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-astraya-gold">
              <Star size={17} fill="currentColor" aria-hidden="true" />
              <span className="font-bold">{product.average_rating.toFixed(1)}</span>
              <span className="text-astraya-text/50">({product.review_count} reviews)</span>
            </div>
            <p className="mt-5 text-lg leading-8 text-astraya-text/72">{product.description}</p>

            <div className="mt-6 flex items-end gap-3">
              <p className="text-3xl font-bold text-astraya-navy">
                {formatPrice(activePrice(product))}
              </p>
              {product.discount_price && (
                <p className="pb-1 text-base text-astraya-text/45 line-through">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>

            <dl className="mt-8 grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-5 sm:grid-cols-2">
              {[
                ['Fragrance', product.fragrance],
                ['Wax', product.wax_type],
                [
                  'Burn time',
                  product.burn_time_minutes
                    ? `${Math.round(product.burn_time_minutes / 60)} hours`
                    : null,
                ],
                ['Weight', product.weight_grams ? `${product.weight_grams} g` : null],
                ['Dimensions', product.dimensions],
                ['Ingredients', product.ingredients],
              ].map(([label, value]) =>
                value ? (
                  <div key={label}>
                    <dt className="text-xs font-bold uppercase tracking-[0.16em] text-astraya-gold">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-astraya-text/72">{value}</dd>
                  </div>
                ) : null,
              )}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QuantityStepper
                max={Math.max(1, product.stock_quantity)}
                value={quantity}
                onChange={setQuantity}
              />
              <Button
                disabled={product.stock_quantity < 1}
                type="button"
                variant="gold"
                onClick={() => addItem(product, quantity)}
              >
                <ShoppingBag size={18} aria-hidden="true" />
                Add to cart
              </Button>
              <Button type="button" variant="outline" onClick={() => toggleWishlist(product)}>
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} aria-hidden="true" />
                {wished ? 'Saved' : 'Save'}
              </Button>
            </div>
            <p className="mt-3 text-sm text-astraya-text/58">
              {product.stock_quantity > 0
                ? `${product.stock_quantity} pieces available`
                : 'Currently sold out'}
            </p>
          </div>
        </section>

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
