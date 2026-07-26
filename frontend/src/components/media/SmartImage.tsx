import { type ImgHTMLAttributes, useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

export const FALLBACK_IMAGE_SRC = '/images/placeholder-candle.svg';

type SmartImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  skeletonClassName?: string;
};

export function SmartImage({
  alt,
  className,
  decoding = 'async',
  fallbackSrc = FALLBACK_IMAGE_SRC,
  loading = 'lazy',
  onError,
  onLoad,
  skeletonClassName,
  src,
  ...props
}: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [fallbackSrc, src]);

  return (
    <>
      {!isLoaded && (
        <span
          className={cn('absolute inset-0 animate-pulse bg-astraya-cream', skeletonClassName)}
          aria-hidden="true"
        />
      )}
      <img
        alt={alt}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        decoding={decoding}
        loading={loading}
        src={currentSrc}
        onError={(event) => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setIsLoaded(false);
          }
          onError?.(event);
        }}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        {...props}
      />
    </>
  );
}
