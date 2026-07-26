import { MoonStar, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

type BrandMarkProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <Link className="group inline-flex items-center gap-3" to="/" aria-label="Astraya home">
      <span className="relative grid h-11 w-11 place-items-center rounded-md border border-astraya-gold/55 bg-astraya-navy text-astraya-gold shadow-glow transition duration-300 group-hover:-translate-y-0.5 group-hover:border-astraya-gold">
        <MoonStar size={19} aria-hidden="true" />
        <Sparkles
          className="absolute -right-1 -top-1 text-astraya-gold"
          size={12}
          aria-hidden="true"
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
