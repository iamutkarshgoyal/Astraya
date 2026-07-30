import { Link } from 'react-router';

type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <Link className="group inline-flex items-center gap-3" to="/" aria-label="Astraya home">
      <span className="relative h-11 w-11 overflow-hidden rounded-full border border-astraya-gold/65 bg-astraya-navy shadow-glow transition duration-300 group-hover:-translate-y-0.5 group-hover:border-astraya-gold">
        <img
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          decoding="async"
          height="44"
          loading="eager"
          src="/assets/astraya/logo/astraya-logo.jpg"
          width="44"
        />
      </span>
      {!compact && (
        <span className="flex flex-col">
          <span
            className={
              inverse
                ? 'font-display text-2xl font-semibold leading-none tracking-[0.08em] text-white'
                : 'font-display text-2xl font-semibold leading-none tracking-[0.08em] text-astraya-navy'
            }
          >
            Astraya
          </span>
          <span className="font-button text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-astraya-gold">
            Inspired by the Cosmos
          </span>
        </span>
      )}
    </Link>
  );
}
