type SceneFallbackProps = {
  isLit: boolean;
};

export function SceneFallback({ isLit }: SceneFallbackProps) {
  return (
    <div
      className="candle-scene-fallback"
      data-lit={isLit ? 'true' : 'false'}
      aria-hidden="true"
    >
      <picture>
        <source
          srcSet="/assets/astraya/instagram/03-heart-candles.avif"
          type="image/avif"
        />
        <img
          alt=""
          className="h-full w-full object-cover"
          decoding="async"
          loading="eager"
          src="/assets/astraya/instagram/03-heart-candles.jpg"
        />
      </picture>
      <span className="candle-scene-fallback__light" />
    </div>
  );
}
