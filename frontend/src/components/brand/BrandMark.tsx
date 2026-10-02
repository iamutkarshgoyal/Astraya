import { Link } from 'react-router';

type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <Link className="group inline-flex flex-col items-center" to="/" aria-label="Astraya home">
      <span
        className={
          inverse
            ? 'font-display text-3xl font-medium uppercase leading-none tracking-[0.3em] text-white'
            : 'font-display text-3xl font-medium uppercase leading-none tracking-[0.3em] text-astraya-navy'
        }
      >
        Astraya
      </span>
      {!compact && (
        <span className="mt-1.5 font-button text-[0.52rem] font-medium uppercase tracking-[0.42em] text-astraya-gold">
          Inspired by the Cosmos
        </span>
      )}
    </Link>
  );
}
