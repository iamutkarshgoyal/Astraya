import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Box,
  Check,
  CircleOff,
  Flame,
  Flower2,
  Heart,
  Images as ImagesIcon,
  RefreshCcw,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
} from 'lucide-react';

import { QuantityStepper } from '@/components/commerce/QuantityStepper';
import { SmartImage } from '@/components/media/SmartImage';
import type { ProductViewerHandle } from '@/components/three/ProductViewer3D';
import { Button } from '@/components/ui/button';
import {
  DECORATION_OPTIONS,
  WAX_COLOR_OPTIONS,
} from '@/data/candleVisuals';
import { useCart } from '@/hooks/useCart';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useWishlist } from '@/hooks/useWishlist';
import type { Product, ProductImage } from '@/types/catalog';
import type {
  CandleCustomization,
  CandleDecoration,
} from '@/types/customization';
import { cn } from '@/utils/cn';
import {
  candleVisualFromCustomization,
  defaultCustomizationForProduct,
} from '@/utils/customization';
import { activePrice, formatPrice } from '@/utils/money';

const ProductViewer3D = lazy(async () => {
  const module = await import('@/components/three/ProductViewer3D');
  return { default: module.ProductViewer3D };
});

type ProductPurchaseExperienceProps = {
  images: ProductImage[];
  product: Product;
};

type MediaMode = '3d' | 'photos';

function DecorationIcon({ decoration }: { decoration: CandleDecoration }) {
  if (decoration === 'none') {
    return <CircleOff size={18} aria-hidden="true" />;
  }
  if (decoration === 'hearts') {
    return <Heart size={18} aria-hidden="true" />;
  }
  return <Flower2 size={18} aria-hidden="true" />;
}

export function ProductPurchaseExperience({
  images,
  product,
}: ProductPurchaseExperienceProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [mediaMode, setMediaMode] = useState<MediaMode>('3d');
  const [isLit, setIsLit] = useState(true);
  const [customization, setCustomization] = useState<CandleCustomization>(() =>
    defaultCustomizationForProduct(product),
  );
  const [customizationTouched, setCustomizationTouched] = useState(false);
  const [cartStatus, setCartStatus] = useState<string | null>(null);
  const viewerRef = useRef<ProductViewerHandle>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const deviceOrientation = useDeviceOrientation(prefersReducedMotion);

  useEffect(() => {
    setActiveImage(product.primary_image_url ?? images[0]?.image_url ?? null);
    setQuantity(1);
    setMediaMode('3d');
    setIsLit(true);
    setCustomization(defaultCustomizationForProduct(product));
    setCustomizationTouched(false);
    setCartStatus(null);
  }, [images, product]);

  const candleVisual = useMemo(
    () => candleVisualFromCustomization(product, customization),
    [customization, product],
  );

  const updateCustomization = (next: Partial<CandleCustomization>) => {
    setCustomization((current) => ({ ...current, ...next }));
    setCustomizationTouched(true);
    setMediaMode('3d');
    setCartStatus(null);
  };

  const resetCustomization = () => {
    setCustomization(defaultCustomizationForProduct(product));
    setCustomizationTouched(false);
    setMediaMode('3d');
    setCartStatus(null);
  };

  const addCurrentProduct = () => {
    if (customizationTouched) {
      addItem(product, quantity, {
        customization,
        previewImage:
          viewerRef.current?.capturePreview() ??
          activeImage ??
          product.primary_image_url,
      });
      setCartStatus('Your personalised candle and preview were added to the cart.');
      return;
    }

    addItem(product, quantity);
    setCartStatus(`${product.name} was added to the cart.`);
  };

  const wished = isWishlisted(product.id);

  return (
    <section className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="min-w-0">
        <div className="relative h-[clamp(25rem,58vw,42rem)] overflow-hidden rounded-lg border border-astraya-navy/10 bg-[#e9e4da] shadow-card">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-astraya-text/62">
                Preparing your candle...
              </div>
            }
          >
            <ProductViewer3D
              ref={viewerRef}
              active={mediaMode === '3d'}
              className={cn(
                'absolute inset-0 min-h-0 transition-opacity duration-300',
                mediaMode === 'photos'
                  ? 'pointer-events-none opacity-0'
                  : 'opacity-100',
              )}
              fallbackImage={activeImage ?? product.primary_image_url}
              isLit={isLit}
              onToggle={() => setIsLit((current) => !current)}
              reducedMotion={prefersReducedMotion}
              tiltRef={deviceOrientation.tiltRef}
              visual={candleVisual}
            />
          </Suspense>

          {mediaMode === 'photos' && (
            <SmartImage
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover"
              src={activeImage ?? product.primary_image_url ?? undefined}
            />
          )}

          <div
            className="absolute left-3 top-3 z-10 flex rounded-md border border-white/45 bg-white/80 p-1 shadow-sm backdrop-blur-md"
            aria-label="Product view"
          >
            <button
              aria-pressed={mediaMode === '3d'}
              className={cn(
                'flex h-10 min-w-20 items-center justify-center gap-2 rounded px-3 text-xs font-semibold transition-colors',
                mediaMode === '3d'
                  ? 'bg-astraya-navy text-white'
                  : 'text-astraya-navy hover:bg-white',
              )}
              type="button"
              onClick={() => setMediaMode('3d')}
            >
              <Box size={17} aria-hidden="true" />
              3D
            </button>
            <button
              aria-pressed={mediaMode === 'photos'}
              className={cn(
                'flex h-10 min-w-20 items-center justify-center gap-2 rounded px-3 text-xs font-semibold transition-colors',
                mediaMode === 'photos'
                  ? 'bg-astraya-navy text-white'
                  : 'text-astraya-navy hover:bg-white',
              )}
              type="button"
              onClick={() => setMediaMode('photos')}
            >
              <ImagesIcon size={17} aria-hidden="true" />
              Photos
            </button>
          </div>

          {mediaMode === '3d' && (
            <div className="absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3">
              <Button
                className="border-white/45 bg-white/85 text-astraya-navy shadow-sm backdrop-blur-md hover:bg-white"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setIsLit((current) => !current)}
              >
                <Flame
                  size={17}
                  fill={isLit ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
                {isLit ? 'Blow out' : 'Light again'}
              </Button>
              {deviceOrientation.status !== 'unsupported' && (
                <Button
                  aria-label={
                    deviceOrientation.status === 'enabled'
                      ? 'Device motion enabled'
                      : 'Enable device motion'
                  }
                  className="border-white/45 bg-white/85 text-astraya-navy shadow-sm backdrop-blur-md hover:bg-white"
                  disabled={deviceOrientation.status === 'enabled'}
                  size="icon"
                  title={
                    deviceOrientation.status === 'enabled'
                      ? 'Device motion enabled'
                      : 'Move the 3D candle with your device'
                  }
                  type="button"
                  variant="outline"
                  onClick={() => void deviceOrientation.requestAccess()}
                >
                  {deviceOrientation.status === 'enabled' ? (
                    <Check size={18} aria-hidden="true" />
                  ) : (
                    <Smartphone size={18} aria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image) => (
            <button
              key={image.id}
              aria-label={`View ${image.alt_text || product.name}`}
              className={cn(
                'relative aspect-[4/3] overflow-hidden rounded-md border bg-white transition-colors',
                activeImage === image.image_url && mediaMode === 'photos'
                  ? 'border-astraya-gold ring-1 ring-astraya-gold'
                  : 'border-astraya-navy/10 hover:border-astraya-gold/60',
              )}
              type="button"
              onClick={() => {
                setActiveImage(image.image_url);
                setMediaMode('photos');
              }}
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
          <span className="text-astraya-text/50">
            ({product.review_count} reviews)
          </span>
        </div>
        <p className="mt-5 text-lg leading-8 text-astraya-text/72">
          {product.description}
        </p>

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
                <dd className="mt-1 text-sm leading-6 text-astraya-text/72">
                  {value}
                </dd>
              </div>
            ) : null,
          )}
        </dl>

        <section
          className="mt-8 border-y border-astraya-navy/10 py-6"
          aria-labelledby="candle-customizer-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-astraya-gold">
                Made for you
              </p>
              <h2
                id="candle-customizer-title"
                className="mt-1 font-serif text-2xl text-astraya-navy"
              >
                Personalise your candle
              </h2>
            </div>
            <Button
              aria-label="Reset candle customisation"
              className="shrink-0"
              size="icon"
              title="Reset customisation"
              type="button"
              variant="ghost"
              onClick={resetCustomization}
            >
              <RefreshCcw size={17} aria-hidden="true" />
            </Button>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-astraya-navy">
              Wax colour
            </legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {WAX_COLOR_OPTIONS.map((option) => {
                const selected = customization.wax_color === option.color;
                return (
                  <button
                    key={option.label}
                    aria-label={`${option.label} wax`}
                    aria-pressed={selected}
                    className={cn(
                      'relative h-10 w-10 rounded-full border-2 shadow-sm transition-transform motion-safe:hover:scale-105',
                      selected
                        ? 'border-astraya-navy ring-2 ring-astraya-gold ring-offset-2'
                        : 'border-white',
                    )}
                    style={{ backgroundColor: option.color }}
                    title={option.label}
                    type="button"
                    onClick={() =>
                      updateCustomization({
                        wax_color: option.color,
                        wax_color_name: option.label,
                      })
                    }
                  >
                    {selected && (
                      <Check
                        className="absolute inset-0 m-auto text-white drop-shadow"
                        size={17}
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-astraya-navy">
              Wax add-on
            </legend>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {DECORATION_OPTIONS.map((option) => {
                const selected = customization.decoration === option.id;
                return (
                  <button
                    key={option.id}
                    aria-pressed={selected}
                    className={cn(
                      'flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-semibold transition-colors',
                      selected
                        ? 'border-astraya-gold bg-astraya-ivory text-astraya-navy'
                        : 'border-astraya-navy/12 bg-white text-astraya-text/68 hover:border-astraya-gold/60',
                    )}
                    type="button"
                    onClick={() =>
                      updateCustomization({
                        decoration: option.id,
                        decoration_color: option.color,
                        decoration_label: option.label,
                      })
                    }
                  >
                    <DecorationIcon decoration={option.id} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 flex min-h-12 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles
                className="text-astraya-gold"
                size={19}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-astraya-navy">
                  Fine glitter
                </p>
                <p className="text-xs text-astraya-text/58">
                  A restrained hand-finished sprinkle
                </p>
              </div>
            </div>
            <button
              aria-checked={customization.glitter}
              aria-label="Add fine glitter"
              className={cn(
                'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
                customization.glitter
                  ? 'border-astraya-gold bg-astraya-gold'
                  : 'border-astraya-navy/20 bg-astraya-muted',
              )}
              role="switch"
              type="button"
              onClick={() =>
                updateCustomization({ glitter: !customization.glitter })
              }
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  customization.glitter ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>

          <p className="mt-4 text-xs leading-5 text-astraya-text/58">
            Your interactive preview is saved with the cart item and included in
            the order.
          </p>
        </section>

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
            onClick={addCurrentProduct}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            Add to cart
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => toggleWishlist(product)}
          >
            <Heart
              size={18}
              fill={wished ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
            {wished ? 'Saved' : 'Save'}
          </Button>
        </div>
        <p className="mt-3 text-sm text-astraya-text/58">
          {product.stock_quantity > 0
            ? `${product.stock_quantity} pieces available`
            : 'Currently sold out'}
        </p>
        <p
          className="mt-2 min-h-5 text-sm font-medium text-astraya-navy"
          aria-live="polite"
        >
          {cartStatus}
        </p>
      </div>
    </section>
  );
}
