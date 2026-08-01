type SceneFallbackProps = {
  image?: string;
  isLit: boolean;
};

export function SceneFallback({
  image = '/assets/astraya/instagram/03-heart-candles.jpg',
  isLit,
}: SceneFallbackProps) {
  return (
    <div
      className="candle-scene-fallback"
      data-lit={isLit ? 'true' : 'false'}
      aria-hidden="true"
    >
      <img
        alt=""
        className="h-full w-full object-cover"
        decoding="async"
        loading="eager"
        src={image}
      />
      <span className="candle-scene-fallback__light" />
    </div>
  );
}
